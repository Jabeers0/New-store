// --- আপনার তথ্যগুলো এখানে দিন ---
const API_KEY = "AIzaSyB5uckgAyRZ_xvGwMaYtLl1b7jJ0iQJJRY";
const SHEET_ID = "pp3N2Xqp3s8BWmy2HRq2Td0Rha7YBaQAl4qwzo";
const SHEET_NAME = "Sheet1"; // শিটের ট্যাবের নাম ঠিকভাবে দিন
const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1488449925048963134/6AY4LqRjwHspJOwKWyxFnh4B5J6_QIRjk5bShCmIEBC2yMNA_lFB2M50Z_M08Sp_vFgi"; // আপনার ওয়েব হুক লিঙ্ক দিন
const WA_NUM = "8801947119247"; // হোয়াটসঅ্যাপ নম্বর

let products = [];

async function init() {
    const list = document.getElementById('productList');
    // রেঞ্জ A:Z পর্যন্ত ডাটা নেওয়ার জন্য অটোমেটিক লিঙ্ক
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}!A:Z?key=${API_KEY}`;

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
        list.innerHTML = `<div style="grid-column: 1/-1; text-align:center;">
            <p style="color:#ef4444; font-size:1.2rem; font-weight:bold;">❌ Connection Error!</p>
            <p style="opacity:0.6; font-size:0.9rem;">Check API Key, Sheet Permission, or Internet.</p>
        </div>`;
    }
}

function render(data) {
    const list = document.getElementById('productList');
    list.innerHTML = data.map(p => `
        <div class="p-card glass">
            <img src="${p.image || 'https://via.placeholder.com/300x200?text=Premium'}" class="p-img" alt="${p.name}">
            <div class="p-info">
                <span class="p-category">${p.category || 'Premium Service'}</span>
                <h3>${p.name}</h3>
                <p class="p-details">${p.details || 'Instant Delivery • Secure'}</p>
                
                <div style="display: flex; justify-content: center; align-items: center; gap: 10px; font-size:0.7rem;">
                    <span style="color:#10b981"><i class="fa-solid fa-boxes-stacked"></i> Stock: ${p.stock || 'In Stock'}</span>
                    <span style="color:#f59e0b"><i class="fa-solid fa-check-double"></i> Instantly Delivered</span>
                </div>

                <div class="p-price">$${p.price}</div>
                <button class="buy-btn" onclick="openOrder('${p.name}', '${p.price}', '${p.stock}')">GET ACCESS <i class="fa-solid fa-gem"></i></button>
            </div>
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

function openOrder(n, p, s) {
    document.getElementById('orderModal').style.display = 'grid';
    document.getElementById('mInfo').innerHTML = `Ordering: <b>${n}</b><br>Unit Price: <b>$${p}</b>`;
    
    document.getElementById('orderForm').onsubmit = (e) => {
        e.preventDefault();
        const qty = document.getElementById('uQty').value;
        const uName = document.getElementById('uName').value;
        const uPhone = document.getElementById('uPhone').value;
        const total = (parseFloat(p) * parseInt(qty)).toFixed(2);

        // --- Discord Webhook Notification ---
        fetch(DISCORD_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                embeds: [{
                    title: "New Order from MOONGLOW! 🚀",
                    color: 0xa855f7,
                    fields: [
                        { name: "Item", value: n, inline: true },
                        { name: "Quantity", value: qty, inline: true },
                        { name: "Unit Price", value: "$" + p, inline: true },
                        { name: "Total Amount", value: "**$" + total + "**" },
                        { name: "Customer Name", value: uName },
                        { name: "WhatsApp Phone", value: uPhone }
                    ],
                    timestamp: new Date()
                }]
            })
        });

        // --- WhatsApp Redirect ---
        const waMsg = `Order Details:\nItem: ${n}\nQty: ${qty}\nUnit: $${p}\nTotal: $${total}\n----------------\nName: ${uName}\nPhone: ${uPhone}`;
        window.location.href = `https://wa.me/${WA_NUM}?text=${encodeURIComponent(waMsg)}`;
    };
}

function closeModal() { document.getElementById('orderModal').style.display = 'none'; }

init();
