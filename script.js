const API_URL = "YOUR_APPS_SCRIPT_URL"; 
const WEBHOOK = "YOUR_DISCORD_WEBHOOK";
const WA_NUM = "8801XXXXXXXXX";

let allProducts = [];

// Initialize Page
async function init() {
    try {
        const response = await fetch(API_URL);
        allProducts = await response.json();
        generateCategories(allProducts);
        render(allProducts);
    } catch (e) {
        document.getElementById('productList').innerText = "Database Error! Check API.";
    }
}

// Auto-generate categories from Sheet data
function generateCategories(data) {
    const container = document.getElementById('dynamicCats');
    const categories = [...new Set(data.map(p => p.category))];
    
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.innerText = cat;
        btn.onclick = () => filterByCategory(cat);
        container.appendChild(btn);
    });
}

function render(data) {
    const list = document.getElementById('productList');
    list.innerHTML = data.map(p => {
        let dPrice = p.price - (p.price * (p.discount / 100));
        return `
            <div class="p-card">
                <img src="${p.image}" style="width:70px; margin-bottom:15px;" onerror="this.src='https://via.placeholder.com/70'">
                <h3>${p.name}</h3>
                <p style="font-size:0.8rem; opacity:0.6">${p.details}</p>
                <div style="margin:15px 0;">
                    <span style="text-decoration:line-through; opacity:0.3; font-size:0.9rem;">$${p.price}</span>
                    <span style="color:#10b981; font-weight:bold; font-size:1.4rem; margin-left:10px;">$${dPrice.toFixed(0)}</span>
                </div>
                <button class="buy-btn" onclick="openOrder('${p.name}', '${dPrice.toFixed(0)}')">Buy Now</button>
            </div>
        `;
    }).join('');
}

// Filter Logic
function filterByCategory(cat) {
    const btns = document.querySelectorAll('.filter-btn');
    btns.forEach(b => b.classList.toggle('active', b.innerText === cat || (cat === 'All' && b.innerText === 'All Items')));
    const filtered = cat === 'All' ? allProducts : allProducts.filter(p => p.category === cat);
    render(filtered);
}

function filterProducts() {
    const q = document.getElementById('searchBar').value.toLowerCase();
    render(allProducts.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)));
}

// Support Pop-up
function toggleSupport() {
    document.getElementById('supportPop').classList.toggle('show');
}

// Order Logic
function openOrder(n, p) {
    document.getElementById('orderModal').style.display = 'flex';
    document.getElementById('mInfo').innerText = `${n} - Price: $${p}`;
    document.getElementById('hName').value = n; document.getElementById('hPrice').value = p;
}

function closeModal() { document.getElementById('orderModal').style.display = 'none'; }

document.getElementById('orderForm').onsubmit = async (e) => {
    e.preventDefault();
    const data = {
        name: document.getElementById('uName').value,
        phone: document.getElementById('uPhone').value,
        discord: document.getElementById('uDiscord').value,
        product: document.getElementById('hName').value,
        price: document.getElementById('hPrice').value
    };

    // Notification
    await fetch(WEBHOOK, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({
        embeds: [{ title: "New Order! ✅", color: 0x8b5cf6, fields: [
            {name: "Product", value: data.product, inline: true},
            {name: "Price", value: "$"+data.price, inline: true},
            {name: "Customer", value: data.name}
        ]}]
    })});

    await fetch(API_URL, { method: 'POST', body: JSON.stringify(data) });
    alert("Success! Opening WhatsApp...");
    window.location.href = `https://wa.me/${WA_NUM}?text=Ordered: ${data.product}`;
};

init();
