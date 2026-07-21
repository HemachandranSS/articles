import os
import re

base_dir = "/home/cipl1168/Music/Articles"
count = 0
for root, _, files in os.walk(base_dir):
    for filename in files:
        if filename.endswith(".html"):
            filepath = os.path.join(root, filename)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            
            # Remove the hanging `<style>` before `</head>`
            new_content = re.sub(r'<style>\s*</head>', '</head>', content)
            
            if new_content != content:
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(new_content)
                count += 1
                print(f"Fixed {filepath}")

print(f"Total fixed: {count}")
