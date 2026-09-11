import React, { useEffect } from 'react';
import { X, Play, Clock, Film, ExternalLink, Calendar, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function VideoModal() {
  const { selectedVideo, setSelectedVideo } = useApp();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedVideo(null);
    };
    if (selectedVideo) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedVideo, setSelectedVideo]);

  if (!selectedVideo) return null;

  // Helper to detect YouTube / Vimeo embeds
  const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch?v=') || url.includes('youtu.be/')) {
      const id = url.includes('youtu.be/') ? url.split('youtu.be/')[1].split('?')[0] : url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
    }
    if (url.includes('vimeo.com/')) {
      const id = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${id}?autoplay=1`;
    }
    return null;
  };

  const embedUrl = getEmbedUrl(selectedVideo.videoUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
      {/* Dark backdrop blur */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-xl transition-opacity animate-in fade-in"
        onClick={() => setSelectedVideo(null)}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-5xl bg-surface-dark border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[92vh]">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-accent/10 text-accent border border-accent/20">
              <Film className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-display font-medium text-white line-clamp-1">
                {selectedVideo.title}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {selectedVideo.category} • {selectedVideo.year || '2026'} {selectedVideo.duration && `• ${selectedVideo.duration}`}
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedVideo(null)}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Close (Esc)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Video Player Box */}
        <div className="relative w-full bg-black aspect-video flex items-center justify-center overflow-hidden">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={selectedVideo.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              src={selectedVideo.videoUrl}
              poster={selectedVideo.thumbnailUrl}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>

        {/* Video Metadata & Description */}
        <div className="p-6 overflow-y-auto bg-surface-dark/80 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-mono tracking-widest text-accent uppercase">
                {selectedVideo.category}
              </span>
              <h2 className="text-xl font-display font-bold text-white">
                {selectedVideo.title}
              </h2>
            </div>

            {selectedVideo.client && (
              <div className="text-right">
                <span className="text-xs text-slate-400 font-mono block">Client / Production</span>
                <span className="text-sm font-medium text-slate-200">{selectedVideo.client}</span>
              </div>
            )}
          </div>

          {selectedVideo.description && (
            <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
              {selectedVideo.description}
            </p>
          )}

          {selectedVideo.tags && selectedVideo.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
              {selectedVideo.tags.map((tag, idx) => (
                <span 
                  key={idx}
                  className="px-3 py-1 text-xs font-mono bg-white/5 border border-white/10 rounded-full text-slate-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
