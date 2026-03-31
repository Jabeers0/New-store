// --- সঠিক তথ্যগুলো এখানে বসান ---
const API_KEY = "AIzaSyB5uckgAyRZ_xvGwMaYtLl1b7jJ0iQJJRY"; 
const SHEET_ID = "1B0JdnrWgX98JHbHPIln59UsuPnOFKKWCSoD-Sn0WVHY";
const SHEET_NAME = "Sheet1"; // আপনার শিটের নিচের ট্যাবের নাম যদি আলাদা হয় তবে সেটা দিন
const WA_NUM = "8801947119247"; 
const WEBHOOK = "https://discord.com/api/webhooks/1488449925048963134/6AY4LqRjwHspJOwKWyxFnh4B5J6_QIRjk5bShCmIEBC2yMNA_lFB2M50Z_M08Sp_vFgi";

let products = [];

async function init() {
    const list = document.getElementById('productList');
    // API URL চেক করুন
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}!A:Z?key=${API_KEY}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        
        // যদি ৪০০ এরর আসে তবে কনসোলে বিস্তারিত দেখাবে
        if (data.error) {
            console.error("Google API Error:", data.error.message);
            list.innerHTML = `<p style="color:red; text-align:center;">Error: ${data.error.message}</p>`;
            return;
        }

        if (data.values && data.values.length > 0) {
            const rows = data.values;
            const headers = rows[0].map(h => h.toLowerCase().trim()); // হেডার ক্লিন করা
            
            products = rows.slice(1).map(row => {
                let obj = {};
                headers.forEach((header, i) => {
                    obj[header] = row[i] || "";
                });
                return obj;
            });

            render(products);
            generateCats(products);
        }
    } catch (e) {
        list.innerHTML = `<p style="color:red; text-align:center;">Network Error! Please check your internet or API Key.</p>`;
    }
}

// আপনার বাকি ফাংশনগুলো (render, filter, openOrder) আগের মতোই থাকবে...
init();
