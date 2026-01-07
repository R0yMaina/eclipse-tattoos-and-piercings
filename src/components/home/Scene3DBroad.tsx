import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import WireframeMeshBroad from './WireframeMeshBroad';

const Scene3DBroad = () => {
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 7], fov: 75 }}
        style={{ background: 'transparent' }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <WireframeMeshBroad />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Scene3DBroad;
