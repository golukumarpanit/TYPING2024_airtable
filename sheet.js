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

let cropper; // global cropper object

function displayFields(fields) {
  // बाकी fields वही रहें
  document.getElementById("RollNubid").innerText    = fields['ROLL_NUB'] || "N/A";
  document.getElementById("qrc").innerText          = fields['Ms_Nub'] || "N/A";
  document.getElementById("studentName").innerText  = fields['NAME'] || "N/A"; 
  document.getElementById("fatherName").innerText   = fields['FATHERS_NAME'] || "N/A";
  document.getElementById("DOBfatch").innerText     = fields['DOB'] || "N/A";
  document.getElementById("courseName").innerText   = fields['SELECT_COURSE'] || "N/A";

 

  // 🔲 QR कोड update (same as before)
  const qrData = `
Certificate No: ${fields['Ms_Nub'] || "N/A"}
Roll No: ${fields['ROLL_NUB'] || "N/A"}
Name: ${fields['NAME'] || "N/A"}
Father's Name: ${fields['FATHERS_NAME'] || "N/A"}
DOB: ${fields['DOB'] || "N/A"}
Course: ${fields['SELECT_COURSE'] || "N/A"}
  `;

  qr.clear();
  qr.makeCode(qrData);
}

// YAHA SE PHOTO URL AA RHA HAI

async function searchCertificate() {
      const idInput = document.getElementById("idInput").value.trim();
      const message = document.getElementById("message");
      const photoElement = document.getElementById("previewImage");
      const photopreview = document.getElementById("croppedImage");

      if (!idInput) {
        message.innerText = "⚠️ कृपया रोल नंबर दर्ज करें!";
        console.log("Roll number not entered.");
        return;
      }

      try {
        message.innerText = "Fetching photo...";
        console.log("Fetching data from Google Sheet...");

        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;
        console.log("Fetching URL:", url);

        const response = await fetch(url);
        const data = await response.json();

        console.log("Raw Sheet Data:", data);

        if (!data.values || data.values.length === 0) {
          message.innerText = "Google Sheet में कोई डेटा नहीं मिला।";
          console.log("No data found in the sheet.");
          return;
        }

        const headers = data.values[0];
        console.log("Sheet Headers:", headers);

        const rollIndex = headers.indexOf("Ms_Nub");
        const urlIndex = headers.indexOf("photourl");

        console.log("Ms_Nub index:", rollIndex, "photourl index:", urlIndex);

        if (rollIndex === -1 || urlIndex === -1) {
          message.innerText = "Ms_Nub या photourl कॉलम नहीं मिला।";
          console.log("Required columns not found in headers.");
          return;
        }

        // रोल नंबर से रिकॉर्ड खोजो
        const record = data.values.find((row, i) => i > 0 && row[rollIndex] === idInput);
        console.log("Matched Record:", record);

        if (!record) {
          message.innerText = "❌ इस रोल नंबर के लिए रिकॉर्ड नहीं मिला।";
          console.log("No record found for roll number:", idInput);
          return;
        }

        let rawLink = record[urlIndex];
        console.log("Raw Google Drive Link:", rawLink);

        if (!rawLink) {
          message.innerText = "Google Drive लिंक नहीं मिला।";
          console.log("Google Drive link missing for this record.");
          return;
        }

        // Google Drive File ID निकालना
        let fileIdMatch = rawLink.match(/\/d\/([a-zA-Z0-9_-]+)/);
        let fileId = fileIdMatch ? fileIdMatch[1] : null;

        if (!fileId) {
          const idMatch = rawLink.match(/[?&]id=([a-zA-Z0-9_-]+)/);
          if (idMatch && idMatch[1]) fileId = idMatch[1];
        }

        console.log("Extracted File ID:", fileId);

        if (fileId) {
          const imageUrl = `https://lh3.googleusercontent.com/d/${fileId}=s800`;
          console.log("Final Image URL:", imageUrl);

          photoElement.src = imageUrl;
          photopreview.src = imageUrl;
          photoElement.style.display = "block";
          photopreview.style.display = "block";
          message.innerText = "✅ फोटो सफलतापूर्वक लोड हो गई है!";

          if (cropper) cropper.destroy();
          cropper = new Cropper(photoElement, {
            viewMode: 1,
            autoCropArea: 0.8,
            crop() {
              const canvas = cropper.getCroppedCanvas({
                width: 200,
                height: 200,
              });
              photopreview.src = canvas.toDataURL();
              console.log("Cropper updated.");
            },
          });
        } else {
          message.innerText = "अमान्य Google Drive URL।";
          console.log("Invalid Google Drive URL format:", rawLink);
        }
      } catch (err) {
        console.error("Error:", err);
        message.innerText = "⚠️ डेटा लाने में त्रुटि हुई।";
      }
    }

    // पेज लोड के समय URL से रोल नंबर निकाल और ऑटो fetch करो
    window.onload = function () {
      const urlParams = new URLSearchParams(window.location.search);
      const idInput = urlParams.get("roll");
      if (idInput) {
        document.getElementById("idInput").value = idInput;
        searchCertificate();
      }
    };


// yaha qr ka stucture aa rha hai 
let qr;

window.onload = function () {
    qr = new QRCode(document.getElementById("qrcode"), {
        text: "QR will update after data load",
        width: 200,
        height: 200
    });
};


