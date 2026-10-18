const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

const outputDir = path.join(__dirname, 'qrcodes');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

const BASE_URL = 'http://192.168.1.110:3000/scan?ticket=';
const TOTAL_TICKETS = 1500;

async function generateQRCodes() {
    console.log(`Regenerating ${TOTAL_TICKETS} QR codes with your network IP...`);

    for (let i = 1; i <= TOTAL_TICKETS; i++) {
        const ticketId = `EVT-${String(i).padStart(4, '0')}`;
        const scanUrl = `${BASE_URL}${ticketId}`;
        const filePath = path.join(outputDir, `${ticketId}.png`);

        await QRCode.toFile(filePath, scanUrl, {
            width: 300,
            margin: 2,
            color: { dark: '#000000', light: '#FFFFFF' }
        });
    }

    console.log('✅ All 1,500 QR codes updated successfully with your network IP!');
}

generateQRCodes();