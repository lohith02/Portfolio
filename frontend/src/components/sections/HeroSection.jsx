import React, { useState } from 'react';
import { ArrowDown, Aperture, Play, ArrowRight, Sparkles } from 'lucide-react';
import SceneContainer from '../3d/SceneContainer';
import CameraLens3D from '../3d/CameraLens3D';
import { useApp } from '../../context/AppContext';

export default function HeroSection() {
  const { profile, featuredShowreel, setSelectedVideo, setIsBookingOpen } = useApp();
  const [lensHovered, setLensHovered] = useState(false);

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-16 overflow-hidden">
      {/* Subtle Ambient Vignette */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Typography & Profile */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Availability Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{profile?.availability || 'Available for Worldwide Commissions'}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-display font-bold tracking-tight text-white leading-[1.1]">
              Visual Artistry <br />
              <span className="text-shimmer font-serif italic">& Cinematic Motion.</span>
            </h1>

            {/* Subtext */}
            <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto lg:mx-0 font-light leading-relaxed">
              {profile?.tagline || 'Specializing in large-format landscape expeditions, high-contrast studio portraiture, and commercial campaigns.'}
            </p>

            {/* Live Stats */}
            {profile?.stats && profile.stats.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 max-w-md mx-auto lg:mx-0">
                {profile.stats.map((st, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-surface border border-white/5 text-center">
                    <span className="text-lg font-bold text-white font-mono block">{st.value}</span>
                    <span className="text-[10px] text-slate-400 font-mono uppercase">{st.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <a
                href="#gallery"
                className="px-6 py-3 rounded-xl bg-accent text-black font-semibold text-xs tracking-wider uppercase hover:bg-accent-hover transition-all flex items-center gap-2"
              >
                <span>View Works</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>

              {featuredShowreel ? (
                <button
                  onClick={() => setSelectedVideo(featuredShowreel)}
                  className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs tracking-wider uppercase transition-all flex items-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 text-accent fill-current" />
                  <span>Showreel</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsBookingOpen(true)}
                  className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs tracking-wider uppercase transition-all"
                >
                  <span>Book Commission</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Clean 3D Interactive Lens Viewport */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div 
              data-cursor="drag"
              className="relative w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] rounded-3xl bg-surface border border-white/10 overflow-hidden flex items-center justify-center shadow-2xl transition-all duration-300 hover:border-accent/30"
            >
              <SceneContainer
                className="w-full h-full"
                camera={{ position: [0, 0, 4.2], fov: 45 }}
              >
                <CameraLens3D onHoverState={setLensHovered} />
              </SceneContainer>

              {/* Realistic Telemetry Overlay */}
              <div className="absolute top-3.5 left-4 right-4 flex items-center justify-between pointer-events-none text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1 text-accent">
                  <Aperture className="w-3 h-3" />
                  {lensHovered ? 'f/1.4 PRIME' : 'f/2.8 OPTIC'}
                </span>
                <span className="bg-black/40 px-2 py-0.5 rounded border border-white/5 text-[9px]">
                  3D INTERACTIVE
                </span>
              </div>

              <div className="absolute bottom-3.5 left-4 right-4 text-center pointer-events-none text-[9px] font-mono text-slate-400">
                MOVE CURSOR TO ROTATE
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors text-[10px] font-mono tracking-widest uppercase">
        <span>Scroll</span>
        <ArrowDown className="w-3 h-3 text-accent animate-bounce" />
      </div>
    </section>
  );
}
