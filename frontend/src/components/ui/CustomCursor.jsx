import React, { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [trailingPos, setTrailingPos] = useState({ x: -100, y: -100 });
  const [cursorType, setCursorType] = useState('default'); // 'default' | 'hover' | 'view' | 'drag'
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only enable on pointer-capable desktop devices
    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);

      const target = e.target;
      if (target.closest('[data-cursor="view"]')) {
        setCursorType('view');
      } else if (target.closest('[data-cursor="drag"]')) {
        setCursorType('drag');
      } else if (target.closest('button, a, input, select, textarea, [role="button"]')) {
        setCursorType('hover');
      } else {
        setCursorType('default');
      }
    };

    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Smooth trailing effect
  useEffect(() => {
    let animationFrame;
    const updateTrailing = () => {
      setTrailingPos(prev => ({
        x: prev.x + (position.x - prev.x) * 0.2,
        y: prev.y + (position.y - prev.y) * 0.2
      }));
      animationFrame = requestAnimationFrame(updateTrailing);
    };
    animationFrame = requestAnimationFrame(updateTrailing);
    return () => cancelAnimationFrame(animationFrame);
  }, [position]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* Inner precise dot */}
      <div
        className="fixed w-2 h-2 -ml-1 -mt-1 rounded-full bg-accent transition-transform duration-75"
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`
        }}
      />

      {/* Outer trailing aura */}
      <div
        className={`fixed rounded-full flex items-center justify-center border transition-all duration-200 ${
          cursorType === 'view'
            ? 'w-16 h-16 -ml-8 -mt-8 bg-accent/20 border-accent text-accent font-mono text-[10px] tracking-widest uppercase backdrop-blur-sm'
            : cursorType === 'drag'
            ? 'w-16 h-16 -ml-8 -mt-8 bg-lens-cyan/20 border-lens-cyan text-lens-cyan font-mono text-[10px] tracking-widest uppercase backdrop-blur-sm'
            : cursorType === 'hover'
            ? 'w-12 h-12 -ml-6 -mt-6 border-accent/70 bg-accent/10 scale-110'
            : 'w-8 h-8 -ml-4 -mt-4 border-white/20'
        }`}
        style={{
          transform: `translate3d(${trailingPos.x}px, ${trailingPos.y}px, 0)`
        }}
      >
        {cursorType === 'view' && <span>VIEW</span>}
        {cursorType === 'drag' && <span>DRAG</span>}
      </div>
    </div>
  );
}
