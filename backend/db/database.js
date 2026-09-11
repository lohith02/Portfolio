import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const uploadsDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const dbFilePath = path.join(dataDir, 'portfolio.json');

// Default initial state schema
const defaultState = {
  profile: {
    name: "Lohith",
    title: "Visual Artist, Cinematographer & Creative Director",
    tagline: "Capturing the raw intersection of light, landscape, and human emotion through medium format optics and cinematic motion.",
    bio: "Based between New York and worldwide on assignment, Lohith is a visual artist, photographer, and director specializing in large-format landscape expeditions, high-contrast studio portraiture, and luxury editorial campaigns. With over a decade behind the lens and in post-production, his work bridges cinematic depth with meticulous fine-art composition.",
    location: "New York, NY / Available Worldwide",
    email: "contact@lohithportfolio.com",
    phone: "+1 (555) 234-8901",
    availability: "Available for Worldwide Commissions - Q3/Q4 2026",
    stats: [
      { label: "Years Experience", value: "10+" },
      { label: "Global Expeditions", value: "48" },
      { label: "Commercial Campaigns", value: "250+" },
      { label: "Fine Art Awards", value: "18" }
    ],
    socials: {
      instagram: "https://instagram.com",
      youtube: "https://youtube.com",
      twitter: "https://twitter.com",
      behance: "https://behance.net",
      linkedin: "https://linkedin.com"
    }
  },
  categories: [],
  photos: [],
  videos: [],
  skills: [],
  journal: [],
  gear: [],
  inquiries: [],
  admins: []
};

// In-memory data store with atomic file synchronization
class DatabaseStore {
  constructor(filePath) {
    this.filePath = filePath;
    this.data = this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          ...defaultState,
          ...parsed,
          profile: { ...defaultState.profile, ...(parsed.profile || {}) }
        };
      }
    } catch (e) {
      console.warn('Could not read existing database file, initializing fresh:', e.message);
    }
    this.save(defaultState);
    return defaultState;
  }

  save(data = this.data) {
    try {
      const tempPath = `${this.filePath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempPath, this.filePath);
    } catch (e) {
      console.error('Database write error:', e);
    }
  }

  // Profile operations
  getProfile() {
    this.data = this.load();
    return this.data.profile || defaultState.profile;
  }

  updateProfile(newProfile) {
    this.data = this.load();
    this.data.profile = {
      ...this.data.profile,
      ...newProfile
    };
    this.save();
    return this.data.profile;
  }

  // Videos operations
  getVideos() {
    this.data = this.load();
    return (this.data.videos || []).sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  }

  getVideoById(id) {
    this.data = this.load();
    return (this.data.videos || []).find(v => v.id === id) || null;
  }

  saveVideo(video) {
    this.data = this.load();
    if (!this.data.videos) this.data.videos = [];
    
    // If set as featured showreel, unfeature others
    if (video.featuredShowreel) {
      this.data.videos.forEach(v => v.featuredShowreel = false);
    }

    const idx = this.data.videos.findIndex(v => v.id === video.id);
    if (idx >= 0) {
      this.data.videos[idx] = { ...this.data.videos[idx], ...video };
    } else {
      this.data.videos.push(video);
    }
    this.save();
    return video;
  }

  deleteVideo(id) {
    this.data = this.load();
    const prev = (this.data.videos || []).length;
    this.data.videos = (this.data.videos || []).filter(v => v.id !== id);
    this.save();
    return prev - this.data.videos.length > 0;
  }

  // Skills operations
  getSkills() {
    this.data = this.load();
    return (this.data.skills || []).sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  }

  getSkillById(id) {
    this.data = this.load();
    return (this.data.skills || []).find(s => s.id === id) || null;
  }

  saveSkill(skill) {
    this.data = this.load();
    if (!this.data.skills) this.data.skills = [];
    const idx = this.data.skills.findIndex(s => s.id === skill.id);
    if (idx >= 0) {
      this.data.skills[idx] = { ...this.data.skills[idx], ...skill };
    } else {
      this.data.skills.push(skill);
    }
    this.save();
    return skill;
  }

  deleteSkill(id) {
    this.data = this.load();
    const prev = (this.data.skills || []).length;
    this.data.skills = (this.data.skills || []).filter(s => s.id !== id);
    this.save();
    return prev - this.data.skills.length > 0;
  }

  // Weekly Journal / BTS updates operations
  getJournal() {
    this.data = this.load();
    return (this.data.journal || []).sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
  }

  getJournalById(id) {
    this.data = this.load();
    return (this.data.journal || []).find(j => j.id === id) || null;
  }

  saveJournal(entry) {
    this.data = this.load();
    if (!this.data.journal) this.data.journal = [];
    const idx = this.data.journal.findIndex(j => j.id === entry.id);
    if (idx >= 0) {
      this.data.journal[idx] = { ...this.data.journal[idx], ...entry };
    } else {
      this.data.journal.unshift(entry);
    }
    this.save();
    return entry;
  }

  deleteJournal(id) {
    this.data = this.load();
    const prev = (this.data.journal || []).length;
    this.data.journal = (this.data.journal || []).filter(j => j.id !== id);
    this.save();
    return prev - this.data.journal.length > 0;
  }

  // Gear operations
  getGear() {
    this.data = this.load();
    return this.data.gear || [];
  }

  getGearById(id) {
    this.data = this.load();
    return (this.data.gear || []).find(g => g.id === id) || null;
  }

  saveGear(item) {
    this.data = this.load();
    if (!this.data.gear) this.data.gear = [];
    const idx = this.data.gear.findIndex(g => g.id === item.id);
    if (idx >= 0) {
      this.data.gear[idx] = { ...this.data.gear[idx], ...item };
    } else {
      this.data.gear.push(item);
    }
    this.save();
    return item;
  }

  deleteGear(id) {
    this.data = this.load();
    const prev = (this.data.gear || []).length;
    this.data.gear = (this.data.gear || []).filter(g => g.id !== id);
    this.save();
    return prev - this.data.gear.length > 0;
  }

  // Emulate SQL prepare statement interface for existing routes
  prepare(sql) {
    const s = sql.trim();
    const self = this;

    return {
      all(...params) {
        self.data = self.load();

        // Photos queries
        if (s.startsWith('SELECT * FROM photos')) {
          let list = [...self.data.photos];
          
          if (s.includes('category = ?')) {
            const cat = params[0];
            list = list.filter(p => p.category.toLowerCase() === cat.toLowerCase());
          }
          if (s.includes('featured = 1')) {
            list = list.filter(p => p.featured === 1 || p.featured === true);
          }
          if (s.includes('title LIKE ?')) {
            const term = (params[params.length - 1] || '').replace(/%/g, '').toLowerCase();
            list = list.filter(p => 
              p.title.toLowerCase().includes(term) ||
              (p.description && p.description.toLowerCase().includes(term)) ||
              (p.location && p.location.toLowerCase().includes(term)) ||
              (p.camera && p.camera.toLowerCase().includes(term))
            );
          }

          list.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
          return list;
        }

        // Categories queries
        if (s.startsWith('SELECT * FROM categories')) {
          return self.data.categories || [];
        }

        // Gear queries
        if (s.startsWith('SELECT * FROM gear')) {
          return self.data.gear || [];
        }

        // Inquiries queries
        if (s.startsWith('SELECT * FROM inquiries')) {
          const list = [...self.data.inquiries];
          list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          return list;
        }

        return [];
      },

      get(...params) {
        self.data = self.load();

        if (s.includes('COUNT(*) as count FROM photos')) {
          return { count: self.data.photos.length };
        }

        if (s.includes('MAX(orderIndex) as maxIdx FROM photos')) {
          const max = self.data.photos.reduce((m, p) => Math.max(m, p.orderIndex || 0), -1);
          return { maxIdx: max >= 0 ? max : 0 };
        }

        if (s.startsWith('SELECT * FROM photos WHERE id = ?')) {
          return self.data.photos.find(p => p.id === params[0]) || null;
        }

        if (s.startsWith('SELECT * FROM admins WHERE username = ?')) {
          return self.data.admins.find(a => a.username === params[0]) || null;
        }

        if (s.startsWith('SELECT id, username, email FROM admins WHERE id = ?')) {
          const adm = self.data.admins.find(a => a.id === params[0]);
          return adm ? { id: adm.id, username: adm.username, email: adm.email } : null;
        }

        if (s.startsWith('SELECT * FROM inquiries WHERE id = ?')) {
          return self.data.inquiries.find(i => i.id === params[0]) || null;
        }

        return null;
      },

      run(...params) {
        self.data = self.load();
        let changes = 0;

        // Categories
        if (s.includes('INSERT OR REPLACE INTO categories') || s.includes('INSERT INTO categories')) {
          const [id, name, slug, description, coverImage] = params;
          const idx = self.data.categories.findIndex(c => c.id === id || c.slug === slug);
          const item = { id, name, slug, description, coverImage };
          if (idx >= 0) self.data.categories[idx] = item;
          else self.data.categories.push(item);
          changes = 1;
        }

        // Photos
        else if (s.includes('INSERT OR REPLACE INTO photos') || s.includes('INSERT INTO photos')) {
          const [
            id, title, description, category, imageUrl, thumbnailUrl,
            camera, lens, focalLength, aperture, shutterSpeed, iso,
            location, year, featured, orderIndex, aspectRatio, createdAt
          ] = params;
          const idx = self.data.photos.findIndex(p => p.id === id);
          const item = {
            id, title, description, category, imageUrl, thumbnailUrl,
            camera, lens, focalLength, aperture, shutterSpeed, iso,
            location, year, featured: Number(featured), orderIndex: Number(orderIndex),
            aspectRatio, createdAt
          };
          if (idx >= 0) self.data.photos[idx] = item;
          else self.data.photos.push(item);
          changes = 1;
        }

        // UPDATE photos
        else if (s.startsWith('UPDATE photos SET')) {
          const id = params[params.length - 1];
          const idx = self.data.photos.findIndex(p => p.id === id);
          if (idx >= 0) {
            const p = self.data.photos[idx];
            const [
              title, description, category, location, year, featured,
              camera, lens, focalLength, aperture, shutterSpeed, iso, orderIndex, aspectRatio
            ] = params;

            self.data.photos[idx] = {
              ...p,
              title: title !== null && title !== undefined ? title : p.title,
              description: description !== null && description !== undefined ? description : p.description,
              category: category !== null && category !== undefined ? category : p.category,
              location: location !== null && location !== undefined ? location : p.location,
              year: year !== null && year !== undefined ? year : p.year,
              featured: featured !== null && featured !== undefined ? Number(featured) : p.featured,
              camera: camera !== null && camera !== undefined ? camera : p.camera,
              lens: lens !== null && lens !== undefined ? lens : p.lens,
              focalLength: focalLength !== null && focalLength !== undefined ? focalLength : p.focalLength,
              aperture: aperture !== null && aperture !== undefined ? aperture : p.aperture,
              shutterSpeed: shutterSpeed !== null && shutterSpeed !== undefined ? shutterSpeed : p.shutterSpeed,
              iso: iso !== null && iso !== undefined ? iso : p.iso,
              orderIndex: orderIndex !== null && orderIndex !== undefined ? Number(orderIndex) : p.orderIndex,
              aspectRatio: aspectRatio !== null && aspectRatio !== undefined ? aspectRatio : p.aspectRatio
            };
            changes = 1;
          }
        }

        // DELETE photos
        else if (s.startsWith('DELETE FROM photos WHERE id = ?')) {
          const prevLen = self.data.photos.length;
          self.data.photos = self.data.photos.filter(p => p.id !== params[0]);
          changes = prevLen - self.data.photos.length;
        }

        // Inquiries
        else if (s.includes('INSERT INTO inquiries')) {
          const [id, clientName, email, phone, sessionType, eventDate, budget, location, message, createdAt] = params;
          self.data.inquiries.push({
            id, clientName, email, phone, sessionType, eventDate, budget, location, message, status: 'new', createdAt
          });
          changes = 1;
        }

        else if (s.startsWith('UPDATE inquiries SET status = ? WHERE id = ?')) {
          const [status, id] = params;
          const inq = self.data.inquiries.find(i => i.id === id);
          if (inq) {
            inq.status = status;
            changes = 1;
          }
        }

        else if (s.startsWith('DELETE FROM inquiries WHERE id = ?')) {
          const prevLen = self.data.inquiries.length;
          self.data.inquiries = self.data.inquiries.filter(i => i.id !== params[0]);
          changes = prevLen - self.data.inquiries.length;
        }

        // Admins
        else if (s.includes('INSERT INTO admins') || s.includes('INSERT OR REPLACE INTO admins')) {
          const [passwordHash] = params;
          const existing = self.data.admins.find(a => a.username === 'admin');
          if (existing) {
            existing.passwordHash = passwordHash;
          } else {
            self.data.admins.push({
              id: 'admin_1',
              username: 'admin',
              passwordHash,
              email: 'contact@lohithportfolio.com'
            });
          }
          changes = 1;
        }

        // Gear
        else if (s.includes('INSERT OR REPLACE INTO gear')) {
          const [id, name, type, specs, description] = params;
          const idx = self.data.gear.findIndex(g => g.id === id);
          const item = { id, name, type, specs, description, status: 'Primary Kit' };
          if (idx >= 0) self.data.gear[idx] = item;
          else self.data.gear.push(item);
          changes = 1;
        }

        self.save();
        return { changes };
      }
    };
  }
}

const db = new DatabaseStore(dbFilePath);
export default db;
