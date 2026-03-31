// --- CONFIGURATION ---
const API_KEY = "AIZaSyCTHWjgYwd0DHsXUiTFwyGkr_6A47BBSwM"; 
const SHEET_ID = "1B0JdnrWgX98JHbHPIln59UsuPnOFKKWCSoD-Sn0WVHY";
const SHEET_NAME = "Sheet1"; // আপনার শিটের ট্যাবের নাম 'Sheet1' হলে এটিই থাকবে
const WA_NUM = "8801947119247"; // আপনার হোয়াটসঅ্যাপ নম্বর দিন
const WEBHOOK = ""; // আপনার ডিসকর্ড ওয়েব হুক (থাকলে দিন)

let products = [];

// ১. ডাটা লোড করা
async function init() {
    const list = document.getElementById('productList');
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}!A:G?key=${API_KEY}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.error) {
            console.error("API Error:", data.error.message);
            list.innerHTML = `<p style="color:#ff4d4d; text-align:center; grid-column: 1/-1;">Error: ${data.error.message}. <br> Make sure the Sheet is Public!</p>`;
            return;
        }

        if (data.values && data.values.length > 0) {
            const rows = data.values;
            const headers = rows[0].map(h => h.toLowerCase().trim());
            
            products = rows.slice(1).map(row => {
                let obj = {};
                headers.forEach((header, i) => {
                    obj[header] = row[i] || "";
                });
                return obj;
            }).filter(p => p.name);

            render(products);
            generateCats(products);
        }
    } catch (e) {
        list.innerHTML = `<p style="color:#ff4d4d; text-align:center; grid-column: 1/-1;">Network Error! Check your API Key or Sheet settings.</p>`;
    }
}

// ২. প্রোডাক্ট ডিসপ্লে
function render(data) {
    const list = document.getElementById('productList');
    list.innerHTML = data.map(p => `
        <div class="p-card glass">
            <div class="p-category">${p.category || 'Premium'}</div>
            <div class="p-icon"><i class="fa-solid fa-box-open"></i></div>
            <h3>${p.name}</h3>
            <p>${p.details || 'Official Premium Product'}</p>
            <div class="price-tag">$${p.price}</div>
            <button class="buy-btn" onclick="openOrder('${p.name}', '${p.price}')">Buy Now</button>
        </div>
    `).join('');
}

// ৩. ক্যাটাগরি তৈরি
function generateCats(data) {
    const cats = ['All', ...new Set(data.map(p => p.category).filter(c => c))];
    const container = document.getElementById('dynamicCats');
    container.innerHTML = cats.map(c => `<button class="cat-pill ${c==='All'?'active':''}" onclick="filterByCategory('${c}', this)">${c}</button>`).join('');
}

// ৪. ফিল্টার ফাংশন
function filterByCategory(cat, btn) {
    document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filtered = cat === 'All' ? products : products.filter(p => p.category === cat);
    render(filtered);
}

// ৫. সার্চ ফাংশন
function filterProducts() {
    const q = document.getElementById('searchBar').value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(q));
    render(filtered);
}

// ৬. অর্ডার মডাল
function openOrder(n, p) {
    const modal = document.getElementById('orderModal');
    modal.style.display = 'grid';
    document.getElementById('mInfo').innerHTML = `Product: <b>${n}</b> | Price: <b>$${p}</b>`;
    
    document.getElementById('orderForm').onsubmit = (e) => {
        e.preventDefault();
        const uName = document.getElementById('uName').value;
        const uPhone = document.getElementById('uPhone').value;
        
        // WhatsApp Redirect
        const msg = `Hello MOONGLOW! I want to buy:\nProduct: ${n}\nPrice: $${p}\nName: ${uName}\nWhatsApp: ${uPhone}`;
        window.location.href = `https://wa.me/${WA_NUM}?text=${encodeURIComponent(msg)}`;
    };
}

function closeModal() { document.getElementById('orderModal').style.display = 'none'; }

init();
