import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const uploadsDir = path.resolve(__dirname, '../uploads');

// Multer storage for video & thumbnail uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    const prefix = file.fieldname === 'video' ? 'video' : 'thumb';
    cb(null, `${prefix}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 150 * 1024 * 1024 }, // 150MB video limit
  fileFilter: (req, file, cb) => {
    const allowedVideo = /mp4|webm|mov|mkv|avi|m4v/;
    const allowedImg = /jpeg|jpg|png|webp|avif/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    
    if (file.fieldname === 'video') {
      if (allowedVideo.test(ext) || file.mimetype.startsWith('video/')) {
        cb(null, true);
      } else {
        cb(new Error('Invalid video format. Supported: MP4, WebM, MOV, MKV'));
      }
    } else {
      if (allowedImg.test(ext) || file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Invalid thumbnail format'));
      }
    }
  }
});

// GET /api/videos - List all videos
router.get('/', (req, res) => {
  try {
    const videos = db.getVideos();
    res.json({ count: videos.length, videos });
  } catch (err) {
    console.error('Error fetching videos:', err);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// GET /api/videos/:id - Single video
router.get('/:id', (req, res) => {
  try {
    const video = db.getVideoById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });
    res.json({ video });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch video' });
  }
});

// POST /api/videos - Create or upload video (Protected)
router.post('/', authenticateToken, upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), (req, res) => {
  try {
    const { 
      title, 
      description, 
      category = 'Cinematography', 
      client = '', 
      year = new Date().getFullYear().toString(),
      duration = '', 
      videoUrl: externalUrl, 
      thumbnailUrl: externalThumb, 
      featuredShowreel = false,
      aspectRatio = '16:9',
      tags = ''
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Video title is required' });
    }

    let finalVideoUrl = externalUrl || '';
    let finalThumbnailUrl = externalThumb || '';

    if (req.files?.video?.[0]) {
      finalVideoUrl = `/uploads/${req.files.video[0].filename}`;
    }

    if (req.files?.thumbnail?.[0]) {
      finalThumbnailUrl = `/uploads/${req.files.thumbnail[0].filename}`;
    }

    if (!finalVideoUrl) {
      return res.status(400).json({ error: 'Either upload a video file or provide a video URL' });
    }

    const id = `vid_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const parsedTags = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : []);

    const newVideo = {
      id,
      title,
      description: description || '',
      category,
      client,
      year,
      duration,
      videoUrl: finalVideoUrl,
      thumbnailUrl: finalThumbnailUrl || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=1200&auto=format&fit=crop',
      featuredShowreel: featuredShowreel === 'true' || featuredShowreel === true,
      aspectRatio,
      tags: parsedTags,
      createdAt: new Date().toISOString(),
      orderIndex: Date.now()
    };

    db.saveVideo(newVideo);
    res.status(201).json({ message: 'Video published successfully', video: newVideo });
  } catch (err) {
    console.error('Error creating video:', err);
    res.status(500).json({ error: err.message || 'Failed to publish video' });
  }
});

// PUT /api/videos/:id - Update video (Protected)
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const existing = db.getVideoById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Video not found' });

    const updated = {
      ...existing,
      ...req.body,
      id: req.params.id,
      featuredShowreel: req.body.featuredShowreel === 'true' || req.body.featuredShowreel === true
    };

    db.saveVideo(updated);
    res.json({ message: 'Video updated successfully', video: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update video' });
  }
});

// DELETE /api/videos/:id - Delete video (Protected)
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const existing = db.getVideoById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Video not found' });

    // Clean up local files if stored in /uploads
    if (existing.videoUrl?.startsWith('/uploads/')) {
      const filePath = path.join(uploadsDir, path.basename(existing.videoUrl));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    if (existing.thumbnailUrl?.startsWith('/uploads/')) {
      const thumbPath = path.join(uploadsDir, path.basename(existing.thumbnailUrl));
      if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
    }

    db.deleteVideo(req.params.id);
    res.json({ message: 'Video deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

export default router;
