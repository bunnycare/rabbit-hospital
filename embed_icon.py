
import os

def embed_icon():
    css_path = r"e:\Antigravity\style.css"
    base64_path = r"e:\Antigravity\icon_base64.txt"
    
    try:
        with open(base64_path, 'r') as f:
            base64_str = f.read().strip()
            
        with open(css_path, 'r', encoding='utf-8') as f:
            css_content = f.read()
            
        new_url = f"url('data:image/png;base64,{base64_str}')"
        new_css = css_content.replace("url('instagram_icon.png')", new_url)
        
        with open(css_path, 'w', encoding='utf-8') as f:
            f.write(new_css)
            
        print("Successfully embedded base64 icon.")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    embed_icon()
