/**
 * Resume Builder & Portfolio Studio Engine ("On Steroids")
 * Vanilla JavaScript - Zero External Dependencies
 */

(function () {
  'use strict';

  // State
  let portfolioData = null;
  let hasPendingChanges = false;

  // DOM Elements
  const previewFrame = document.getElementById('preview-frame');
  const previewContainer = document.getElementById('preview-container');
  const statusSaved = document.getElementById('status-saved');
  const renderBtn = document.getElementById('render-btn');
  const deployBtn = document.getElementById('deploy-btn');
  const printPdfBtn = document.getElementById('print-pdf-btn');
  const exportJsonBtn = document.getElementById('export-json-btn');
  const importJsonInput = document.getElementById('import-json-input');

  // Modals
  const deployModal = document.getElementById('deploy-modal');
  const closeDeployModal = document.getElementById('close-deploy-modal');
  const runDeployBtn = document.getElementById('run-deploy-btn');
  const deployConsole = document.getElementById('deploy-console');
  const commitMsgInput = document.getElementById('commit-msg-input');

  // Device Buttons
  const deviceBtns = document.querySelectorAll('.device-btn');

  /* ==========================================================================
     1. Initialization & Data Loading
     ========================================================================== */
  async function init() {
    try {
      const res = await fetch('./data/resume.json?t=' + Date.now());
      if (res.ok) {
        portfolioData = await res.json();
      } else {
        throw new Error('Fallback to local');
      }
    } catch (e) {
      const cached = localStorage.getItem('portfolio_studio_data');
      if (cached) {
        portfolioData = JSON.parse(cached);
      } else {
        portfolioData = getDefaultData();
      }
    }

    renderTabs();
    populateForms();
    setupEventListeners();
    updatePreview();
  }

  /* ==========================================================================
     2. Tab Navigation
     ========================================================================== */
  function renderTabs() {
    const tabBtns = document.querySelectorAll('.tab-item');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-tab');
        tabBtns.forEach((b) => b.classList.remove('active'));
        tabPanes.forEach((p) => p.classList.remove('active'));

        btn.classList.add('active');
        const activePane = document.getElementById(`tab-${target}`);
        if (activePane) activePane.classList.add('active');
      });
    });
  }

  /* ==========================================================================
     3. Populate Forms from State
     ========================================================================== */
  function populateForms() {
    if (!portfolioData) return;

    // Profile
    const p = portfolioData.personal || {};
    setVal('p-name', p.name);
    setVal('p-role', p.role);
    setVal('p-headline', p.headline);
    setVal('p-bio', p.bio);
    setVal('p-location', p.location);
    setVal('p-email', p.email);
    setVal('p-github', p.github);
    setVal('p-linkedin', p.linkedin);
    setVal('p-twitter', p.twitter);
    setVal('p-status', p.status);

    // Theme
    const t = portfolioData.theme || {};
    setVal('t-palette', t.palette || 'indigo');

    // Repeaters
    renderSkillsForm();
    renderProjectsForm();
    renderExperienceForm();
    renderEducationForm();
  }

  function setVal(id, val) {
    const el = document.getElementById(id);
    if (el && val !== undefined) el.value = val;
  }

  /* ==========================================================================
     4. Skills Matrix Form
     ========================================================================== */
  function renderSkillsForm() {
    const container = document.getElementById('skills-container');
    if (!container) return;
    container.innerHTML = '';

    const categories = portfolioData.skills || [];
    categories.forEach((cat, catIdx) => {
      const card = document.createElement('div');
      card.className = 'repeater-card';
      card.innerHTML = `
        <div class="repeater-card-header">
          <input type="text" class="form-input" style="font-weight:700; width:70%;" value="${cat.category || ''}" placeholder="Category Name" data-cat-idx="${catIdx}">
          <button type="button" class="btn-remove-item" data-remove-cat="${catIdx}">✕ Delete</button>
        </div>
        <div class="form-group">
          <label class="form-label">Skills (comma separated)</label>
          <input type="text" class="form-input" value="${(cat.items || []).map(i => i.name).join(', ')}" placeholder="e.g. Python, SQL, Docker" data-cat-items="${catIdx}">
        </div>
      `;
      container.appendChild(card);
    });

    // Add Category Button
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'btn-add-item';
    addBtn.innerHTML = '+ Add Skill Category';
    addBtn.addEventListener('click', () => {
      portfolioData.skills = portfolioData.skills || [];
      portfolioData.skills.push({ category: 'New Category', items: [{ name: 'Skill 1', level: 'Advanced' }] });
      renderSkillsForm();
      triggerChange();
    });
    container.appendChild(addBtn);

    // Attach listeners
    container.querySelectorAll('[data-cat-idx]').forEach((input) => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.getAttribute('data-cat-idx'), 10);
        portfolioData.skills[idx].category = e.target.value;
        triggerChange();
      });
    });

    container.querySelectorAll('[data-cat-items]').forEach((input) => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.getAttribute('data-cat-items'), 10);
        const names = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
        portfolioData.skills[idx].items = names.map(n => ({ name: n, level: 'Advanced' }));
        triggerChange();
      });
    });

    container.querySelectorAll('[data-remove-cat]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.getAttribute('data-remove-cat'), 10);
        portfolioData.skills.splice(idx, 1);
        renderSkillsForm();
        triggerChange();
      });
    });
  }

  /* ==========================================================================
     5. Projects Form
     ========================================================================== */
  function renderProjectsForm() {
    const container = document.getElementById('projects-container');
    if (!container) return;
    container.innerHTML = '';

    const projects = portfolioData.projects || [];
    projects.forEach((proj, idx) => {
      const card = document.createElement('div');
      card.className = 'repeater-card';
      card.innerHTML = `
        <div class="repeater-card-header">
          <span class="repeater-card-title">#${idx + 1} ${proj.title || 'Untitled Project'}</span>
          <button type="button" class="btn-remove-item" data-remove-proj="${idx}">✕ Delete</button>
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Title</label>
            <input type="text" class="form-input" value="${proj.title || ''}" data-p-field="title" data-p-idx="${idx}">
          </div>
          <div class="form-group">
            <label class="form-label">Subtitle / Role</label>
            <input type="text" class="form-input" value="${proj.subtitle || ''}" data-p-field="subtitle" data-p-idx="${idx}">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea class="form-textarea" data-p-field="description" data-p-idx="${idx}">${proj.description || ''}</textarea>
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Tags (comma separated)</label>
            <input type="text" class="form-input" value="${(proj.tags || []).join(', ')}" data-p-field="tags" data-p-idx="${idx}">
          </div>
          <div class="form-group">
            <label class="form-label">Key Metric / Result</label>
            <input type="text" class="form-input" value="${proj.metrics || ''}" data-p-field="metrics" data-p-idx="${idx}">
          </div>
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">GitHub URL</label>
            <input type="text" class="form-input" value="${proj.github || ''}" data-p-field="github" data-p-idx="${idx}">
          </div>
          <div class="form-group">
            <label class="form-label">Demo URL</label>
            <input type="text" class="form-input" value="${proj.demo || ''}" data-p-field="demo" data-p-idx="${idx}">
          </div>
        </div>
      `;
      container.appendChild(card);
    });

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'btn-add-item';
    addBtn.innerHTML = '+ Add Project';
    addBtn.addEventListener('click', () => {
      portfolioData.projects = portfolioData.projects || [];
      portfolioData.projects.push({
        id: 'proj-' + Date.now(),
        title: 'New Project',
        subtitle: 'Subsystem / App',
        description: 'Description of the architecture and accomplishments.',
        tags: ['Python', 'FastAPI'],
        github: 'https://github.com/mayur-64',
        demo: '#',
        featured: false,
        metrics: 'Key achievement metric',
        image: 'assets/images/project-1.svg'
      });
      renderProjectsForm();
      triggerChange();
    });
    container.appendChild(addBtn);

    // Event listeners
    container.querySelectorAll('[data-p-field]').forEach((input) => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.getAttribute('data-p-idx'), 10);
        const field = e.target.getAttribute('data-p-field');
        if (field === 'tags') {
          portfolioData.projects[idx].tags = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
        } else {
          portfolioData.projects[idx][field] = e.target.value;
        }
        triggerChange();
      });
    });

    container.querySelectorAll('[data-remove-proj]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.getAttribute('data-remove-proj'), 10);
        portfolioData.projects.splice(idx, 1);
        renderProjectsForm();
        triggerChange();
      });
    });
  }

  /* ==========================================================================
     6. Experience Form
     ========================================================================== */
  function renderExperienceForm() {
    const container = document.getElementById('experience-container');
    if (!container) return;
    container.innerHTML = '';

    const exps = portfolioData.experience || [];
    exps.forEach((exp, idx) => {
      const card = document.createElement('div');
      card.className = 'repeater-card';
      card.innerHTML = `
        <div class="repeater-card-header">
          <span class="repeater-card-title">${exp.role || 'Role'} @ ${exp.company || 'Company'}</span>
          <button type="button" class="btn-remove-item" data-remove-exp="${idx}">✕ Delete</button>
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Role Title</label>
            <input type="text" class="form-input" value="${exp.role || ''}" data-exp-field="role" data-exp-idx="${idx}">
          </div>
          <div class="form-group">
            <label class="form-label">Company & Location</label>
            <input type="text" class="form-input" value="${exp.company || ''}" data-exp-field="company" data-exp-idx="${idx}">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Period (e.g. 2023 — Present)</label>
          <input type="text" class="form-input" value="${exp.period || ''}" data-exp-field="period" data-exp-idx="${idx}">
        </div>
        <div class="form-group">
          <label class="form-label">Bullet Achievements (one per line)</label>
          <textarea class="form-textarea" style="min-height:80px;" data-exp-field="bullets" data-exp-idx="${idx}">${(exp.bullets || []).join('\n')}</textarea>
        </div>
      `;
      container.appendChild(card);
    });

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'btn-add-item';
    addBtn.innerHTML = '+ Add Experience';
    addBtn.addEventListener('click', () => {
      portfolioData.experience = portfolioData.experience || [];
      portfolioData.experience.push({
        id: 'exp-' + Date.now(),
        role: 'Software Engineer',
        company: 'Company Name',
        period: '2023 — Present',
        bullets: ['Architected scalable services and microservices.']
      });
      renderExperienceForm();
      triggerChange();
    });
    container.appendChild(addBtn);

    container.querySelectorAll('[data-exp-field]').forEach((input) => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.getAttribute('data-exp-idx'), 10);
        const field = e.target.getAttribute('data-exp-field');
        if (field === 'bullets') {
          portfolioData.experience[idx].bullets = e.target.value.split('\n').map(s => s.trim()).filter(Boolean);
        } else {
          portfolioData.experience[idx][field] = e.target.value;
        }
        triggerChange();
      });
    });

    container.querySelectorAll('[data-remove-exp]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.getAttribute('data-remove-exp'), 10);
        portfolioData.experience.splice(idx, 1);
        renderExperienceForm();
        triggerChange();
      });
    });
  }

  /* ==========================================================================
     7. Education Form
     ========================================================================== */
  function renderEducationForm() {
    const container = document.getElementById('education-container');
    if (!container) return;
    container.innerHTML = '';

    const edus = portfolioData.education || [];
    edus.forEach((edu, idx) => {
      const card = document.createElement('div');
      card.className = 'repeater-card';
      card.innerHTML = `
        <div class="repeater-card-header">
          <span class="repeater-card-title">${edu.degree || 'Degree'}</span>
          <button type="button" class="btn-remove-item" data-remove-edu="${idx}">✕ Delete</button>
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Degree</label>
            <input type="text" class="form-input" value="${edu.degree || ''}" data-edu-field="degree" data-edu-idx="${idx}">
          </div>
          <div class="form-group">
            <label class="form-label">Institution</label>
            <input type="text" class="form-input" value="${edu.institution || ''}" data-edu-field="institution" data-edu-idx="${idx}">
          </div>
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Period</label>
            <input type="text" class="form-input" value="${edu.period || ''}" data-edu-field="period" data-edu-idx="${idx}">
          </div>
          <div class="form-group">
            <label class="form-label">Details / Honors</label>
            <input type="text" class="form-input" value="${edu.details || ''}" data-edu-field="details" data-edu-idx="${idx}">
          </div>
        </div>
      `;
      container.appendChild(card);
    });

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'btn-add-item';
    addBtn.innerHTML = '+ Add Education';
    addBtn.addEventListener('click', () => {
      portfolioData.education = portfolioData.education || [];
      portfolioData.education.push({
        id: 'edu-' + Date.now(),
        degree: 'Degree / Program',
        institution: 'University / Institute',
        period: '2019 — 2023',
        details: 'Specialization details.'
      });
      renderEducationForm();
      triggerChange();
    });
    container.appendChild(addBtn);

    container.querySelectorAll('[data-edu-field]').forEach((input) => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.getAttribute('data-edu-idx'), 10);
        const field = e.target.getAttribute('data-edu-field');
        portfolioData.education[idx][field] = e.target.value;
        triggerChange();
      });
    });

    container.querySelectorAll('[data-remove-edu]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.getAttribute('data-remove-edu'), 10);
        portfolioData.education.splice(idx, 1);
        renderEducationForm();
        triggerChange();
      });
    });
  }

  /* ==========================================================================
     8. Reactive Sync & Live Preview
     ========================================================================== */
  function triggerChange() {
    hasPendingChanges = true;
    localStorage.setItem('portfolio_studio_data', JSON.stringify(portfolioData));
    if (statusSaved) {
      statusSaved.innerHTML = `<span class="status-dot-saved" style="background:#f59e0b;"></span><span>Unrendered Edits</span>`;
    }
    updatePreview();
  }

  function updatePreview() {
    if (!previewFrame) return;
    const compiledHtml = compileIndexHtml(portfolioData);
    previewFrame.srcdoc = compiledHtml;
  }

  /* ==========================================================================
     9. HTML Compiler (Generates Production index.html)
     ========================================================================== */
  function compileIndexHtml(data) {
    const p = data.personal || {};
    const skills = data.skills || [];
    const projects = data.projects || [];
    const exps = data.experience || [];
    const edus = data.education || [];

    const skillsHtml = skills.map((cat, i) => `
          <div class="skill-category-card">
            <h3 class="category-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
              ${escapeHtml(cat.category)}
            </h3>
            <div class="skill-pills">
              ${(cat.items || []).map(item => `<span class="skill-pill"><span class="skill-level-dot"></span>${escapeHtml(item.name)}</span>`).join('\n              ')}
            </div>
          </div>`).join('\n');

    const projectsHtml = projects.map((proj, i) => `
          <article class="project-card">
            <div class="project-thumbnail">
              <img src="${escapeHtml(proj.image || './assets/images/project-1.svg')}" alt="${escapeHtml(proj.title)} preview" loading="lazy">
              ${proj.featured ? '<span class="project-featured-badge">Featured</span>' : ''}
            </div>
            <div class="project-body">
              <h3 class="project-title">${escapeHtml(proj.title)}</h3>
              <p class="project-subtitle">${escapeHtml(proj.subtitle || '')}</p>
              <p class="project-desc">${escapeHtml(proj.description || '')}</p>
              ${proj.metrics ? `<div class="project-metrics">✓ ${escapeHtml(proj.metrics)}</div>` : ''}
              <div class="project-tags">
                ${(proj.tags || []).map(t => `<span class="project-tag">${escapeHtml(t)}</span>`).join('\n                ')}
              </div>
              <div class="project-links">
                ${proj.github ? `<a href="${escapeHtml(proj.github)}" class="project-link-item" target="_blank" rel="noopener noreferrer">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                  Source Code
                </a>` : ''}
                ${proj.demo ? `<a href="${escapeHtml(proj.demo)}" class="project-link-item" target="_blank" rel="noopener noreferrer">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                  View Details
                </a>` : ''}
              </div>
            </div>
          </article>`).join('\n');

    const expsHtml = exps.map(exp => `
          <div class="timeline-item">
            <span class="timeline-marker" aria-hidden="true"></span>
            <div class="timeline-card">
              <div class="timeline-header">
                <h3 class="timeline-role">${escapeHtml(exp.role)}</h3>
                <span class="timeline-period">${escapeHtml(exp.period || '')}</span>
              </div>
              <div class="timeline-company">${escapeHtml(exp.company || '')}</div>
              <ul class="timeline-bullets">
                ${(exp.bullets || []).map(b => `<li class="timeline-bullet">${escapeHtml(b)}</li>`).join('\n                ')}
              </ul>
            </div>
          </div>`).join('\n');

    const edusHtml = edus.map(edu => `
          <div class="timeline-item">
            <span class="timeline-marker" aria-hidden="true"></span>
            <div class="timeline-card">
              <div class="timeline-header">
                <h3 class="timeline-role">${escapeHtml(edu.degree)}</h3>
                <span class="timeline-period">${escapeHtml(edu.period || '')}</span>
              </div>
              <div class="timeline-company">${escapeHtml(edu.institution || '')}</div>
              <ul class="timeline-bullets">
                <li class="timeline-bullet">${escapeHtml(edu.details || '')}</li>
              </ul>
            </div>
          </div>`).join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(p.name || 'Portfolio')} | ${escapeHtml(p.role || 'Developer')}</title>
  <meta name="description" content="${escapeHtml(p.bio || '')}">
  <meta name="keywords" content="${escapeHtml(p.role || '')}, Developer, Portfolio, Resume">
  <meta name="author" content="${escapeHtml(p.name || '')}">
  <meta name="theme-color" content="#0b0f19">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(p.name || 'Portfolio')} | ${escapeHtml(p.role || '')}">
  <meta property="og:description" content="${escapeHtml(p.bio || '')}">
  <meta property="og:image" content="./assets/images/project-1.svg">

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="./assets/favicon.svg">
  <link rel="stylesheet" href="./css/style.css">
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <header class="site-header" role="banner">
    <div class="container nav-wrapper">
      <a href="#hero" class="logo-brand" aria-label="${escapeHtml(p.name || 'Portfolio')} Home">
        <span class="logo-icon">${escapeHtml((p.name || 'M')[0])}</span>
        <span>${escapeHtml(p.name || 'Portfolio')}<span style="color: var(--accent-cyan);">.dev</span></span>
      </a>

      <nav id="site-nav" role="navigation" aria-label="Main Navigation">
        <ul class="nav-links" id="nav-links">
          <li><a href="#about" class="nav-link">About</a></li>
          <li><a href="#skills" class="nav-link">Skills</a></li>
          <li><a href="#projects" class="nav-link">Projects</a></li>
          <li><a href="#experience" class="nav-link">Experience</a></li>
          <li><a href="#resume" class="nav-link">Resume</a></li>
          <li><a href="#contact" class="nav-link">Contact</a></li>
        </ul>
      </nav>

      <div class="nav-actions">
        <a href="./editor.html" class="btn-studio" title="Open Studio Editor" aria-label="Open Studio Editor">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
          <span>Studio</span>
        </a>
        <button id="theme-toggle" class="btn-icon" aria-label="Switch Theme" type="button"></button>
        <button id="mobile-menu-btn" class="btn-icon mobile-menu-btn" aria-label="Toggle Menu" aria-expanded="false" type="button">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
      </div>
    </div>
  </header>

  <main id="main-content" role="main">
    <section id="hero" class="section-hero">
      <div class="container hero-content">
        <div class="badge-status">
          <span class="status-dot"></span>
          <span>${escapeHtml(p.status || 'Available for opportunities')}</span>
        </div>
        <p class="hero-greeting">Hi, my name is</p>
        <h1 id="hero-title" class="hero-title">
          <span class="text-gradient">${escapeHtml(p.name || 'Your Name')}.</span>
        </h1>
        <p class="hero-headline">${escapeHtml(p.headline || '')}</p>
        <p class="hero-bio">${escapeHtml(p.bio || '')}</p>
        <div class="hero-actions">
          <a href="./${escapeHtml(p.resumeUrl || 'assets/resume.pdf')}" class="btn btn-primary" download>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Download Resume
          </a>
          <a href="#contact" class="btn btn-secondary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            Get In Touch
          </a>
        </div>
        <div class="hero-stats">
          <div class="stat-item"><span class="stat-value">4+</span><span class="stat-label">Years Experience</span></div>
          <div class="stat-item"><span class="stat-value">10M+</span><span class="stat-label">Daily API Requests</span></div>
          <div class="stat-item"><span class="stat-value">100/100</span><span class="stat-label">Lighthouse Audits</span></div>
        </div>
      </div>
    </section>

    <section id="about">
      <div class="container">
        <div class="section-header">
          <span class="section-tag">01. Overview</span>
          <h2 class="section-title">About Me</h2>
          <p class="section-subtitle">A brief overview of my engineering philosophy, background, and what drives me.</p>
        </div>
        <div class="about-grid">
          <div class="about-text">
            <p>${escapeHtml(p.bio || '')}</p>
          </div>
          <div class="about-highlights">
            <div class="highlight-card">
              <h4>Distributed Systems & APIs</h4>
              <p>Designing RESTful interfaces, asynchronous queues, and microservices.</p>
            </div>
            <div class="highlight-card">
              <h4>Linux & System Internals</h4>
              <p>POSIX process management, low-overhead resource profiling, and hardware optimization.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="skills">
      <div class="container">
        <div class="section-header">
          <span class="section-tag">02. Capabilities</span>
          <h2 class="section-title">Technical Skills</h2>
          <p class="section-subtitle">Core technologies and frameworks I leverage daily.</p>
        </div>
        <div class="skills-grid">
${skillsHtml}
        </div>
      </div>
    </section>

    <section id="projects">
      <div class="container">
        <div class="section-header">
          <span class="section-tag">03. Portfolio</span>
          <h2 class="section-title">Featured Projects</h2>
          <p class="section-subtitle">Real-world production tools and backend systems engineered for speed and reliability.</p>
        </div>
        <div class="projects-grid">
${projectsHtml}
        </div>
      </div>
    </section>

    <section id="experience">
      <div class="container">
        <div class="section-header">
          <span class="section-tag">04. Background</span>
          <h2 class="section-title">Experience & Education</h2>
        </div>
        <div class="timeline-container">
${expsHtml}
${edusHtml}
        </div>
      </div>
    </section>

    <section id="resume">
      <div class="container">
        <div class="section-header">
          <span class="section-tag">05. Documentation</span>
          <h2 class="section-title">Resume & Curriculum Vitae</h2>
        </div>
        <div class="resume-wrapper">
          <div class="resume-cta-bar">
            <div class="resume-info">
              <h3>${escapeHtml(p.name || 'Resume')}_Resume.pdf</h3>
              <p>Standard format • Updated for current roles • Print-optimized</p>
            </div>
            <div class="resume-actions">
              <a href="./${escapeHtml(p.resumeUrl || 'assets/resume.pdf')}" class="btn btn-primary" download>Download PDF</a>
              <button type="button" class="btn btn-secondary" onclick="window.print()">Print / Save PDF</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="contact">
      <div class="container">
        <div class="contact-card">
          <span class="section-tag">06. Next Steps</span>
          <h2 class="contact-heading">Get In Touch</h2>
          <p class="contact-text">Currently open to engineering opportunities and collaborations.</p>
          <div class="contact-actions">
            <a href="mailto:${escapeHtml(p.email || 'hello@example.com')}" class="btn btn-primary">Say Hello</a>
            <button type="button" class="btn btn-secondary" id="copy-email-btn" data-email="${escapeHtml(p.email || '')}">Copy Email Address</button>
          </div>
          <div class="contact-socials">
            ${p.github ? `<a href="${escapeHtml(p.github)}" class="social-link" target="_blank" rel="noopener noreferrer">GitHub</a>` : ''}
            ${p.linkedin ? `<a href="${escapeHtml(p.linkedin)}" class="social-link" target="_blank" rel="noopener noreferrer">LinkedIn</a>` : ''}
            ${p.twitter ? `<a href="${escapeHtml(p.twitter)}" class="social-link" target="_blank" rel="noopener noreferrer">Twitter / X</a>` : ''}
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="container footer-wrapper">
      <p>© <span id="current-year"></span> ${escapeHtml(p.name || 'Mayur')}. Built with clean HTML, CSS & Vanilla JS.</p>
      <ul class="footer-nav">
        <li><a href="./editor.html" class="footer-link">Studio Editor</a></li>
        <li><a href="#hero" class="btn-top" id="back-to-top">Back to top ↑</a></li>
      </ul>
    </div>
  </footer>

  <aside id="toast-notice" class="toast-notice" role="status" aria-live="polite">
    <span id="toast-msg">Copied!</span>
  </aside>
  <script src="./js/main.js"></script>
</body>
</html>`;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ==========================================================================
     10. Event Listeners & Actions
     ========================================================================== */
  function setupEventListeners() {
    // Profile inputs
    const map = [
      ['p-name', 'name'],
      ['p-role', 'role'],
      ['p-headline', 'headline'],
      ['p-bio', 'bio'],
      ['p-location', 'location'],
      ['p-email', 'email'],
      ['p-github', 'github'],
      ['p-linkedin', 'linkedin'],
      ['p-twitter', 'twitter'],
      ['p-status', 'status']
    ];

    map.forEach(([id, key]) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', (e) => {
          portfolioData.personal[key] = e.target.value;
          triggerChange();
        });
      }
    });

    // Theme selector
    const themeSelect = document.getElementById('t-palette');
    if (themeSelect) {
      themeSelect.addEventListener('change', (e) => {
        portfolioData.theme.palette = e.target.value;
        triggerChange();
      });
    }

    // Device switchers
    deviceBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        deviceBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const device = btn.getAttribute('data-device');
        previewContainer.className = 'preview-frame-container preview-' + device;
      });
    });

    // Render & Build Button
    if (renderBtn) {
      renderBtn.addEventListener('click', async () => {
        const html = compileIndexHtml(portfolioData);
        renderBtn.disabled = true;
        renderBtn.textContent = '⚡ Rendering...';

        try {
          const res = await fetch('/api/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: portfolioData, html: html })
          });

          if (res.ok) {
            hasPendingChanges = false;
            statusSaved.innerHTML = `<span class="status-dot-saved"></span><span>Site Rendered & Saved</span>`;
            alert('✓ Success: index.html and resume.json compiled and written to disk!');
          } else {
            fallbackDownload(html);
          }
        } catch (e) {
          fallbackDownload(html);
        } finally {
          renderBtn.disabled = false;
          renderBtn.innerHTML = `<span>⚡ Render & Build</span>`;
          updatePreview();
        }
      });
    }

    // Deploy Button
    if (deployBtn) {
      deployBtn.addEventListener('click', () => {
        deployModal.classList.add('open');
        checkGitStatus();
      });
    }

    if (closeDeployModal) {
      closeDeployModal.addEventListener('click', () => {
        deployModal.classList.remove('open');
      });
    }

    if (runDeployBtn) {
      runDeployBtn.addEventListener('click', async () => {
        const commitMsg = commitMsgInput.value.trim() || 'Update portfolio content via studio editor';
        runDeployBtn.disabled = true;
        runDeployBtn.textContent = 'Deploying...';
        appendConsole(`$ git commit -m "${commitMsg}" && git push origin main\nExecuting deployment...`);

        try {
          const res = await fetch('/api/deploy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: commitMsg })
          });
          const result = await res.json();
          appendConsole(result.output || result.error || 'Deployment finished.');
          if (result.success) {
            appendConsole('\n✓ Deployment complete! Changes will appear on GitHub Pages in 1-2 minutes.');
          }
        } catch (e) {
          appendConsole('\nNote: Dev server not responding or local offline mode. Run git push manually or start dev_server.py.');
        } finally {
          runDeployBtn.disabled = false;
          runDeployBtn.textContent = 'Run Deploy';
        }
      });
    }

    // Print / Export PDF
    if (printPdfBtn) {
      printPdfBtn.addEventListener('click', () => {
        if (previewFrame && previewFrame.contentWindow) {
          previewFrame.contentWindow.print();
        } else {
          window.print();
        }
      });
    }

    // Export JSON
    if (exportJsonBtn) {
      exportJsonBtn.addEventListener('click', () => {
        const blob = new Blob([JSON.stringify(portfolioData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'resume.json';
        a.click();
        URL.revokeObjectURL(url);
      });
    }

    // Import JSON
    if (importJsonInput) {
      importJsonInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            portfolioData = JSON.parse(event.target.result);
            populateForms();
            triggerChange();
            alert('✓ Portfolio data imported successfully!');
          } catch (err) {
            alert('Invalid JSON file format.');
          }
        };
        reader.readAsText(file);
      });
    }
  }

  function fallbackDownload(html) {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    a.click();
    URL.revokeObjectURL(url);
    alert('Downloaded index.html! Place it in your project root.');
  }

  async function checkGitStatus() {
    appendConsole('Checking local git status...');
    try {
      const res = await fetch('/api/git-status');
      if (res.ok) {
        const data = await res.json();
        appendConsole(`Branch: ${data.branch}\nStatus:\n${data.status || 'Clean working tree'}\nLast commit: ${data.last_commit || 'None'}`);
      } else {
        appendConsole('Git status unavailable via dev server.');
      }
    } catch (e) {
      appendConsole('Dev server offline. Ready for git push when running dev_server.py.');
    }
  }

  function appendConsole(msg) {
    if (!deployConsole) return;
    deployConsole.textContent += '\n' + msg;
    deployConsole.scrollTop = deployConsole.scrollHeight;
  }

  function getDefaultData() {
    return {
      personal: { name: 'Mayur', role: 'Developer', headline: '', bio: '', email: '' },
      skills: [],
      projects: [],
      experience: [],
      education: [],
      theme: { palette: 'indigo' }
    };
  }

  // Run init on load
  document.addEventListener('DOMContentLoaded', init);
})();
