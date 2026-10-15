const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
let data = null;
let editMode = false;
let itemDraft = null;
let itemKind = "project";
let itemIndex = -1;
let toastTimer;

const fallbackData = {
  name: "Oliver J. Ramos",
  role: "3rd Year BSIT Student",
  college: "Torres Capitol College, Inc.",
  heroDescription:
    "An aspiring IT professional interested in software development, computer systems, troubleshooting, and practical technology solutions.",
  about:
    "I am Oliver J. Ramos, a 3rd year Bachelor of Science in Information Technology student at Torres Capitol College, Inc. I am developing my programming, troubleshooting, and software development skills through school projects and personal learning.",
  profileImage: "/assets/profile/profile-placeholder.svg",
  skills: [
    "Python",
    "HTML / CSS",
    "JavaScript",
    "Backend Development",
    "Microsoft Word",
    "Microsoft Excel",
    "Microsoft PowerPoint",
    "Microsoft Access",
    "Basic Computer Troubleshooting",
    "Photo Editing",
  ],
  projects: [],
  certificates: [],
  education: [],
  contact: { email: "your.email@example.com", github: "", facebook: "" },
};

function escapeHTML(value = "") {
  return String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[char],
  );
}
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}
function normalizeUrl(value) {
  const v = String(value || "").trim();
  if (!v) return "";
  if (/^(https?:\/\/|mailto:|tel:)/i.test(v)) return v;
  return "https://" + v;
}
async function loadData() {
  try {
    const response = await fetch("/api/portfolio");
    if (!response.ok) throw new Error("API unavailable");
    data = { ...structuredClone(fallbackData), ...(await response.json()) };
    data.contact = { ...fallbackData.contact, ...(data.contact || {}) };
    if (!Array.isArray(data.skills)) data.skills = [];
    if (!Array.isArray(data.projects)) data.projects = [];
    if (!Array.isArray(data.certificates)) data.certificates = [];
    if (!Array.isArray(data.education)) data.education = [];
  } catch (error) {
    data = structuredClone(fallbackData);
    showToast("Could not load JSON. Start the site using npm start.");
  }
  renderAll();
  startTyping();
}
async function saveData() {
  try {
    const response = await fetch("/api/portfolio", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data, null, 2),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Save failed");
    showToast("Saved to data/portfolio.json");
    return true;
  } catch (error) {
    showToast(error.message || "Save failed. Is the Node.js server running?");
    return false;
  }
}
function renderAll() {
  document.title = `${data.name || "Portfolio"} | Digital Portfolio`;
  $("#heroName").textContent = data.name || "";
  $("#heroRole").textContent = data.role || "";
  $("#heroDescription").textContent = data.heroDescription || "";
  $("#aboutText").textContent = data.about || "";
  $("#profileImage").src =
    data.profileImage || "/assets/profile/profile-placeholder.svg";
  $("#profileImage").alt = `Profile photo of ${data.name || "portfolio owner"}`;
  renderSkills();
  renderProjects();
  renderCertificates();
  renderEducation();
  renderContact();
  $("#year").textContent = new Date().getFullYear();
}
function renderSkills() {
  $("#skillsGrid").innerHTML = data.skills.length
    ? data.skills
        .map(
          (skill, i) =>
            `<article class="skill-card"><span class="skill-mark">${String(i + 1).padStart(2, "0")}</span><p>${escapeHTML(skill)}</p>${editMode ? `<button class="small-action danger" data-delete-skill="${i}" aria-label="Delete ${escapeHTML(skill)}">×</button>` : ""}</article>`,
        )
        .join("")
    : `<div class="empty-state">Add your skills in Edit Portfolio.</div>`;
}
function renderProjects() {
  $("#projectsGrid").innerHTML = data.projects.length
    ? data.projects
        .map(
          (project, i) => `
    <article class="project-card">
      <div class="project-image"><img src="${escapeHTML(project.image || "/assets/projects/pos-grocery-placeholder.svg")}" alt="${escapeHTML(project.title || "Project")} image" loading="lazy" onerror="this.style.display='none'"></div>
      <div class="project-content"><span class="project-number">PROJECT / ${String(i + 1).padStart(2, "0")}</span><h3>${escapeHTML(project.title || "Untitled project")}</h3><p>${escapeHTML(project.description || "Add a description for this project.")}</p><div class="tags">${(project.tools || []).map((tool) => `<span class="tag">${escapeHTML(tool)}</span>`).join("")}</div>${project.link ? `<p style="margin-top:14px"><a href="${escapeHTML(normalizeUrl(project.link))}" target="_blank" rel="noopener noreferrer">View project ↗</a></p>` : ""}</div>
      <div class="card-actions"><button class="small-action" data-edit-project="${i}">Edit</button><button class="small-action danger" data-delete-project="${i}">Delete</button></div>
    </article>`,
        )
        .join("")
    : `<div class="empty-state">No projects yet. Turn on Edit Mode to add one.</div>`;
  $("#addProjectButton").hidden = !editMode;
}

function renderCertificates() {
  const grid = $("#certificatesGrid");

  grid.innerHTML = data.certificates.length
    ? `
      <div class="certificate-carousel" style="--quantity: ${data.certificates.length}">
        ${data.certificates.map((cert, i) => `
          <article class="certificate-card" style="--index: ${i}">
            <div class="certificate-image" ${cert.image ? `data-view-image="${escapeHTML(cert.image)}"` : ""}>
              ${cert.image
                ? `<img src="${escapeHTML(cert.image)}" alt="${escapeHTML(cert.title || "Certificate")}" loading="lazy">`
                : `<div class="certificate-placeholder">▧<br>Upload certificate image</div>`}
            </div>

            <div class="certificate-content">
              <span class="certificate-meta">${escapeHTML([cert.issuer, cert.date].filter(Boolean).join(" · ") || "CERTIFICATE")}</span>
              <h3>${escapeHTML(cert.title || "Untitled certificate")}</h3>
              <p>${escapeHTML(cert.description || "Add a short description.")}</p>
            </div>

            <div class="card-actions">
              <button class="small-action" data-edit-certificate="${i}">Edit</button>
              <button class="small-action danger" data-delete-certificate="${i}">Delete</button>
            </div>
          </article>
        `).join("")}
      </div>
    `
    : `<div class="empty-state">
        Your certificates will appear here.
        ${editMode ? "Use “Add certificate” to add one." : "Turn on Edit Portfolio to add certificate images and descriptions."}
      </div>`;

  $("#addCertificateButton").hidden = !editMode;
}

function renderEducation() {
  $("#educationList").innerHTML = data.education.length
    ? data.education
        .map(
          (item) => `
    <article class="timeline-item"><span class="timeline-dot"></span><div class="timeline-card"><small>${escapeHTML(item.period || "Education")}</small><h3>${escapeHTML(item.qualification || "Qualification")}</h3><h4>${escapeHTML(item.school || "")}</h4><p>${escapeHTML(item.details || "")}</p></div></article>`,
        )
        .join("")
    : `<div class="empty-state">Add your education details in data/portfolio.json.</div>`;
}
function renderContact() {
  const contact = data.contact || {};
  const links = [];
  if (contact.email)
    links.push(
      `<a class="contact-link" href="mailto:${escapeHTML(contact.email)}"><span>EMAIL</span>${escapeHTML(contact.email)}</a>`,
    );
  if (contact.github)
    links.push(
      `<a class="contact-link" href="${escapeHTML(normalizeUrl(contact.github))}" target="_blank" rel="noopener noreferrer"><span>GITHUB</span>${escapeHTML(contact.github)}</a>`,
    );
  if (contact.facebook)
    links.push(
      `<a class="contact-link" href="${escapeHTML(normalizeUrl(contact.facebook))}" target="_blank" rel="noopener noreferrer"><span>FACEBOOK</span>${escapeHTML(contact.facebook)}</a>`,
    );
  $("#contactLinks").innerHTML =
    links.join("") ||
    `<p>Add your contact information using Edit Portfolio.</p>`;
}
let typingTimer;
function startTyping() {
  clearInterval(typingTimer);
  const el = $("#typingText");
  const phrase = data.college || "Your school name";
  let i = 0,
    deleting = false;
  el.textContent = "";
  typingTimer = setInterval(() => {
    if (!deleting) {
      i++;
      el.textContent = phrase.slice(0, i);
      if (i >= phrase.length) {
        clearInterval(typingTimer);
        setTimeout(() => {
          deleting = true;
          typingTimer = setInterval(() => {
            i--;
            el.textContent = phrase.slice(0, i);
            if (i <= 0) {
              clearInterval(typingTimer);
              startTyping();
            }
          }, 45);
        }, 1700);
      }
    }
  }, 75);
}
function setEditMode(enabled) {
  editMode = enabled;
  document.body.classList.toggle("editing", enabled);
  $("#editBanner").hidden = !enabled;
  $("#editButton").textContent = enabled ? "✓ Editing" : "✎ Edit Portfolio";
  renderSkills();
  renderProjects();
  renderCertificates();
}
function openEditor() {
  $("#fieldName").value = data.name || "";
  $("#fieldRole").value = data.role || "";
  $("#fieldCollege").value = data.college || "";
  $("#fieldHero").value = data.heroDescription || "";
  $("#fieldAbout").value = data.about || "";
  $("#fieldSkills").value = (data.skills || []).join("\n");
  $("#fieldEmail").value = data.contact?.email || "";
  $("#fieldGithub").value = data.contact?.github || "";
  $("#fieldFacebook").value = data.contact?.facebook || "";
  $("#editorDialog").showModal();
}
$("#editorForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  data.name = $("#fieldName").value.trim();
  data.role = $("#fieldRole").value.trim();
  data.college = $("#fieldCollege").value.trim();
  data.heroDescription = $("#fieldHero").value.trim();
  data.about = $("#fieldAbout").value.trim();
  data.skills = $("#fieldSkills")
    .value.split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  data.contact = {
    email: $("#fieldEmail").value.trim(),
    github: $("#fieldGithub").value.trim(),
    facebook: $("#fieldFacebook").value.trim(),
  };
  renderAll();
  startTyping();
  $("#editorDialog").close();
  setEditMode(true);
  await saveData();
});
$("#editButton").addEventListener("click", () => {
  setEditMode(!editMode);
  if (editMode) openEditor();
});
$("#closeDialog").addEventListener("click", () => $("#editorDialog").close());
$("#dismissDialog").addEventListener("click", () => $("#editorDialog").close());
$("#saveButton").addEventListener("click", async () => {
  if (await saveData()) setEditMode(false);
});
$("#cancelEditButton").addEventListener("click", async () => {
  await loadData();
  setEditMode(false);
  showToast("Reloaded saved portfolio data.");
});

async function uploadImage(file, category) {
  const form = new FormData();
  form.append("image", file);
  const response = await fetch(`/api/upload/${category}`, {
    method: "POST",
    body: form,
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Image upload failed");
  return result.path;
}
$("#profileUpload").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    data.profileImage = await uploadImage(file, "profile");
    $("#profileImage").src = data.profileImage;
    await saveData();
  } catch (err) {
    showToast(err.message);
  }
  event.target.value = "";
});

function field(label, key, value = "", type = "text", extra = "") {
  return `<label>${label}<input name="${key}" type="${type}" value="${escapeHTML(value)}" ${extra}></label>`;
}
function textareaField(label, key, value = "", rows = 4) {
  return `<label>${label}<textarea name="${key}" rows="${rows}">${escapeHTML(value)}</textarea></label>`;
}
function openItemEditor(kind, index = -1) {
  itemKind = kind;
  itemIndex = index;
  const isNew = index < 0;
  const current = isNew
    ? kind === "project"
      ? { title: "", image: "", description: "", tools: [], link: "" }
      : { title: "", issuer: "", date: "", description: "", image: "" }
    : structuredClone(
        kind === "project" ? data.projects[index] : data.certificates[index],
      );
  itemDraft = current;
  const isProject = kind === "project";
  $("#itemEyebrow").textContent = isProject
    ? "PROJECT DETAILS"
    : "CERTIFICATE DETAILS";
  $("#itemDialogTitle").textContent =
    `${isNew ? "Add" : "Edit"} ${isProject ? "project" : "certificate"}`;
  let html = field(
    isProject ? "Project title" : "Certificate title",
    "title",
    current.title || "",
    "text",
    "required",
  );
  if (!isProject) {
    html += field("Issuing organization", "issuer", current.issuer || "");
    html += field("Date / year", "date", current.date || "");
  }
  html += textareaField(
    "Description",
    "description",
    current.description || "",
    4,
  );
  if (isProject) {
    html += field(
      "Tools / technologies (comma separated)",
      "tools",
      (current.tools || []).join(", "),
    );
    html += field("Project URL (optional)", "link", current.link || "", "url");
  }
  html += `<label>Image ${isProject ? "(optional screenshot)" : "(certificate scan/photo)"}<input type="file" name="imageFile" accept="image/*"></label>`;
  if (current.image)
    html += `<p class="form-note">Current image: ${escapeHTML(current.image)}</p>`;
  $("#itemFields").innerHTML = html;
  $("#itemDialog").showModal();
}
$("#itemForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const isProject = itemKind === "project";
  const item = {
    ...itemDraft,
    title: String(form.get("title") || "").trim(),
    description: String(form.get("description") || "").trim(),
  };
  if (!item.title) {
    showToast("Please enter a title.");
    return;
  }
  if (isProject) {
    item.tools = String(form.get("tools") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    item.link = String(form.get("link") || "").trim();
  } else {
    item.issuer = String(form.get("issuer") || "").trim();
    item.date = String(form.get("date") || "").trim();
  }
  const file = form.get("imageFile");
  try {
    if (file && file.size > 0)
      item.image = await uploadImage(
        file,
        isProject ? "projects" : "certificates",
      );
    const list = isProject ? data.projects : data.certificates;
    if (itemIndex < 0) list.push(item);
    else list[itemIndex] = item;
    renderAll();
    setEditMode(true);
    $("#itemDialog").close();
    await saveData();
  } catch (err) {
    showToast(err.message);
  }
});
$("#closeItemDialog").addEventListener("click", () => $("#itemDialog").close());
$("#cancelItem").addEventListener("click", () => $("#itemDialog").close());
$("#addProjectButton").addEventListener("click", () =>
  openItemEditor("project"),
);
$("#addCertificateButton").addEventListener("click", () =>
  openItemEditor("certificate"),
);

document.addEventListener("click", async (event) => {
  const target = event.target.closest("button");
  if (!target) {
    const imageContainer = event.target.closest("[data-view-image]");
    if (imageContainer)
      window.open(imageContainer.dataset.viewImage, "_blank", "noopener");
    return;
  }
  if (target.dataset.editProject !== undefined)
    openItemEditor("project", Number(target.dataset.editProject));
  if (target.dataset.editCertificate !== undefined)
    openItemEditor("certificate", Number(target.dataset.editCertificate));
  if (
    target.dataset.deleteProject !== undefined &&
    confirm("Delete this project?")
  ) {
    data.projects.splice(Number(target.dataset.deleteProject), 1);
    renderAll();
    await saveData();
  }
  if (
    target.dataset.deleteCertificate !== undefined &&
    confirm("Delete this certificate?")
  ) {
    data.certificates.splice(Number(target.dataset.deleteCertificate), 1);
    renderAll();
    await saveData();
  }
  if (
    target.dataset.deleteSkill !== undefined &&
    confirm("Remove this skill?")
  ) {
    data.skills.splice(Number(target.dataset.deleteSkill), 1);
    renderSkills();
    await saveData();
  }
});

$("#menuToggle").addEventListener("click", () =>
  $("#nav").classList.toggle("open"),
);
$$("#nav a").forEach((link) =>
  link.addEventListener("click", () => $("#nav").classList.remove("open")),
);
$("#backToTop").addEventListener("click", () =>
  window.scrollTo({ top: 0, behavior: "smooth" }),
);
window.addEventListener("scroll", () =>
  $("#backToTop").classList.toggle("visible", window.scrollY > 500),
);
const sections = $$("main section[id]");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          $$("#nav a").forEach((link) =>
            link.classList.toggle(
              "active",
              link.getAttribute("href") === `#${entry.target.id}`,
            ),
          );
        }
      });
    },
    { rootMargin: "-35% 0px -55% 0px" },
  );
  sections.forEach((section) => observer.observe(section));
}
loadData();
