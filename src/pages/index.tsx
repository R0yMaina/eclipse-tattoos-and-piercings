import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import * as THREE from "three";

const Index = () => {
  const navigate = useNavigate();
  const threeContainerRef = useRef(null);

  // ===== INIT 3D + EVENTS =====
  useEffect(() => {
    // ---- THREE.JS INIT ----
    const container = threeContainerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Particles
    const particlesCount = 5000;
    const particlesGeometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
      colorArray[i] = Math.random() * 0.3 + 0.7;
    }

    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(posArray, 3)
    );
    particlesGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(colorArray, 3)
    );

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });

    const particlesMesh = new THREE.Points(
      particlesGeometry,
      particlesMaterial
    );
    scene.add(particlesMesh);

    // Torus Knot
    const organicGeometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
    const organicMaterial = new THREE.MeshBasicMaterial({
      color: 0xd4af37,
      wireframe: true,
      transparent: true,
      opacity: 0.2,
    });

    const organicMesh = new THREE.Mesh(organicGeometry, organicMaterial);
    organicMesh.scale.set(2, 2, 2);
    scene.add(organicMesh);

    camera.position.z = 5;

    // Mouse motion
    let mouseX = 0;
    let mouseY = 0;
    const mouseListener = (event) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    document.addEventListener("mousemove", mouseListener);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      particlesMesh.rotation.x += 0.0005;
      particlesMesh.rotation.y += 0.001;

      organicMesh.rotation.x += 0.005;
      organicMesh.rotation.y += 0.003;

      camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
      camera.position.y += (mouseY * 0.5 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };
    animate();

    // Resize event
    const resizeListener = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", resizeListener);

    // CLEANUP on unmount
    return () => {
      document.removeEventListener("mousemove", mouseListener);
      window.removeEventListener("resize", resizeListener);

      renderer.dispose();
      particlesGeometry.dispose();
      organicGeometry.dispose();
      particlesMaterial.dispose();
      organicMaterial.dispose();
    };
  }, []);

  return (
    <div className="relative">
      {/* === THREE.JS BACKGROUND === */}
      <div
        ref={threeContainerRef}
        id="three-container"
        className="absolute inset-0 -z-10"
      />

      {/* === MAIN PAGE CONTENT === */}
      <div className="flex min-h-screen items-center justify-center bg-background/60 backdrop-blur-sm">
        <div className="text-center space-y-6 max-w-2xl mx-auto px-4">
          <div className="mb-8">
            <svg viewBox="0 0 200 200" className="w-32 h-32 mx-auto mb-6 opacity-50">
              <defs>
                <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: "hsl(var(--primary))", stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: "hsl(var(--accent))", stopOpacity: 0.6 }} />
                </linearGradient>
                <clipPath id="circle-clip">
                  <circle cx="100" cy="100" r="80" />
                </clipPath>
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
              onClick={() => navigate("/contact")}
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 gold-glow transition-smooth rounded-full px-8 py-6 text-base font-semibold"
            >
              Book Your Session
            </Button>

            <Button
              onClick={() => navigate("/services")}
              variant="outline"
              size="lg"
              className="border-primary text-foreground hover:bg-primary/10 rounded-full px-8 py-6 text-base transition-smooth"
            >
              View Services
            </Button>

            <Button
              onClick={() => navigate("/about")}
              variant="outline"
              size="lg"
              className="border-primary text-foreground hover:bg-primary/10 rounded-full px-8 py-6 text-base transition-smooth"
            >
              Learn Our Story
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
