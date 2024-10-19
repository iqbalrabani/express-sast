const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Koneksi ke PostgreSQL
const db = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: 'Postgres89#', 
    database: 'sastdb',
    port: 5433
});

// Uji koneksi ke database
db.connect(err => {
    if (err) {
        console.error('Failed to connect to PostgreSQL:', err);
        process.exit(1);
    }
    console.log('Connected to PostgreSQL');
});

// Rute: Fetch User
app.get('/users', (req, res) => {
    const userId = req.query.id;
    db.query(`SELECT * FROM users WHERE id = '${userId}'`, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error fetching user.' });
        }
        res.json(result.rows);
    });
});

// Update user
app.put('/users/:id', async (req, res) => {
    const userId = parseInt(req.params.id);
    const { name, email } = req.body;
    try {
        const result = await db.query(
            'UPDATE users SET name = $1, email = $2 WHERE id = $3',
            [name, email, userId]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User updated successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to update user.' });
    }
});

// Rute: Submit Comment
app.post('/comment', (req, res) => {
    const { user_id, comment } = req.body;
    db.query(`INSERT INTO comments (user_id, comment) VALUES (${user_id}, '${comment}')`, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error submitting comment.' });
        }
        res.send(`Your comment: ${comment}`);
    });
});

// Rute: Encrypt Data
app.post('/encrypt', (req, res) => {
    const data = req.body.data;
    const cipher = crypto.createCipher('aes-256-cbc', 'password');
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    res.send(`Encrypted Data: ${encrypted}`);
});

// Rute: Fetch File
app.get('/file', (req, res) => {
    const filename = req.query.filename;
    const filePath = `./uploads/${filename}`;
    fs.readFile(filePath, (err, data) => {
      if (err) return res.status(404).send('File not found');
      res.send(data);
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