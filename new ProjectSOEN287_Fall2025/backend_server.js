// server.js - Main Backend Server for Campus Resource Booking System
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve your HTML files from 'public' folder

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');

// Initialize data directory and files
async function initializeData() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        
        // Initialize users file
        try {
            await fs.access(USERS_FILE);
        } catch {
            const initialUsers = [
                {
                    id: 1,
                    name: "Alex Johnson",
                    email: "alex.johnson@concordia.ca",
                    password: await bcrypt.hash("password123", 10),
                    studentId: "40245891",
                    phone: "+1 (514) 555-0123",
                    program: "Bachelor of Computer Science",
                    year: "3rd Year"
                }
            ];
            await fs.writeFile(USERS_FILE, JSON.stringify(initialUsers, null, 2));
        }
        
        // Initialize bookings file
        try {
            await fs.access(BOOKINGS_FILE);
        } catch {
            const initialBookings = [
                {
                    id: 1,
                    userId: 1,
                    resource: "Study Room A",
                    date: "2025-11-05",
                    time: "10:00 - 12:00",
                    purpose: "Group Project",
                    people: 3,
                    notes: "Working on database project"
                },
                {
                    id: 2,
                    userId: 1,
                    resource: "Computer Lab 1",
                    date: "2025-11-07",
                    time: "14:00 - 16:00",
                    purpose: "Study",
                    people: 1,
                    notes: "Programming assignment"
                }
            ];
            await fs.writeFile(BOOKINGS_FILE, JSON.stringify(initialBookings, null, 2));
        }
        
        console.log('Data files initialized successfully');
    } catch (error) {
        console.error('Error initializing data:', error);
    }
}

// Helper functions to read/write data
async function readUsers() {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
}

async function writeUsers(users) {
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

async function readBookings() {
    const data = await fs.readFile(BOOKINGS_FILE, 'utf8');
    return JSON.parse(data);
}

async function writeBookings(bookings) {
    await fs.writeFile(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
}

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
}

// ==================== AUTH ROUTES ====================

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }
        
        const users = await readUsers();
        const user = users.find(u => u.email === email);
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '24h' });
        
        const { password: _, ...userWithoutPassword } = user;
        
        res.json({
            message: 'Login successful',
            token,
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, studentId, phone, program, year } = req.body;
        
        if (!name || !email || !password || !studentId) {
            return res.status(400).json({ error: 'Required fields missing' });
        }
        
        const users = await readUsers();
        
        if (users.find(u => u.email === email)) {
            return res.status(400).json({ error: 'Email already exists' });
        }
        
        if (users.find(u => u.studentId === studentId)) {
            return res.status(400).json({ error: 'Student ID already exists' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = {
            id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
            name,
            email,
            password: hashedPassword,
            studentId,
            phone: phone || '',
            program: program || '',
            year: year || ''
        };
        
        users.push(newUser);
        await writeUsers(users);
        
        const { password: _, ...userWithoutPassword } = newUser;
        
        res.status(201).json({
            message: 'Registration successful',
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== USER PROFILE ROUTES ====================

// Get current user profile
app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        const users = await readUsers();
        const user = users.find(u => u.id === req.user.id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update user profile
app.put('/api/profile', authenticateToken, async (req, res) => {
    try {
        const { name, email, phone, program, year } = req.body;
        
        const users = await readUsers();
        const userIndex = users.findIndex(u => u.id === req.user.id);
        
        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Check if email is taken by another user
        if (email && email !== users[userIndex].email) {
            if (users.find(u => u.email === email && u.id !== req.user.id)) {
                return res.status(400).json({ error: 'Email already in use' });
            }
        }
        
        users[userIndex] = {
            ...users[userIndex],
            name: name || users[userIndex].name,
            email: email || users[userIndex].email,
            phone: phone !== undefined ? phone : users[userIndex].phone,
            program: program !== undefined ? program : users[userIndex].program,
            year: year !== undefined ? year : users[userIndex].year
        };
        
        await writeUsers(users);
        
        const { password: _, ...userWithoutPassword } = users[userIndex];
        res.json({
            message: 'Profile updated successfully',
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Change password
app.put('/api/profile/password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current and new password required' });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }
        
        const users = await readUsers();
        const userIndex = users.findIndex(u => u.id === req.user.id);
        
        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const validPassword = await bcrypt.compare(currentPassword, users[userIndex].password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }
        
        users[userIndex].password = await bcrypt.hash(newPassword, 10);
        await writeUsers(users);
        
        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== BOOKING ROUTES ====================

// Get all bookings for current user
app.get('/api/bookings', authenticateToken, async (req, res) => {
    try {
        const bookings = await readBookings();
        const userBookings = bookings.filter(b => b.userId === req.user.id);
        res.json(userBookings);
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get single booking
app.get('/api/bookings/:id', authenticateToken, async (req, res) => {
    try {
        const bookingId = parseInt(req.params.id);
        const bookings = await readBookings();
        const booking = bookings.find(b => b.id === bookingId && b.userId === req.user.id);
        
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        
        res.json(booking);
    } catch (error) {
        console.error('Get booking error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create new booking
app.post('/api/bookings', authenticateToken, async (req, res) => {
    try {
        const { resource, date, time, purpose, people, notes } = req.body;
        
        if (!resource || !date || !time || !purpose) {
            return res.status(400).json({ error: 'Required fields missing' });
        }
        
        const bookings = await readBookings();
        
        const newBooking = {
            id: bookings.length > 0 ? Math.max(...bookings.map(b => b.id)) + 1 : 1,
            userId: req.user.id,
            resource,
            date,
            time,
            purpose,
            people: people || 1,
            notes: notes || ''
        };
        
        bookings.push(newBooking);
        await writeBookings(bookings);
        
        res.status(201).json({
            message: 'Booking created successfully',
            booking: newBooking
        });
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update booking
app.put('/api/bookings/:id', authenticateToken, async (req, res) => {
    try {
        const bookingId = parseInt(req.params.id);
        const { resource, date, time, purpose, people, notes } = req.body;
        
        const bookings = await readBookings();
        const bookingIndex = bookings.findIndex(b => b.id === bookingId && b.userId === req.user.id);
        
        if (bookingIndex === -1) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        
        bookings[bookingIndex] = {
            ...bookings[bookingIndex],
            resource: resource || bookings[bookingIndex].resource,
            date: date || bookings[bookingIndex].date,
            time: time || bookings[bookingIndex].time,
            purpose: purpose || bookings[bookingIndex].purpose,
            people: people !== undefined ? people : bookings[bookingIndex].people,
            notes: notes !== undefined ? notes : bookings[bookingIndex].notes
        };
        
        await writeBookings(bookings);
        
        res.json({
            message: 'Booking updated successfully',
            booking: bookings[bookingIndex]
        });
    } catch (error) {
        console.error('Update booking error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete booking
app.delete('/api/bookings/:id', authenticateToken, async (req, res) => {
    try {
        const bookingId = parseInt(req.params.id);
        
        const bookings = await readBookings();
        const bookingIndex = bookings.findIndex(b => b.id === bookingId && b.userId === req.user.id);
        
        if (bookingIndex === -1) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        
        bookings.splice(bookingIndex, 1);
        await writeBookings(bookings);
        
        res.json({ message: 'Booking deleted successfully' });
    } catch (error) {
        console.error('Delete booking error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== START SERVER ====================

initializeData().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log('API Endpoints:');
        console.log('  POST   /api/auth/login');
        console.log('  POST   /api/auth/register');
        console.log('  GET    /api/profile');
        console.log('  PUT    /api/profile');
        console.log('  PUT    /api/profile/password');
        console.log('  GET    /api/bookings');
        console.log('  GET    /api/bookings/:id');
        console.log('  POST   /api/bookings');
        console.log('  PUT    /api/bookings/:id');
        console.log('  DELETE /api/bookings/:id');
    });
});

module.exports = app;