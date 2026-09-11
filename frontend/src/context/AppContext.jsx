import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [photos, setPhotos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [videos, setVideos] = useState([]);
  const [skills, setSkills] = useState([]);
  const [profile, setProfile] = useState({
    name: "Lohith",
    title: "Visual Artist & Cinematographer",
    tagline: "Capturing the raw intersection of light, landscape, and human emotion through medium format optics and cinematic motion.",
    bio: "Lohith is a visual artist, photographer, and cinematographer specializing in large-format landscape expeditions, studio portraiture, and commercial campaigns. His work bridges cinematic depth with meticulous fine-art composition.",
    location: "Available Worldwide",
    email: "contact@lohithportfolio.com",
    phone: "+1 (555) 234-8901",
    availability: "Available for Worldwide Commissions",
    stats: [
      { label: "Years Experience", value: "10+" },
      { label: "Global Expeditions", value: "45+" },
      { label: "Commercial Campaigns", value: "200+" },
      { label: "Awards & Honors", value: "15+" }
    ],
    socials: {
      instagram: "https://instagram.com",
      youtube: "https://youtube.com",
      twitter: "https://twitter.com",
      behance: "https://behance.net",
      linkedin: "https://linkedin.com"
    }
  });

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null); // For Lightbox
  const [selectedVideo, setSelectedVideo] = useState(null); // For Video Player Modal
  
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminToken, setAdminToken] = useState(localStorage.getItem('portfolio_admin_token') || '');
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load all live portfolio data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [photosRes, catsRes, vidsRes, skillsRes, profRes] = await Promise.allSettled([
        api.getPhotos(),
        api.getCategories(),
        api.getVideos(),
        api.getSkills(),
        api.getProfile()
      ]);

      if (photosRes.status === 'fulfilled' && photosRes.value.photos) setPhotos(photosRes.value.photos);
      if (catsRes.status === 'fulfilled' && catsRes.value.categories) setCategories(catsRes.value.categories);
      if (vidsRes.status === 'fulfilled' && vidsRes.value.videos) setVideos(vidsRes.value.videos);
      if (skillsRes.status === 'fulfilled' && skillsRes.value.skills) setSkills(skillsRes.value.skills);
      if (profRes.status === 'fulfilled' && profRes.value.profile) setProfile(profRes.value.profile);
    } catch (err) {
      console.error('Error loading portfolio data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Check admin session
  useEffect(() => {
    if (adminToken) {
      api.verifyAuth(adminToken)
        .then(res => {
          if (res.admin) setAdminUser(res.admin);
        })
        .catch(() => {
          setAdminToken('');
          setAdminUser(null);
          localStorage.removeItem('portfolio_admin_token');
        });
    }
  }, [adminToken]);

  const handleAdminLogin = (token, user) => {
    setAdminToken(token);
    setAdminUser(user);
    localStorage.setItem('portfolio_admin_token', token);
  };

  const handleAdminLogout = () => {
    setAdminToken('');
    setAdminUser(null);
    localStorage.removeItem('portfolio_admin_token');
  };

  // Filtered photos
  const filteredPhotos = photos.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = !searchQuery || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.location && p.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.camera && p.camera.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Featured Showreel video
  const featuredShowreel = videos.find(v => v.featuredShowreel) || videos[0] || null;

  return (
    <AppContext.Provider value={{
      photos,
      filteredPhotos,
      categories,
      videos,
      featuredShowreel,
      skills,
      profile,
      selectedCategory,
      setSelectedCategory,
      searchQuery,
      setSearchQuery,
      selectedPhoto,
      setSelectedPhoto,
      selectedVideo,
      setSelectedVideo,
      isBookingOpen,
      setIsBookingOpen,
      isAdminOpen,
      setIsAdminOpen,
      adminToken,
      adminUser,
      handleAdminLogin,
      handleAdminLogout,
      loading,
      refreshData: loadData
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
