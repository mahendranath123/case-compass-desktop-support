
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'support_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const [rows] = await pool.execute(
      'SELECT id, username, password_hash, full_name, role FROM users WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/register', authenticateToken, async (req, res) => {
  try {
    const { username, password, fullName } = req.body;
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can create users' });
    }

    // Check if username exists
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.execute(
      'INSERT INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, fullName || '', 'user']
    );

    res.json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Lead Routes
app.get('/api/leads/search', authenticateToken, async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.json([]);
    }

    const searchTerm = `%${query}%`;
    const [rows] = await pool.execute(
      `SELECT * FROM leads 
       WHERE ckt LIKE ? 
       OR cust_name LIKE ? 
       OR usable_ip_address LIKE ?
       LIMIT 50`,
      [searchTerm, searchTerm, searchTerm]
    );

    res.json(rows);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/leads', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM leads ORDER BY sr_no');
    res.json(rows);
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Case Routes
app.get('/api/cases', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM cases ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Get cases error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/cases', authenticateToken, async (req, res) => {
  try {
    const {
      leadCkt,
      ipAddress,
      connectivity,
      assignedDate,
      dueDate,
      caseRemarks,
      status
    } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO cases (lead_ckt, ip_address, connectivity, assigned_date, due_date, case_remarks, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [leadCkt, ipAddress, connectivity, assignedDate, dueDate, caseRemarks, status, req.user.id]
    );

    const [newCase] = await pool.execute(
      'SELECT * FROM cases WHERE id = ?',
      [result.insertId]
    );

    res.json(newCase[0]);
  } catch (error) {
    console.error('Create case error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/cases/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      leadCkt,
      ipAddress,
      connectivity,
      assignedDate,
      dueDate,
      caseRemarks,
      status
    } = req.body;

    await pool.execute(
      `UPDATE cases 
       SET lead_ckt = ?, ip_address = ?, connectivity = ?, assigned_date = ?, 
           due_date = ?, case_remarks = ?, status = ?
       WHERE id = ?`,
      [leadCkt, ipAddress, connectivity, assignedDate, dueDate, caseRemarks, status, id]
    );

    const [updatedCase] = await pool.execute(
      'SELECT * FROM cases WHERE id = ?',
      [id]
    );

    res.json(updatedCase[0]);
  } catch (error) {
    console.error('Update case error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/cases/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.execute('DELETE FROM cases WHERE id = ?', [id]);
    
    res.json({ message: 'Case deleted successfully' });
  } catch (error) {
    console.error('Delete case error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User Management Routes
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const [rows] = await pool.execute(
      'SELECT id, username, full_name, role, created_at FROM users ORDER BY created_at DESC'
    );
    
    res.json(rows);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
