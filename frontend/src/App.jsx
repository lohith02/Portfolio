import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/ui/Navbar';
import HeroSection from './components/sections/HeroSection';
import GallerySection from './components/sections/GallerySection';
import VideoSection from './components/sections/VideoSection';
import SkillsSection from './components/sections/SkillsSection';
import AboutSection from './components/sections/AboutSection';
import ContactSection from './components/sections/ContactSection';
import LightboxModal from './components/ui/LightboxModal';
import BookingModal from './components/ui/BookingModal';
import VideoModal from './components/ui/VideoModal';
import AdminModal from './components/admin/AdminModal';

function MainLayout() {
  const { setIsAdminOpen } = useApp();

  // Keyboard shortcut: Shift + A for Admin Studio CMS
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        setIsAdminOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsAdminOpen]);

  return (
    <div className="relative min-h-screen bg-background text-slate-100 selection:bg-accent selection:text-black">
      {/* Floating Glass Navbar */}
      <Navbar />

      {/* Main Content Sections */}
      <main className="space-y-4">
        <HeroSection />
        <GallerySection />
        <VideoSection />
        <SkillsSection />
        <AboutSection />
        <ContactSection />
      </main>

      {/* Interactive Modals */}
      <LightboxModal />
      <BookingModal />
      <VideoModal />
      <AdminModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
