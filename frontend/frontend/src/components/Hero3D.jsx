import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, Sparkles, useGLTF, Float, Center } from '@react-three/drei';
import '../App.css'; // Ensure it can access the CSS

const ClothingModel = () => {
  const { scene } = useGLTF('/models/hoodie.glb'); 

  // Ensures all pieces of the 3D file stay visible
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.frustumCulled = false;
        }
      });
    }
  }, [scene]);

  return (
    // Moving the scale to the Center component prevents bounding-box math errors
    <Center scale={4.5}>
      <primitive object={scene} />
    </Center>
  );
};

const Hero3D = () => {
  return (
    <div className="hero-3d-wrapper">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={1} />
        <directionalLight position={[10, 10, 5]} intensity={2} />
        
        <Sparkles count={50} scale={10} size={2} speed={0.4} color="#ffffff" />
        
        <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5}>
          <Suspense fallback={null}>
            <ClothingModel />
          </Suspense>
        </Float>

        {/* OrbitControls handles the spinning and dragging flawlessly */}
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          autoRotate 
          autoRotateSpeed={1.5}
          maxPolarAngle={Math.PI / 1.5} 
          minPolarAngle={Math.PI / 3} 
        />

        <Environment preset="city" />
      </Canvas>
    </div>
  );
};

export default Hero3D;