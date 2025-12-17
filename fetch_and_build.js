const fs = require('fs');
const https = require('https');

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRr-bNUq69_4hAWmzSnqU0fA4mlp1sZfaQ51OmFI3zdr3ZtF6MZpPNnG87K_mfi_GpBFfywYBX8CB47/pub?gid=423837787&single=true&output=csv';
const OUTPUT_FILE = 'e:/Antigravity/hospital_data.js';

console.log(`Fetching data from ${SHEET_URL}...`);

https.get(SHEET_URL, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Download complete. Parsing CSV...');
        processData(data);
    });

}).on('error', (err) => {
    console.error('Error fetching data: ' + err.message);
});

function parseCSV(text) {
    const rows = [];
    let currentRow = [];
    let currentVal = '';
    let insideQuote = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (char === '"') {
            if (insideQuote && nextChar === '"') {
                currentVal += '"';
                i++;
            } else {
                insideQuote = !insideQuote;
            }
        } else if (char === ',' && !insideQuote) {
            currentRow.push(currentVal);
            currentVal = '';
        } else if ((char === '\r' || char === '\n') && !insideQuote) {
            if (char === '\r' && nextChar === '\n') i++;
            if (currentRow.length > 0 || currentVal) {
                currentRow.push(currentVal);
                rows.push(currentRow);
            }
            currentRow = [];
            currentVal = '';
        } else {
            currentVal += char;
        }
    }
    if (currentRow.length > 0 || currentVal) {
        currentRow.push(currentVal);
        rows.push(currentRow);
    }
    return rows;
}

function processData(csvText) {
    const rows = parseCSV(csvText);

    if (rows.length < 2) {
        console.error("No data found");
        return;
    }

    const headers = rows[0].map(h => h.trim());
    const idxRegion = headers.indexOf('region');
    const idxName = headers.indexOf('name');
    const idxAddress = headers.indexOf('address');
    const idxPhone = headers.indexOf('phone');
    const idxHours = headers.indexOf('hours');
    const idxIs24h = headers.indexOf('is_24h');
    const idxHasNight = headers.indexOf('has_night');
    const idxHasSunday = headers.indexOf('has_sunday');
    const idxHasHoliday = headers.indexOf('has_holiday');

    const hospitals = rows.slice(1).map(row => {
        if (row.length < 5) return null;

        return {
            "region": row[idxRegion] || '',
            "name": row[idxName] || '',
            "address": row[idxAddress] || '',
            "phone": row[idxPhone] || '',
            "hours": row[idxHours] || '',
            "is_24h": (row[idxIs24h] || '').toUpperCase() === 'TRUE',
            "has_night": (row[idxHasNight] || '').toUpperCase() === 'TRUE',
            "has_sunday": (row[idxHasSunday] || '').toUpperCase() === 'TRUE',
            "has_holiday": (row[idxHasHoliday] || '').toUpperCase() === 'TRUE'
        };
    }).filter(h => h !== null);

    console.log(`Parsed ${hospitals.length} hospitals.`);

    const fileContent = `// Google Sheet Data (Snapshot)\nconst hospitalData = ${JSON.stringify(hospitals, null, 4)};`;

    fs.writeFileSync(OUTPUT_FILE, fileContent, 'utf8');
    console.log(`Successfully wrote to ${OUTPUT_FILE}`);
}
