import base64
import sys

def image_to_base64(path):
    try:
        with open(path, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
            print(encoded_string)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    image_to_base64(r"e:\Antigravity\instagram_icon.png")
