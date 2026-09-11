import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db/database.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
    if (!admin) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const match = bcrypt.compareSync(password, admin.passwordHash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = generateToken({ id: admin.id, username: admin.username, role: 'admin' });

    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me - Verify current admin session
router.get('/me', authenticateToken, (req, res) => {
  try {
    const admin = db.prepare('SELECT id, username, email FROM admins WHERE id = ?').get(req.user.id);
    if (!admin) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true, admin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post('/change-password', authenticateToken, (req, res) => {
  try {
    const { currentPassword, newPassword, newUsername } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const admin = db.prepare('SELECT * FROM admins WHERE id = ?').get(req.user.id);
    if (!admin) {
      return res.status(404).json({ error: 'Admin account not found' });
    }

    if (currentPassword) {
      const match = bcrypt.compareSync(currentPassword, admin.passwordHash);
      if (!match) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    admin.passwordHash = newHash;
    if (newUsername && newUsername.trim()) {
      admin.username = newUsername.trim();
    }
    db.save();

    res.json({ success: true, message: 'Admin credentials updated successfully', username: admin.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

