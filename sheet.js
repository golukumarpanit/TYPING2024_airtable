const API_KEY = 'AIzaSyA2UyAU-6qR-nwwfauzdFG-CxhpVSSh8yw';
const SPREADSHEET_ID = '1q9KL8CBHjPuhPohyTcGp9wk68VxkJ6OT8DZrRctwRyI';
const SHEET_NAME = 'Sheet2';

const urlParams = new URLSearchParams(window.location.search);
const rollNumber = urlParams.get("roll");

window.addEventListener("load", () => {
  if (rollNumber) {
    // पहले शीट की रेंज पता करें फिर रिकॉर्ड लाएं
    fetchAndSetFullRangeThenFetchRecord(rollNumber);
  } else {
    document.getElementById("errorMsg").innerText = "⚠️ कृपया URL में रोल नंबर दें.";
  }
});

// कॉलम नंबर को अक्षर में बदलने वाला फंक्शन
function columnToLetter(column) {
  let temp, letter = '';
  while (column > 0) {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = (column - temp - 1) / 26;
  }
  return letter;
}

async function fetchAndSetFullRangeThenFetchRecord(roll) {
  try {
    const sheetPropsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?fields=sheets(properties(title,gridProperties))&key=${API_KEY}`;
    const propsRes = await fetch(sheetPropsUrl);
    if (!propsRes.ok) throw new Error("शीट की जानकारी लाने में समस्या");
    const propsData = await propsRes.json();

    const sheet = propsData.sheets.find(s => s.properties.title === SHEET_NAME);
    if (!sheet) {
      document.getElementById("errorMsg").innerText = "❌ शीट का नाम सही नहीं है।";
      return;
    }

    const rowCount = sheet.properties.gridProperties.rowCount;
    const colCount = sheet.properties.gridProperties.columnCount;
    const lastColumnLetter = columnToLetter(colCount);
  
    const fullRange = `${SHEET_NAME}!A1:${lastColumnLetter}${rowCount}`;

    // अब पूरा रेंज बन चुका है, इस रेंज के साथ रिकॉर्ड लाएं
    fetchRecordByRoll(roll, fullRange);
  } catch (err) {
    document.getElementById("errorMsg").innerText = "त्रुटि: डेटा लोड नहीं हो पाया।";
    console.error(err);
  }
}

// fetchRecordByRoll अब रेंज को पैरामीटर के तौर पर लेगा
async function fetchRecordByRoll(roll, range) {
  try {
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
    const rollColIndex = 3; // या headers.indexOf('ROLL_NUB') जैसे भी सेट कर सकते हैं

    const record = rows.find((row, idx) => idx > 0 && row[rollColIndex] === roll);
    if (!record) {
      document.getElementById("errorMsg").innerText = "❌ रिकॉर्ड नहीं मिला।";
      return;
    }

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
  document.getElementById("RollNubid").innerText    = fields['ROLL_NUB'] || "N/A";
  document.getElementById("qrc").innerText          = fields['Ms_Nub'] || "N/A";
  document.getElementById("studentName").innerText  = fields['NAME'] || "N/A"; 
  document.getElementById("fatherName").innerText   = fields['FATHERS_NAME'] || "N/A";
  document.getElementById("DOBfatch").innerText     = fields['DOB'] || "N/A";
  document.getElementById("t3").innerText           = fields['3rd Terminal'] || "N/A";
  document.getElementById("t4").innerText           = fields['4th Terminal'] || "N/A";
  document.getElementById("total").innerText        = fields['Total'] || "N/A";
  document.getElementById("percentage").innerText   = fields['percentage'] || fields['percentege'] || "N/A";
}
