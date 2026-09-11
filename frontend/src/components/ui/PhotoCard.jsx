import React, { useState } from 'react';
import { Maximize2, MapPin, Camera, Aperture } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function PhotoCard({ photo, index }) {
  const { setSelectedPhoto } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  // 3D Card Tilt Physics
  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -7;
    const rotateY = ((x - centerX) / centerX) * 7;

    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div
      data-cursor="view"
      onClick={() => setSelectedPhoto(photo)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        transition: 'transform 0.15s ease-out'
      }}
      className="group relative rounded-2xl overflow-hidden bg-surface border border-white/5 shadow-lg hover:shadow-2xl hover:border-accent/30 hover:shadow-accent/5 cursor-pointer transition-all duration-300"
    >
      {/* Image Container with Aspect Ratio */}
      <div className="relative w-full overflow-hidden bg-surface-light">
        {/* Placeholder shimmer before load */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-surface to-surface-light animate-pulse aspect-[3/2]" />
        )}

        <img
          src={photo.imageUrl}
          alt={photo.title}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-auto object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-105 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Cinematic Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-60 group-hover:opacity-85 transition-opacity duration-300" />

        {/* Top Badges: Category & Year */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-medium tracking-wider uppercase bg-black/60 backdrop-blur-md text-amber-300 border border-amber-400/20">
            {photo.category}
          </span>
          {photo.featured ? (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase bg-accent text-black font-bold">
              Featured
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-slate-400 bg-black/50 backdrop-blur-sm border border-white/10">
              {photo.year || '2025'}
            </span>
          )}
        </div>

        {/* Hover Action Icon */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-8 h-8 rounded-full bg-black/70 backdrop-blur-md border border-accent/40 flex items-center justify-center text-accent shadow-lg">
            <Maximize2 className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Bottom Details & EXIF HUD */}
        <div className="absolute bottom-0 left-0 right-0 p-4 transition-transform duration-300">
          {/* Title & Location */}
          <h3 className="text-base font-semibold text-white group-hover:text-accent transition-colors line-clamp-1">
            {photo.title}
          </h3>
          
          {photo.location && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
              <MapPin className="w-3 h-3 text-accent/80" />
              <span className="line-clamp-1">{photo.location}</span>
            </div>
          )}

          {/* EXIF Data Strip (Smooth Reveal on Hover) */}
          <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
            {photo.camera && (
              <span className="exif-tag px-2 py-0.5 rounded text-slate-300 flex items-center gap-1">
                <Camera className="w-2.5 h-2.5 text-accent" />
                <span className="truncate max-w-[120px]">{photo.camera}</span>
              </span>
            )}
            {photo.aperture && (
              <span className="exif-tag px-2 py-0.5 rounded text-amber-200">
                {photo.aperture}
              </span>
            )}
            {photo.shutterSpeed && (
              <span className="exif-tag px-2 py-0.5 rounded text-slate-300">
                {photo.shutterSpeed}
              </span>
            )}
            {photo.iso && (
              <span className="exif-tag px-2 py-0.5 rounded text-slate-400">
                {photo.iso}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
