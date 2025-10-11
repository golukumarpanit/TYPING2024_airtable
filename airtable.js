/* --------------------------
   Airtable API credentials
-----------------------------*/
const API_KEY = 'patxNsgkdADYDxhX3.76bd2e1372398f07b3367fa55ed280c2d015a0f307d0427325073855fd9ff655';       
const BASE_ID = 'appQgYPqyGnNdrtlL'; 
const TABLE_NAME = 'GCSM2024';        

/* --------------------------
   URL से roll number निकालना
-----------------------------*/
const urlParams = new URLSearchParams(window.location.search);
const rollNumber = urlParams.get("roll"); 

console.log("Roll Number:", rollNumber);
/* ---------------------------------------
   Airtable से उस roll का record लाना
-----------------------------------------*/

async function fetchRecordByRoll(roll) {
    try {
        const formula = `FIND("${roll}", {ROLL_NUB})`;
        const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?filterByFormula=${encodeURIComponent(formula)}`;

        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${API_KEY}` }
        });

        const data = await res.json();

        // yaha se
        if (data.records && data.records.length > 0) {
        const fields = data.records[0].fields;

        // Roll number aur tab title update
        displayCertificatell(fields);

        // Baaki details show karne ke liye
        displayCertificate(fields);
            } 
        // yaha tak 
        else {
            document.getElementById("errorMsg").innerText = "❌ No record found!";
        }
        
        
    } catch (err) {
        document.getElementById("errorMsg").innerText = "⚠️ Error loading record.";
        console.error(err);
    }
}
//yaha se jo equation liye hai o yaha fetch ho rha hai
if (rollNumber) {
    fetchRecordByRoll(rollNumber);
} else {
    document.getElementById("errorMsg").innerText = "⚠️ No roll number provided!";
}

async function AkashpandeyLearne(roll) {
    try {
        const formula = `FIND("${roll}", {ROLL_NUB})`;
        const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?filterByFormula=${encodeURIComponent(formula)}`;

        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${API_KEY}` }
        });

        const data = await res.json();

        if (data.records && data.records.length > 0) {
            AkashpandeyLearn(data.records[0].fields); 
        } else {
            document.getElementById("errorMsg").innerText = "❌ No record found!";
        }
        
        
    } catch (err) {
        document.getElementById("errorMsg").innerText = "⚠️ Error loading record.";
        console.error(err);
    }
}
//yaha se jo equation liye hai o yaha fetch ho rha hai
if (rollNumber) {
    AkashpandeyLearne(rollNumber);
} else {
    document.getElementById("errorMsg").innerText = "⚠️ No roll number provided!";
}

// title change krne ka kosiis ho rha hai
function displayCertificatell(fields) {
            const roll = fields.ROLL_NUB || "N/A";
            document.getElementById("RollNubid").innerText = roll;

            // **Yaha title automatic set ho raha hai**
            document.title = `${roll}`;
        }

        // Agar roll number URL me nahi hai
        if (rollNumber) {
            fetchRecordByRoll(rollNumber);
        } else {
            document.getElementById("errorMsg").innerText = "⚠️ No roll number provided!";
            document.title = "No Roll Number"; 
        }


/* ---------------------------------
   Data को HTML में दिखाने का function
-----------------------------------*/
function displayCertificate(fields) {
    // Text fields set करना
    document.getElementById("qrc").innerText = fields.Ms_Nub || "N/A";
    function displayCertificate(fields) {
    // Roll number display
    document.getElementById("RollNubid").innerText = fields.ROLL_NUB || "N/A";

    // Title me Roll Number set karna
    document.title = fields.ROLL_NUB ? `Certificate - ${fields.ROLL_NUB}` : "Certificate";

    // Agar aur kuch fields dikhani ho to yaha add kar sakte ho
}

    document.getElementById("DOBfatch").innerText = fields.DOB || "N/A";
    document.getElementById("studentName").innerText = fields.NAME || "N/A";
    document.getElementById("fatherName").innerText = fields.FATHERS_NAME || "N/A";

    // Course selection code
    let adcacourse = fields.SELECT_COURSE || "CHELA";
    let duration = "Duration";

    switch (adcacourse.toLowerCase()) {
        case "english and hindi typing":
            duration = "six";
            break;
        case "diploma in computer application":
            duration = "six";
            break;
        default:
            duration = "please visit";
    }

    document.getElementById("courseName").innerText = adcacourse;
    document.getElementById("selectedDuration").innerText = duration;    
    document.getElementById("englishspeed").innerText = fields.English_SPD;
    document.getElementById("hindispeed").innerText = fields.Hindi_SPD;

    
    
}
// yaha hme qr update krna hai 
// QR code initialize (placeholder) → इसे page load में ही define कर दो
let qr;

window.onload = function () {
    qr = new QRCode(document.getElementById("qrcode"), {
        text: "Loading QR...",
        width: 200,
        height: 200
    });
};

function AkashpandeyLearn(fields) {    
    console.log(fields); // debug ke liye
    
    const qrData = `Certificate Nub: ${fields.Ms_Nub || "N/A"}
Roll No: ${fields.ROLL_NUB || "N/A"}
Name: ${fields.NAME || "N/A"}
Father's Name: ${fields.FATHERS_NAME || "N/A"}
Course: ${fields.SELECT_COURSE || "N/A"}
Hindi Speed : ${fields.Hindi_SPD || "N/A"}
English Speed : ${fields.English_SPD || "N/A"}`;

    qr.clear();
    qr.makeCode(qrData);
}

// Example call
AkashpandeyLearn({
  Ms_Nub: "1234",
  ROLL_NUB: "5678",
  NAME: "Amit Kumar",
  FATHERS_NAME: "Rajesh",
  SELECT_COURSE: "ADCA",
  Hindi_SPD: "35",
  English_SPD: "40"
});
