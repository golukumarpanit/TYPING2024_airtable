/* ========== DetilsMain.js (Main script) ========== */

// Airtable API credentials
const API_KEY = 'patxNsgkdADYDxhX3.76bd2e1372398f07b3367fa55ed280c2d015a0f307d0427325073855fd9ff655';
const BASE_ID = 'appQgYPqyGnNdrtlL';
const TABLE_NAME = 'GCSM2024';

// Global variable for QR code
let qr;

// Extract roll number once and make it globally available
const urlParams = new URLSearchParams(window.location.search);
window.rollNumber = urlParams.get("roll");
console.log("Roll Number:", window.rollNumber);

// Initialize QR code once on page load and run both main functions
window.addEventListener("load", function () {
    qr = new QRCode(document.getElementById("qrcode"), {
        text: "Loading QR...",
        width: 200,
        height: 200
    });

    if (window.rollNumber) {
        fetchRecordByRoll(window.rollNumber);
        AkashpandeyLearne(window.rollNumber);

        /* Photo.js code merged here */
        fetchGoogleDrivePhoto(window.rollNumber);
    } else {
        document.getElementById("errorMsg").innerText = "⚠️ No roll number provided!";
        document.title = "No Roll Number"; 
        document.getElementById("message").innerText = "⚠️ No roll number found!";
    }
});

/* ----------- DetilsMain.js functions ----------- */

async function fetchRecordByRoll(roll) {
    try {
        const formula = `FIND("${roll}", {ROLL_NUB})`;
        const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?filterByFormula=${encodeURIComponent(formula)}`;

        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${API_KEY}` }
        });

        const data = await res.json();

        if (data.records && data.records.length > 0) {
            displayCertificate(data.records[0].fields);
        } else {
            document.getElementById("errorMsg").innerText = "❌ No record found!";
        }
    } catch (err) {
        document.getElementById("errorMsg").innerText = "⚠️ Error loading record.";
        console.error(err);
    }
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
            displayCertificatell(data.records[0].fields);
        } else {
            document.getElementById("errorMsg").innerText = "❌ No record found!";
        }
    } catch (err) {
        document.getElementById("errorMsg").innerText = "⚠️ Error loading record.";
        console.error(err);
    }
}

function AkashpandeyLearn(fields) {
    const qrData = `Certificate Nub: ${fields.Ms_Nub || "N/A"}
Roll No: ${fields.ROLL_NUB || "N/A"}
Name: ${fields.NAME || "N/A"}
Father's Name: ${fields.FATHERS_NAME || "N/A"}
DOB: ${fields.DOB || "N/A"}
Course: ${fields.SELECT_COURSE || "N/A"}
English Typ: ${fields.English_SPD || "N/A"}
Hindi Typ: ${fields.Hindi_SPD || "N/A"}`;

    if (qr) {
        qr.clear();
        qr.makeCode(qrData);
    }
}

// yaha se details update kr diya gya hai

function displayCertificate(fields) {
    document.getElementById("qrc").innerText = fields.Ms_Nub || "N/A";
    document.getElementById("RollNubid").innerText = fields.ROLL_NUB || "N/A";
    document.getElementById("DOBfatch").innerText = fields.DOB || "N/A";
    document.getElementById("studentName").innerText = fields.NAME || "N/A";
    document.getElementById("fatherName").innerText = fields.FATHERS_NAME || "N/A";

    let adcacourse = fields.SELECT_COURSE || "CHELA";
    let duration = "Duration";

    switch (adcacourse.toLowerCase()) {
        case "English And Hindi Typing":
            duration = "SIX";
            break;
        case "diploma in computer application":
            duration = "six";
            break;
        default:
            duration = "SIX";
    }

    document.getElementById("courseName").innerText = adcacourse;
    document.getElementById("selectedDuration").innerText = duration;
    document.getElementById("englishspeed").innerText = fields.English_SPD;
    document.getElementById("hindispeed").innerText = fields.Hindi_SPD;
    // document.getElementById("studentIssueDate").innerText = fields.ISSUE_DATE || "N/A";  
}

function displayCertificatell(fields) {
    const roll = fields.ROLL_NUB || "N/A";
    document.getElementById("RollNubid").innerText = roll;
    document.title = roll;
}

/* ----------- Photo.js code merged here ----------- */

// Fetch image from Airtable and Google Drive URL process
let cropper;

async function fetchGoogleDrivePhoto(rollNumber) {
    const message = document.getElementById("message");
    const photoElement = document.getElementById("previewImage");
    const photopreview = document.getElementById("croppedImage");

    try {
        message.innerText = "Fetching photo...";
        const response = await fetch(
            `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?filterByFormula={ROLL_NUB}='${rollNumber}'`,
            { headers: { Authorization: `Bearer ${API_KEY}` } }
        );
        const data = await response.json();

        if (!data.records.length) {
            message.innerText = "No record found.";
            return;
        }

        const fields = data.records[0].fields;
        let rawLink = fields.photourl || fields.url;

        if (Array.isArray(rawLink) && rawLink.length > 0) rawLink = rawLink[0].url;

        if (typeof rawLink === "string") {
            let fileId = null;

            // /d/ के बाद ID निकालें
            let fileIdMatch = rawLink.match(/\/d\/([a-zA-Z0-9_-]+)/);
            if (fileIdMatch && fileIdMatch[1]) {
                fileId = fileIdMatch[1];
            } else {
                // id= के बाद ID निकालें
                fileIdMatch = rawLink.match(/[?&]id=([a-zA-Z0-9_-]+)/);
                if (fileIdMatch && fileIdMatch[1]) {
                    fileId = fileIdMatch[1];
                }
            }

            if (fileId) {
                const imageUrl = `https://lh3.googleusercontent.com/d/${fileId}=s800`;
                photoElement.src = imageUrl;
                photopreview.src = imageUrl;
                photoElement.style.display = "block";
                photopreview.style.display = "block";
                message.innerText = "Photo loaded successfully!";

                if (cropper) {
                    cropper.destroy();
                }
                cropper = new Cropper(photoElement, {
                    viewMode: 1,
                    autoCropArea: 0.8,
                    crop(event) {
                        const canvas = cropper.getCroppedCanvas({
                            width: 200,
                            height: 200,
                        });
                        photopreview.src = canvas.toDataURL();
                    },
                });
            } else {
                message.innerText = "Invalid Google Drive URL.";
            }
        } else {
            message.innerText = "No Google Drive link found.";
        }
    } catch (err) {
        console.error(err);
        message.innerText = "Error fetching data.";
    }
}


