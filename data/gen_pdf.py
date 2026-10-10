#!/usr/bin/env python3
"""
Zero-dependency PDF generator that produces a valid, clean PDF 1.4 resume document.
"""
import os

def create_resume_pdf(output_path):
    lines = [
        "MAYUR - BACKEND & FULL-STACK DEVELOPER",
        "Email: mayur.dev@example.com | GitHub: github.com/mayur-64 | Location: Remote",
        "--------------------------------------------------------------------------------",
        "",
        "SUMMARY",
        "Passionate software engineer focused on building performant backend architectures,",
        "scalable web applications, and streamlined automation workflows. Experienced with Python,",
        "Linux systems, modern JavaScript, and clean API design.",
        "",
        "TECHNICAL SKILLS",
        "* Languages: Python, JavaScript (ES6+), SQL, Bash / Shell, HTML5 & Modern CSS",
        "* Backend: FastAPI, Starlette, AsyncIO, RESTful APIs, Concurrency, Microservices",
        "* Systems & DevOps: Linux/POSIX, Git, GitHub Actions, ARM64 Kryo, Process Management",
        "* Quality: WCAG AA Accessibility, Lighthouse 100/100, Performance Profiling",
        "",
        "FEATURED PROJECTS",
        "* Project Monitor PaaS - Personal PaaS control plane and health monitoring dashboard.",
        "  Stack: Python, FastAPI, Linux, REST API, WebSocket.",
        "* PocketGallery - High-performance photo and video indexing engine.",
        "  Stack: Python, FastAPI, SQLite WAL, Vanilla JS, FFmpeg.",
        "* Edge Task Orchestrator - Async micro-task scheduler for ARM64 edge systems.",
        "  Stack: Python, AsyncIO, Multi-Processing.",
        "",
        "EXPERIENCE",
        "* Senior Backend & Systems Developer | Tech Horizon Systems (2023 - Present)",
        "  - Architected high-throughput API microservices handling 12M+ daily requests.",
        "  - Optimized SQLite WAL concurrency and query plans, cutting p95 latency by 45%.",
        "  - Streamlined automated CI/CD pipelines, slashing build times from 35m to 6m.",
        "",
        "* Software Engineer | Apex Cloud Solutions (2021 - 2023)",
        "  - Developed full-stack web applications and internal telemetry dashboards.",
        "  - Integrated real-time edge telemetry and asynchronous queue workers.",
        "",
        "EDUCATION & CERTIFICATIONS",
        "* B.S. in Computer Science - University of Technology (Honors Graduate)",
        "* Linux Professional Institute Certification (LPIC-1) | AWS Certified Solutions Architect",
        "",
        "--------------------------------------------------------------------------------",
        "(Generated placeholder resume - replace with your resume.pdf)"
    ]

    # Convert lines to PDF content stream
    content_stream = "BT\n/F1 10 Tf\n14 TL\n50 780 Td\n"
    for i, line in enumerate(lines):
        # Escape parenthesis and backslashes for PDF
        escaped = line.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
        if i == 0:
            content_stream += f"/F2 16 Tf\n({escaped}) Tj\n/F1 10 Tf\nT*\n"
        elif line.startswith("SUMMARY") or line.startswith("TECHNICAL") or line.startswith("FEATURED") or line.startswith("EXPERIENCE") or line.startswith("EDUCATION"):
            content_stream += f"/F2 12 Tf\nT*\n({escaped}) Tj\n/F1 10 Tf\nT*\n"
        else:
            content_stream += f"({escaped}) Tj\nT*\n"
    content_stream += "ET\n"

    stream_bytes = content_stream.encode('latin1')
    stream_len = len(stream_bytes)

    objects = []
    # 1: Catalog
    objects.append(b"<< /Type /Catalog /Pages 2 0 R >>")
    # 2: Pages
    objects.append(b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>")
    # 3: Page
    objects.append(b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>")
    # 4: Contents
    objects.append(b"<< /Length " + str(stream_len).encode('ascii') + b" >>\nstream\n" + stream_bytes + b"\nendstream")
    # 5: Font Regular
    objects.append(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
    # 6: Font Bold
    objects.append(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")

    pdf = bytearray(b"%PDF-1.4\n")
    offsets = []
    for i, obj in enumerate(objects, 1):
        offsets.append(len(pdf))
        pdf.extend(f"{i} 0 obj\n".encode('ascii'))
        pdf.extend(obj)
        pdf.extend(b"\nendobj\n")

    xref_offset = len(pdf)
    pdf.extend(f"xref\n0 {len(objects) + 1}\n".encode('ascii'))
    pdf.extend(b"0000000000 65535 f \n")
    for offset in offsets:
        pdf.extend(f"{offset:010d} 00000 n \n".encode('ascii'))

    pdf.extend(f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref_offset}\n%%EOF\n".encode('ascii'))

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'wb') as f:
        f.write(pdf)
    print(f"Generated valid PDF at {output_path} ({len(pdf)} bytes)")

if __name__ == "__main__":
    create_resume_pdf("/root/portfolio/assets/resume.pdf")
