import bcrypt from 'bcryptjs';
import db from './database.js';

export function seedDatabase() {
  db.data = db.load();

  // 1. Seed Categories if empty
  if (!db.data.categories || db.data.categories.length === 0) {
    db.data.categories = [
      { id: 'cat_all', name: 'All Archives', slug: 'all', description: 'Complete photography archive.' },
      { id: 'cat_portraits', name: 'Portraits', slug: 'portraits', description: 'Studio and environmental portraiture.' },
      { id: 'cat_landscapes', name: 'Landscapes', slug: 'landscapes', description: 'Earth, alpine, and coastal landscapes.' },
      { id: 'cat_street', name: 'Street & Urban', slug: 'street', description: 'Documentary and urban street captures.' },
      { id: 'cat_editorial', name: 'Editorial & Commercial', slug: 'editorial', description: 'Commissioned editorial campaigns.' }
    ];
  }

  // Ensure photos & videos arrays exist (starts blank for user uploads)
  if (!db.data.photos) db.data.photos = [];
  if (!db.data.videos) db.data.videos = [];

  // 2. Seed Skills if empty
  if (!db.data.skills || db.data.skills.length === 0) {
    db.data.skills = [
      {
        id: 'sk_1',
        name: 'Medium Format & Stills Photography',
        category: 'Photography',
        proficiency: 98,
        badge: 'Mastery',
        description: 'Large-format landscape expeditions, studio portraiture, and high-resolution commercial capture.',
        tools: ['Sony Alpha', 'Capture One', 'Lightroom'],
        orderIndex: 0
      },
      {
        id: 'sk_2',
        name: 'Cinematography & Motion Direction',
        category: 'Cinematography',
        proficiency: 95,
        badge: 'Director',
        description: 'Dynamic scene lighting, cinematic gimbal control, and visual storytelling.',
        tools: ['Cinema Rigs', 'Anamorphic', 'Gimbals'],
        orderIndex: 1
      },
      {
        id: 'sk_3',
        name: 'Color Grading & Post-Production',
        category: 'Post-Production',
        proficiency: 94,
        badge: 'Colorist',
        description: 'ACES workflows, film emulation, HDR finishing, and fine-art color science.',
        tools: ['DaVinci Resolve', 'Photoshop', 'Premiere Pro'],
        orderIndex: 2
      },
      {
        id: 'sk_4',
        name: 'Studio & Location Lighting',
        category: 'Lighting',
        proficiency: 92,
        badge: 'Specialist',
        description: 'Precise multi-source flash ratios, softboxes, parabolic reflectors, and natural light sculpting.',
        tools: ['Strobes', 'Diffusers', 'Reflectors'],
        orderIndex: 3
      }
    ];
  }

  // 3. Ensure Admin user exists
  if (!db.data.admins || db.data.admins.length === 0) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('password123', salt);
    db.data.admins = [
      {
        id: 'admin_1',
        username: 'admin',
        passwordHash: hash,
        email: 'contact@lohithportfolio.com'
      }
    ];
  }

  db.save();
  console.log(`✨ Portfolio initialized: ready for photo and video uploads.`);
}
