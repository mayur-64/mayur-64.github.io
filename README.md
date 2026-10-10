# Personal Portfolio & Resume Website

A blazing-fast, accessible, and responsive personal portfolio and resume website engineered with zero external runtime dependencies. Hosted on GitHub Pages.

---

## 🌟 Key Features

* **Zero Bloat & Zero Dependencies:** Pure HTML5, modern CSS custom properties, and Vanilla ES6+ JavaScript.
* **100/100 Lighthouse Performance:** Sub-second load times, optimized SVGs, and semantic markup.
* **Responsive & Mobile-First:** Fluid layouts meticulously tested across mobile (375px), tablet (768px), and desktop (1280px+).
* **Dark / Light Mode:** Automatic system preference detection (`prefers-color-scheme`) with persistent `localStorage` theme toggle.
* **Print-Friendly Resume:** `@media print` stylesheet formatted to export or print an executive 1–2 page clean resume directly from the browser.
* **Accessibility & SEO:** WCAG AA compliant contrast, keyboard navigation, skip-to-content link, Open Graph tags, Twitter cards, and SVG favicon.
* **GitHub Pages Native:** Works smoothly at root (`https://USERNAME.github.io/`) or inside a repo subpath (`https://USERNAME.github.io/portfolio/`).

---

## 📁 Project Structure

```text
/portfolio
├── index.html              # Standalone production portfolio & resume site
├── dev_server.py           # Zero-dependency local development server (Python)
├── css/
│   └── style.css           # Modern design tokens, dark/light themes, print stylesheet
├── js/
│   └── main.js             # Theme switcher, mobile drawer, scroll-spy, copy email toast
├── data/
│   ├── resume.json         # Structured resume data (single source of truth)
│   ├── gen_pdf.py          # Standalone PDF generator script
│   └── verify_site.py      # Automated test verification suite
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

Launch the lightweight local development server with Python (zero pip packages needed):

```bash
cd /root/portfolio
python3 dev_server.py
```

* **Live Portfolio Website:** Open [http://127.0.0.1:8080/](http://127.0.0.1:8080/)

*(Note: Binds to port `8080` to adhere to machine port allocation guidelines).*

---

## ✏️ How to Edit Content

Updating your information is straightforward:
* **Option A:** Edit `data/resume.json` to keep your structured data updated.
* **Option B:** Edit `index.html` directly—every customizable field is clearly marked with a `<!-- TODO: [FieldName] -->` comment.

---

## 🌐 Deploying to GitHub Pages

### 1. Step-by-Step GitHub Setup
1. Create a repository on GitHub:
   * **Root domain deployment:** Name the repo `USERNAME.github.io` (published at `https://USERNAME.github.io/`)
   * **Project subpath deployment:** Name the repo anything, e.g. `portfolio` (published at `https://USERNAME.github.io/portfolio/`)
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
