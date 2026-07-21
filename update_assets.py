import os
import re

base_dir = "/home/cipl1168/Music/Articles"
assets_css = "assets/css/article.css"
assets_js = "assets/js/vocab-modal.js"

count = 0
for root, _, files in os.walk(base_dir):
    for filename in files:
        if filename.endswith(".html"):
            filepath = os.path.join(root, filename)
            
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            
            if 'class="article-wrapper"' not in content and 'vocab-modal.js' not in content and 'modal-overlay' not in content:
                continue
                
            rel_path = os.path.relpath(base_dir, root)
            if rel_path == ".":
                rel_path = ""
            else:
                rel_path += "/"
                
            css_link = f'<link rel="stylesheet" href="{rel_path}{assets_css}" />'
            js_link = f'<script src="{rel_path}{assets_js}"></script>'
            
            new_content = content
            
            # Replace inline <style> block containing '--bg:#f4f1eb' or '--bg: #f4f1eb'
            # Check if it already has the generic link
            if css_link not in new_content:
                new_content = re.sub(r'<style>[^<]*?(?:--bg:\s*#f4f1eb;|--bg:#f4f1eb;|--vocab-color:).*?</style>', css_link, new_content, flags=re.DOTALL)
            
            # Replace inline <script> block
            if js_link not in new_content:
                new_content = re.sub(r'<script>[^<]*?getElementById\(\'meaningModal\'\).*?</script>', js_link, new_content, flags=re.DOTALL)
            
            if new_content != content:
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(new_content)
                count += 1
                print(f"Updated {filepath}")

print(f"Total updated: {count}")
