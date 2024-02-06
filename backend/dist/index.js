// Import modules
const express = require('express');
const mysql = require('mysql');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken
const cors = require('cors');
const moment = require('moment');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Create MySQL Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Reza172172',
    database: process.env.DB_NAME || 'manajemen_keuangan',
});

// Connect to MySQL
db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

// Middleware
app.use(express.json());
app.use(cors()); // Allow CORS from all origins

console.log(new Date().toISOString());

// Routes
// GET all transactions
app.get('/api/transactions', (req, res) => {
    const sql = 'SELECT * FROM transactions';
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching transactions:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        const formattedResult = result.map(transaction => ({
            ...transaction,
            date: moment(new Date(transaction.date)).format('YYYY-MM-DD HH:mm:ss'),
        }));
        res.json(formattedResult);
    });
});

// POST new transaction
app.post('/api/transactions', (req, res) => {
    const { description, amount, category, date } = req.body;

    // Periksa apakah amount adalah number
    if (typeof amount !== 'number') {
        res.status(400).json({ error: 'Invalid amount format' });
        return;
    }

    const formattedDate = moment(date).format('YYYY-MM-DD HH:mm:ss');

    // Tidak perlu lagi melakukan penggantian karakter non-digit karena amount sudah dalam format number

    const sql = 'INSERT INTO transactions (description, amount, category, date) VALUES (?, ?, ?, ?)';
    db.query(sql, [description, amount, category, formattedDate], (err, result) => {
        if (err) {
            console.error('Error creating transaction:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.status(201).json({ message: 'Transaction created successfully' });
    });
});



// PUT update transaction by ID
app.put('/api/transactions/:id', (req, res) => {
    const { id } = req.params;
    const { description, amount, category, date } = req.body;

    // Format tanggal yang diberikan oleh pengguna
    const formattedDate = moment(date).format('YYYY-MM-DD HH:mm:ss');

    const sql = 'UPDATE transactions SET description = ?, amount = ?, category = ?, date = ? WHERE id = ?;';
    db.query(sql, [description, amount, category, formattedDate, id], (err, result) => {
        if (err) {
            console.error('Error updating transaction:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json({ message: 'Transaction updated successfully' });
    });
});


// DELETE transaction by ID
app.delete('/api/transactions/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM transactions WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error deleting transaction:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json({ message: 'Transaction deleted successfully' });
    });
});

// Login endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM users WHERE username = ? AND password = ?'; // Query tanpa hashing password
    db.query(sql, [username, password], (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        if (results.length === 0) {
            res.status(401).json({ error: 'Invalid username or password' });
            return;
        }
        const user = results[0];
        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET || 'secret');
        res.json({ token });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
