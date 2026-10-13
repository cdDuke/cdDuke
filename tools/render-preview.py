# Renders README.md through GitHub's own markdown API (README mode) for a local visual check.
import pathlib, subprocess
root = pathlib.Path(__file__).resolve().parent.parent
md = (root / 'README.md').read_text()
html = subprocess.run(['gh', 'api', 'markdown', '-f', f'text={md}', '-f', 'mode=markdown'], capture_output=True, text=True, check=True).stdout
page = f'''<!doctype html><html><head><meta charset="utf-8"><base href="{root.as_uri()}/">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/github-markdown-css@5/github-markdown-dark.css">
<style>body{{background:#0d1117;margin:0}} .markdown-body{{box-sizing:border-box;max-width:1012px;margin:0 auto;padding:32px}}</style></head>
<body><article class="markdown-body">{html}</article></body></html>'''
(root / 'tools' / 'preview.html').write_text(page)
print('preview.html', len(html))
