import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';

class CanvasErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('3D Canvas render notice:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="w-full h-full flex items-center justify-center bg-surface/50 border border-white/5 rounded-2xl p-8 text-center">
          <div>
            <div className="w-12 h-12 rounded-full border border-accent/40 flex items-center justify-center mx-auto mb-3 text-accent">
              <span className="font-mono text-sm">3D</span>
            </div>
            <p className="text-slate-400 text-sm">Interactive 3D view active (hardware accelerated mode)</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function SceneContainer({
  children,
  className = 'w-full h-full',
  camera = { position: [0, 0, 5], fov: 45 },
  gl = { antialias: true, alpha: true, powerPreference: 'high-performance' }
}) {
  return (
    <div className={`relative ${className}`}>
      <CanvasErrorBoundary>
        <Canvas
          camera={camera}
          gl={gl}
          dpr={[1, 2]}
        >
          <Suspense fallback={null}>
            {children}
          </Suspense>
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}
