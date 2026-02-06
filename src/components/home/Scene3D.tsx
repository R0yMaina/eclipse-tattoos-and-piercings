import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import WireframeMesh from './WireframeMesh';
import { ErrorBoundary } from '@/components/ui/error-boundary';

const Scene3D = () => {
  return (
    <div className="absolute inset-0 w-full h-full">
      <ErrorBoundary fallback={<div className="absolute inset-0 bg-background" />}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 75 }}
          style={{ background: 'transparent' }}
          gl={{ antialias: true, alpha: true }}
        >
          <Suspense fallback={null}>
            <WireframeMesh />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
    </div>
  );
};

export default Scene3D;
