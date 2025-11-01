const API_KEY = "AIzaSyA2UyAU-6qR-nwwfauzdFG-CxhpVSSh8yw";
const SPREADSHEET_ID = "1QYQfaKsb0W_6s18Bw4Dcj1iNr3xeaoMEmmKb1gT-ahU";
const RANGE = "Sheet1!A1:Z500";

// Column Indexes
const ROLL_COLUMN_INDEX = 0;
const MS_COLUMN_INDEX = 1;
const NAME_COLUMN_INDEX = 2;
const FATHER_COLUMN_INDEX = 3;
const DOB_COLUMN_INDEX = 4;
const Third_COLUMN_INDEX = 5;
const Forth_COLUMN_INDEX = 6;
const Total_COLUMN_INDEX = 7;
const Percentage_COLUMN_INDEX = 8;

// URL से roll number निकालना
function getURLParam(name) {
    const u = new URL(window.location.href);
    return u.searchParams.get(name);
}

// Google Sheets से data fetch करना
async function fetchSheetValues() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(SPREADSHEET_ID)}/values/${encodeURIComponent(RANGE)}?key=${encodeURIComponent(API_KEY)}`;
    const resp = await fetch(url);
    if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(`Sheets API error: ${resp.status} ${resp.statusText}\n${txt}`);
    }
    const data = await resp.json();
    return data.values || [];
}

// Error/message दिखाना
function showMessage(msg, isError = false) {
    const out = document.getElementById("output");
    out.innerHTML = isError ? `<div class="alert">${msg}</div>` : msg;
}

// HTML escape
function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
}

// Roll number search
async function searchByRoll(roll) {
    showMessage("Loading... कृपया प्रतीक्षा करें।");
    try {
        const rows = await fetchSheetValues();
        if (rows.length === 0) {
            showMessage("Sheet खाली है या range गलत है।", true);
            return;
        }

        const dataRows = rows.slice(1); // header skip
        let found = null;
        for (const r of dataRows) {
            const cell = (r[ROLL_COLUMN_INDEX] || "").toString().trim();
            if (cell === roll) {
                found = r;
                break;
            }
        }

        if (!found) {
            showMessage(`Roll "${roll}" नहीं मिला।`, true);
            document.getElementById('rollDisplay').textContent = "-";
            document.getElementById('msDisplay').textContent = "-";
            document.getElementById('nameDisplay').textContent = "-";
            document.getElementById('fatherDisplay').textContent = "-";
            document.getElementById('Second_Term').textContent = "-";
            document.getElementById('Third_Term').textContent = "-";
            document.getElementById('Forth_Term').textContent = "-";
            document.getElementById('Total_Marks').textContent = "-";
            document.getElementById('Percentage_value').textContent = "-";
            return;
        }

        document.getElementById('rollDisplay').textContent = escapeHtml(roll);
        document.getElementById('msDisplay').textContent = escapeHtml(found[MS_COLUMN_INDEX] || "(MS Number नहीं मिला)");
        document.getElementById('nameDisplay').textContent = escapeHtml(found[NAME_COLUMN_INDEX] || "(Name नहीं मिला)");
        document.getElementById('fatherDisplay').textContent = escapeHtml(found[FATHER_COLUMN_INDEX] || "(Father Name नहीं मिला)");        
        document.getElementById('Second_Term').textContent = escapeHtml(found[DOB_COLUMN_INDEX] || "(Second_Term नहीं मिला)");
        document.getElementById('Third_Term').textContent = escapeHtml(found[Third_COLUMN_INDEX] || "(Third_Term नहीं मिला)");
        document.getElementById('Forth_Term').textContent = escapeHtml(found[Forth_COLUMN_INDEX] || "(Forth_Term नहीं मिला)");
        document.getElementById('Total_Marks').textContent = escapeHtml(found[Total_COLUMN_INDEX] || "(Total_Marks नहीं मिला)");
        document.getElementById('Percentage_value').textContent = escapeHtml(found[Percentage_COLUMN_INDEX] || "(Percentage_value नहीं मिला)");

        showMessage("✅ Data loaded successfully!");
    } catch (err) {
        console.error(err);
        showMessage("Error: " + escapeHtml(err.message || err), true);
    }
}

// URL से roll number read करके search करना
// पुराना
const roll = getURLParam("roll");
if (roll) {
    searchByRoll(roll);
} else {
    showMessage("कृपया URL में ?roll=ROLLNUMBER डालें।", true);
}

// इसे ऐसे बदल दो:
document.addEventListener("DOMContentLoaded", () => {
    const roll = getURLParam("roll");
    if (roll) {
        searchByRoll(roll);
    } else {
        showMessage("कृपया URL में ?roll=ROLLNUMBER डालें।", true);
    }
});

