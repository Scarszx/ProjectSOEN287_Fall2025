// creating some variables and setting up the server
const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const session = require('express-session');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

//MySQL Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',  
    database: 'campus_booking'
});

db.connect(err => {
    if (err) {
        console.error('MySQL connection failed:', err);
    } else {
        console.log('Connected to MySQL');
    }
});

// Middleware setup
app.use(bodyParser.json());
app.use(session({
    secret: 'soen287-secret-2025',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.use(express.static(path.join(__dirname, 'index.html')));  // your HTML folder
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));

// Routes
app.post('/api/register', (req, res) => {
    const { first_name, last_name, email, status, id_number, new_username, new_password } = req.body;
    const hashed = crypto.createHash('sha256').update(new_password).digest('hex');

    const sql = `INSERT INTO users (first_name, last_name, email, status, id_number, username, password) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, [first_name, last_name, email, status, id_number, new_username, hashed], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') return res.json({ success: false, message: 'Username/Email/ID already taken' });
            return res.json({ success: false, message: 'Error' });
        }
        res.json({ success: true, message: 'Account created!' });
    });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const hashed = crypto.createHash('sha256').update(password).digest('hex');

    db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, hashed], (err, results) => {
        if (err || results.length === 0) {
            return res.json({ success: false, message: 'Wrong username or password' });
        }
        const user = results[0];
        req.session.user = user;

        let redirect = '/student_dashboard.html';
        if (user.status === 'faculty') redirect = '/faculty_dashboard.html';
        if (user.status === 'resource_manager') redirect = '/manager_dashboard.html';

        res.json({ success: true, redirect });
    });
});

app.get('/api/me', (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.json({ loggedIn: false });
    }
});

app.get('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Go to: http://localhost:${PORT}/login_page.html`);
});