const API_URL = "YOUR_GOOGLE_SHEET_API_URL";
const WEBHOOK = "YOUR_DISCORD_WEBHOOK_URL";
const WA_NUM = "8801XXXXXXXXX"; // Change this

let products = [];

async function init() {
    try {
        const res = await fetch(API_URL);
        products = await res.json();
        render(products);
    } catch (e) {
        document.getElementById('productList').innerHTML = "Failed to load products.";
    }
}

function render(data) {
    const list = document.getElementById('productList');
    list.innerHTML = data.map(p => `
        <div class="p-card">
            <i class="fa-solid fa-box-open" style="font-size:2rem; color:var(--primary)"></i>
            <h3>${p.name}</h3>
            <p style="font-size:0.8rem; opacity:0.6">${p.details}</p>
            <div class="price-box">$${p.price}</div>
            <button class="order-btn" onclick="openOrder('${p.name}', '${p.price}')">
                Buy Now <i class="fa-solid fa-cart-shopping"></i>
            </button>
        </div>
    `).join('');
}

function openOrder(n, p) {
    document.getElementById('orderModal').style.display = 'grid';
    document.getElementById('itemDetails').innerHTML = `<i class="fa-solid fa-tag"></i> Item: ${n} | Price: $${p}`;
    document.getElementById('hName').value = n;
    document.getElementById('hPrice').value = p;
}

function closeModal() { document.getElementById('orderModal').style.display = 'none'; }

function toggleSupport() {
    const box = document.getElementById('supportMenu');
    box.style.display = box.style.display === 'flex' ? 'none' : 'flex';
}

document.getElementById('orderForm').onsubmit = async (e) => {
    e.preventDefault();
    const data = {
        name: document.getElementById('uName').value,
        phone: document.getElementById('uPhone').value,
        discord: document.getElementById('uDiscord').value || "N/A",
        product: document.getElementById('hName').value,
        price: document.getElementById('hPrice').value
    };

    // Discord Notification
    await fetch(WEBHOOK, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
            embeds: [{
                title: "New Order! ✅",
                fields: [
                    {name: "Product", value: data.product, inline: true},
                    {name: "Price", value: "$"+data.price, inline: true},
                    {name: "Customer", value: data.name}
                ],
                color: 0x8b5cf6
            }]
        })
    });

    const msg = `Order: ${data.product}\nPrice: $${data.price}\nName: ${data.name}`;
    window.location.href = `https://wa.me/${WA_NUM}?text=${encodeURIComponent(msg)}`;
};

init();
