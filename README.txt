OLIVER J. RAMOS — DIGITAL PORTFOLIO
===================================

REQUIREMENTS
- Node.js (LTS recommended)
- Visual Studio Code

FIRST-TIME SETUP
1. Extract this ZIP into a folder, for example MY_portfolio.
2. Open that folder in VS Code (File > Open Folder).
3. Open Terminal > New Terminal.
4. Run:
      npm install
5. Start the website:
      npm start
6. Open this address in your browser:
      http://localhost:3000

IMPORTANT
Do not open index.html by double-clicking it. The JSON save and image upload features require server.js, so always visit http://localhost:3000 after running npm start.

EDITING
- Click "Edit Portfolio" to update your name, role, college, introduction, About Me, skills, and contact details.
- Turn on Edit Portfolio, then use Edit / Delete on project and certificate cards.
- Use Add project or Add certificate while edit mode is active.
- Change your profile photo using the "Change photo" chip.
- Click Save Changes to finish editing. Updates are written to data/portfolio.json.
- Uploaded images are stored under assets/profile, assets/projects, or assets/certificates.

PLACEHOLDER IMAGES
The supplied SVG images are placeholders. Replace them with your own image through the website editor or replace the image file and update the corresponding path in data/portfolio.json.

DATA BACKUP
Back up both data/portfolio.json and the assets/ folder. The project saves on the computer running Node.js. If you publish the website online, this local server and its file storage do not automatically become a hosted backend.

SECURITY NOTE
This is a local personal portfolio starter and does not include authentication. Do not expose the edit/upload server publicly as-is. Add authentication and production hardening before hosting it on a public server.
