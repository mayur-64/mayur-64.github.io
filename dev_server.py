#!/usr/bin/env python3
"""
Zero-dependency Development & Studio Server for Portfolio Website.
Runs on Port 8080 (Safe port per AGENTS.md rules).
Provides static serving + Studio Save & Deploy API endpoints.
"""

import http.server
import socketserver
import os
import json
import subprocess
import urllib.parse

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class PortfolioStudioHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        # API: Data
        if self.path.startswith('/api/data'):
            data_file = os.path.join(DIRECTORY, 'data', 'resume.json')
            if os.path.exists(data_file):
                with open(data_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(content.encode('utf-8'))
            else:
                self.send_error(404, 'Data file not found')
            return

        # API: Git Status
        if self.path.startswith('/api/git-status'):
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            try:
                branch = subprocess.check_output(['git', 'branch', '--show-current'], cwd=DIRECTORY, stderr=subprocess.STDOUT).decode('utf-8').strip()
            except Exception:
                branch = 'unknown'
            try:
                status = subprocess.check_output(['git', 'status', '-s'], cwd=DIRECTORY, stderr=subprocess.STDOUT).decode('utf-8').strip()
            except Exception:
                status = 'git not initialized or error'
            try:
                last_commit = subprocess.check_output(['git', 'log', '-1', '--oneline'], cwd=DIRECTORY, stderr=subprocess.STDOUT).decode('utf-8').strip()
            except Exception:
                last_commit = 'No commits yet'

            resp = {'branch': branch, 'status': status, 'last_commit': last_commit}
            self.wfile.write(json.dumps(resp).encode('utf-8'))
            return

        # Default static serving
        super().do_GET()

    def do_POST(self):
        # API: Save Rendered Content
        if self.path == '/api/save':
            length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(length)
            try:
                payload = json.loads(body.decode('utf-8'))
                data = payload.get('data')
                html = payload.get('html')

                if data:
                    data_file = os.path.join(DIRECTORY, 'data', 'resume.json')
                    with open(data_file, 'w', encoding='utf-8') as f:
                        json.dump(data, f, indent=2)

                if html:
                    index_file = os.path.join(DIRECTORY, 'index.html')
                    with open(index_file, 'w', encoding='utf-8') as f:
                        f.write(html)

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': True, 'message': 'Saved successfully'}).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': False, 'error': str(e)}).encode('utf-8'))
            return

        # API: Deploy to Git
        if self.path == '/api/deploy':
            length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(length)
            try:
                payload = json.loads(body.decode('utf-8')) if length > 0 else {}
                commit_msg = payload.get('message', 'Update portfolio content via studio editor')

                output_logs = []
                # 1. git add .
                res_add = subprocess.run(['git', 'add', '.'], cwd=DIRECTORY, capture_output=True, text=True)
                output_logs.append(f"$ git add .\n{res_add.stdout}{res_add.stderr}")

                # 2. git commit -m ...
                res_commit = subprocess.run(['git', 'commit', '-m', commit_msg], cwd=DIRECTORY, capture_output=True, text=True)
                output_logs.append(f"$ git commit -m \"{commit_msg}\"\n{res_commit.stdout}{res_commit.stderr}")

                # 3. Check remote
                res_remotes = subprocess.run(['git', 'remote', '-v'], cwd=DIRECTORY, capture_output=True, text=True)
                if 'origin' in res_remotes.stdout:
                    res_push = subprocess.run(['git', 'push', 'origin', 'HEAD'], cwd=DIRECTORY, capture_output=True, text=True)
                    output_logs.append(f"$ git push origin HEAD\n{res_push.stdout}{res_push.stderr}")
                    success = (res_push.returncode == 0)
                else:
                    output_logs.append("No git remote 'origin' configured yet.\nCommit created locally. Add your GitHub remote to enable automatic push.")
                    success = True

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': success, 'output': '\n'.join(output_logs)}).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': False, 'error': str(e)}).encode('utf-8'))
            return

        self.send_error(404, 'Endpoint not found')

def run_server():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("0.0.0.0", PORT), PortfolioStudioHandler) as httpd:
        print(f"Portfolio Dev & Studio Server running on http://127.0.0.1:{PORT}/")
        print(f"Studio Editor available at http://127.0.0.1:{PORT}/editor.html")
        httpd.serve_forever()

if __name__ == "__main__":
    run_server()
