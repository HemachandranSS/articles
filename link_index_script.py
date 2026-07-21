import os
import re

base_dir = "/home/cipl1168/Music/Articles"
assets_js = "assets/js/index.js"

for root, _, files in os.walk(base_dir):
    for filename in files:
        if filename == "index.html":
            filepath = os.path.join(root, filename)
            
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            
            # Use regex to find and remove the recently added inline script entirely.
            # The inline script checks for DOMContentLoaded and handles .date-badge
            script_pattern = re.compile(r'\s*<script>\s*document\.addEventListener\([\'"]DOMContentLoaded[\'"].*?const todayId = `date-\$\{yyyy\}-\$\{mm\}-\$\{dd\}`;.*?\}\);\s*\}\);\s*</script>', re.DOTALL)
            content_without_script = script_pattern.sub('', content)

            if '<script src="' not in content_without_script or assets_js not in content_without_script:
                rel_path = os.path.relpath(base_dir, root)
                if rel_path == ".":
                    rel_path = ""
                else:
                    rel_path += "/"
                
                js_link = f'\n    <script src="{rel_path}{assets_js}"></script>'
                # inject right before </body>
                new_content = content_without_script.replace('</body>', f'{js_link}\n</body>')
            else:
                new_content = content_without_script

            if new_content != content:
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(new_content)
                print(f"Updated {filepath}")
