const API_KEY = "AIZaSyCTHWjgYwd0DHsXUiTFwyGkr_6A47BBSwM";
const SHEET_ID = "1B0JdnrWgX98JHbHPIln59UsuPnOFKKWCSoD-Sn0WVHY";
const DISCORD_WEBHOOK = "YOUR_DISCORD_WEBHOOK_URL"; 
const WA_NUM = "8801947119247"; // আপনার নম্বর

let products = [];

async function init() {
    const list = document.getElementById('productList');
    // শিটের নাম ছাড়াই প্রথম ট্যাব থেকে ডাটা নেওয়ার অটোমেটিক লিঙ্ক
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/A:G?key=${API_KEY}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.values) {
            const rows = data.values;
            const headers = rows[0].map(h => h.toLowerCase().trim());
            products = rows.slice(1).map(row => {
                let obj = {};
                headers.forEach((h, i) => obj[h] = row[i] || "");
                return obj;
            }).filter(p => p.name);
            render(products);
            generateCats(products);
        }
    } catch (e) {
        list.innerHTML = "❌ Connection Error! Please Refresh.";
    }
}

function render(data) {
    const list = document.getElementById('productList');
    list.innerHTML = data.map(p => `
        <div class="p-card glass">
            <small style="color:var(--accent)">${p.category}</small>
            <h3 style="margin:10px 0">${p.name}</h3>
            <p style="font-size:0.8rem; opacity:0.6">${p.details || 'Premium Product'}</p>
            <h2 style="margin:15px 0">$${p.price}</h2>
            <button class="buy-btn" onclick="openOrder('${p.name}', '${p.price}')">Order Now</button>
        </div>
    `).join('');
}

function generateCats(data) {
    const cats = ['All', ...new Set(data.map(p => p.category).filter(c => c))];
    const container = document.getElementById('dynamicCats');
    container.innerHTML = cats.map(c => `<button class="cat-pill ${c==='All'?'active':''}" onclick="filterByCategory('${c}', this)">${c}</button>`).join('');
}

function filterByCategory(cat, btn) {
    document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render(cat === 'All' ? products : products.filter(p => p.category === cat));
}

function openOrder(n, p) {
    document.getElementById('orderModal').style.display = 'grid';
    document.getElementById('mInfo').innerHTML = `Item: ${n} | Price: $${p}`;
    document.getElementById('orderForm').onsubmit = (e) => {
        e.preventDefault();
        const uName = document.getElementById('uName').value;
        const uPhone = document.getElementById('uPhone').value;
        
        // Webhook
        fetch(DISCORD_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ embeds: [{ title: "New Order! 🛒", color: 0xa855f7, fields: [{name:"Item", value:n}, {name:"Price", value:p}, {name:"User", value:uName}, {name:"Phone", value:uPhone}] }] })
        });

        window.location.href = `https://wa.me/${WA_NUM}?text=${encodeURIComponent(`Order: ${n}\nPrice: $${p}\nName: ${uName}\nPhone: ${uPhone}`)}`;
    };
}

function closeModal() { document.getElementById('orderModal').style.display = 'none'; }
init();
