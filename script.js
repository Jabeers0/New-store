// --- তোমার সব তথ্য এখানে সেট করা হলো ---
const API_KEY = "AIZaSyB5uckgAyRZ_xvGwMaYtLl1b7jJ0iQJJRY";
const FULL_SHEET_LINK = "https://docs.google.com/spreadsheets/d/1H6FH-pp3N2Xqp3s8BWmy2HRq2Td0Rha7YBaQAl4qwzo/edit?usp=drivesdk";
const WA_NUM = "8801947119247"; // তোমার দেওয়া নম্বর
const DISCORD_WEBHOOK = "YOUR_WEBHOOK_HERE"; // যদি ডিসকর্ড লগ লাগে এখানে লিঙ্ক দাও

// লিঙ্ক থেকে আইডি আলাদা করার অটো-ফাংশন
function extractSheetId(link) {
    const match = link.match(/\/d\/([^/]+)/);
    return match ? match[1] : null;
}

const SHEET_ID = extractSheetId(FULL_SHEET_LINK);
let products = [];

async function init() {
    const list = document.getElementById('productList');
    // শিটের প্রথম ট্যাব থেকে ডাটা পড়ার জন্য A:Z রেঞ্জ ব্যবহার করা হয়েছে
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/A:Z?key=${API_KEY}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.values) {
            const rows = data.values;
            // প্রথম লাইনের নামগুলোকে ছোট হাতের করে হেডার হিসেবে নেওয়া
            const headers = rows[0].map(h => h.toLowerCase().trim());
            
            products = rows.slice(1).map(row => {
                let obj = {};
                headers.forEach((h, i) => obj[h] = row[i] || "");
                return obj;
            }).filter(p => p.name); // যাদের নাম আছে শুধু তাদের দেখাবে

            render(products);
            generateCats(products);
        } else {
            list.innerHTML = "<p style='text-align:center;'>শিটে কোনো ডাটা পাওয়া যায়নি!</p>";
        }
    } catch (e) {
        console.error(e);
        list.innerHTML = "<p style='color:red; text-align:center;'>ডাটা লোড হতে সমস্যা হচ্ছে। API Key চেক করো।</p>";
    }
}

// কার্ডগুলো স্ক্রিনে দেখানোর ফাংশন
function render(data) {
    const list = document.getElementById('productList');
    list.innerHTML = data.map(p => `
        <div class="p-card glass">
            <img src="${p.image || 'https://via.placeholder.com/300x180'}" class="p-img">
            <div class="p-info">
                <small style="color:#a855f7; text-transform:uppercase;">${p.category || 'General'}</small>
                <h3>${p.name}</h3>
                <p style="font-size:0.8rem; opacity:0.6; height:35px; overflow:hidden;">${p.details || 'Premium Service'}</p>
                <div style="font-size:0.7rem; color:#10b981; margin:10px 0;">
                    <i class="fa-solid fa-box-open"></i> Stock: ${p.stock || 'In Stock'}
                </div>
                <div style="font-size:1.6rem; font-weight:800; margin-bottom:15px;">$${p.price}</div>
                <button class="buy-btn" onclick="openOrder('${p.name}', '${p.price}')">Order Now <i class="fa-solid fa-arrow-right"></i></button>
            </div>
        </div>
    `).join('');
}

// ক্যাটাগরি তৈরি করার ফাংশন
function generateCats(data) {
    const cats = ['All', ...new Set(data.map(p => p.category).filter(c => c))];
    const container = document.getElementById('dynamicCats');
    if(container) {
        container.innerHTML = cats.map(c => `<button class="cat-pill ${c==='All'?'active':''}" onclick="filterByCategory('${c}', this)">${c}</button>`).join('');
    }
}

function filterByCategory(cat, btn) {
    document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render(cat === 'All' ? products : products.filter(p => p.category === cat));
}

// অর্ডার মডাল ওপেন এবং হোয়াটসঅ্যাপে মেসেজ পাঠানো
function openOrder(n, p) {
    const modal = document.getElementById('orderModal');
    if(modal) {
        modal.style.display = 'grid';
        document.getElementById('mInfo').innerHTML = `Item: <b>${n}</b> | Price: <b>$${p}</b>`;
        
        document.getElementById('orderForm').onsubmit = (e) => {
            e.preventDefault();
            const qty = document.getElementById('uQty').value;
            const uName = document.getElementById('uName').value;
            const total = (parseFloat(p) * parseInt(qty)).toFixed(2);
            
            const msg = `New Order From MOONGLOW!\n----------------\nItem: ${n}\nQty: ${qty}\nPrice: $${p}\nTotal: $${total}\n----------------\nCustomer: ${uName}`;
            
            // হোয়াটসঅ্যাপে রিডাইরেক্ট
            window.location.href = `https://wa.me/${WA_NUM}?text=${encodeURIComponent(msg)}`;
        };
    }
}

function closeModal() {
    document.getElementById('orderModal').style.display = 'none';
}

// সব শুরু করার কল
init();
