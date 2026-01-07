import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const WireframeMeshBroad = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const mesh2Ref = useRef<THREE.Mesh>(null);
  const mesh3Ref = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Broader, more spread out torus knot geometries
  const geometry1 = useMemo(() => new THREE.TorusKnotGeometry(4, 0.5, 120, 20, 3, 4), []);
  const geometry2 = useMemo(() => new THREE.TorusKnotGeometry(5, 0.4, 100, 18, 2, 3), []);
  const geometry3 = useMemo(() => new THREE.TorusKnotGeometry(3.5, 0.35, 90, 16, 4, 5), []);

  // Golden wireframe material - slightly more transparent for pages
  const wireframeMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color('#C9A44C'),
    wireframe: true,
    transparent: true,
    opacity: 0.35,
  }), []);

  const wireframeMaterial2 = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color('#D4AF37'),
    wireframe: true,
    transparent: true,
    opacity: 0.25,
  }), []);

  const wireframeMaterial3 = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color('#B8962E'),
    wireframe: true,
    transparent: true,
    opacity: 0.2,
  }), []);

  // Create floating particles - fewer for subtlety
  const particlesGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const count = 300;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;

      // Mix of gold, white, and light blue particles
      const colorChoice = Math.random();
      if (colorChoice < 0.6) {
        // Gold
        colors[i * 3] = 0.78;
        colors[i * 3 + 1] = 0.65;
        colors[i * 3 + 2] = 0.22;
      } else if (colorChoice < 0.85) {
        // White
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 1;
        colors[i * 3 + 2] = 1;
      } else {
        // Light blue
        colors[i * 3] = 0.6;
        colors[i * 3 + 1] = 0.8;
        colors[i * 3 + 2] = 1;
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geometry;
  }, []);

  const particlesMaterial = useMemo(() => new THREE.PointsMaterial({
    size: 0.04,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true,
  }), []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (meshRef.current) {
      meshRef.current.rotation.x = time * 0.05;
      meshRef.current.rotation.y = time * 0.08;
      meshRef.current.rotation.z = time * 0.03;
    }

    if (mesh2Ref.current) {
      mesh2Ref.current.rotation.x = -time * 0.04;
      mesh2Ref.current.rotation.y = time * 0.06;
      mesh2Ref.current.rotation.z = -time * 0.04;
    }

    if (mesh3Ref.current) {
      mesh3Ref.current.rotation.x = time * 0.03;
      mesh3Ref.current.rotation.y = -time * 0.05;
      mesh3Ref.current.rotation.z = time * 0.05;
    }

    if (particlesRef.current) {
      particlesRef.current.rotation.y = time * 0.015;
      
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(time + positions[i]) * 0.0008;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <>
      {/* Broader wireframe meshes - more spread out */}
      <mesh ref={meshRef} geometry={geometry1} material={wireframeMaterial} position={[-2, 1, -2]} />
      <mesh ref={mesh2Ref} geometry={geometry2} material={wireframeMaterial2} position={[3, -1, -3]} />
      <mesh ref={mesh3Ref} geometry={geometry3} material={wireframeMaterial3} position={[0, 2, -1]} />
      
      {/* Floating particles */}
      <points ref={particlesRef} geometry={particlesGeometry} material={particlesMaterial} />
    </>
  );
};

export default WireframeMeshBroad;
