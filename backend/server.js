const express = require('express');
// DB connection moved to ./db
const db = require('./db');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());             // Allows React to connect
app.use(express.json({ limit: '50mb' }));     // Allows sending JSON data with large base64 images

// Test DB connection with a simple query using the pooled connection
(async () => {
    try {
        const rows = await db.query('SELECT 1 + 1 AS result');
        console.log('DB test query result:', rows[0].result);
    } catch (err) {
        console.error('Error connecting to DB:', err);
    }
})();

// Simple Route to test
app.get('/', (req, res) => {
    res.json("Backend is working!");
});

// API routes
const booksRouter = require('./routes/books');
const membersRouter = require('./routes/members');
const catalogueRouter = require('./routes/catalogue');
const usersRouter = require('./routes/users');
const borrowRecordsRouter = require('./routes/borrowRecords');
const finesRouter = require('./routes/fines');
const announcementsRouter = require('./routes/announcements');
const membershipRouter = require('./routes/membership');
const messagesRouter = require('./routes/messages');
const adminRouter = require('./routes/admin');

app.use('/api/books', booksRouter);
app.use('/api/members', membersRouter);
app.use('/api/catalogue', catalogueRouter);
app.use('/api/users', usersRouter);
app.use('/api/borrow-records', borrowRecordsRouter);
app.use('/api/fines', finesRouter);
app.use('/api/announcements', announcementsRouter);
app.use('/api/membership', membershipRouter);
app.use('/api/messages', messagesRouter);
// Hidden admin endpoints
app.use('/api', adminRouter);

const path = require('path');

// Serve simple static error pages (useful in production when frontend static files are served by backend)
app.use(express.static(path.join(__dirname, 'public')));

// Development-only error routes (handy to test error pages locally)
if (process.env.NODE_ENV !== 'production') {
    app.get('/__error/500', (req, res, next) => {
        next(new Error('Test 500 - server error'));
    });
    app.get('/__error/403', (req, res, next) => {
        const err = new Error('Test 403 - forbidden');
        err.status = 403;
        next(err);
    });
}

// 404 handler: APIs return JSON, non-API GETs return friendly HTML page
app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not Found' });
    // For non-API routes, serve the friendly 404 page
    if (req.method === 'GET') return res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
    return res.status(404).end();
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err && err.stack ? err.stack : err);
    const status = err && err.status ? err.status : 500;
    if (req.path.startsWith('/api')) {
        return res.status(status).json({ error: err.message || 'Server Error' });
    }

    if (status === 403) return res.status(403).sendFile(path.join(__dirname, 'public', '403.html'));
    return res.status(500).sendFile(path.join(__dirname, 'public', '500.html'));
});

// Start Server
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});