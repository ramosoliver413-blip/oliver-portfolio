const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const DATA_FILE = path.join(DATA_DIR, "portfolio.json");
const ASSETS_DIR = path.join(ROOT, "assets");

for (const dir of [DATA_DIR, ASSETS_DIR, path.join(ASSETS_DIR, "profile"), path.join(ASSETS_DIR, "projects"), path.join(ASSETS_DIR, "certificates")]) {
  fs.mkdirSync(dir, { recursive: true });
}

app.use(express.json({ limit: "2mb" }));
app.use(express.static(ROOT));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const category = ["profile", "projects", "certificates"].includes(req.params.category)
      ? req.params.category
      : "certificates";
    const target = path.join(ASSETS_DIR, category);
    fs.mkdirSync(target, { recursive: true });
    cb(null, target);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = /^\.(png|jpe?g|webp|gif|svg)$/i.test(ext) ? ext : ".png";
    const base = path.basename(file.originalname, ext)
      .toLowerCase().replace(/[^a-z0-9-_]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 45) || "upload";
    cb(null, `${Date.now()}-${base}${safeExt}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^image\/(png|jpeg|webp|gif|svg\+xml)$/.test(file.mimetype)) return cb(null, true);
    cb(new Error("Please upload an image file (PNG, JPG, WEBP, GIF, or SVG)."));
  }
});

function readPortfolio() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({}, null, 2));
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

app.get("/api/portfolio", (req, res) => {
  try {
    res.json(readPortfolio());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not read data/portfolio.json. Check that it contains valid JSON." });
  }
});

app.put("/api/portfolio", (req, res) => {
  try {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json({ error: "Portfolio data must be a JSON object." });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(req.body, null, 2) + "\n", "utf8");
    res.json({ ok: true, message: "Portfolio saved to data/portfolio.json." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not save portfolio JSON." });
  }
});

app.post("/api/upload/:category", (req, res) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || "Upload failed." });
    }
    if (!req.file) return res.status(400).json({ error: "Choose an image first." });
    const relative = `/assets/${req.params.category}/${req.file.filename}`;
    res.json({ ok: true, path: relative, filename: req.file.filename });
  });
});

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Oliver's portfolio is running at http://localhost:${PORT}`);
});
