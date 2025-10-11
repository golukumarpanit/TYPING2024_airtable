const API_KEY = 'patxNsgkdADYDxhX3.654356213cd686479f5fd85867cd6db2e53f788d3a65f920009cb676f735b83e'; // Airtable API Key
const BASE_ID = 'appQgYPqyGnNdrtlL';
const TABLE_NAME = 'GCSM2024';

let qr;

window.onload = function () {
    qr = new QRCode(document.getElementById("qrcode"), {
        text: "QR will update after data load",
        width: 200,
        height: 200
    });
};

async function fetchData() {
    const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;
    const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${API_KEY}` }
    });
    if (!response.ok) throw new Error('Failed to fetch data');
    const data = await response.json();
    return data.records;
}

// function formatDate(dobRaw) {
//     if (!dobRaw) return '[DOB]';
//     const date = new Date(dobRaw);
//     if (isNaN(date.getTime())) return '[DOB]';
//     const day = String(date.getUTCDate()).padStart(2, '0');
//     const month = String(date.getUTCMonth() + 1).padStart(2, '0');
//     const year = date.getUTCFullYear();
//     return `${day}-${month}-${year}`;
// }

function getDirectDriveLink(driveLink) {
    let fileId = "";
    if (driveLink.includes("id=")) {
        fileId = driveLink.split("id=")[1];
    } else if (driveLink.includes("/d/")) {
        fileId = driveLink.split("/d/")[1].split("/")[0];
    }
    return fileId ? `https://drive.google.com/uc?export=view&id=${fileId}` : null;
}
// yaha function kam kr rha hai api se data lene me 
function fetch_data_from_API(record) {
    const name = record.fields.NAME || '[Student Name]';
    const father = record.fields.FATHERS_NAME || '[Father Name]';
    const course = record.fields.SELECT_COURSE || '[Course]';
    const roll = record.fields.ROLL_NUB || '[Roll No]';
    const ms = record.fields.Ms_Nub || '[Ms No]';
    const dobFormatted = record.fields.DOB || '[dob]';
    // const dobFormatted = formatDate(record.fields.DOB);


// YAHA SE QR KA DATA UPDATE HO RHA HAI 
    const data = `Certificate Nub: ${ms}
    Roll No: ${roll}
    Name: ${name}
    Father's Name: ${father}
    Course: ${course}
    DOB: ${dobFormatted}`;

    qr.clear();
    qr.makeCode(data);
    // ISKE UPPAR QR HAI 
}

function displayCertificate(record) {
    const get = id => document.getElementById(id);
    const f = record.fields;

    const name = f.NAME || '[Student Name]';
    const father = f.FATHERS_NAME || '[Father Name]';
    const course = f.SELECT_COURSE || '[Course Name]';
    const roll = f.ROLL_NUB || '[Roll No]';
    const ms = f.Ms_Nub || '[Ms No]';
    const dobFormatted = record.fields.DOB || '[dob]';
    // yaha name ka  condition kam kr rha hai 
    let akashname = '';
    if (course === 'Advance Diploma in Computer Application') {
    akashname = 'XXXXXXXXXXXXXXXXXXXXXXXX';
    } else if (course === 'Diploma in Computer Application') {
    akashname = 'XXXXXXXXXXXXXXXXXXXXXXXX';
    } else if (course === 'English And Hindi Typing') {
    akashname = name;    }

    // यदि 'get' एक कस्टम फंक्शन है जो document.getElementById करता है
    get('studentName').innerText = akashname;       
    get('nameInput').innerText = akashname;
    // yaha if else se data aa rha hai 
    get('fatherName').innerText = father;
    get('fatherNameInput').innerText = father;
    get('courseName').innerText = course;
    get('courseName1').innerText = course;
    get('RollNubid').innerText = roll;
    get('roll2').innerText = roll;
    get('qrc').innerText = ms;
    get('qhrc').innerText = ms;
    get('dob2').innerText = dobFormatted;
    get('DOBfatch').innerText = dobFormatted;

    let duration = '';
    if (course === 'Advance Diploma in Computer Application') duration = 'XXXXXXXXXXXXXXXXXXXXXXXX';
    else if (course === 'Diploma in Computer Application') duration = 'XXXXXXXXXXXXXXXXXXXXXXXX';
    else if (course === 'English And Hindi Typing') duration = 'Six';

    get('durationSelect').innerText = duration;
    get('selectedDuration').innerText = duration || '[Duration]';
    

    // ✅ PHOTO Handling
    const preview = document.getElementById('previewImage');
    const cropped = document.getElementById('croppedImage');

    if (record.fields.photo && record.fields.photo[0] && record.fields.photo[0].url) {
        preview.src = record.fields.photo[0].url;
        cropped.src = record.fields.photo[0].url;
        preview.style.display = "block";
        cropped.style.display = "block";
    } else {
        preview.style.display = "none";
        cropped.style.display = "none";
    }

    // ✅ yaha se sab update ho rha hai data 
    fetch_data_from_API(record);

}

async function searchCertificate() {
    const inputId = document.getElementById('idInput').value.trim();
    const messageDiv = document.getElementById('message');

    if (!inputId) {
        messageDiv.innerText = 'Please enter an ID.';
        messageDiv.className = 'error';
        return;
    }

    messageDiv.innerText = 'Please wait... fetching data...';
    messageDiv.className = 'loading';

    try {
        const records = await fetchData();
        const record = records.find(r => r.fields.ROLL_NUB == inputId);

        if (record) {
            displayCertificate(record);
            messageDiv.innerText = 'Certificate Loaded Successfully!';
            messageDiv.className = 'success';
        } else {
            messageDiv.innerText = 'No record found for the given ID.';
            messageDiv.className = 'error';
        }
    } catch (error) {
        messageDiv.innerText = 'Error fetching data. Check API Key or Base ID.';
        messageDiv.className = 'error';
        console.error(error);
    }

    // Update page title with roll number
    document.title = inputId;  
    
     
}
// yaha se croper kam karega 

