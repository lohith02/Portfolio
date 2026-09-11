const RAW_URL = import.meta.env.VITE_API_URL || '';
const API_BASE = RAW_URL ? `${RAW_URL.replace(/\/$/, '')}/api` : '/api';

export const api = {
  // Photos & Works
  async getPhotos(params = {}) {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.featured) query.append('featured', 'true');
    if (params.search) query.append('search', params.search);

    const res = await fetch(`${API_BASE}/photos?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch photos');
    return res.json();
  },

  async getPhotoById(id) {
    const res = await fetch(`${API_BASE}/photos/${id}`);
    if (!res.ok) throw new Error('Failed to fetch photo');
    return res.json();
  },

  async getCategories() {
    const res = await fetch(`${API_BASE}/photos/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  async createCategory(data, token) {
    const res = await fetch(`${API_BASE}/photos/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create category');
    return res.json();
  },

  async deleteCategory(id, token) {
    const res = await fetch(`${API_BASE}/photos/categories/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to delete category');
    return res.json();
  },

  async uploadPhoto(formData, token) {
    const res = await fetch(`${API_BASE}/photos`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to upload photo');
    }
    return res.json();
  },

  async updatePhoto(id, data, token) {
    const res = await fetch(`${API_BASE}/photos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update photo');
    return res.json();
  },

  async deletePhoto(id, token) {
    const res = await fetch(`${API_BASE}/photos/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error('Failed to delete photo');
    return res.json();
  },

  // Videos & Motion
  async getVideos() {
    const res = await fetch(`${API_BASE}/videos`);
    if (!res.ok) throw new Error('Failed to fetch videos');
    return res.json();
  },

  async uploadVideo(formData, token) {
    const res = await fetch(`${API_BASE}/videos`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to publish video');
    }
    return res.json();
  },

  async updateVideo(id, data, token) {
    const res = await fetch(`${API_BASE}/videos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update video');
    return res.json();
  },

  async deleteVideo(id, token) {
    const res = await fetch(`${API_BASE}/videos/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to delete video');
    return res.json();
  },

  // Skills & Capabilities
  async getSkills() {
    const res = await fetch(`${API_BASE}/skills`);
    if (!res.ok) throw new Error('Failed to fetch skills');
    return res.json();
  },

  async createSkill(data, token) {
    const res = await fetch(`${API_BASE}/skills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create skill');
    return res.json();
  },

  async updateSkill(id, data, token) {
    const res = await fetch(`${API_BASE}/skills/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update skill');
    return res.json();
  },

  async deleteSkill(id, token) {
    const res = await fetch(`${API_BASE}/skills/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to delete skill');
    return res.json();
  },

  // Weekly Journal & BTS Logs
  async getJournal() {
    const res = await fetch(`${API_BASE}/journal`);
    if (!res.ok) throw new Error('Failed to fetch journal entries');
    return res.json();
  },

  async createJournal(formData, token) {
    const isMultipart = formData instanceof FormData;
    const res = await fetch(`${API_BASE}/journal`, {
      method: 'POST',
      headers: isMultipart
        ? { Authorization: `Bearer ${token}` }
        : { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: isMultipart ? formData : JSON.stringify(formData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to publish journal post');
    }
    return res.json();
  },

  async updateJournal(id, formData, token) {
    const isMultipart = formData instanceof FormData;
    const res = await fetch(`${API_BASE}/journal/${id}`, {
      method: 'PUT',
      headers: isMultipart
        ? { Authorization: `Bearer ${token}` }
        : { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: isMultipart ? formData : JSON.stringify(formData)
    });
    if (!res.ok) throw new Error('Failed to update journal post');
    return res.json();
  },

  async deleteJournal(id, token) {
    const res = await fetch(`${API_BASE}/journal/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to delete journal post');
    return res.json();
  },

  // Gear Vault
  async getGear() {
    const res = await fetch(`${API_BASE}/gear`);
    if (!res.ok) throw new Error('Failed to fetch gear');
    return res.json();
  },

  async createGear(data, token) {
    const res = await fetch(`${API_BASE}/gear`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to add gear');
    return res.json();
  },

  async updateGear(id, data, token) {
    const res = await fetch(`${API_BASE}/gear/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update gear');
    return res.json();
  },

  async deleteGear(id, token) {
    const res = await fetch(`${API_BASE}/gear/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to delete gear');
    return res.json();
  },

  // Profile & Site Bio
  async getProfile() {
    const res = await fetch(`${API_BASE}/profile`);
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  },

  async updateProfile(data, token) {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },

  // Inquiries
  async submitInquiry(inquiryData) {
    const res = await fetch(`${API_BASE}/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inquiryData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit inquiry');
    }
    return res.json();
  },

  async getInquiries(token) {
    const res = await fetch(`${API_BASE}/inquiries`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch inquiries');
    return res.json();
  },

  async updateInquiryStatus(id, status, token) {
    const res = await fetch(`${API_BASE}/inquiries/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update inquiry status');
    return res.json();
  },

  async deleteInquiry(id, token) {
    const res = await fetch(`${API_BASE}/inquiries/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to delete inquiry');
    return res.json();
  },

  // Auth
  async login(username, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  async verifyAuth(token) {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Token invalid');
    return res.json();
  },

  async changePassword(data, token) {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update credentials');
    }
    return res.json();
  }
};
