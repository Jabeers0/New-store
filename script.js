// --- আপনার তথ্যগুলো এখানে দিন ---
const API_KEY = "AIZaSyCTHWjgYwd0DHsXUiTFwyGkr_6A47BBSwM";
const SHEET_ID = "1B0JdnrWgX98JHbHPIln59UsuPnOFKKWCSoD-Sn0WVHY";
const SHEET_NAME = "Sheet1"; // গুগল শিটের নিচের ট্যাবের নাম (সাধারণত Sheet1 থাকে)
const DISCORD_WEBHOOK = "YOUR_DISCORD_WEBHOOK_URL"; // আপনার ডিসকর্ড ওয়েব হুক এখানে দিন
const WA_NUM = "8801XXXXXXXXX"; // হোয়াটসঅ্যাপ নম্বর

let products = [];

async function init() {
    const list = document.getElementById('productList');
    // শিটের নামসহ ফুল পাথ (যাতে নেটওয়ার্ক এরর না আসে)
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}!A:G?key=${API_KEY}`;

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
        list.innerHTML = "<p style='text-align:center; color:red;'>Check Internet or Google Sheet Public Setting!</p>";
    }
}

function render(data) {
    const list = document.getElementById('productList');
    list.innerHTML = data.map(p => `
        <div class="p-card glass">
            <i class="fa-solid fa-gem" style="color:var(--accent); font-size: 2rem;"></i>
            <h3>${p.name}</h3>
            <p style="font-size: 0.8rem; opacity: 0.5;">${p.details || 'Instant Delivery'}</p>
            <span class="price">$${p.price}</span>
            <button class="buy-btn" onclick="openOrder('${p.name}', '${p.price}')">Order Now</button>
        </div>
    `).join('');
}

function generateCats(data) {
    const cats = ['All', ...new Set(data.map(p => p.category).filter(c => c))];
    const container = document.getElementById('dynamicCats');
    container.innerHTML = cats.map(c => `
        <button class="cat-pill ${c==='All'?'active':''}" onclick="filterByCategory('${c}', this)">${c}</button>
    `).join('');
}

function filterByCategory(cat, btn) {
    document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filtered = cat === 'All' ? products : products.filter(p => p.category === cat);
    render(filtered);
}

function openOrder(n, p) {
    document.getElementById('orderModal').style.display = 'grid';
    document.getElementById('mInfo').innerHTML = `Product: <b>${n}</b> | Price: <b>$${p}</b>`;
    
    document.getElementById('orderForm').onsubmit = async (e) => {
        e.preventDefault();
        const uName = document.getElementById('uName').value;
        const uPhone = document.getElementById('uPhone').value;

        // --- Discord Webhook Notification ---
        const discordData = {
            embeds: [{
                title: "New Order Received! 🛒",
                color: 0xa855f7,
                fields: [
                    { name: "Customer Name", value: uName, inline: true },
                    { name: "WhatsApp", value: uPhone, inline: true },
                    { name: "Product", value: n },
                    { name: "Price", value: "$" + p }
                ],
                footer: { text: "MOONGLOW Store Notification" },
                timestamp: new Date()
            }]
        };

        await fetch(DISCORD_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(discordData)
        });

        // --- WhatsApp Redirect ---
        const waMsg = `Hello MOONGLOW!\nNew Order Details:\nItem: ${n}\nPrice: $${p}\nName: ${uName}\nPhone: ${uPhone}`;
        window.location.href = `https://wa.me/${WA_NUM}?text=${encodeURIComponent(waMsg)}`;
    };
}

function closeModal() { document.getElementById('orderModal').style.display = 'none'; }

init();
