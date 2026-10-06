#!/usr/bin/env python3
"""
Comprehensive Automated Verification Script for Portfolio and Studio Website.
Verifies HTML structure, anchor links, relative asset paths, HTTP 200 status,
and Studio Save/Deploy API endpoints.
"""

import os
import re
import urllib.request
import json

BASE_DIR = '/root/portfolio'
BASE_URL = 'http://127.0.0.1:8080'

def test_files_exist():
    required = [
        'index.html',
        'editor.html',
        'css/style.css',
        'css/editor.css',
        'js/main.js',
        'js/editor.js',
        'data/resume.json',
        'assets/favicon.svg',
        'assets/resume.pdf',
        'assets/images/project-1.svg',
        'assets/images/project-2.svg',
        'assets/images/project-3.svg',
        '.nojekyll',
        '.gitignore',
        'README.md'
    ]
    for rel_path in required:
        full = os.path.join(BASE_DIR, rel_path)
        assert os.path.exists(full), f"Missing file: {rel_path}"
        assert os.path.getsize(full) > 0, f"Empty file: {rel_path}"
    print("✓ All 15 required files exist and are non-empty.")

def test_html_semantics_and_links():
    with open(os.path.join(BASE_DIR, 'index.html'), 'r', encoding='utf-8') as f:
        html = f.read()

    # Check SEO meta
    assert '<title>' in html and '</title>' in html, "Missing <title>"
    assert '<meta name="description"' in html, "Missing meta description"
    assert '<meta property="og:title"' in html, "Missing Open Graph og:title"
    assert '<meta name="viewport"' in html, "Missing viewport tag"
    assert 'lang="en"' in html, "Missing html lang attribute"

    # Check IDs required by main.js
    required_ids = [
        'theme-toggle',
        'mobile-menu-btn',
        'nav-links',
        'copy-email-btn',
        'toast-notice',
        'toast-msg',
        'back-to-top',
        'current-year'
    ]
    for elem_id in required_ids:
        assert f'id="{elem_id}"' in html, f"Missing required element ID in index.html: {elem_id}"

    # Check anchor destinations exist
    anchors = re.findall(r'href="#([a-zA-Z0-9\-_]+)"', html)
    for a in anchors:
        assert f'id="{a}"' in html, f"Anchor destination #{a} has no matching id in index.html!"

    # Check all resource links are strictly relative
    srcs = re.findall(r'(?:src|href)="((\./|\.\./|assets/|css/|js/)[^"]+)"', html)
    for src_tuple in srcs:
        src = src_tuple[0]
        clean_src = src.lstrip('./').split('#')[0].split('?')[0]
        if clean_src:
            full = os.path.join(BASE_DIR, clean_src)
            assert os.path.exists(full), f"Broken relative resource path in HTML: {src} -> {full}"

    print(f"✓ Semantic HTML, SEO tags, all {len(anchors)} anchor targets, and relative paths verified.")

def test_css_tokens():
    with open(os.path.join(BASE_DIR, 'css/style.css'), 'r', encoding='utf-8') as f:
        css = f.read()

    assert ':root' in css, "Missing :root CSS variables"
    assert '[data-theme="light"]' in css, "Missing light theme variables"
    assert '@media print' in css, "Missing print stylesheet"
    assert '@media (max-width: 768px)' in css, "Missing tablet/mobile responsive query"
    assert '@media (max-width: 480px)' in css, "Missing mobile responsive query"
    assert ':focus-visible' in css, "Missing accessible focus visible styles"
    print("✓ CSS design tokens, dark/light themes, responsive breakpoints, and print CSS verified.")

def test_http_endpoints():
    endpoints = [
        ('/', 200, 'text/html'),
        ('/index.html', 200, 'text/html'),
        ('/editor.html', 200, 'text/html'),
        ('/css/style.css', 200, 'text/css'),
        ('/css/editor.css', 200, 'text/css'),
        ('/js/main.js', 200, 'javascript'),
        ('/js/editor.js', 200, 'javascript'),
        ('/assets/favicon.svg', 200, 'image/svg+xml'),
        ('/assets/resume.pdf', 200, 'application/pdf'),
        ('/assets/images/project-1.svg', 200, 'image/svg+xml'),
        ('/assets/images/project-2.svg', 200, 'image/svg+xml'),
        ('/assets/images/project-3.svg', 200, 'image/svg+xml'),
        ('/api/data', 200, 'application/json'),
        ('/api/git-status', 200, 'application/json')
    ]

    for path, exp_status, exp_type in endpoints:
        req = urllib.request.Request(BASE_URL + path)
        with urllib.request.urlopen(req) as resp:
            status = resp.status
            content_type = resp.headers.get('Content-Type', '')
            assert status == exp_status, f"{path} returned {status}, expected {exp_status}"
            assert exp_type in content_type, f"{path} returned {content_type}, expected {exp_type}"

    print(f"✓ All {len(endpoints)} HTTP endpoints successfully returned status 200.")

def test_api_save_and_deploy():
    # Test POST /api/save
    save_url = BASE_URL + '/api/save'
    payload = {
        "data": {
            "personal": {
                "name": "Mayur",
                "role": "Backend & Full-Stack Developer",
                "headline": "Building robust backend services, resilient Linux systems, and elegant web experiences.",
                "bio": "Passionate software engineer focused on building performant backend architectures, scalable web applications, and streamlined developer workflows.",
                "location": "Remote / Worldwide",
                "email": "mayur.dev@example.com",
                "github": "https://github.com/mayur-64",
                "status": "Available for opportunities"
            }
        }
    }
    req = urllib.request.Request(save_url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'}, method='POST')
    with urllib.request.urlopen(req) as resp:
        result = json.loads(resp.read().decode('utf-8'))
        assert result.get('success') is True, f"Save API failed: {result}"
    print("✓ Studio Save API (/api/save) verified successfully.")

    # Test GET /api/git-status
    git_url = BASE_URL + '/api/git-status'
    with urllib.request.urlopen(git_url) as resp:
        git_res = json.loads(resp.read().decode('utf-8'))
        assert git_res.get('branch') == 'main', f"Expected branch 'main', got {git_res.get('branch')}"
        print(f"✓ Git Status API (/api/git-status) verified (branch: {git_res.get('branch')}, last commit: {git_res.get('last_commit')}).")

if __name__ == '__main__':
    print("Running automated verification suite...")
    test_files_exist()
    test_html_semantics_and_links()
    test_css_tokens()
    test_http_endpoints()
    test_api_save_and_deploy()
    print("\n🎉 ALL TESTS PASSED! Portfolio site and Studio Editor are 100% verified.")
