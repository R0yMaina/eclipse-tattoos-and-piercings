import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import WireframeMesh from './WireframeMesh';

const Scene3D = () => {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        style={{ background: 'transparent' }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <WireframeMesh />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Scene3D;
