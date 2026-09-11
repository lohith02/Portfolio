import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import photosRouter from './routes/photos.js';
import videosRouter from './routes/videos.js';
import skillsRouter from './routes/skills.js';
import profileRouter from './routes/profile.js';
import inquiriesRouter from './routes/inquiries.js';
import authRouter from './routes/auth.js';
import { seedDatabase } from './db/seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded assets statically
const uploadsDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir, {
  maxAge: '30d',
  immutable: true
}));

// API Routes
app.use('/api/photos', photosRouter);
app.use('/api/videos', videosRouter);
app.use('/api/skills', skillsRouter);
app.use('/api/profile', profileRouter);
app.use('/api/inquiries', inquiriesRouter);
app.use('/api/auth', authRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    version: '2.1.0',
    service: 'Photography & Cinema Portfolio API'
  });
});

// Initialize database
seedDatabase();

// In production, serve the built frontend if available
const possibleDistDirs = [
  path.resolve(__dirname, '../frontend/dist'),
  path.resolve(__dirname, '../dist'),
  path.resolve(__dirname, 'dist')
];
const distDir = possibleDistDirs.find(dir => fs.existsSync(dir));

if (distDir) {
  app.use(express.static(distDir));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`✨ Photography Studio Server running on http://localhost:${PORT}`);
});

export default app;
