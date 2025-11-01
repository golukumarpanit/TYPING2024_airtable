const API_KEY = "AIzaSyA2UyAU-6qR-nwwfauzdFG-CxhpVSSh8yw";
const SPREADSHEET_ID = "q9KL8CBHjPuhPohyTcGp9wk68VxkJ6OT8DZrRctwRyI";
const RANGE = "Sheet2!A:Z";

const ROLL_COLUMN_INDEX = 0; // रोल नंबर वाला कॉलम
const MS_COLUMN_INDEX = 1;   // Certificate Number Column (अगर जरूरत हो तो)
const NAME_COLUMN_INDEX = 2;
const FATHER_COLUMN_INDEX = 3;
// आप अन्य इंडेक्स भी इस तरह दर्ज कर सकते हैं जैसे dob, photo url, course name इत्यादि

function getURLParam(name) {
    const u = new URL(window.location.href);
    return u.searchParams.get(name);
}

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

function showMessage(msg, isError = false) {
    const out = document.getElementById("message");
    out.textContent = msg;
    out.style.color = isError ? "red" : "green";
}

function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
}

async function searchByRoll(roll) {
    showMessage("Loading... कृपया प्रतीक्षा करें।");
    try {
        const rows = await fetchSheetValues();
        if (rows.length === 0) {
            showMessage("Sheet खाली है या range गलत है।", true);
            return;
        }

        const dataRows = rows.slice(1); // हेडर को छोड़ें
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
            clearDataDisplay();
            return;
        }

        // डेटा HTML में भरें
        document.getElementById('RollNubid').textContent = escapeHtml(found[ROLL_COLUMN_INDEX] || "-");
        document.getElementById('qrc').textContent = escapeHtml(found[MS_COLUMN_INDEX] || "-");
        document.getElementById('studentName').textContent = escapeHtml(found[NAME_COLUMN_INDEX] || "-");
        document.getElementById('fatherName').textContent = escapeHtml(found[FATHER_COLUMN_INDEX] || "-");

        // अगर दूसरे डेटा फील्ड हैं तो इधर भी डाल सकते हैं जैसे dob, photo url, course etc.
        // उदाहरण:
        if(found.length > 4) document.getElementById('DOBfatch').textContent = escapeHtml(found[4] || "-");
        if(found.length > 5) {
            document.getElementById('croppedImage').src = escapeHtml(found[5]) || 'default-photo.png'; 
            // Photo url assumed at index 5
        }
        if(found.length > 6) document.getElementById('courseName').textContent = escapeHtml(found[6] || "-");
        if(found.length > 7) document.getElementById('selectedDuration').textContent = escapeHtml(found[7] || "-");
        if(found.length > 8) document.getElementById('examDisplay').textContent = escapeHtml(found[8] || "-");

        showMessage("✅ Data loaded successfully!");
    } catch (err) {
        console.error(err);
        showMessage("Error: " + escapeHtml(err.message || err), true);
    }
}

function clearDataDisplay() {
    // जब डेटा ना मिले तो फील्ड खाली कर दें
    document.getElementById('RollNubid').textContent = "-";
    document.getElementById('qrc').textContent = "-";
    document.getElementById('studentName').textContent = "-";
    document.getElementById('fatherName').textContent = "-";
    document.getElementById('DOBfatch').textContent = "-";
    document.getElementById('croppedImage').src = 'default-photo.png';
    document.getElementById('courseName').textContent = "-";
    document.getElementById('selectedDuration').textContent = "-";
    document.getElementById('examDisplay').textContent = "-";
}

// बटन क्लिक से सर्च फ़ंक्शन ट्रिगर करें
document.getElementById("idInput").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        const roll = document.getElementById("idInput").value.trim();
        if (!roll) {
            showMessage("कृपया Roll number डालें।", true);
            return;
        }
        searchByRoll(roll);
    }
});

// URL से roll नंबर get करके auto search
const initialRoll = getURLParam("roll");
if (initialRoll) {
    document.getElementById("idInput").value = initialRoll;
    setTimeout(() => searchByRoll(initialRoll), 200);
}
