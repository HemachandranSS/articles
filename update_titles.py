import os
import re

dir_path = "/home/cipl1168/Music/Articles/2026/"
html_files = []
for root, dirs, files in os.walk(dir_path):
    for f in files:
        if f.endswith(".html"):
            html_files.append(os.path.join(root, f))

title_pattern = re.compile(r'<title>(.*?)<\/title>', re.IGNORECASE | re.DOTALL)
h1_pattern = re.compile(r'<h1[^>]*>(.*?)<\/h1>', re.IGNORECASE | re.DOTALL)

updated_count = 0
for fpath in html_files:
    try:
        with open(fpath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        h1_match = h1_pattern.search(content)
        title_text = ""
        is_fallback = False
        
        if h1_match:
            title_text = h1_match.group(1).strip()
            title_text = re.sub(r'<[^>]+>', '', title_text) # strip inner tags
        else:
            base_name = os.path.basename(fpath).replace(".html", "").replace("-", " ")
            title_text = base_name.title()
            is_fallback = True

        new_title = f"<title>{title_text}</title>"
        new_content = title_pattern.sub(new_title, content)
        
        if content != new_content:
            with open(fpath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            status = "Fallback" if is_fallback else "H1"
            print(f"[{status}] Updated {fpath.replace(dir_path, '')} -> {title_text}")
            updated_count += 1
    except Exception as e:
        print(f"Error processing {fpath}: {e}")

print(f"\nTotal files updated: {updated_count}")
