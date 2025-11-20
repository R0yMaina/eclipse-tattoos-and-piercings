import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import * as THREE from "three"; // Make sure Three.js is imported

const Index = () => {
  const navigate = useNavigate();
  const threeContainerRef = useRef(null); // Reference to the 3D container

  useEffect(() => {
    // Three.js 3D Background setup
    function initThreeJS() {
      const container = threeContainerRef.current; // Get the container element
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

      renderer.setSize(window.innerWidth, window.innerHeight);
      container.appendChild(renderer.domElement);

      // Create golden particles
      const particlesGeometry = new THREE.BufferGeometry();
      const particlesCount = 5000;

      const posArray = new Float32Array(particlesCount * 3);
      const colorArray = new Float32Array(particlesCount * 3);

      for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 10;
        // Gold color variations
        colorArray[i] = Math.random() * 0.3 + 0.7; // Gold to yellow
      }

      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

      const particlesMaterial = new THREE.PointsMaterial({
        size: 0.02,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
      });

      const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
      scene.add(particlesMesh);

      // Add some organic shapes (torus knot)
      const organicGeometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
      const organicMaterial = new THREE.MeshBasicMaterial({
        color: 0xd4af37,
        wireframe: true,
        transparent: true,
        opacity: 0.2
      });

      const organicMesh = new THREE.Mesh(organicGeometry, organicMaterial);
      organicMesh.scale.set(2, 2, 2);
      scene.add(organicMesh);

      camera.position.z = 5;

      // Mouse movement effect
      let mouseX = 0;
      let mouseY = 0;

      document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
      });

      // Animation loop
      function animate() {
        requestAnimationFrame(animate);

        particlesMesh.rotation.x += 0.0005;
        particlesMesh.rotation.y += 0.001;

        organicMesh.rotation.x += 0.005;
        organicMesh.rotation.y += 0.003;

        // Subtle camera movement based on mouse position
        camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
        camera.position.y += (mouseY * 0.5 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
      }

      animate();

      // Handle window resize
      window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });
    }

    // Initialize Three.js when the component is mounted
    initThreeJS();

    // Clean up the Three.js scene on component unmount
    return () => {
      // You can handle cleanup here, like disposing of geometries, materials, etc.
    };
  }, []); // Empty dependency array means this effect runs once when the component is mounted

  return (
    <div 
      className="flex min-h-screen items-center justify-center bg-cover bg-center relative" 
      style={{ backgroundImage: 'url(/path/to/your-image.jpg)' }}  // Background Image
    >
      {/* Hero Section with 3D Container */}
      <section className="hero relative w-full h-full">
        {/* 3D Animation Container */}
        <div ref={threeContainerRef} id="three-container" className="absolute top-0 left-0 w-full h-full"></div>
        
        {/* Content (Text and Buttons) */}
        <div className="hero-content text-center space-y-6 max-w-2xl mx-auto px-4 relative z-10">
          <div className="mb-8">
            <svg viewBox="0 0 200 200" className="w-32 h-32 mx-auto mb-6 opacity-50">
              <defs>
                <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 0.6 }} />
                </linearGradient>
              </defs>
              <image 
                href="../limit.png"
                x="0"
                y="0"
                width="200"
                height="200"
                clipPath="url(#circle-clip)"
                preserveAspectRatio="xMidYMid slice"
              />
              <circle 
                cx="100" 
                cy="100" 
                r="80" 
                fill="none"
                stroke="url(#logo-gradient)" 
                strokeWidth="3"
              />
            </svg>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-foreground mb-4">
            Eclipse Tattoo & Piercings
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 font-light">
            Perfection is the aim
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/contact')}
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 gold-glow transition-smooth rounded-full px-8 py-6 text-base font-semibold"
            >
              Book Your Session
            </Button>
            <Button 
              onClick={() => navigate('/services')}
              variant="outline"
              size="lg"
              className="border-primary text-foreground hover:bg-primary/10 rounded-full px-8 py-6 text-base transition-smooth"
            >
              View Services
            </Button>
            <Button 
              onClick={() => navigate('/about')}
              variant="outline"
              size="lg"
              className="border-primary text-foreground hover:bg-primary/10 rounded-full px-8 py-6 text-base transition-smooth"
            >
              Learn Our Story
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
