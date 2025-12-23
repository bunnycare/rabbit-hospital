const fs = require('fs');
const https = require('https');

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRr-bNUq69_4hAWmzSnqU0fA4mlp1sZfaQ51OmFI3zdr3ZtF6MZpPNnG87K_mfi_GpBFfywYBX8CB47/pub?gid=423837787&single=true&output=csv';
const OUTPUT_FILE = 'd:/버니케어/251223/hospital_data.js';
const CSV_FILE = 'd:/버니케어/251223/hospital_data.csv';

console.log(`Fetching data from ${SHEET_URL}...`);

https.get(SHEET_URL, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Download complete.');

        // 1. Save Raw CSV
        fs.writeFileSync(CSV_FILE, data, 'utf8');
        console.log(`Saved raw CSV to ${CSV_FILE}`);

        // 2. Save as JS variable
        // Escape backticks just in case
        const safeData = data.replace(/`/g, '\\`');
        const jsContent = `const hospitalDataRAW = \`${safeData}\`;`;

        fs.writeFileSync(OUTPUT_FILE, jsContent, 'utf8');
        console.log(`Successfully updated ${OUTPUT_FILE}`);
    });

}).on('error', (err) => {
    console.error('Error fetching data: ' + err.message);
});
