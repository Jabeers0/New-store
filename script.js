const API_URL = "YOUR_APPS_SCRIPT_URL";
const WEBHOOK = "YOUR_DISCORD_WEBHOOK";
const WA_NUM = "8801XXXXXXXXX";

let products = [];

async function init() {
    try {
        const res = await fetch(API_URL);
        products = await res.json();
        render(products);
        generateCats(products);
    } catch (e) {
        document.getElementById('productList').innerHTML = "<p>Failed to connect to database.</p>";
    }
}

function render(data) {
    const list = document.getElementById('productList');
    list.innerHTML = data.map(p => `
        <div class="p-card">
            <div style="font-size: 2.5rem; color: var(--accent); margin-bottom: 15px;"><i class="fa-solid fa-cube"></i></div>
            <h3 style="margin: 0;">${p.name}</h3>
            <p style="font-size: 0.8rem; opacity: 0.5;">${p.details}</p>
            <div class="price-tag">$${p.price}</div>
            <button class="buy-btn" onclick="openOrder('${p.name}', '${p.price}')">Purchase Now</button>
        </div>
    `).join('');
}

function generateCats(data) {
    const cats = ['All', ...new Set(data.map(p => p.category))];
    const container = document.getElementById('dynamicCats');
    container.innerHTML = cats.map(c => `<button class="cat-pill ${c==='All'?'active':''}" onclick="filterByCategory('${c}', this)">${c}</button>`).join('');
}

function filterByCategory(cat, btn) {
    document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filtered = cat === 'All' ? products : products.filter(p => p.category === cat);
    render(filtered);
}

function openOrder(n, p) {
    document.getElementById('orderModal').style.display = 'grid';
    document.getElementById('mInfo').innerHTML = `<b>${n}</b> - Secure Payment: <b>$${p}</b>`;
    document.getElementById('uName').focus();
}

function closeModal() { document.getElementById('orderModal').style.display = 'none'; }

function toggleSupport() {
    const menu = document.getElementById('supportPop');
    menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
}

init();
