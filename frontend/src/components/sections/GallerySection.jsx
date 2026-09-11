import React from 'react';
import { Camera, Plus, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import PhotoCard from '../ui/PhotoCard';
import FilterBar from '../ui/FilterBar';

export default function GallerySection() {
  const { filteredPhotos, photos, loading, setIsAdminOpen } = useApp();

  return (
    <section id="gallery" className="py-20 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-4 border-b border-white/10 gap-3">
          <div>
            <span className="text-accent text-xs font-mono tracking-widest uppercase block mb-1">
              Photography Archive
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Selected Works
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-sm font-light">
            High-resolution medium format stills, studio portraiture, and landscape series.
          </p>
        </div>

        {/* Filter Controls */}
        <FilterBar />

        {/* Gallery Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-72 rounded-2xl bg-surface/50 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : photos.length === 0 ? (
          /* Clean Empty Slate State */
          <div className="py-20 text-center rounded-2xl bg-surface border border-white/5 my-4 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-accent">
              <Camera className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-white">No Photographs in Gallery</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Your photography section is ready. Upload your high-resolution images with automated EXIF extraction anytime.
              </p>
            </div>
            <button
              onClick={() => setIsAdminOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-accent text-black font-semibold text-xs tracking-wider uppercase hover:bg-accent-hover transition-colors inline-flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Upload Photographs (Shift + A)</span>
            </button>
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-surface border border-white/5 my-4">
            <p className="text-xs text-slate-400 font-mono">No photographs found matching the current search criteria.</p>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {filteredPhotos.map((photo, index) => (
              <PhotoCard
                key={photo.id || index}
                photo={photo}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
