import React, { useState, useEffect } from 'react';
import { 
  X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw, 
  Camera, Aperture, Clock, Sliders, MapPin, Calendar, Share2, 
  Info, Download, Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function LightboxModal() {
  const { selectedPhoto, setSelectedPhoto, filteredPhotos } = useApp();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showInfo, setShowInfo] = useState(true);
  const [copied, setCopied] = useState(false);

  // Current photo index in filtered list
  const currentIndex = selectedPhoto 
    ? filteredPhotos.findIndex(p => p.id === selectedPhoto.id)
    : -1;

  const handleNext = () => {
    if (currentIndex >= 0 && currentIndex < filteredPhotos.length - 1) {
      setSelectedPhoto(filteredPhotos[currentIndex + 1]);
      setZoomLevel(1);
    } else if (filteredPhotos.length > 0) {
      setSelectedPhoto(filteredPhotos[0]);
      setZoomLevel(1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setSelectedPhoto(filteredPhotos[currentIndex - 1]);
      setZoomLevel(1);
    } else if (filteredPhotos.length > 0) {
      setSelectedPhoto(filteredPhotos[filteredPhotos.length - 1]);
      setZoomLevel(1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!selectedPhoto) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedPhoto(null);
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === '+' || e.key === '=') setZoomLevel(prev => Math.min(prev + 0.3, 3));
      if (e.key === '-') setZoomLevel(prev => Math.max(prev - 0.3, 1));
      if (e.key === '0') setZoomLevel(1);
      if (e.key === 'i' || e.key === 'I') setShowInfo(prev => !prev);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto, currentIndex, filteredPhotos]);

  if (!selectedPhoto) return null;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in select-none">
      {/* Top Action Header Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 to-transparent">
        {/* Photo Title & Counter */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-full bg-white/10 text-slate-300 font-mono text-xs border border-white/10">
            {currentIndex >= 0 ? `${currentIndex + 1} / ${filteredPhotos.length}` : 'ARCHIVE'}
          </div>
          <h2 className="hidden sm:block text-white font-semibold text-sm tracking-wide">
            {selectedPhoto.title}
          </h2>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="hidden sm:flex items-center bg-white/10 backdrop-blur-md rounded-xl p-1 border border-white/10">
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 1))}
              disabled={zoomLevel <= 1}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono text-xs text-slate-300">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 2.5))}
              disabled={zoomLevel >= 2.5}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            {zoomLevel > 1 && (
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1.5 rounded-lg text-accent hover:bg-white/10"
                title="Reset Zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Toggle Metadata Drawer */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`p-2.5 rounded-xl border transition-colors ${
              showInfo 
                ? 'bg-accent text-black border-accent' 
                : 'bg-white/10 text-slate-300 border-white/10 hover:text-white hover:bg-white/20'
            }`}
            title="Toggle EXIF Metadata (I)"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Share Link */}
          <button
            onClick={handleShare}
            className="p-2.5 rounded-xl bg-white/10 border border-white/10 text-slate-300 hover:text-white hover:bg-white/20 transition-colors"
            title="Copy Direct Link"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>

          {/* Close Lightbox */}
          <button
            onClick={() => setSelectedPhoto(null)}
            className="p-2.5 rounded-xl bg-accent text-black font-bold hover:bg-accent-hover transition-colors shadow-lg shadow-accent/20"
            title="Close Lightbox (ESC)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div 
        className="relative w-full h-full flex items-center justify-center p-4 sm:p-12 overflow-hidden"
        onClick={(e) => {
          if (e.target === e.currentTarget) setSelectedPhoto(null);
        }}
      >
        <div
          style={{
            transform: `scale(${zoomLevel})`,
            transition: 'transform 0.25s cubic-bezier(0.2, 0, 0, 1)'
          }}
          className="relative max-w-full max-h-[85vh] flex items-center justify-center shadow-2xl rounded-lg overflow-hidden border border-white/10"
        >
          <img
            src={selectedPhoto.imageUrl}
            alt={selectedPhoto.title}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
          />
        </div>
      </div>

      {/* Navigation Buttons: Previous / Next */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-black/60 backdrop-blur-md border border-white/15 text-white hover:text-accent hover:border-accent/40 hover:bg-black/80 transition-all z-20 group"
        title="Previous Photo (Left Arrow)"
      >
        <ChevronLeft className="w-6 h-6 transition-transform group-hover:-translate-x-0.5" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-black/60 backdrop-blur-md border border-white/15 text-white hover:text-accent hover:border-accent/40 hover:bg-black/80 transition-all z-20 group"
        title="Next Photo (Right Arrow)"
      >
        <ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-0.5" />
      </button>

      {/* EXIF Metadata Sidebar Drawer */}
      {showInfo && (
        <div className="absolute bottom-6 sm:bottom-8 right-6 sm:right-8 max-w-sm w-full glass-panel-glow p-5 rounded-2xl border border-accent/20 z-30 animate-slide-up shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-accent block">
                {selectedPhoto.category}
              </span>
              <h3 className="text-base font-bold text-white leading-tight">
                {selectedPhoto.title}
              </h3>
            </div>
            <button
              onClick={() => setShowInfo(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {selectedPhoto.description && (
            <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
              {selectedPhoto.description}
            </p>
          )}

          {/* EXIF Technical Matrix */}
          <div className="mt-4 pt-3 border-t border-white/10 space-y-2 font-mono text-xs">
            {selectedPhoto.camera && (
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <Camera className="w-3.5 h-3.5 text-accent" /> Camera
                </span>
                <span className="text-white font-medium text-right truncate max-w-[180px]">
                  {selectedPhoto.camera}
                </span>
              </div>
            )}

            {selectedPhoto.lens && (
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <Aperture className="w-3.5 h-3.5 text-lens-cyan" /> Lens
                </span>
                <span className="text-white font-medium text-right truncate max-w-[180px]">
                  {selectedPhoto.lens}
                </span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-center">
              <div className="bg-white/5 rounded-lg p-1.5">
                <span className="text-[10px] text-slate-400 block">F-STOP</span>
                <span className="text-amber-300 font-bold text-xs">{selectedPhoto.aperture || 'f/2.8'}</span>
              </div>
              <div className="bg-white/5 rounded-lg p-1.5">
                <span className="text-[10px] text-slate-400 block">SHUTTER</span>
                <span className="text-white font-bold text-xs">{selectedPhoto.shutterSpeed || '1/500s'}</span>
              </div>
              <div className="bg-white/5 rounded-lg p-1.5">
                <span className="text-[10px] text-slate-400 block">ISO</span>
                <span className="text-white font-bold text-xs">{selectedPhoto.iso || 'ISO 100'}</span>
              </div>
            </div>

            {(selectedPhoto.location || selectedPhoto.year) && (
              <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400">
                {selectedPhoto.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-accent" />
                    {selectedPhoto.location}
                  </span>
                )}
                {selectedPhoto.year && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {selectedPhoto.year}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
