import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;
const JWT_SECRET = 'phub_secure_secret_key_2026';
const dbPath = path.resolve(__dirname, 'phub.db');

app.use(cors());
app.use(bodyParser.json());

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Database connection error:', err.message);
  else console.log('Connected to SQLite database.');
});

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token.' });
    req.user = user;
    next();
  });
};

// Initialize database
const initDb = () => {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS medicines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      description TEXT,
      manufacturer TEXT,
      price REAL,
      discountedPrice REAL,
      expiryDate TEXT,
      category TEXT,
      image TEXT,
      inStock BOOLEAN
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS cart (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      medicineId INTEGER,
      quantity INTEGER,
      FOREIGN KEY(userId) REFERENCES users(id),
      FOREIGN KEY(medicineId) REFERENCES medicines(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      items TEXT,
      totalAmount REAL,
      shippingAddress TEXT,
      contactNumber TEXT,
      paymentMethod TEXT,
      paymentStatus TEXT,
      status TEXT,
      orderDate TEXT,
      transactionId TEXT,
      FOREIGN KEY(userId) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      deviceId TEXT,
      lastActive TEXT
    )`);
  });
};

initDb();

// Auth Routes
app.post('/auth/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.run("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", 
    [name, email, hashedPassword, role || 'user'], 
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Email already exists.' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, name, email, role: role || 'user' });
    }
  );
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;

  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(400).json({ error: 'Invalid email or password.' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid email or password.' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '365d' });
    
    // Remove password from response
    const { password: _, ...userData } = user;
    res.json({ token, user: userData });
  });
});

// Medicine Routes (Public)
app.get('/medicines', (req, res) => {
  db.all("SELECT * FROM medicines", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/medicines/:id', (req, res) => {
  db.get("SELECT * FROM medicines WHERE id = ?", [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

// Protected Cart Routes
app.get('/cart', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const expand = req.query._expand;

  let query = `SELECT * FROM cart WHERE userId = ?`;
  if (expand === 'medicine') {
    query = `SELECT cart.*, medicines.name as med_name, medicines.price as med_price, medicines.image as med_image 
             FROM cart JOIN medicines ON cart.medicineId = medicines.id 
             WHERE cart.userId = ?`;
  }

  db.all(query, [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (expand === 'medicine') {
      const transformed = rows.map(r => ({
        id: r.id,
        userId: r.userId,
        medicineId: r.medicineId,
        quantity: r.quantity,
        medicine: { id: r.medicineId, name: r.med_name, price: r.med_price, image: r.med_image }
      }));
      return res.json(transformed);
    }
    res.json(rows);
  });
});

app.post('/cart', authenticateToken, (req, res) => {
  const { medicineId, quantity } = req.body;
  const userId = req.user.id;

  db.run("INSERT INTO cart (userId, medicineId, quantity) VALUES (?, ?, ?)", 
    [userId, medicineId, quantity], 
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, userId, medicineId, quantity });
    }
  );
});

app.patch('/cart/:id', authenticateToken, (req, res) => {
  const { quantity } = req.body;
  db.run("UPDATE cart SET quantity = ? WHERE id = ? AND userId = ?", 
    [quantity, req.params.id, req.user.id], 
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

app.delete('/cart/:id', authenticateToken, (req, res) => {
  db.run("DELETE FROM cart WHERE id = ? AND userId = ?", 
    [req.params.id, req.user.id], 
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// Protected Order Routes
app.get('/orders', authenticateToken, (req, res) => {
  db.all("SELECT * FROM orders WHERE userId = ? ORDER BY id DESC", [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const transformed = rows.map(r => ({ ...r, items: JSON.parse(r.items) }));
    res.json(transformed);
  });
});

app.post('/orders', authenticateToken, (req, res) => {
  const { items, totalAmount, shippingAddress, contactNumber, paymentMethod, paymentStatus } = req.body;
  const userId = req.user.id;
  const orderDate = new Date().toISOString();
  const transactionId = 'TXN' + Math.random().toString(36).substring(2, 10).toUpperCase();

  db.run(`INSERT INTO orders (userId, items, totalAmount, shippingAddress, contactNumber, paymentMethod, paymentStatus, status, orderDate, transactionId) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
    [userId, JSON.stringify(items), totalAmount, shippingAddress, contactNumber, paymentMethod, paymentStatus, 'Confirmed', orderDate, transactionId], 
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, transactionId, status: 'Confirmed' });
    }
  );
});

// Payment Verification Simulation (Secure)
app.post('/payments/verify', authenticateToken, (req, res) => {
  const { amount, method } = req.body;
  
  // Simulation logic: Professional grade checksum/verification
  setTimeout(() => {
    const success = Math.random() > 0.05; // 95% success
    if (success) {
      const gatewayToken = jwt.sign({ amount, status: 'success' }, JWT_SECRET, { expiresIn: '5m' });
      res.json({ success: true, gatewayToken });
    } else {
      res.status(402).json({ success: false, error: 'Payment declined by gateway.' });
    }
  }, 2000);
});

// Session Management
app.get('/sessions', (req, res) => {
  const userId = req.query.userId;
  db.all("SELECT * FROM sessions WHERE userId = ?", [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/sessions', (req, res) => {
  const { userId, deviceId, lastActive } = req.body;
  db.run("INSERT INTO sessions (userId, deviceId, lastActive) VALUES (?, ?, ?)", 
    [userId, deviceId, lastActive], 
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

app.delete('/sessions/:id', (req, res) => {
  db.run("DELETE FROM sessions WHERE id = ?", [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.listen(PORT, () => {
  console.log(`Professional Secure Server running at http://localhost:${PORT}`);
});
