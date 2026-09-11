import React from 'react';
import { Play, Film, Plus, Clock, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function VideoSection() {
  const { videos, setSelectedVideo, featuredShowreel, setIsAdminOpen } = useApp();

  return (
    <section id="motion" className="py-20 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-white/10 gap-3">
          <div>
            <span className="text-accent text-xs font-mono tracking-widest uppercase block mb-1">
              Cinematography
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Motion & Films
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-sm font-light">
            Cinematic reels, commercial motion directing, and visual narratives.
          </p>
        </div>

        {/* Empty Slate State */}
        {videos.length === 0 ? (
          <div className="py-20 text-center rounded-2xl bg-surface border border-white/5 my-4 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-accent">
              <Film className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-white">No Motion Works in Showcase</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Your motion section is ready. Upload video files or embed YouTube/Vimeo links using the Studio CMS.
              </p>
            </div>
            <button
              onClick={() => setIsAdminOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-accent text-black font-semibold text-xs tracking-wider uppercase hover:bg-accent-hover transition-colors inline-flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Upload Video (Shift + A)</span>
            </button>
          </div>
        ) : (
          /* Video Works Grid */
          <div className="space-y-8">
            {/* Featured Showreel if present */}
            {featuredShowreel && (
              <div 
                onClick={() => setSelectedVideo(featuredShowreel)}
                className="group relative rounded-2xl overflow-hidden border border-white/10 bg-surface cursor-pointer shadow-xl transition-all duration-300 hover:border-accent/40"
              >
                <div className="relative aspect-[16/8] sm:aspect-[21/9] w-full overflow-hidden bg-black">
                  <img
                    src={featuredShowreel.thumbnailUrl}
                    alt={featuredShowreel.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-accent text-black flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    </div>
                  </div>

                  <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-accent block">
                        Featured Reel • {featuredShowreel.category}
                      </span>
                      <h3 className="text-lg sm:text-2xl font-display font-bold text-white group-hover:text-accent transition-colors">
                        {featuredShowreel.title}
                      </h3>
                    </div>
                    {featuredShowreel.duration && (
                      <span className="px-2.5 py-1 rounded-md text-xs font-mono bg-black/60 text-slate-300 border border-white/10">
                        {featuredShowreel.duration}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Other Videos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos
                .filter(v => !featuredShowreel || v.id !== featuredShowreel.id)
                .map((video) => (
                  <div
                    key={video.id}
                    onClick={() => setSelectedVideo(video)}
                    className="group relative rounded-xl overflow-hidden border border-white/10 bg-surface hover:border-accent/40 transition-all cursor-pointer flex flex-col"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-black">
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />

                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center group-hover:bg-accent group-hover:text-black transition-colors shadow-md">
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </div>
                      </div>

                      {video.duration && (
                        <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-mono bg-black/80 text-slate-200 border border-white/10">
                          {video.duration}
                        </span>
                      )}
                    </div>

                    <div className="p-4 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-accent">
                        <span>{video.category}</span>
                        <span className="text-slate-400">{video.year}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-white group-hover:text-accent transition-colors line-clamp-1">
                        {video.title}
                      </h4>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
