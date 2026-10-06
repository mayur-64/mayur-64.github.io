# Personal Portfolio & Resume Website (with Studio Builder on Steroids)

A blazing-fast, accessible, and responsive personal portfolio and resume website engineered with zero external runtime dependencies. Ready to host on GitHub Pages (free tier).

Includes a built-in visual **Resume & Portfolio Studio Editor** with real-time responsive preview, instant compilation, PDF export, and one-click GitHub Pages deployment.

---

## 🌟 Key Features

* **Zero Bloat & Zero Dependencies:** Pure HTML5, modern CSS, and Vanilla ES6+ JavaScript.
* **100/100 Lighthouse Performance:** Sub-second load times, optimized SVGs, and semantic markup.
* **Resume Builder Studio on Steroids (`editor.html`):**
  * Live two-way reactive editing for Profile, Skills, Projects, Experience, and Education.
  * Real-time device preview switcher: **Desktop (100%)**, **Tablet (768px)**, and **Mobile (375px)**.
  * **"⚡ Render & Build Page"** button: compiles the structured data directly into a standalone production `index.html`.
  * **"🚀 Deploy"** button: stages changes, creates a git commit, and pushes directly to GitHub Pages.
  * **"📄 PDF Export"**: Print-optimized stylesheet for generating clean resume PDFs.
  * **"📥 Import / 📤 Export JSON"**: Backup or restore your entire portfolio data at any time.
* **Dark / Light Mode:** Automatic system preference detection (`prefers-color-scheme`) with persistent `localStorage` toggle.
* **Accessibility & SEO:** WCAG AA compliant contrast, keyboard navigation, skip-to-content link, Open Graph tags, Twitter cards, and SVG favicon.
* **GitHub Pages Native:** Works smoothly at root (`https://USERNAME.github.io/`) or inside a repo subpath (`https://USERNAME.github.io/portfolio/`).

---

## 📁 Project Structure

```text
/portfolio
├── index.html              # Standalone production site for GitHub Pages
├── editor.html             # Visual Resume & Portfolio Studio Editor
├── dev_server.py           # Zero-dependency Python server (serves & handles save/deploy API)
├── css/
│   ├── style.css           # Production styling (CSS variables, dark/light, print stylesheet)
│   └── editor.css          # Studio Editor workspace & terminal modal styling
├── js/
│   ├── main.js             # Theme toggle, mobile drawer, scroll spy, email copy toast
│   └── editor.js           # Reactive studio state, HTML compiler, device toggler, API connector
├── data/
│   ├── resume.json         # Single source of truth structured data
│   └── gen_pdf.py          # Standalone PDF generator script
├── assets/
│   ├── favicon.svg         # Modern vector favicon
│   ├── resume.pdf          # Clean resume PDF document for instant downloads
│   └── images/             # Vector diagrams for project cards (project-1, 2, 3)
├── .nojekyll               # Bypasses Jekyll on GitHub Pages
├── .gitignore              # Ignores editor artifacts and temporary logs
└── README.md               # Documentation and guides
```

---

## 🚀 Running Locally

You can launch the integrated Dev & Studio Server with Python (zero pip packages needed):

```bash
cd /root/portfolio
python3 dev_server.py
```

* **Live Portfolio Website:** Open [http://127.0.0.1:8080/](http://127.0.0.1:8080/)
* **Resume & Portfolio Studio Editor:** Open [http://127.0.0.1:8080/editor.html](http://127.0.0.1:8080/editor.html)

*(Note: We run on port `8080` to respect existing machine port allocations).*

---

## ✏️ How to Edit Content

You have two easy ways to update your site:

### Option A: Using the Studio Editor (Recommended)
1. Open [http://127.0.0.1:8080/editor.html](http://127.0.0.1:8080/editor.html) in your browser.
2. Edit your profile, add or remove projects, skills, and experience items.
3. Watch the live preview update instantly on the right.
4. Click **"⚡ Render & Build"** to compile and save your changes to disk (`index.html` and `data/resume.json`).
5. Click **"🚀 Deploy"** to commit and publish!

### Option B: Direct File Editing
* Edit `data/resume.json` directly to change data fields.
* Or edit `index.html` directly—every customizable field is marked with a clear `<!-- TODO: [FieldName] -->` comment.

---

## 🌐 Deploying to GitHub Pages

### 1. Step-by-Step GitHub Setup
1. Create a repository on GitHub:
   * **Root domain deployment:** Name the repo `USERNAME.github.io` (will be published at `https://USERNAME.github.io/`)
   * **Project subpath deployment:** Name the repo anything, e.g. `portfolio` (will be published at `https://USERNAME.github.io/portfolio/`)
2. Link your local repository:
   ```bash
   cd /root/portfolio
   git remote add origin https://github.com/USERNAME/REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```
3. Enable GitHub Pages:
   * Go to your repository on GitHub: **Settings** → **Pages**.
   * Under **Build and deployment**:
     * **Source:** Select `Deploy from a branch`.
     * **Branch:** Select `main` / `/(root)`.
     * Click **Save**.
4. Your site will be live within 1 to 2 minutes!
