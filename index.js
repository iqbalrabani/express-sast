const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const crypto = require('crypto');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Koneksi ke MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Mysql89#', 
    database: 'sastdb'
});

db.connect(err => {
    if (err) {
        throw err;
    }
    console.log('Connected to MySQL');
});

// Rute: Fetch User
app.get('/users', (req, res) => {
    const userId = req.query.id;
    const query = 'SELECT * FROM users WHERE id = ?';
    db.query(query, [userId], (err, result) => {
        if (err) throw err;
        res.json(result);
    });
});

// Update user
app.put('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const { name, email } = req.body; // Pastikan body memiliki field name dan email
    const query = 'UPDATE users SET name = ?, email = ? WHERE id = ?';

    db.query(query, [name, email, userId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Failed to update user.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User updated successfully!' });
    });
});

// Rute: Submit Comment
app.post('/comment', (req, res) => {
    const comment = req.body.comment;
    const query = 'INSERT INTO comments (comment) VALUES (?)';
    db.query(query, [comment], (err) => {
        if (err) throw err;
        res.send('Comment submitted!');
    });
});

// Rute: Encrypt Data
app.post('/encrypt', (req, res) => {
    const data = req.body.data;
    const cipher = crypto.createCipher('aes-256-cbc', 'a_secret_key');
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    res.send(`Encrypted Data: ${encrypted}`);
});

// Rute: Fetch File
app.get('/file', (req, res) => {
    const fileName = req.query.filename;
    const filePath = path.join(__dirname, 'uploads', fileName);
    res.sendFile(filePath, err => {
        if (err) {
            res.status(404).send('File not found');
        }
    });
});

// Render Front-End
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Jalankan server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});