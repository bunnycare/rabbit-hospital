// Region Mapping (Korean Region Name -> ID used in HTML)
const REGION_MAP = {
    '서울': 'seoul',
    '경기': 'gyeonggi',
    '인천': 'incheon',
    '강원': 'gangwon',
    '충청': 'chungcheong',
    '세종': 'sejong',
    '대전': 'daejeon',
    '부산': 'busan',
    '울산': 'ulsan',
    '대구': 'daegu',
    '경상': 'gyeongsang',
    '전라도': 'jeolla',
    '광주': 'gwangju',
    '제주': 'jeju'
};

let allHospitals = []; // Store processed data

// Helper to map tags to display HTML
const getTagHtml = (tags) => {
    let html = '';
    if (tags.includes('emergency')) {
        html += `<span class="tag emergency">24시 운영</span>`;
    }
    if (tags.includes('night')) {
        html += `<span class="tag night">야간 진료</span>`;
    }
    if (tags.includes('sunday')) {
        html += `<span class="tag sunday" style="background-color:#fff0f6; color:#c0205e;">일요일 진료</span>`;
    }
    if (tags.includes('holiday')) {
        html += `<span class="tag holiday" style="background-color:#e6f7ff; color:#0050b3;">공휴일 진료</span>`;
    }
    if (html === '') return '-';
    return html;
};

// Render List
const renderList = (data) => {
    const listContainer = document.getElementById('hospital-list');
    const countSpan = document.getElementById('result-count');

    listContainer.innerHTML = ''; // Clear current
    countSpan.textContent = data.length;

    if (data.length === 0) {
        listContainer.innerHTML = '<div style="padding:40px; text-align:center; color:#999;">검색 결과가 없습니다.</div>';
        return;
    }

    data.forEach(item => {
        const div = document.createElement('div');
        div.className = 'hospital-item';

        // Handle hours newlines for display
        const displayHours = item.hours.replace(/\n/g, '<br>');

        div.innerHTML = `
            <div class="h-name">${item.name}</div>
            <div class="h-info">
                <div>
                    ${item.address}
                    <button class="copy-btn" onclick="copyToClipboard('${item.address.replace(/'/g, "\\'")}', '주소가 복사되었습니다')" title="주소 복사">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 4V16C8 17.1046 8.89543 18 10 18H18C19.1046 18 20 17.1046 20 16V7.24264C20 6.7122 19.7893 6.20357 19.4142 5.82843L16.1716 2.58579C15.7964 2.21071 15.2878 2 14.7574 2H10C8.89543 2 8 2.89543 8 4Z" stroke="#999" stroke-width="2" stroke-linejoin="round"/>
                            <path d="M16 2V7H21" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M4 8H6V20H16V22H6C4.89543 22 4 21.1046 4 20V8Z" fill="#999"/>
                        </svg>
                    </button>
                </div>
                <div>
                    ${item.phone}
                    <button class="copy-btn" onclick="copyToClipboard('${item.phone.replace(/'/g, "\\'")}', '연락처가 복사되었습니다')" title="연락처 복사">
                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 4V16C8 17.1046 8.89543 18 10 18H18C19.1046 18 20 17.1046 20 16V7.24264C20 6.7122 19.7893 6.20357 19.4142 5.82843L16.1716 2.58579C15.7964 2.21071 15.2878 2 14.7574 2H10C8.89543 2 8 2.89543 8 4Z" stroke="#999" stroke-width="2" stroke-linejoin="round"/>
                            <path d="M16 2V7H21" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M4 8H6V20H16V22H6C4.89543 22 4 21.1046 4 20V8Z" fill="#999"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="h-hours">${displayHours}</div>
            <div class="h-tags">
                ${getTagHtml(item.tags)}
            </div>
        `;
        listContainer.appendChild(div);
    });
};

// CSV Parser
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

// Process Data
async function loadData() {
    // 1. Try to use local hospitalData (if loaded via script tag)
    // Legacy Array format
    if (typeof hospitalData !== 'undefined') {
        allHospitals = hospitalData.map(item => {
            // Legacy booleans might be inconsistent, assuming CSV raw format mostly used now
            // But let's check keys if they exist in item
            const is24h = String(item.is_24h).toUpperCase() === 'TRUE';
            const hasNight = String(item.has_night).toUpperCase() === 'TRUE';
            const hasSunday = String(item.has_sunday).toUpperCase() === 'TRUE';
            const hasHoliday = String(item.has_holiday).toUpperCase() === 'TRUE';

            const tags = [];
            if (is24h) tags.push('emergency');
            if (hasNight) tags.push('night');
            if (hasSunday) tags.push('sunday');
            if (hasHoliday) tags.push('holiday');
            return {
                originalRegion: item.region,
                regionId: REGION_MAP[item.region] || 'other',
                name: item.name,
                address: item.address,
                phone: item.phone,
                hours: item.hours,
                tags: tags
            };
        });
        renderList(allHospitals);
        document.getElementById('result-count').textContent = allHospitals.length;
        return;
    }

    // New RAW CSV format (embedded in JS file)
    if (typeof hospitalDataRAW !== 'undefined') {
        const rows = parseCSV(hospitalDataRAW);
        if (rows.length > 0) {
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

            allHospitals = rows.slice(1).map(row => {
                if (row.length < 5) return null;
                const is24h = (row[idxIs24h] || '').toUpperCase() === 'TRUE';
                const hasNight = (row[idxHasNight] || '').toUpperCase() === 'TRUE';
                const hasSunday = (row[idxHasSunday] || '').toUpperCase() === 'TRUE';
                const hasHoliday = (row[idxHasHoliday] || '').toUpperCase() === 'TRUE';

                const tags = [];
                if (is24h) tags.push('emergency');
                if (hasNight) tags.push('night');
                if (hasSunday) tags.push('sunday');
                if (hasHoliday) tags.push('holiday');
                return {
                    originalRegion: row[idxRegion] || '',
                    regionId: REGION_MAP[row[idxRegion] || ''] || 'other',
                    name: row[idxName] || '',
                    address: row[idxAddress] || '',
                    phone: row[idxPhone] || '',
                    hours: row[idxHours] || '',
                    tags: tags
                };
            }).filter(item => item !== null);

            renderList(allHospitals);
            document.getElementById('result-count').textContent = allHospitals.length;
            return;
        }
    }

    // 2. Fallback: Try live fetch
    const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRr-bNUq69_4hAWmzSnqU0fA4mlp1sZfaQ51OmFI3zdr3ZtF6MZpPNnG87K_mfi_GpBFfywYBX8CB47/pub?gid=423837787&single=true&output=csv';

    try {
        const response = await fetch(SHEET_URL);
        if (!response.ok) throw new Error('Network response was not ok');
        const text = await response.text();

        const rows = parseCSV(text);
        if (rows.length === 0) return;

        // Assume first row is header. 
        // Headers: region,name,address,phone,hours,is_24h,has_night,...
        // Map headers to indices
        const headers = rows[0].map(h => h.trim());
        const idxRegion = headers.indexOf('region');
        const idxName = headers.indexOf('name');
        const idxAddress = headers.indexOf('address');
        const idxPhone = headers.indexOf('phone');
        const idxHours = headers.indexOf('hours');
        const idxIs24h = headers.indexOf('is_24h');
        const idxHasNight = headers.indexOf('has_night');

        // Allow some flexibility if headers change slightly, but mostly rely on these keys

        allHospitals = rows.slice(1).map(row => {
            if (row.length < 5) return null; // Skip empty rows

            const is24h = row[idxIs24h] === 'TRUE';
            const hasNight = row[idxHasNight] === 'TRUE';
            const hasSunday = row[headers.indexOf('has_sunday')] === 'TRUE';
            const hasHoliday = row[headers.indexOf('has_holiday')] === 'TRUE';

            const tags = [];
            if (is24h) tags.push('emergency');
            if (hasNight) tags.push('night');
            if (hasSunday) tags.push('sunday');
            if (hasHoliday) tags.push('holiday');

            const region = row[idxRegion] || '';

            return {
                originalRegion: region,
                regionId: REGION_MAP[region] || 'other',
                name: row[idxName] || '',
                address: row[idxAddress] || '',
                phone: row[idxPhone] || '',
                hours: row[idxHours] || '',
                tags: tags
            };
        }).filter(item => item !== null);

        // Initial render (All)
        renderList(allHospitals);

        // Update count immediately
        document.getElementById('result-count').textContent = allHospitals.length;

    } catch (error) {
        console.error("Failed to load data:", error);
        document.getElementById('hospital-list').innerHTML = `<div style="padding:20px; text-align:center; color:red;">
            데이터를 불러오는데 실패했습니다.<br>
            <small>${error.message}</small><br>
            <small style="color:#666; font-size:0.8em;">(파일을 직접 열었다면, 로컬 서버(Live Server 등)를 이용해주세요)</small>
        </div>`;
    }
}

// Filter Logic
function applyFilters() {
    const activeRegionBtn = document.querySelector('.region-options .filter-btn.active');
    const selectedRegion = activeRegionBtn ? activeRegionBtn.dataset.region : 'all';

    const is24hChecked = document.getElementById('filter-24h').checked;
    const isNightChecked = document.getElementById('filter-night').checked;
    const isSundayChecked = document.getElementById('filter-sunday').checked;
    const isHolidayChecked = document.getElementById('filter-holiday').checked;
    const searchText = document.getElementById('name-search').value.toLowerCase().trim();

    const filtered = allHospitals.filter(item => {
        // Region Filter
        let regionMatch = true;
        if (selectedRegion !== 'all') {
            regionMatch = item.regionId === selectedRegion;
        }

        // Condition Filter
        let conditionMatch = true;
        if (is24hChecked && !item.tags.includes('emergency')) conditionMatch = false;
        if (isNightChecked && !item.tags.includes('night')) conditionMatch = false;
        if (isSundayChecked && !item.tags.includes('sunday')) conditionMatch = false;
        if (isHolidayChecked && !item.tags.includes('holiday')) conditionMatch = false;

        // Name Filter
        let nameMatch = true;
        if (searchText) {
            nameMatch = item.name.toLowerCase().includes(searchText);
        }

        return regionMatch && conditionMatch && nameMatch;
    });

    renderList(filtered);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadData();

    // Region Buttons
    const regionBtns = document.querySelectorAll('.filter-btn');
    regionBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            regionBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            applyFilters(); // Trigger filter immediately
        });
    });

    // Toggle Filters (Immediate trigger)
    document.getElementById('filter-24h').addEventListener('change', applyFilters);
    document.getElementById('filter-night').addEventListener('change', applyFilters);
    document.getElementById('filter-sunday').addEventListener('change', applyFilters);
    document.getElementById('filter-holiday').addEventListener('change', applyFilters);

    // Search Button
    document.getElementById('search-btn').addEventListener('click', () => {
        applyFilters();
    });

    // Enter Key on Search Input
    document.getElementById('name-search').addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            applyFilters();
        }
    });

    // Close region options when clicking outside
    document.addEventListener('click', (e) => {
        const regionOptions = document.getElementById('region-options');
        const isClickInside = regionOptions.contains(e.target) || e.target.closest('.filter-btn');
        // Actually we don't need to close it as they are buttons not dropdown
    });
});

// Toast & Copy Feature
function copyToClipboard(text, message = '복사되었습니다') {
    if (!text) return;

    // Try Modern API
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            showToast(message);
        }).catch(err => {
            console.error('Async: Could not copy text: ', err);
            fallbackCopy(text, message);
        });
    } else {
        // Fallback
        fallbackCopy(text, message);
    }
}

function fallbackCopy(text, message) {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Ensure it's not visible but part of DOM
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showToast(message);
        } else {
            console.error('Fallback: Copy command failed');
            alert('복사에 실패했습니다. 브라우저 보안 설정을 확인해주세요.');
        }
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
        alert('복사에 실패했습니다.');
    }

    document.body.removeChild(textArea);
}

function showToast(message) {
    // Remove existing notification
    const existing = document.querySelector('.toast-message');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Remove automatically after animation (2000ms)
    setTimeout(() => {
        if (toast.parentElement) toast.remove();
    }, 2000);
}
