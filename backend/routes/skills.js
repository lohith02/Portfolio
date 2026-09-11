import express from 'express';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/skills - List all skills
router.get('/', (req, res) => {
  try {
    const skills = db.getSkills();
    res.json({ count: skills.length, skills });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

// POST /api/skills - Add new skill (Protected)
router.post('/', authenticateToken, (req, res) => {
  try {
    const { name, category = 'Photography', proficiency = 90, badge = 'Mastery', description = '', tools = [] } = req.body;
    if (!name) return res.status(400).json({ error: 'Skill name is required' });

    const id = `sk_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const parsedTools = Array.isArray(tools) ? tools : (typeof tools === 'string' ? tools.split(',').map(t => t.trim()).filter(Boolean) : []);

    const newSkill = {
      id,
      name,
      category,
      proficiency: Number(proficiency) || 90,
      badge: badge || 'Advanced',
      description: description || '',
      tools: parsedTools,
      orderIndex: Date.now()
    };

    db.saveSkill(newSkill);
    res.status(201).json({ message: 'Skill added successfully', skill: newSkill });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add skill' });
  }
});

// PUT /api/skills/:id - Update skill (Protected)
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const existing = db.getSkillById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Skill not found' });

    const { tools } = req.body;
    const parsedTools = tools !== undefined ? (Array.isArray(tools) ? tools : tools.split(',').map(t => t.trim()).filter(Boolean)) : existing.tools;

    const updated = {
      ...existing,
      ...req.body,
      tools: parsedTools,
      proficiency: req.body.proficiency !== undefined ? Number(req.body.proficiency) : existing.proficiency,
      id: req.params.id
    };

    db.saveSkill(updated);
    res.json({ message: 'Skill updated successfully', skill: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update skill' });
  }
});

// DELETE /api/skills/:id - Delete skill (Protected)
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const existing = db.getSkillById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Skill not found' });

    db.deleteSkill(req.params.id);
    res.json({ message: 'Skill deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete skill' });
  }
});

export default router;
