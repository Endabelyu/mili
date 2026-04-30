
const ocrText = `SEANCOL 178-10,ANCOL
BARAT-JAKART. U 3,
NPWP 01.337 of Soa |
BESI JANGKANG KM. 1.5/004 02744454894
JL.BESI JANGKANG KM. 1.5 RT 01 RW 13 MINDI
+ SUKOHARJO, NGAGLIK, SLEMAN, SLEMAN, 5558
16.06.18-17:08 2.1.27 301135/RATIH/01
ABC ORANGE 525ML 1 193500 13,500
I/F BISC.HNDRLND 300 1 20900 29 909
LEXUS SANDH COKL 130 1 26800 25 ggo
LUWAK WHT ORGL 20X20 1 25400  5’400
OREO CHO & VAN 2X137 1 13800 19 ggg
TONG TJI JASM T/A.25 1 9300 91300
KOPIKO 78C 240ML 2 5500 11,000
FRSTEA TEH MADU 350 1 3950 3'gep
SOVIA M/GORENG 2L 1 26950 26,950
CANCEL :  (1)(26950) (26,950)
HARGA JUAL : 130,650
VOUCHER ABC SQUASH ORANGE : (3,600) |
| VOUCHER INDOFOOD WONDERLAND : (10.000)`;

function test(strategyName, fn) {
    console.log(`\n=== Strategy: ${strategyName} ===`);
    try {
        const res = fn(ocrText);
        console.log(`Merchant: ${res.merchant}`);
        console.log(`Total: ${res.total}`);
        console.log(`Items Found (${res.items.length}):`);
        res.items.forEach(it => console.log(` - ${it.name} [Rp ${it.price}]`));
    } catch (e) {
        console.log(`Error: ${e.message}`);
    }
}

const moneyPattern = /(?:rp|[$]|)\s*([\d]{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/gi;

// Strategy 1: Current Logic
test("1. Last Number + Strip All Numbers", (text) => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 5);
    const merchant = lines[0];
    const total = 130650;
    const items = [];
    lines.forEach(line => {
        if (line.includes('JUAL')) return;
        const matches = Array.from(line.matchAll(moneyPattern));
        if (matches.length > 0) {
            const last = matches[matches.length - 1];
            const price = parseInt(last[1].replace(/\D/g, ''));
            let name = line;
            matches.forEach(m => name = name.replace(m[0], ''));
            if (price >= 1000 && name.trim().length > 3) items.push({name: name.trim(), price});
        }
    });
    return { merchant, total, items };
});

// Strategy 2: Improved Name Preservation (Only strip last 2 numbers)
test("2. Strip Only Last 2 Numbers (Price/Subtotal)", (text) => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 5);
    const merchant = lines[0];
    const total = 130650;
    const items = [];
    lines.forEach(line => {
        if (line.includes('JUAL') || line.includes('VOUCHER')) return;
        const matches = Array.from(line.matchAll(moneyPattern));
        if (matches.length >= 2) {
            const last = matches[matches.length - 1];
            const price = parseInt(last[1].replace(/\D/g, ''));
            // Remove only the last 2 matches (often unit price + subtotal)
            let name = line.replace(matches[matches.length - 1][0], '').replace(matches[matches.length - 2][0], '').trim();
            if (price >= 1000) items.push({name, price});
        }
    });
    return { merchant, total, items };
});

// Strategy 3: Look for QTY (1-9) as Anchor
test("3. Qty Anchor (Everything before first small digit)", (text) => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 5);
    const total = 130650;
    const items = [];
    lines.forEach(line => {
        const qtyMatch = line.match(/\s(\d)\s/); // Matches " 1 " or " 2 "
        if (qtyMatch) {
            const name = line.substring(0, qtyMatch.index).trim();
            const afterQty = line.substring(qtyMatch.index + qtyMatch[0].length);
            const matches = Array.from(afterQty.matchAll(moneyPattern));
            if (matches.length > 0) {
                const price = parseInt(matches[matches.length-1][1].replace(/\D/g, ''));
                if (price >= 1000) items.push({name, price});
            }
        }
    });
    return { merchant: lines[0], total, items };
});

// Strategy 4: Filter Symbol-Heavy Lines (Ignore Ratih/Address)
test("4. Symbol Density Filter", (text) => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 5);
    const items = [];
    lines.forEach(line => {
        const symbolCount = (line.match(/[./:+-]/g) || []).length;
        if (symbolCount > 3) return; // Ignore lines with too many symbols like addresses
        const matches = Array.from(line.matchAll(moneyPattern));
        if (matches.length > 0) {
            const price = parseInt(matches[matches.length-1][1].replace(/\D/g, ''));
            if (price >= 1000 && !line.includes('JUAL')) {
                items.push({name: line.replace(matches[matches.length-1][0], '').trim(), price});
            }
        }
    });
    return { merchant: "SEANCOL", total: 130650, items };
});

// Strategy 5: Smart Merchant Detection (Skip address keywords)
test("5. Smart Merchant (Skip Address)", (text) => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 5);
    const blacklist = ['JL.', 'KM', 'NPWP', 'BARAT', 'ANCOL'];
    const merchant = lines.find(l => !blacklist.some(b => l.includes(b))) || "Unknown";
    return { merchant, total: 130650, items: [] };
});

// Strategy 6: Combined Multi-Step
test("6. Hybrid (Density + Last Number + Voucher Handling)", (text) => {
    const lines = text.split('\n').map(l => l.trim());
    const items = [];
    lines.forEach(line => {
        if (line.includes('JUAL')) return;
        if ((line.match(/[./:+-]/g) || []).length > 2) return;
        
        const matches = Array.from(line.matchAll(moneyPattern));
        if (matches.length > 0) {
            const last = matches[matches.length - 1];
            const price = parseInt(last[1].replace(/\D/g, ''));
            if (price < 1000) return;
            
            let name = line.replace(last[0], '').trim();
            if (line.includes('VOUCHER')) name = `[PROMO] ${name}`;
            items.push({name, price});
        }
    });
    return { merchant: "SEANCOL", total: 130650, items };
});
