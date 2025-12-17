import csv
import json
import urllib.request
import io

URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRr-bNUq69_4hAWmzSnqU0fA4mlp1sZfaQ51OmFI3zdr3ZtF6MZpPNnG87K_mfi_GpBFfywYBX8CB47/pub?gid=423837787&single=true&output=csv"
OUTPUT_FILE = "e:/Antigravity/hospital_data.js"

try:
    print(f"Fetching data from {URL}...")
    with urllib.request.urlopen(URL) as response:
        csv_data = response.read().decode('utf-8')

    print("Parsing CSV...")
    # Use csv module which handles quotes and newlines correctly
    f = io.StringIO(csv_data)
    reader = csv.DictReader(f)
    
    hospitals = []
    for row in reader:
        # Map fields to our schema
        # CSV Headers: region,name,address,phone,hours,is_24h,has_night,...
        
        is_24h = row.get('is_24h', 'FALSE').upper() == 'TRUE'
        has_night = row.get('has_night', 'FALSE').upper() == 'TRUE'
        has_sunday = row.get('has_sunday', 'FALSE').upper() == 'TRUE'
        has_holiday = row.get('has_holiday', 'FALSE').upper() == 'TRUE'
        
        hospital = {
            "region": row.get('region', ''),
            "name": row.get('name', ''),
            "address": row.get('address', ''),
            "phone": row.get('phone', ''),
            "hours": row.get('hours', ''),
            "is_24h": is_24h,
            "has_night": has_night,
            "has_sunday": has_sunday,
            "has_holiday": has_holiday
        }
        hospitals.append(hospital)

    print(f"Processed {len(hospitals)} hospitals.")
    
    # Generate JS content
    js_content = f"// Google Sheet Data (Snapshot from Python Script)\nconst hospitalData = {json.dumps(hospitals, indent=4, ensure_ascii=False)};"
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(js_content)
        
    print(f"Successfully wrote to {OUTPUT_FILE}")

except Exception as e:
    print(f"Error: {e}")
