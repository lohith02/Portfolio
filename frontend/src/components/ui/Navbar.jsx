import React, { useState, useEffect } from 'react';
import { Camera, Sparkles, Shield, Menu, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Navbar() {
  const {
    profile,
    setIsBookingOpen,
    setIsAdminOpen,
    adminUser
  } = useApp();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Works', href: '#gallery' },
    { name: 'Motion', href: '#motion' },
    { name: 'Skills', href: '#skills' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
      scrolled ? 'py-2.5' : 'py-4'
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className={`flex items-center justify-between px-5 py-2.5 rounded-2xl transition-all duration-300 ${
          scrolled ? 'glass-panel shadow-2xl bg-black/85' : 'glass-panel bg-black/60'
        }`}>
          {/* Brand Logo */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-accent group-hover:border-accent/40 transition-colors">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <span className="font-display font-bold text-sm tracking-wider text-white block leading-tight">
                {profile?.name ? profile.name.toUpperCase() : 'LOHITH'}
              </span>
              <span className="text-[9px] tracking-widest uppercase text-slate-400 font-mono block">
                Visual Studio
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-3.5 py-1.5 rounded-lg text-xs font-mono text-slate-300 hover:text-white hover:bg-white/5 transition-all"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right Action Icons & Commission Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Admin CMS Access Button */}
            <button
              onClick={() => setIsAdminOpen(true)}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono transition-all flex items-center gap-1.5 ${
                adminUser 
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' 
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
              }`}
              title="Studio Admin CMS (Shift + A)"
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{adminUser ? 'CMS' : 'Admin'}</span>
            </button>

            {/* Book Commission Button */}
            <button
              onClick={() => setIsBookingOpen(true)}
              className="px-4 py-1.5 rounded-xl bg-accent text-black font-semibold text-xs tracking-wider uppercase hover:bg-accent-hover transition-all flex items-center gap-1.5 shadow-sm"
            >
              <span>Book Shoot</span>
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-xl bg-white/5 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 p-4 rounded-2xl glass-panel border border-white/10 space-y-1 bg-black/95">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 rounded-xl text-xs font-mono text-slate-300 hover:text-accent hover:bg-white/5 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
