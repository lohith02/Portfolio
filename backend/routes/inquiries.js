import express from 'express';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/inquiries - Submit a new client booking / inquiry
router.post('/', (req, res) => {
  try {
    const {
      clientName, email, phone, sessionType,
      eventDate, budget, location, message
    } = req.body;

    if (!clientName || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    const id = 'inq_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    const createdAt = new Date().toISOString();

    const insert = db.prepare(`
      INSERT INTO inquiries (
        id, clientName, email, phone, sessionType,
        eventDate, budget, location, message, status, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?)
    `);

    insert.run(
      id, clientName, email, phone || '', sessionType || 'General Inquiry',
      eventDate || '', budget || '', location || '', message, createdAt
    );

    res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully. We will be in touch shortly.',
      inquiryId: id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/inquiries - Admin list inquiries (Protected)
router.get('/', authenticateToken, (req, res) => {
  try {
    const inquiries = db.prepare('SELECT * FROM inquiries ORDER BY createdAt DESC').all();
    res.json({ success: true, count: inquiries.length, inquiries });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/inquiries/:id - Update status (Protected)
router.patch('/:id', authenticateToken, (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const result = db.prepare('UPDATE inquiries SET status = ? WHERE id = ?').run(status, req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    res.json({ success: true, message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/inquiries/:id - Delete inquiry (Protected)
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const result = db.prepare('DELETE FROM inquiries WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }
    res.json({ success: true, message: 'Inquiry deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
