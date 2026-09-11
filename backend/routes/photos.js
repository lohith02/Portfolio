import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db from '../db/database.js';
import { extractExif } from '../utils/exifParser.js';
import { authenticateToken } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const uploadsDir = path.resolve(__dirname, '../uploads');

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `photo-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|avif|tiff/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    if (allowed.test(ext) || allowed.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP, AVIF, TIFF) are allowed'));
    }
  }
});

// GET /api/photos - List photos with optional filters
router.get('/', (req, res) => {
  try {
    let query = 'SELECT * FROM photos WHERE 1=1';
    const params = [];

    if (req.query.category && req.query.category !== 'all') {
      query += ' AND category = ?';
      params.push(req.query.category);
    }

    if (req.query.featured === 'true' || req.query.featured === '1') {
      query += ' AND featured = 1';
    }

    if (req.query.search) {
      query += ' AND (title LIKE ? OR description LIKE ? OR location LIKE ? OR camera LIKE ?)';
      const term = `%${req.query.search}%`;
      params.push(term, term, term, term);
    }

    query += ' ORDER BY orderIndex ASC, createdAt DESC';

    if (req.query.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(req.query.limit));
      if (req.query.offset) {
        query += ' OFFSET ?';
        params.push(parseInt(req.query.offset));
      }
    }

    const stmt = db.prepare(query);
    const photos = stmt.all(...params);

    res.json({
      success: true,
      count: photos.length,
      photos
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/photos/categories - Get all categories
router.get('/categories', (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories').all();
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/photos/gear - Get gear list
router.get('/gear', (req, res) => {
  try {
    const gear = db.prepare('SELECT * FROM gear').all();
    res.json({ success: true, gear });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/photos/:id - Get single photo
router.get('/:id', (req, res) => {
  try {
    const photo = db.prepare('SELECT * FROM photos WHERE id = ?').get(req.params.id);
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    res.json({ success: true, photo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/photos - Upload photo with automatic EXIF parsing (Protected)
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file && !req.body.imageUrl) {
      return res.status(400).json({ error: 'Image file or imageUrl is required' });
    }

    let imageUrl = req.body.imageUrl;
    let extractedExif = {};

    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
      // Extract EXIF from uploaded file
      extractedExif = await extractExif(req.file.path);
    }

    const id = 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    const title = req.body.title || 'Untitled Archive';
    const description = req.body.description || '';
    const category = req.body.category || 'landscapes';
    const location = req.body.location || '';
    const year = req.body.year || extractedExif.year || new Date().getFullYear().toString();
    const featured = req.body.featured === 'true' || req.body.featured === true ? 1 : 0;
    const aspectRatio = req.body.aspectRatio || '3:2';

    const camera = req.body.camera || extractedExif.camera || 'Sony Alpha 6400';
    const lens = req.body.lens || extractedExif.lens || 'FE 16-50mm F3.0 GM II';
    const focalLength = req.body.focalLength || extractedExif.focalLength || '35mm';
    const aperture = req.body.aperture || extractedExif.aperture || 'f/3.0';
    const shutterSpeed = req.body.shutterSpeed || extractedExif.shutterSpeed || '1/500s';
    const iso = req.body.iso || extractedExif.iso || 'ISO 100';

    const maxOrder = db.prepare('SELECT MAX(orderIndex) as maxIdx FROM photos').get();
    const orderIndex = (maxOrder && maxOrder.maxIdx !== null) ? maxOrder.maxIdx + 1 : 0;

    const createdAt = new Date().toISOString();

    const insert = db.prepare(`
      INSERT INTO photos (
        id, title, description, category, imageUrl, thumbnailUrl,
        camera, lens, focalLength, aperture, shutterSpeed, iso,
        location, year, featured, orderIndex, aspectRatio, createdAt
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?
      )
    `);

    insert.run(
      id, title, description, category, imageUrl, imageUrl,
      camera, lens, focalLength, aperture, shutterSpeed, iso,
      location, year, featured, orderIndex, aspectRatio, createdAt
    );

    const createdPhoto = db.prepare('SELECT * FROM photos WHERE id = ?').get(id);

    res.status(201).json({
      success: true,
      message: 'Photo uploaded successfully',
      photo: createdPhoto
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/photos/:id - Update photo metadata (Protected)
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM photos WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    const {
      title, description, category, location, year, featured,
      camera, lens, focalLength, aperture, shutterSpeed, iso, orderIndex, aspectRatio
    } = req.body;

    const update = db.prepare(`
      UPDATE photos SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        category = COALESCE(?, category),
        location = COALESCE(?, location),
        year = COALESCE(?, year),
        featured = COALESCE(?, featured),
        camera = COALESCE(?, camera),
        lens = COALESCE(?, lens),
        focalLength = COALESCE(?, focalLength),
        aperture = COALESCE(?, aperture),
        shutterSpeed = COALESCE(?, shutterSpeed),
        iso = COALESCE(?, iso),
        orderIndex = COALESCE(?, orderIndex),
        aspectRatio = COALESCE(?, aspectRatio)
      WHERE id = ?
    `);

    update.run(
      title, description, category, location, year,
      featured !== undefined ? (featured ? 1 : 0) : null,
      camera, lens, focalLength, aperture, shutterSpeed, iso, orderIndex, aspectRatio,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM photos WHERE id = ?').get(req.params.id);
    res.json({ success: true, photo: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/photos/:id - Delete photo (Protected)
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const photo = db.prepare('SELECT * FROM photos WHERE id = ?').get(req.params.id);
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    if (photo.imageUrl && photo.imageUrl.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', photo.imageUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    db.prepare('DELETE FROM photos WHERE id = ?').run(req.params.id);

    res.json({ success: true, message: 'Photo deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/photos/categories - Add category (Protected)
router.post('/categories', authenticateToken, (req, res) => {
  try {
    const { name, description = '', coverImage = null } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const id = `cat_${slug}`;

    db.prepare('INSERT OR REPLACE INTO categories (id, name, slug, description, coverImage) VALUES (?, ?, ?, ?, ?)').run(
      id, name, slug, description, coverImage
    );

    res.status(201).json({ success: true, message: 'Category created', category: { id, name, slug, description, coverImage } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/photos/categories/:id - Delete category (Protected)
router.delete('/categories/:id', authenticateToken, (req, res) => {
  try {
    db.data = db.load();
    const prev = db.data.categories.length;
    db.data.categories = db.data.categories.filter(c => c.id !== req.params.id && c.slug !== req.params.id);
    db.save();
    res.json({ success: true, message: 'Category removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
