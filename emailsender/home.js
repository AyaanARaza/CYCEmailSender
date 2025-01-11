const fileInput = document.getElementById("xlsxFile");
const sendList = document.getElementById("send");
const noSendList = document.getElementById("nosend");
var emailDataList;


fileInput.addEventListener("change", function () {
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();

        reader.onload = function (event) {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: "array" });

            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            emailDataList = [];

            sheetData.slice(1).forEach(row => {
                if (row[0] !== undefined) {
                    if (row[1] === undefined || row[1] === "") {
                        const listItem = document.createElement("li");
                        listItem.textContent = row[0];
                        sendList.appendChild(listItem);
                        const g = row[0];
                        if (g && g.includes("@")) {
                            const rowData = row.slice(2);
                            emailDataList.push({ [g]: rowData });
                        }
                    }  else {
                        const noSendItem = document.createElement("li");
                        noSendItem.textContent = row[0];
                        noSendList.appendChild(noSendItem);
                    }

                }
            });

            console.log(emailDataList);
        };

        reader.readAsArrayBuffer(file);
    } else {
        console.log("No file selected.");
    }
});
function sendEmail() {
    const recipientEmail = prompt("Please enter the email address to send to:");

    if (!recipientEmail) {
        alert("No email entered. Please provide a valid email address.");
        return;
    }

    const subject = "Test Email";
    const senderEmail = "campbellyouthcommission@gmail.com";
    const body = "This is a test email that should be sent through " + senderEmail;

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}&authuser=${encodeURIComponent(senderEmail)}`;

    window.open(gmailUrl, '_blank');
}

function sendBulk() {
    var text = document.getElementById("template").value;
    function getSubject(input) {
        const match = input.match(/SUBJECT:(.*)/);
        return match ? match[1].trim() : null;
    }
    function removeSubject(input) {
        return input.replace(/SUBJECT:.*\n?/, '').trim();
    }
    function findWords(input) {
        const matches = input.match(/\$\{([^}]+)\}/g);
        return matches ? matches.map(match => match.slice(2, -1)) : [];
    }
    var subject = getSubject(text);
    var words = findWords(text);
    text = removeSubject(text);
    emailDataList.forEach(entry => {
        var temp = text;
        const email = Object.keys(entry)[0];
        const parameters = entry[email];
        console.log(email, parameters)

        words.forEach((word, index) => {
            temp = temp.replace("${" + word + "}", parameters[index]);
        });

        sendEmailTo(email, {
            subject: subject,
            body: temp
        });
    });

}
function sendEmailTo(email, { subject, body }) {
    const senderEmail = "campbellyouthcommission@gmail.com";
    console.log(`Sending email to: ${email}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}&authuser=${encodeURIComponent(senderEmail)}`;

    window.open(gmailUrl, '_blank');
}

document.getElementById('test').addEventListener('click', sendEmail);
document.getElementById('bulk').addEventListener('click', sendBulk);