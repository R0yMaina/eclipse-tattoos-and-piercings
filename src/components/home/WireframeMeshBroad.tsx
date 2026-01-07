import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const WireframeMeshBroad = () => {
  const particlesRef = useRef<THREE.Points>(null);
  const organicRef = useRef<THREE.Mesh>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const { camera } = useThree();

  // Mouse movement handler
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMouse({
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1,
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Create golden particles - spread wider for inner pages
  const particlesGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const particlesCount = 5000;
    const posArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 15; // Wider spread
      // Gold color variations
      colorArray[i] = Math.random() * 0.3 + 0.7;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
    return geometry;
  }, []);

  const particlesMaterial = useMemo(() => new THREE.PointsMaterial({
    size: 0.02,
    vertexColors: true,
    transparent: true,
    opacity: 0.6, // Slightly less opaque for background
  }), []);

  // Organic torus knot geometry - slightly larger for broader effect
  const organicGeometry = useMemo(() => new THREE.TorusKnotGeometry(1.5, 0.4, 100, 16), []);
  
  const organicMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: 0xd4af37,
    wireframe: true,
    transparent: true,
    opacity: 0.15, // More subtle for inner pages
  }), []);

  useFrame(() => {
    if (particlesRef.current) {
      particlesRef.current.rotation.x += 0.0003;
      particlesRef.current.rotation.y += 0.0006;
    }

    if (organicRef.current) {
      organicRef.current.rotation.x += 0.003;
      organicRef.current.rotation.y += 0.002;
    }

    // Subtle camera movement based on mouse position
    camera.position.x += (mouse.x * 0.3 - camera.position.x) * 0.03;
    camera.position.y += (mouse.y * 0.3 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      {/* Golden particles */}
      <points ref={particlesRef} geometry={particlesGeometry} material={particlesMaterial} />
      
      {/* Organic torus knot shape - larger scale for broader look */}
      <mesh ref={organicRef} geometry={organicGeometry} material={organicMaterial} scale={[2.5, 2.5, 2.5]} />
    </>
  );
};

export default WireframeMeshBroad;
