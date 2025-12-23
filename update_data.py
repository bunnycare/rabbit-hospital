import urllib.request

URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRr-bNUq69_4hAWmzSnqU0fA4mlp1sZfaQ51OmFI3zdr3ZtF6MZpPNnG87K_mfi_GpBFfywYBX8CB47/pub?gid=423837787&single=true&output=csv"
OUTPUT_FILE = "d:/버니케어/251223/hospital_data.js"
CSV_FILE = "d:/버니케어/251223/hospital_data.csv"

try:
    print(f"Fetching data from {URL}...")
    with urllib.request.urlopen(URL) as response:
        csv_data = response.read().decode('utf-8')

    # Save raw CSV for reference
    with open(CSV_FILE, 'w', encoding='utf-8') as f:
        f.write(csv_data)
    print(f"Saved raw CSV to {CSV_FILE}")

    # Generate JS content with backticks for multiline string
    # Escape backticks if any exist in data (though unlikely in CSV)
    safe_data = csv_data.replace('`', '\\`')
    js_content = f"const hospitalDataRAW = `{safe_data}`;"
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(js_content)
        
    print(f"Successfully updated {OUTPUT_FILE}")

except Exception as e:
    print(f"Error: {e}")
