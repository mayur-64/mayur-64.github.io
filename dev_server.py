#!/usr/bin/env python3
"""
Zero-dependency Development Server for Portfolio Website.
Runs on Port 8080 (Safe port per AGENTS.md rules).
Serves static assets locally with no external pip dependencies.
"""

import http.server
import socketserver
import os

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class PortfolioHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def run_server():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("0.0.0.0", PORT), PortfolioHandler) as httpd:
        print(f"Portfolio Dev Server running on http://127.0.0.1:{PORT}/")
        print("Press Ctrl+C to stop.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down dev server.")

if __name__ == "__main__":
    run_server()
