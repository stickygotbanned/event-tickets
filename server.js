const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser'); // We'll use this to remember staff phones
const app = express();
const PORT = process.env.PORT || 3000;

const checkedInTickets = new Set();
const STAFF_PIN = 'my-secret-staff-pin'; // Change this to your preferred password

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// 1. Staff Login Page
app.get('/login', (req, res) => {
    res.send(`
        <div style="font-family: Arial; text-align: center; margin-top: 50px; padding: 20px;">
            <h2>Staff Scanner Login</h2>
            <form method="POST" action="/login">
                <input type="password" name="pin" placeholder="Enter Staff PIN" style="padding: 10px; font-size: 16px;" required />
                <br><br>
                <button type="submit" style="padding: 10px 20px; font-size: 16px; background: green; color: white; border: none; border-radius: 5px;">Login as Staff</button>
            </form>
        </div>
    `);
});

// 2. Handle Staff Login Submission
app.post('/login', (req, res) => {
    const { pin } = req.body;
    if (pin === STAFF_PIN) {
        // Give this phone a staff cookie that lasts for 7 days
        res.cookie('isStaff', 'true', { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true });
        return res.send(`
            <div style="font-family: Arial; text-align: center; margin-top: 50px; background-color: #e6ffed; padding: 30px; border-radius: 10px;">
                <h1 style="color: green;">✅ Staff Login Successful!</h1>
                <p style="font-size: 20px;">This phone is now authorized to scan and check in tickets.</p>
                <a href="/" style="font-size: 18px;">Go to Scanner Mode</a>
            </div>
        `);
    } else {
        return res.send(`<script>alert('Incorrect PIN'); window.location.href='/login';</script>`);
    }
});

// 3. The Scan Route (Handles both customers and logged-in staff using the SAME QR code)
app.get('/scan', (req, res) => {
    const ticketId = req.query.ticket;
    const isStaffPhone = req.cookies.isStaff === 'true';

    if (!ticketId) {
        return res.status(400).send('<h1>❌ Error: No ticket ID provided.</h1>');
    }

    if (isStaffPhone) {
        // --- STAFF VIEW (Checks tickets in automatically) ---
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
        // --- CUSTOMER VIEW (Just shows valid, does NOT use it up) ---
        return res.send(`
            <div style="font-family: Arial; text-align: center; margin-top: 50px; background-color: #e6f0ff; padding: 30px; border-radius: 10px;">
                <h1 style="color: blue; font-size: 36px;">🎫 OFFICIAL TICKET</h1>
                <h2>Ticket ID: ${ticketId}</h2>
                <p style="font-size: 20px;">This is a valid event ticket.</p>
            </div>
        `);
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Live ticket server running on port ${PORT}!`);
});
