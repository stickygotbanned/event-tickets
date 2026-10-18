const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Tracks which tickets have been checked in
const checkedInTickets = new Set();

// Secret PIN for your 3 staff phones (you can change this password to anything you want)
const STAFF_PIN = 'my-secret-staff-pin';

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Scan route
app.get('/scan', (req, res) => {
    const ticketId = req.query.ticket;
    const staffPin = req.query.pin;

    if (!ticketId) {
        return res.status(400).send('<h1>❌ Error: No ticket ID provided.</h1>');
    }

    const isStaff = (staffPin === STAFF_PIN);

    if (isStaff) {
        // --- STAFF VIEW (Checks tickets in and blocks duplicates) ---
        if (checkedInTickets.has(ticketId)) {
            return res.send(`
                <div style="font-family: Arial; text-align: center; margin-top: 50px; background-color: #ffe6e6; padding: 30px; border-radius: 10px;">
                    <h1 style="color: red; font-size: 36px;">⚠️ ALREADY USED!</h1>
                    <h2>Ticket ID: ${ticketId}</h2>
                    <p style="font-size: 20px;">This ticket was already checked in previously.</p>
                </div>
            `);
        } else {
            checkedInTickets.add(ticketId);
            return res.send(`
                <div style="font-family: Arial; text-align: center; margin-top: 50px; background-color: #e6ffed; padding: 30px; border-radius: 10px;">
                    <h1 style="color: green; font-size: 36px;">✅ VALID & CHECKED IN!</h1>
                    <h2>Ticket ID: ${ticketId}</h2>
                    <p style="font-size: 20px;">Access granted. Enjoy the event!</p>
                </div>
            `);
        }
    } else {
        // --- CUSTOMER VIEW (Only shows validity, does NOT use up the ticket) ---
        return res.send(`
            <div style="font-family: Arial; text-align: center; margin-top: 50px; background-color: #e6f0ff; padding: 30px; border-radius: 10px;">
                <h1 style="color: blue; font-size: 36px;">🎫 OFFICIAL TICKET</h1>
                <h2>Ticket ID: ${ticketId}</h2>
                <p style="font-size: 20px;">This is a valid event ticket.</p>
                <p style="color: gray; font-size: 14px;">(Note: This view is for ticket holders. Staff use a separate scanner portal.)</p>
            </div>
        `);
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Live ticket server running on port ${PORT}!`);
});