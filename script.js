// Region Mapping (Korean Region Name -> ID used in HTML)
const REGION_MAP = {
    '서울': 'seoul',
    '경기': 'gyeonggi',
    '인천': 'incheon',
    '부산': 'busan',
    '대구': 'daegu',
    '대전': 'daejeon',
    '광주': 'gwangju',
    '제주': 'jeju'
};

let allHospitals = []; // Store processed data

// Helper to map tags to display HTML
const getTagHtml = (tags) => {
    let html = '';
    if (tags.includes('emergency')) {
        html += `<span class="tag emergency">24시 응급</span>`;
    }
    if (tags.includes('night')) {
        html += `<span class="tag night">야간 진료</span>`;
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
                <div><span class="icon">📍</span> ${item.address}</div>
                <div><span class="icon">📞</span> ${item.phone}</div>
            </div>
            <div class="h-hours">${displayHours}</div>
            <div class="h-tags">
                ${getTagHtml(item.tags)}
            </div>
        `;
        listContainer.appendChild(div);
    });
};

// Process Data from hospital_data.js
function loadData() {
    // Check if hospitalData is loaded
    if (typeof hospitalData === 'undefined') {
        console.error("hospitalData is missing");
        document.getElementById('hospital-list').innerHTML = '<div style="padding:20px;">데이터 파일(hospital_data.js)을 불러오지 못했습니다.</div>';
        return;
    }

    allHospitals = hospitalData.map(item => {
        const tags = [];
        if (item.is_24h) tags.push('emergency');
        if (item.has_night) tags.push('night');

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

    // Initial render (All)
    renderList(allHospitals);
}

// Filter Logic
function applyFilters() {
    const activeRegionBtn = document.querySelector('.region-options .filter-btn.active');
    const selectedRegion = activeRegionBtn ? activeRegionBtn.dataset.region : 'all';

    const is24hChecked = document.getElementById('filter-24h').checked;
    const isNightChecked = document.getElementById('filter-night').checked;

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

        return regionMatch && conditionMatch;
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

    // Search Button
    document.getElementById('search-btn').addEventListener('click', () => {
        applyFilters();
    });
});
