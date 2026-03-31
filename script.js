// আপনার সঠিক Apps Script URL এখানে বসান
const API_URL = "YOUR_GOOGLE_SHEET_WEB_APP_URL"; 
const WEBHOOK = "YOUR_DISCORD_WEBHOOK_URL";
const WA_NUM = "8801XXXXXXXXX";

let products = [];

async function init() {
    const list = document.getElementById('productList');
    try {
        const res = await fetch(API_URL);
        products = await res.json();
        render(products);
        generateCats(products);
    } catch (e) {
        list.innerHTML = `<p style="color: #ef4444; text-align: center; grid-column: 1/-1;">⚠️ Database Connection Failed! Please check API URL.</p>`;
    }
}

function render(data) {
    const list = document.getElementById('productList');
    list.innerHTML = data.map(p => `
        <div class="p-card glass">
            <i class="fa-solid fa-box-open" style="font-size: 2.5rem; color: var(--accent)"></i>
            <h3 style="margin: 15px 0 10px;">${p.name}</h3>
            <p style="font-size: 0.85rem; opacity: 0.5; height: 40px;">${p.details}</p>
            <span class="price">$${p.price}</span>
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

function filterProducts() {
    const q = document.getElementById('searchBar').value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(q));
    render(filtered);
}

function openOrder(n, p) {
    document.getElementById('orderModal').style.display = 'grid';
    document.getElementById('mInfo').innerHTML = `Product: <b>${n}</b><br>Amount: <b>$${p}</b>`;
    document.getElementById('orderForm').onsubmit = (e) => handleOrder(e, n, p);
}

function closeModal() { document.getElementById('orderModal').style.display = 'none'; }

function toggleSupport() {
    const pop = document.getElementById('supportPop');
    pop.style.display = pop.style.display === 'flex' ? 'none' : 'flex';
}

async function handleOrder(e, prod, pr) {
    e.preventDefault();
    const name = document.getElementById('uName').value;
    const phone = document.getElementById('uPhone').value;

    const embed = {
        title: "New Order! ✅",
        color: 0x8b5cf6,
        fields: [
            {name: "Customer", value: name, inline: true},
            {name: "Phone", value: phone, inline: true},
            {name: "Item", value: prod},
            {name: "Price", value: "$"+pr}
        ]
    };

    fetch(WEBHOOK, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({embeds: [embed]}) });
    
    const msg = `Hello! I want to buy ${prod} for $${pr}.\nName: ${name}\nPhone: ${phone}`;
    window.location.href = `https://wa.me/${WA_NUM}?text=${encodeURIComponent(msg)}`;
}

init();
