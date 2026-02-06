import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import WireframeMeshBroad from './WireframeMeshBroad';
import { ErrorBoundary } from '@/components/ui/error-boundary';

const Scene3DBroad = () => {
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
      <ErrorBoundary fallback={<div className="absolute inset-0 bg-background" />}>
        <Canvas
          camera={{ position: [0, 0, 7], fov: 75 }}
          style={{ background: 'transparent' }}
          gl={{ antialias: true, alpha: true }}
        >
          <Suspense fallback={null}>
            <WireframeMeshBroad />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
    </div>
  );
};

export default Scene3DBroad;
