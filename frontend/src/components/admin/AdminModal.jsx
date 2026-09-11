import React, { useState, useEffect } from 'react';
import { 
  X, Lock, LogOut, Upload, Image, Mail, Trash2, Edit3, 
  Check, RefreshCw, Plus, ShieldCheck, Eye,
  Film, Cpu, User, Key, ArrowRight, Play
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../utils/api';

export default function AdminModal() {
  const { 
    isAdminOpen, 
    setIsAdminOpen, 
    adminToken, 
    adminUser, 
    handleAdminLogin, 
    handleAdminLogout, 
    photos,
    videos,
    skills,
    profile,
    categories,
    refreshData 
  } = useApp();

  // Active Tab: 'photos' | 'videos' | 'skills' | 'profile' | 'inquiries' | 'security'
  const [activeTab, setActiveTab] = useState('photos'); 

  // Auth Login state
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Notifications
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // 1. Photos State
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoDesc, setPhotoDesc] = useState('');
  const [photoCategory, setPhotoCategory] = useState('landscapes');
  const [photoLocation, setPhotoLocation] = useState('');
  const [photoYear, setPhotoYear] = useState(new Date().getFullYear().toString());
  const [photoFeatured, setPhotoFeatured] = useState(false);

  // 2. Videos State
  const [videoFile, setVideoFile] = useState(null);
  const [videoThumbFile, setVideoThumbFile] = useState(null);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [videoThumbUrlInput, setVideoThumbUrlInput] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoCategory, setVideoCategory] = useState('Cinematography');
  const [videoClient, setVideoClient] = useState('');
  const [videoDuration, setVideoDuration] = useState('');
  const [videoDesc, setVideoDesc] = useState('');
  const [videoFeatured, setVideoFeatured] = useState(false);

  // 3. Skills State
  const [skillName, setSkillName] = useState('');
  const [skillCategory, setSkillCategory] = useState('Photography');
  const [skillProficiency, setSkillProficiency] = useState(90);
  const [skillBadge, setSkillBadge] = useState('Mastery');
  const [skillDesc, setSkillDesc] = useState('');
  const [skillTools, setSkillTools] = useState('');

  // 4. Profile State
  const [profName, setProfName] = useState('');
  const [profTitle, setProfTitle] = useState('');
  const [profTagline, setProfTagline] = useState('');
  const [profBio, setProfBio] = useState('');
  const [profLocation, setProfLocation] = useState('');
  const [profEmail, setProfEmail] = useState('');
  const [profPhone, setProfPhone] = useState('');
  const [profAvailability, setProfAvailability] = useState('');
  const [profInstagram, setProfInstagram] = useState('');
  const [profYoutube, setProfYoutube] = useState('');
  const [profTwitter, setProfTwitter] = useState('');

  // 5. Inquiries State
  const [inquiries, setInquiries] = useState([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);

  // 6. Security State
  const [curPass, setCurPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [newAdminUser, setNewAdminUser] = useState('');

  const [submitting, setSubmitting] = useState(false);

  // Populate profile form
  useEffect(() => {
    if (profile) {
      setProfName(profile.name || '');
      setProfTitle(profile.title || '');
      setProfTagline(profile.tagline || '');
      setProfBio(profile.bio || '');
      setProfLocation(profile.location || '');
      setProfEmail(profile.email || '');
      setProfPhone(profile.phone || '');
      setProfAvailability(profile.availability || '');
      setProfInstagram(profile.socials?.instagram || '');
      setProfYoutube(profile.socials?.youtube || '');
      setProfTwitter(profile.socials?.twitter || '');
    }
  }, [profile]);

  // Load inquiries
  const loadInquiries = async () => {
    if (!adminToken) return;
    try {
      setLoadingInquiries(true);
      const res = await api.getInquiries(adminToken);
      if (res.inquiries) setInquiries(res.inquiries);
    } catch (err) {
      console.error('Failed to load inquiries:', err);
    } finally {
      setLoadingInquiries(false);
    }
  };

  useEffect(() => {
    if (adminToken && activeTab === 'inquiries') {
      loadInquiries();
    }
  }, [adminToken, activeTab]);

  const showNotification = (msg, isError = false) => {
    if (isError) {
      setActionError(msg);
      setTimeout(() => setActionError(''), 4000);
    } else {
      setActionSuccess(msg);
      setTimeout(() => setActionSuccess(''), 4000);
    }
  };

  if (!isAdminOpen) return null;

  // Handle Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);
    try {
      const res = await api.login(username, password);
      handleAdminLogin(res.token, res.admin);
      showNotification('Welcome back, ' + res.admin.username);
    } catch (err) {
      setLoginError(err.message || 'Invalid credentials');
    } finally {
      setLoggingIn(false);
    }
  };

  // 1. Upload Photo Submit
  const handlePhotoUpload = async (e) => {
    e.preventDefault();
    if (!photoFile) return showNotification('Please select an image file', true);
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('image', photoFile);
      formData.append('title', photoTitle);
      formData.append('description', photoDesc);
      formData.append('category', photoCategory);
      formData.append('location', photoLocation);
      formData.append('year', photoYear);
      formData.append('featured', photoFeatured ? 'true' : 'false');

      await api.uploadPhoto(formData, adminToken);
      showNotification('Photo uploaded successfully!');
      setPhotoFile(null);
      setPhotoPreview(null);
      setPhotoTitle('');
      setPhotoDesc('');
      setPhotoLocation('');
      refreshData();
    } catch (err) {
      showNotification(err.message, true);
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Add Video Submit
  const handleVideoUpload = async (e) => {
    e.preventDefault();
    if (!videoFile && !videoUrlInput) {
      return showNotification('Please upload a video file or enter a video URL', true);
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      if (videoFile) formData.append('video', videoFile);
      if (videoThumbFile) formData.append('thumbnail', videoThumbFile);
      formData.append('title', videoTitle);
      formData.append('category', videoCategory);
      formData.append('client', videoClient);
      formData.append('duration', videoDuration);
      formData.append('description', videoDesc);
      formData.append('videoUrl', videoUrlInput);
      formData.append('thumbnailUrl', videoThumbUrlInput);
      formData.append('featuredShowreel', videoFeatured ? 'true' : 'false');

      await api.uploadVideo(formData, adminToken);
      showNotification('Video added successfully!');
      setVideoFile(null);
      setVideoThumbFile(null);
      setVideoUrlInput('');
      setVideoTitle('');
      setVideoDesc('');
      setVideoClient('');
      refreshData();
    } catch (err) {
      showNotification(err.message, true);
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Add Skill Submit
  const handleSkillSubmit = async (e) => {
    e.preventDefault();
    if (!skillName) return showNotification('Skill name is required', true);
    setSubmitting(true);
    try {
      await api.createSkill({
        name: skillName,
        category: skillCategory,
        proficiency: skillProficiency,
        badge: skillBadge,
        description: skillDesc,
        tools: skillTools.split(',').map(t => t.trim()).filter(Boolean)
      }, adminToken);
      showNotification('Skill added successfully!');
      setSkillName('');
      setSkillDesc('');
      setSkillTools('');
      refreshData();
    } catch (err) {
      showNotification(err.message, true);
    } finally {
      setSubmitting(false);
    }
  };

  // 4. Update Profile Submit
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.updateProfile({
        name: profName,
        title: profTitle,
        tagline: profTagline,
        bio: profBio,
        location: profLocation,
        email: profEmail,
        phone: profPhone,
        availability: profAvailability,
        socials: {
          instagram: profInstagram,
          youtube: profYoutube,
          twitter: profTwitter,
          behance: profile?.socials?.behance || '',
          linkedin: profile?.socials?.linkedin || ''
        }
      }, adminToken);
      showNotification('Profile updated live!');
      refreshData();
    } catch (err) {
      showNotification(err.message, true);
    } finally {
      setSubmitting(false);
    }
  };

  // 5. Change Password Submit
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.changePassword({
        currentPassword: curPass,
        newPassword: newPass,
        newUsername: newAdminUser
      }, adminToken);
      showNotification('Credentials updated successfully!');
      setCurPass('');
      setNewPass('');
      setNewAdminUser('');
    } catch (err) {
      showNotification(err.message, true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={() => setIsAdminOpen(false)}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-5xl bg-[#121316] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh]">
        
        {/* Top App Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-accent">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-display font-semibold text-white flex items-center gap-2">
                <span>Studio CMS Control</span>
                {adminUser && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Live
                  </span>
                )}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {adminUser && (
              <button
                onClick={handleAdminLogout}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-rose-400 text-xs font-mono flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}

            <button
              onClick={() => setIsAdminOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications */}
        {actionSuccess && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/30 px-6 py-2 text-xs font-mono text-emerald-300 flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>{actionSuccess}</span>
          </div>
        )}
        {actionError && (
          <div className="bg-rose-500/10 border-b border-rose-500/30 px-6 py-2 text-xs font-mono text-rose-300 flex items-center gap-2">
            <X className="w-3.5 h-3.5 text-rose-400" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Main Body */}
        {!adminToken ? (
          /* Login View */
          <div className="p-8 sm:p-12 max-w-sm mx-auto my-auto w-full text-center space-y-6">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-accent">
              <Lock className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Studio Admin Access</h3>
              <p className="text-xs text-slate-400 mt-1">Sign in to manage your photographs, videos, and profile.</p>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-surface border border-white/10 text-xs text-white focus:outline-none focus:border-accent"
                  placeholder="admin"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-surface border border-white/10 text-xs text-white focus:outline-none focus:border-accent"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loggingIn}
                className="w-full py-2.5 rounded-xl bg-accent text-black font-semibold text-xs tracking-wider uppercase hover:bg-accent-hover transition-colors flex items-center justify-center gap-2"
              >
                {loggingIn ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                <span>{loggingIn ? 'Authenticating...' : 'Sign In'}</span>
              </button>
            </form>
          </div>
        ) : (
          /* Dashboard Tabs */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Sidebar Navigation */}
            <div className="w-full md:w-56 border-b md:border-b-0 md:border-r border-white/10 bg-black/30 p-3 overflow-x-auto md:overflow-y-auto flex md:flex-col gap-1 shrink-0">
              {[
                { id: 'photos', label: 'Works & Photos', icon: Image, count: photos.length },
                { id: 'videos', label: 'Videos & Motion', icon: Film, count: videos.length },
                { id: 'skills', label: 'Skills', icon: Cpu, count: skills.length },
                { id: 'profile', label: 'Bio & Profile', icon: User },
                { id: 'inquiries', label: 'Inquiries', icon: Mail, count: inquiries.length },
                { id: 'security', label: 'Security', icon: Key }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all text-left whitespace-nowrap ${
                      isActive
                        ? 'bg-accent text-black font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </div>
                    {tab.count !== undefined && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-black/30 text-black' : 'bg-white/5 text-slate-400'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-[#121316]">
              
              {/* 1. PHOTOS TAB */}
              {activeTab === 'photos' && (
                <div className="space-y-6">
                  {/* Upload Form */}
                  <div className="p-5 rounded-2xl bg-surface border border-white/10 space-y-4">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Upload className="w-4 h-4 text-accent" />
                      <span>Upload Photograph</span>
                    </h3>

                    <form onSubmit={handlePhotoUpload} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                        <div className="border border-dashed border-white/20 rounded-xl p-5 text-center hover:border-accent/40 transition-colors cursor-pointer relative bg-black/30">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const f = e.target.files[0];
                              if (f) {
                                setPhotoFile(f);
                                setPhotoPreview(URL.createObjectURL(f));
                                setPhotoTitle(f.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
                              }
                            }}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          {photoPreview ? (
                            <img src={photoPreview} alt="Preview" className="max-h-36 mx-auto rounded-lg object-contain" />
                          ) : (
                            <div className="space-y-1.5 text-slate-400">
                              <Upload className="w-6 h-6 mx-auto text-accent" />
                              <p className="text-xs font-mono">Select image file</p>
                              <p className="text-[10px] text-slate-500">EXIF data is automatically extracted</p>
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-[11px] font-mono text-slate-400 mb-1">Title</label>
                            <input
                              type="text"
                              value={photoTitle}
                              onChange={(e) => setPhotoTitle(e.target.value)}
                              placeholder="e.g. Coastal Dawn"
                              className="w-full px-3 py-1.5 rounded-xl bg-surface-dark border border-white/10 text-xs text-white focus:outline-none focus:border-accent"
                              required
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] font-mono text-slate-400 mb-1">Category</label>
                              <select
                                value={photoCategory}
                                onChange={(e) => setPhotoCategory(e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-xl bg-surface-dark border border-white/10 text-xs text-white focus:outline-none focus:border-accent"
                              >
                                {categories.filter(c => c.slug !== 'all').map(c => (
                                  <option key={c.id} value={c.slug}>{c.name}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] font-mono text-slate-400 mb-1">Location</label>
                              <input
                                type="text"
                                value={photoLocation}
                                onChange={(e) => setPhotoLocation(e.target.value)}
                                placeholder="e.g. Positano"
                                className="w-full px-3 py-1.5 rounded-xl bg-surface-dark border border-white/10 text-xs text-white focus:outline-none focus:border-accent"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 mb-1">Description (Optional)</label>
                        <textarea
                          rows={2}
                          value={photoDesc}
                          onChange={(e) => setPhotoDesc(e.target.value)}
                          placeholder="Story or shoot details..."
                          className="w-full px-3 py-1.5 rounded-xl bg-surface-dark border border-white/10 text-xs text-white focus:outline-none focus:border-accent resize-none"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={photoFeatured}
                            onChange={(e) => setPhotoFeatured(e.target.checked)}
                            className="rounded border-white/20 text-accent focus:ring-accent"
                          />
                          <span>Pin to Featured</span>
                        </label>

                        <button
                          type="submit"
                          disabled={submitting || !photoFile}
                          className="px-5 py-2 rounded-xl bg-accent text-black font-semibold text-xs tracking-wider uppercase hover:bg-accent-hover transition-colors disabled:opacity-50"
                        >
                          {submitting ? 'Uploading...' : 'Publish Photo'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Photo List */}
                  {photos.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                        Archive Photos ({photos.length})
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {photos.map((p) => (
                          <div key={p.id} className="p-2 rounded-xl bg-surface border border-white/5 space-y-1.5">
                            <div className="aspect-square rounded-lg overflow-hidden relative bg-black">
                              <img src={p.thumbnailUrl || p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex items-center justify-between px-1">
                              <p className="text-xs text-white font-medium line-clamp-1">{p.title}</p>
                              <button
                                onClick={async () => {
                                  if (confirm(`Delete "${p.title}"?`)) {
                                    await api.deletePhoto(p.id, adminToken);
                                    showNotification('Photo deleted');
                                    refreshData();
                                  }
                                }}
                                className="p-1 text-slate-400 hover:text-rose-400"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 2. VIDEOS TAB */}
              {activeTab === 'videos' && (
                <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-surface border border-white/10 space-y-4">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Film className="w-4 h-4 text-accent" />
                      <span>Upload Video or Add URL</span>
                    </h3>

                    <form onSubmit={handleVideoUpload} className="space-y-3.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1">Title</label>
                          <input
                            type="text"
                            value={videoTitle}
                            onChange={(e) => setVideoTitle(e.target.value)}
                            placeholder="e.g. Cinematic Showreel"
                            className="w-full px-3 py-1.5 rounded-xl bg-surface-dark border border-white/10 text-xs text-white focus:outline-none focus:border-accent"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1">Category</label>
                          <input
                            type="text"
                            value={videoCategory}
                            onChange={(e) => setVideoCategory(e.target.value)}
                            placeholder="e.g. Commercial / Drone / Narrative"
                            className="w-full px-3 py-1.5 rounded-xl bg-surface-dark border border-white/10 text-xs text-white focus:outline-none focus:border-accent"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1">Option A: Upload Video File</label>
                          <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => setVideoFile(e.target.files[0])}
                            className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-mono file:bg-white/10 file:text-white hover:file:bg-accent hover:file:text-black cursor-pointer"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1">Option B: Or Video URL (YouTube, Vimeo, MP4)</label>
                          <input
                            type="url"
                            value={videoUrlInput}
                            onChange={(e) => setVideoUrlInput(e.target.value)}
                            placeholder="https://youtube.com/watch?v=... or direct link"
                            className="w-full px-3 py-1.5 rounded-xl bg-surface-dark border border-white/10 text-xs text-white focus:outline-none focus:border-accent"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1">Custom Thumbnail Image URL (Optional)</label>
                          <input
                            type="url"
                            value={videoThumbUrlInput}
                            onChange={(e) => setVideoThumbUrlInput(e.target.value)}
                            placeholder="https://..."
                            className="w-full px-3 py-1.5 rounded-xl bg-surface-dark border border-white/10 text-xs text-white focus:outline-none focus:border-accent"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1">Duration</label>
                          <input
                            type="text"
                            value={videoDuration}
                            onChange={(e) => setVideoDuration(e.target.value)}
                            placeholder="e.g. 1:45"
                            className="w-full px-3 py-1.5 rounded-xl bg-surface-dark border border-white/10 text-xs text-white focus:outline-none focus:border-accent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 mb-1">Description (Optional)</label>
                        <textarea
                          rows={2}
                          value={videoDesc}
                          onChange={(e) => setVideoDesc(e.target.value)}
                          placeholder="Director notes..."
                          className="w-full px-3 py-1.5 rounded-xl bg-surface-dark border border-white/10 text-xs text-white focus:outline-none focus:border-accent resize-none"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={videoFeatured}
                            onChange={(e) => setVideoFeatured(e.target.checked)}
                            className="rounded border-white/20 text-accent focus:ring-accent"
                          />
                          <span>Set as Master Featured Showreel</span>
                        </label>

                        <button
                          type="submit"
                          disabled={submitting}
                          className="px-5 py-2 rounded-xl bg-accent text-black font-semibold text-xs tracking-wider uppercase hover:bg-accent-hover transition-colors"
                        >
                          {submitting ? 'Publishing...' : 'Publish Video'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Video List */}
                  {videos.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                        Videos ({videos.length})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {videos.map((v) => (
                          <div key={v.id} className="p-3 rounded-xl bg-surface border border-white/5 flex items-center justify-between">
                            <div className="space-y-0.5">
                              <h5 className="text-xs font-semibold text-white">{v.title}</h5>
                              <p className="text-[10px] text-slate-400 font-mono">{v.category} {v.featuredShowreel && '• Featured Reel'}</p>
                            </div>
                            <button
                              onClick={async () => {
                                if (confirm(`Delete video "${v.title}"?`)) {
                                  await api.deleteVideo(v.id, adminToken);
                                  showNotification('Video deleted');
                                  refreshData();
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 3. SKILLS TAB */}
              {activeTab === 'skills' && (
                <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-surface border border-white/10 space-y-4">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-accent" />
                      <span>Add Capability</span>
                    </h3>

                    <form onSubmit={handleSkillSubmit} className="space-y-3.5">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1">Skill Name</label>
                          <input
                            type="text"
                            value={skillName}
                            onChange={(e) => setSkillName(e.target.value)}
                            placeholder="e.g. Anamorphic Lens Directing"
                            className="w-full px-3 py-1.5 rounded-xl bg-surface-dark border border-white/10 text-xs text-white focus:outline-none focus:border-accent"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1">Category</label>
                          <select
                            value={skillCategory}
                            onChange={(e) => setSkillCategory(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-xl bg-surface-dark border border-white/10 text-xs text-white focus:outline-none focus:border-accent"
                          >
                            <option value="Photography">Photography</option>
                            <option value="Cinematography">Cinematography</option>
                            <option value="Post-Production">Post-Production</option>
                            <option value="Lighting">Lighting</option>
                            <option value="Direction">Direction</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1">Proficiency % ({skillProficiency}%)</label>
                          <input
                            type="range"
                            min="50"
                            max="100"
                            value={skillProficiency}
                            onChange={(e) => setSkillProficiency(Number(e.target.value))}
                            className="w-full accent-accent"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1">Badge</label>
                          <input
                            type="text"
                            value={skillBadge}
                            onChange={(e) => setSkillBadge(e.target.value)}
                            placeholder="e.g. Mastery / Specialist"
                            className="w-full px-3 py-1.5 rounded-xl bg-surface-dark border border-white/10 text-xs text-white focus:outline-none focus:border-accent"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1">Tools / Software (Comma-separated)</label>
                          <input
                            type="text"
                            value={skillTools}
                            onChange={(e) => setSkillTools(e.target.value)}
                            placeholder="DaVinci Resolve, Lightroom, Cinema Glass"
                            className="w-full px-3 py-1.5 rounded-xl bg-surface-dark border border-white/10 text-xs text-white focus:outline-none focus:border-accent"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="px-5 py-2 rounded-xl bg-accent text-black font-semibold text-xs tracking-wider uppercase hover:bg-accent-hover transition-colors"
                        >
                          {submitting ? 'Adding...' : 'Add Skill'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Skills List */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                      Skills List ({skills.length})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {skills.map((s) => (
                        <div key={s.id} className="p-3 rounded-xl bg-surface border border-white/5 flex items-center justify-between">
                          <div className="space-y-0.5">
                            <h5 className="text-xs font-semibold text-white">{s.name}</h5>
                            <p className="text-[10px] text-slate-400 font-mono">{s.category} • {s.proficiency}%</p>
                          </div>
                          <button
                            onClick={async () => {
                              if (confirm(`Delete skill "${s.name}"?`)) {
                                await api.deleteSkill(s.id, adminToken);
                                showNotification('Skill deleted');
                                refreshData();
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 4. BIO & PROFILE TAB */}
              {activeTab === 'profile' && (
                <div className="p-5 rounded-2xl bg-surface border border-white/10 space-y-4">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-accent" />
                    <span>Bio & Artist Profile</span>
                  </h3>

                  <form onSubmit={handleProfileSubmit} className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 mb-1">Name</label>
                        <input
                          type="text"
                          value={profName}
                          onChange={(e) => setProfName(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl bg-surface-dark border border-white/10 text-xs text-white focus:outline-none focus:border-accent"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 mb-1">Professional Title</label>
                        <input
                          type="text"
                          value={profTitle}
                          onChange={(e) => setProfTitle(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl bg-surface-dark border border-white/10 text-xs text-white focus:outline-none focus:border-accent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Hero Subtitle / Tagline</label>
                      <input
                        type="text"
                        value={profTagline}
                        onChange={(e) => setProfTagline(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-surface-dark border border-white/10 text-xs text-white focus:outline-none focus:border-accent"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Bio / About Paragraph</label>
                      <textarea
                        rows={3}
                        value={profBio}
                        onChange={(e) => setProfBio(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-surface-dark border border-white/10 text-xs text-white focus:outline-none focus:border-accent leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 mb-1">Location</label>
                        <input
                          type="text"
                          value={profLocation}
                          onChange={(e) => setProfLocation(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl bg-surface-dark border border-white/10 text-xs text-white focus:outline-none focus:border-accent"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 mb-1">Email</label>
                        <input
                          type="email"
                          value={profEmail}
                          onChange={(e) => setProfEmail(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl bg-surface-dark border border-white/10 text-xs text-white focus:outline-none focus:border-accent"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 mb-1">Phone</label>
                        <input
                          type="text"
                          value={profPhone}
                          onChange={(e) => setProfPhone(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl bg-surface-dark border border-white/10 text-xs text-white focus:outline-none focus:border-accent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Availability Status</label>
                      <input
                        type="text"
                        value={profAvailability}
                        onChange={(e) => setProfAvailability(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-surface-dark border border-white/10 text-xs text-white focus:outline-none focus:border-accent font-mono"
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-5 py-2 rounded-xl bg-accent text-black font-semibold text-xs tracking-wider uppercase hover:bg-accent-hover transition-colors"
                      >
                        {submitting ? 'Saving...' : 'Save Profile'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* 5. INQUIRIES TAB */}
              {activeTab === 'inquiries' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Mail className="w-4 h-4 text-accent" />
                      <span>Client Inquiries ({inquiries.length})</span>
                    </h3>
                    <button
                      onClick={loadInquiries}
                      className="text-xs font-mono text-accent hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingInquiries ? 'animate-spin' : ''}`} />
                      <span>Refresh</span>
                    </button>
                  </div>

                  {inquiries.length === 0 ? (
                    <div className="p-10 text-center rounded-2xl bg-surface border border-white/5 text-slate-400 text-xs font-mono">
                      No client inquiries yet. Submissions from the contact form will appear here.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {inquiries.map((inq) => (
                        <div key={inq.id} className="p-4 rounded-xl bg-surface border border-white/5 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-xs font-bold text-white">{inq.clientName} ({inq.email})</h4>
                              <p className="text-[10px] text-slate-400 font-mono">
                                Date: {new Date(inq.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <button
                              onClick={async () => {
                                if (confirm('Delete inquiry?')) {
                                  await api.deleteInquiry(inq.id, adminToken);
                                  showNotification('Inquiry deleted');
                                  loadInquiries();
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {inq.message && (
                            <p className="p-2.5 rounded-lg bg-black/40 text-xs text-slate-300">
                              "{inq.message}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 6. SECURITY TAB */}
              {activeTab === 'security' && (
                <div className="max-w-sm p-5 rounded-2xl bg-surface border border-white/10 space-y-4">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Key className="w-4 h-4 text-accent" />
                    <span>Change Password</span>
                  </h3>

                  <form onSubmit={handleChangePassword} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">New Username (Optional)</label>
                      <input
                        type="text"
                        value={newAdminUser}
                        onChange={(e) => setNewAdminUser(e.target.value)}
                        placeholder="admin"
                        className="w-full px-3 py-1.5 rounded-xl bg-surface-dark border border-white/10 text-xs text-white focus:outline-none focus:border-accent"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Current Password</label>
                      <input
                        type="password"
                        value={curPass}
                        onChange={(e) => setCurPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-1.5 rounded-xl bg-surface-dark border border-white/10 text-xs text-white focus:outline-none focus:border-accent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">New Password</label>
                      <input
                        type="password"
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full px-3 py-1.5 rounded-xl bg-surface-dark border border-white/10 text-xs text-white focus:outline-none focus:border-accent"
                        required
                      />
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-5 py-2 rounded-xl bg-accent text-black font-semibold text-xs tracking-wider uppercase hover:bg-accent-hover transition-colors"
                      >
                        {submitting ? 'Saving...' : 'Update Password'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
