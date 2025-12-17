const fs = require('fs');

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
            // Only add if row has content
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
    // Last row
    if (currentRow.length > 0 || currentVal) {
        currentRow.push(currentVal);
        rows.push(currentRow);
    }
    return rows;
}

try {
    console.log("Reading CSV...");
    const csvContent = fs.readFileSync('e:/Antigravity/hospital_data.csv', 'utf8');
    const rows = parseCSV(csvContent);

    if (rows.length < 2) {
        console.error("Not enough data rows");
        process.exit(1);
    }

    const headers = rows[0].map(h => h.trim());
    const idxRegion = headers.indexOf('region');
    const idxName = headers.indexOf('name');
    const idxAddress = headers.indexOf('address');
    const idxPhone = headers.indexOf('phone');
    const idxHours = headers.indexOf('hours');
    const idxIs24h = headers.indexOf('is_24h');
    const idxHasNight = headers.indexOf('has_night');

    const hospitals = rows.slice(1).map(row => {
        if (row.length < 5) return null;

        const is24h = (row[idxIs24h] || '').toUpperCase() === 'TRUE';
        const hasNight = (row[idxHasNight] || '').toUpperCase() === 'TRUE';
        // Note: For JSON file, we can store Booleans directly. 
        // script.js fallback handles strings "TRUE" but boolean true is also fine (String(true) is "true").
        // Actually, let's store them as STRINGS "TRUE"/"FALSE" to match what script.js expects from the CSV-like object?
        // Wait, script.js fallback code I wrote: `String(item.is_24h).toUpperCase() === 'TRUE'`
        // If I store boolean true, String(true).toUpperCase() is "TRUE". So storing booleans is fine!

        return {
            "region": row[idxRegion] || '',
            "name": row[idxName] || '',
            "address": row[idxAddress] || '',
            "phone": row[idxPhone] || '',
            "hours": row[idxHours] || '',
            "is_24h": is_24h,
            "has_night": has_night
        };
    }).filter(h => h !== null);

    console.log(`Parsed ${hospitals.length} hospitals.`);

    const fileContent = `// Google Sheet Data (Snapshot)\nconst hospitalData = ${JSON.stringify(hospitals, null, 4)};`;

    fs.writeFileSync('e:/Antigravity/hospital_data.js', fileContent, 'utf8');
    console.log("Written to hospital_data.js");

} catch (e) {
    console.error(e);
    process.exit(1);
}
