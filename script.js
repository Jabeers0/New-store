const API_KEY = "আপনার_সঠিক_এপিআই_কি"; 
const SHEET_ID = "আপনার_সঠিক_শিট_আইডি";
const DISCORD_WEBHOOK = "আপনার_ওয়েব_হুক";
const WA_NUM = "8801XXXXXXXXX"; 

let products = [];

async function init() {
    const list = document.getElementById('productList');
    // রেঞ্জ A:Z পর্যন্ত বাড়ানো হলো যাতে অনেক কলাম থাকলেও পায়
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/A:Z?key=${API_KEY}`;

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
        list.innerHTML = "<p style='color:red; text-align:center;'>Check API Key & Sheet Public Permission!</p>";
    }
}

function render(data) {
    const list = document.getElementById('productList');
    list.innerHTML = data.map(p => `
        <div class="p-card glass">
            <img src="${p.image || 'https://via.placeholder.com/300x180'}" class="p-img" alt="${p.name}">
            <div class="p-info">
                <span class="stock-tag">${p.stock || 'In Stock'}</span>
                <h3 style="margin: 10px 0;">${p.name}</h3>
                <p style="font-size: 0.8rem; opacity: 0.6; height: 35px; overflow: hidden;">${p.details || 'Premium Service'}</p>
                <div style="font-size: 1.8rem; font-weight: 800; margin: 15px 0;">$${p.price}</div>
                <button class="buy-btn" onclick="openOrder('${p.name}', '${p.price}', '${p.stock}')">Order Now</button>
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
    document.getElementById('mInfo').innerHTML = `Ordering: <b>${n}</b><br>Unit Price: <b>$${p}</b><br><small>Stock: ${s}</small>`;
    
    document.getElementById('orderForm').onsubmit = (e) => {
        e.preventDefault();
        const qty = document.getElementById('uQty').value;
        const uName = document.getElementById('uName').value;
        const uPhone = document.getElementById('uPhone').value;
        const total = (parseFloat(p) * parseInt(qty)).toFixed(2);

        // Discord Webhook Notification
        fetch(DISCORD_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                embeds: [{
                    title: "New Order Alert! 🛒",
                    color: 0xa855f7,
                    fields: [
                        { name: "Product", value: n, inline: true },
                        { name: "Quantity", value: qty, inline: true },
                        { name: "Total Price", value: "$" + total },
                        { name: "Customer", value: uName },
                        { name: "WhatsApp", value: uPhone }
                    ],
                    timestamp: new Date()
                }]
            })
        });

        // WhatsApp Redirect
        const msg = `New Order from MOONGLOW!\nItem: ${n}\nQty: ${qty}\nTotal: $${total}\nName: ${uName}\nPhone: ${uPhone}`;
        window.location.href = `https://wa.me/${WA_NUM}?text=${encodeURIComponent(msg)}`;
    };
}

function closeModal() { document.getElementById('orderModal').style.display = 'none'; }
init();
