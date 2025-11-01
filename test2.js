const API_KEY = 'AIzaSyA2UyAU-6qR-nwwfauzdFG-CxhpVSSh8yw'; // अपना API Key डालें
const SPREADSHEET_ID = '1q9KL8CBHjPuhPohyTcGp9wk68VxkJ6OT8DZrRctwRyI'; // अपनी शीट का ID डालें
const SHEET_NAME = 'Sheet2'; // शीट का नाम

const urlParams = new URLSearchParams(window.location.search);
const rollNumber = urlParams.get("roll");

window.addEventListener("load", () => {
  if (rollNumber) {
    fetchRecordByRoll(rollNumber);
  } else {
    document.getElementById("errorMsg").innerText = "⚠️ कृपया URL में रोल नंबर दें.";
  }
});

async function fetchRecordByRoll(roll) {
  try {
    const range = `${SHEET_NAME}!A1:I100`; // जितने कॉलम और रिकॉर्ड हैं उन्हें adjust कर सकते हैं
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?key=${API_KEY}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('डेटा लोड करने में त्रुटि');

    const data = await res.json();
    const rows = data.values;

    if (!rows || rows.length === 0) {
      document.getElementById("errorMsg").innerText = "❌ डेटा नहीं मिला।";
      return;
    }

    const headers = rows[0];
    const rollColIndex = 3; // रोल नंबर अब 3rd कॉलम में है, इसलिए इंडेक्स 2 (0 से गिना जाता है)

    // रोल नंबर के आधार पर रिकॉर्ड खोजें
    // rows.find में idx > 0 इसलिए है ताकि header वाली पंक्ति को छोड़ दें
    const record = rows.find((row, idx) => idx > 0 && row[rollColIndex] === roll);

    if (!record) {
      document.getElementById("errorMsg").innerText = "❌ रिकॉर्ड नहीं मिला।";
      return;
    }

    // डेटा को फिल्ड्स में मैप करें ताकि सही दिखाए जा सकें
    const fields = {};
    headers.forEach((header, index) => {
      fields[header] = record[index] || "N/A";
    });

    displayFields(fields);
  } catch (err) {
    document.getElementById("errorMsg").innerText = "त्रुटि: डेटा लोड नहीं हो पाया।";
    console.error(err);
  }
}

function displayFields(fields) {
  document.getElementById("RollNubid").innerText    = fields['ROLL_NUB'] || "N/A";  // रोल नंबर (3rd कॉलम)
  document.getElementById("qrc").innerText          = fields['Ms_Nub'] || "N/A";
  document.getElementById("studentName").innerText  = fields['NAME'] || "N/A"; 
  document.getElementById("fatherName").innerText   = fields['FATHERS_NAME'] || "N/A";
  document.getElementById("DOBfatch").innerText           = fields['DOB'] || "N/A";
  document.getElementById("t3").innerText           = fields['3rd Terminal'] || "N/A";
  document.getElementById("t4").innerText           = fields['4th Terminal'] || "N/A";
  document.getElementById("total").innerText        = fields['Total'] || "N/A";
  document.getElementById("percentage").innerText   = fields['percentage'] || fields['percentege'] || "N/A";
}
