// --- CONFIGURATION (এগুলো পরিবর্তন করুন) ---
const API_KEY = "AIZaSyCTHWjgYwd0DHsXUiTFwyGkr_6A47BBSwM"; // আপনার দেওয়া কি-টি এখানে বসালাম
const SHEET_ID = "1B0JdnrWgX98JHbHPIln59UsuPnOFKKWCSoD-Sn0WVHY"; // আপনার গুগল শিটের আইডি এখানে বসান
const SHEET_NAME = "Hype deals"; // আপনার শিটের নাম (নিচের ট্যাব থেকে দেখে নিন)
const WEBHOOK = "https://discord.com/api/webhooks/1488449925048963134/6AY4LqRjwHspJOwKWyxFnh4B5J6_QIRjk5bShCmIEBC2yMNA_lFB2M50Z_M08Sp_vFgi";
const WA_NUM = "8801947119247"; // আপনার হোয়াটসঅ্যাপ নম্বর

let products = [];

// ১. ডাটা লোড করার মেইন ফাংশন
async function init() {
    const list = document.getElementById('productList');
    // Google Sheets API v4 URL
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}!A:G?key=${API_KEY}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.values && data.values.length > 0) {
            const rows = data.values;
            const headers = rows[0]; // প্রথম লাইন (Category, Name, etc.)
            
            // ডাটাকে সহজ অবজেক্টে রূপান্তর
            products = rows.slice(1).map(row => {
                let obj = {};
                headers.forEach((header, i) => {
                    obj[header.toLowerCase().trim()] = row[i] || "";
                });
                return obj;
            });

            render(products);
            generateCats(products);
        } else {
            list.innerHTML = `<p style="text-align:center; color:#ffb703;">⚠️ শিটে কোনো ডাটা পাওয়া যায়নি!</p>`;
        }
    } catch (e) {
        console.error("API Error:", e);
        list.innerHTML = `<p style="text-align:center; color:#ef4444;">❌ API Key বা Sheet ID ভুল অথবা শিটটি Public করা নেই!</p>`;
    }
}

// ২. প্রোডাক্টগুলো ডিসপ্লে করার ফাংশন
function render(data) {
    const list = document.getElementById('productList');
    if (data.length === 0) {
        list.innerHTML = `<p style="text-align:center; grid-column: 1/-1;">No items found.</p>`;
        return;
    }

    list.innerHTML = data.map(p => `
        <div class="p-card glass">
            <div class="p-badge">${p.category || 'Premium'}</div>
            <div style="font-size: 2.5rem; color: var(--accent); margin: 15px 0;">
                <i class="fa-solid fa-cube"></i>
            </div>
            <h3 style="margin: 10px 0;">${p.name}</h3>
            <p style="font-size: 0.85rem; opacity: 0.6; min-height: 40px;">${p.details || 'Official Premium Assets'}</p>
            <div class="price-tag">$${p.price}</div>
            <button class="buy-btn" onclick="openOrder('${p.name}', '${p.price}')">
                Purchase Now <i class="fa-solid fa-arrow-right"></i>
            </button>
        </div>
    `).join('');
}

// ৩. ক্যাটাগরি ফিল্টার তৈরি করা
function generateCats(data) {
    const cats = ['All', ...new Set(data.map(p => p.category).filter(c => c))];
    const container = document.getElementById('dynamicCats');
    container.innerHTML = cats.map(c => `
        <button class="cat-pill ${c==='All'?'active':''}" onclick="filterByCategory('${c}', this)">
            ${c}
        </button>
    `).join('');
}

// ৪. ক্যাটাগরি অনুযায়ী ফিল্টার করা
function filterByCategory(cat, btn) {
    document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filtered = cat === 'All' ? products : products.filter(p => p.category === cat);
    render(filtered);
}

// ৫. সার্চ বার লজিক
function filterProducts() {
    const q = document.getElementById('searchBar').value.toLowerCase();
    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.category && p.category.toLowerCase().includes(q))
    );
    render(filtered);
}

// ৬. অর্ডার মডাল ওপেন করা
function openOrder(n, p) {
    const modal = document.getElementById('orderModal');
    modal.style.display = 'grid';
    document.getElementById('mInfo').innerHTML = `
        <i class="fa-solid fa-cart-shopping"></i> Item: <b>${n}</b><br>
        <i class="fa-solid fa-wallet"></i> Price: <b>$${p}</b>
    `;
    
    // ফরম সাবমিট হ্যান্ডলার
    document.getElementById('orderForm').onsubmit = async (e) => {
        e.preventDefault();
        const uName = document.getElementById('uName').value;
        const uPhone = document.getElementById('uPhone').value;

        // Discord Webhook Notification
        try {
            await fetch(WEBHOOK, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    embeds: [{
                        title: "New Order! 🚀",
                        color: 0x8b5cf6,
                        fields: [
                            {name: "Customer", value: uName, inline: true},
                            {name: "WhatsApp", value: uPhone, inline: true},
                            {name: "Product", value: n},
                            {name: "Price", value: "$" + p}
                        ],
                        timestamp: new Date()
                    }]
                })
            });
        } catch (err) { console.log("Webhook failed"); }

        // WhatsApp Redirect
        const waMsg = `Hello MOONGLOW! I want to buy:\n📦 Product: ${n}\n💰 Price: $${p}\n👤 Name: ${uName}\n📱 WhatsApp: ${uPhone}`;
        window.location.href = `https://wa.me/${WA_NUM}?text=${encodeURIComponent(waMsg)}`;
    };
}

function closeModal() { document.getElementById('orderModal').style.display = 'none'; }

function toggleSupport() {
    const menu = document.getElementById('supportPop');
    menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
}

// শুরুতেই ডাটা লোড করা
init();
