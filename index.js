const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const crypto = require('crypto');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
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
app.get('/users', async (req, res) => {
    const userId = req.query.id;
    try {
        const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching user.' });
    }
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
app.post('/comment', async (req, res) => {
    const { user_id, comment } = req.body;
    try {
        await db.query('INSERT INTO comments (user_id, comment) VALUES ($1, $2)', [user_id, comment]);
        res.send('Comment submitted!');
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error submitting comment.' });
    }
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