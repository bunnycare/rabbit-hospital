import csv
import json

CSV_FILE = "e:/Antigravity/hospital_data.csv"
OUTPUT_FILE = "e:/Antigravity/hospital_data.js"

try:
    print(f"Reading data from {CSV_FILE}...")
    
    hospitals = []
    with open(CSV_FILE, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Map fields to our schema
            is_24h = row.get('is_24h', 'FALSE').upper() == 'TRUE'
            has_night = row.get('has_night', 'FALSE').upper() == 'TRUE'
            
            hospital = {
                "region": row.get('region', ''),
                "name": row.get('name', ''),
                "address": row.get('address', ''),
                "phone": row.get('phone', ''),
                "hours": row.get('hours', ''),
                "is_24h": is_24h,
                "has_night": has_night
            }
            hospitals.append(hospital)

    print(f"Processed {len(hospitals)} hospitals.")
    
    # Generate JS content
    js_content = f"// Google Sheet Data (Snapshot from Local CSV)\nconst hospitalData = {json.dumps(hospitals, indent=4, ensure_ascii=False)};"
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(js_content)
        
    print(f"Successfully wrote to {OUTPUT_FILE}")

except Exception as e:
    print(f"Error: {e}")
