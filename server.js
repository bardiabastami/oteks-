const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'products.json');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// Get Products
app.get('/api/products', (req, res) => {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read data' });
        }
        res.json(JSON.parse(data));
    });
});

// Update Products
app.post('/api/products', (req, res) => {
    const products = req.body;
    fs.writeFile(DATA_FILE, JSON.stringify(products, null, 4), 'utf8', (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to save data' });
        }
        res.json({ success: true });
    });
});

// References API
const REFERENCES_FILE = path.join(__dirname, 'data', 'references.json');

app.get('/api/references', (req, res) => {
    fs.readFile(REFERENCES_FILE, 'utf8', (err, data) => {
        if (err) {
            // If file doesn't exist, return empty array
            if (err.code === 'ENOENT') return res.json([]);
            return res.status(500).json({ error: 'Failed to read data' });
        }
        res.json(JSON.parse(data));
    });
});

app.post('/api/references', (req, res) => {
    const references = req.body;
    fs.writeFile(REFERENCES_FILE, JSON.stringify(references, null, 4), 'utf8', (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to save data' });
        }
        res.json({ success: true });
    });
});

// File Upload Configuration
const multer = require('multer');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOADS_DIR)
    },
    filename: function (req, file, cb) {
        // Safe filename: timestamp + original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Upload Offer Endpoint
app.post('/api/upload-offer', upload.single('offerFile'), (req, res) => {
    if (!req.file) {
        // It's okay if no file, just process body
        console.log('Offer received without file:', req.body);
        return res.json({ success: true, message: 'Offer received (no file)' });
    }
    console.log('Offer received with file:', req.file.filename, req.body);
    res.json({ success: true, message: 'Offer received with file' });
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
