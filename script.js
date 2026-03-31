const API_URL = "YOUR_GOOGLE_APPS_SCRIPT_URL"; 
const DISCORD_WEBHOOK = "YOUR_DISCORD_WEBHOOK_URL";
const WA_NUMBER = "8801XXXXXXXXX";

let allProducts = [];

// Fetch Data from Sheet
async function loadData() {
    try {
        const response = await fetch(API_URL);
        allProducts = await response.json();
        render(allProducts);
    } catch (e) {
        document.getElementById('productList').innerHTML = "Database Connection Error!";
    }
}

function render(data) {
    const list = document.getElementById('productList');
    if(data.length === 0) { list.innerHTML = "No products found."; return; }
    
    list.innerHTML = data.map(p => {
        let finalPrice = p.price - (p.price * (p.discount / 100));
        return `
            <div class="p-card glass">
                <div style="font-size: 0.7rem; color: var(--p); text-transform: uppercase; margin-bottom:10px;">${p.category}</div>
                <img src="${p.image}" onerror="this.src='https://via.placeholder.com/90?text=Product'">
                <h3>${p.name}</h3>
                <p style="font-size:0.85rem; opacity:0.7">${p.details}</p>
                <div class="price-tag">
                    <span class="old-p">$${p.price}</span> $${finalPrice.toFixed(0)}
                </div>
                <button class="buy-btn" onclick="openOrder('${p.name}', '${finalPrice.toFixed(0)}')">PURCHASE NOW</button>
            </div>
        `;
    }).join('');
}

// Filters
function filterByCategory(cat) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.innerText === cat || (cat === 'All' && btn.innerText === 'All Products'));
    });
    const filtered = cat === 'All' ? allProducts : allProducts.filter(p => p.category === cat);
    render(filtered);
}

function filterProducts() {
    const val = document.getElementById('searchBar').value.toLowerCase();
    render(allProducts.filter(p => p.name.toLowerCase().includes(val) || p.category.toLowerCase().includes(val)));
}

// Modal & Order
function openOrder(name, price) {
    document.getElementById('orderModal').style.display = 'flex';
    document.getElementById('mPriceDisplay').innerText = `Item: ${name} | Amount: $${price}`;
    document.getElementById('hName').value = name;
    document.getElementById('hPrice').value = price;
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

    // Discord Notification
    await fetch(DISCORD_WEBHOOK, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            embeds: [{
                title: "New Order from MOONGLOW",
                color: 0x8b5cf6,
                fields: [
                    {name: "Product", value: data.product, inline: true},
                    {name: "Price", value: "$"+data.price, inline: true},
                    {name: "Customer", value: data.name},
                    {name: "WhatsApp", value: data.phone},
                    {name: "Discord", value: data.discord || "Not Given"}
                ],
                footer: {text: "System by Hridoy Hasan"}
            }]
        })
    });

    // Sheet Update
    await fetch(API_URL, { method: 'POST', body: JSON.stringify(data) });

    alert("Order Successful! Redirecting to WhatsApp...");
    window.location.href = `https://wa.me/${WA_NUMBER}?text=I want to pay for ${data.product}`;
};

loadData();
