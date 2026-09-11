import express from 'express';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/profile - Public profile & bio info
router.get('/', (req, res) => {
  try {
    const profile = db.getProfile();
    res.json({ profile });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /api/profile - Update site profile, bio, stats, socials (Protected)
router.put('/', authenticateToken, (req, res) => {
  try {
    const updated = db.updateProfile(req.body);
    res.json({ message: 'Profile updated successfully', profile: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
