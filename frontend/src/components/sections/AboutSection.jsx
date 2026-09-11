import React from 'react';
import { Award, Compass, Globe, Sparkles, CheckCircle2, MapPin, Film } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AboutSection() {
  const { profile } = useApp();

  const awards = [
    { year: '2025', title: 'Sony World Photography Awards', category: 'Landscape Finalist' },
    { year: '2024', title: 'International Photography Awards (IPA)', category: '1st Place Editorial' },
    { year: '2024', title: 'Paris Fine Art Photo Prize (PX3)', category: 'Gold — Architecture' },
    { year: '2023', title: 'Tokyo International Foto Awards', category: 'Silver — Street Series' },
  ];

  const clients = [
    'Vogue Living', 'National Geographic', 'Architectural Digest', 'Monocle', 'Leica Gallery', 'Hasselblad Mag'
  ];

  return (
    <section id="about" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Portrait & Film Aesthetic */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden glass-panel-glow border border-accent/30 p-2">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1200&auto=format&fit=crop"
                alt={profile?.name || 'Visual Artist'}
                className="w-full h-[480px] object-cover rounded-2xl grayscale hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-2 bg-gradient-to-t from-background via-transparent to-transparent rounded-2xl" />
              
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-xs font-mono text-accent uppercase tracking-widest block">
                  {profile?.title || 'Principal Visual Artist'}
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  {profile?.name || 'Lohith'}
                </h3>
                {profile?.location && (
                  <p className="text-xs text-slate-300 font-light mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-accent" />
                    {profile.location}
                  </p>
                )}
              </div>
            </div>

            {/* Experience Floating Badge */}
            <div className="absolute -bottom-4 -right-4 glass-panel p-4 rounded-2xl border-accent/40 shadow-xl hidden sm:block">
              <span className="text-2xl font-bold text-accent font-mono block">
                {profile?.stats?.[0]?.value || '10+ YRS'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">
                {profile?.stats?.[0]?.label || 'Visual Artistry'}
              </span>
            </div>
          </div>

          {/* Right Column: Bio & Philosophy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-mono tracking-widest uppercase">
              <Compass className="w-3.5 h-3.5" />
              <span>Artist Philosophy & Direction</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-snug">
              Every frame is an archival pursuit of atmospheric truth.
            </h2>

            <div className="space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed font-light whitespace-pre-line">
              <p>
                {profile?.bio || 'My work spans medium-format fine art, editorial fashion, brutalist architecture, and remote wilderness landscapes. By combining bespoke 3D spatial presentation with traditional darkroom color sensibility, I strive to create photographs and films that exist as tangible moments rather than ephemeral digital pixels.'}
              </p>
            </div>

            {/* Honors & Exhibitions Table */}
            <div className="pt-4">
              <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-accent" />
                <span>Selected Honors & Exhibitions</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {awards.map((award, i) => (
                  <div key={i} className="glass-panel p-3 rounded-xl border-white/5 flex items-start justify-between">
                    <div>
                      <span className="text-xs font-semibold text-white block">{award.title}</span>
                      <span className="text-[10px] text-accent font-mono">{award.category}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{award.year}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Publications / Clients */}
            <div className="pt-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-2">
                Commissioned & Featured In:
              </span>
              <div className="flex flex-wrap gap-2">
                {clients.map((c, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300 font-mono">
                    {c}
                  </span>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
