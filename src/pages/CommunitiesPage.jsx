import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations, Environment, ContactShadows } from '@react-three/drei';

function Model({ url }) {
  const { scene, animations } = useGLTF(url);
  const { actions } = useAnimations(animations, scene);

  useEffect(() => {
    // Play the first animation if available
    if (actions && Object.keys(actions).length > 0) {
      const firstActionKey = Object.keys(actions)[0];
      actions[firstActionKey].play();
    }
    
    // Scale and position adjustment to make it look good in viewport
    scene.scale.set(3.0, 3.0, 3.0);
    scene.position.y = -3.0;
  }, [actions, scene]);

  return <primitive object={scene} />;
}

export default function CommunitiesPage() {
  return (
    <div className="relative min-h-screen pt-20 bg-dark-950">
      {/* Noise texture */}
      <div className="noise-overlay" />
      
      {/* Text Overlay */}
      <div className="absolute top-28 left-0 right-0 z-10 pointer-events-none px-4 text-center">
        <h1 className="font-outfit font-black text-5xl sm:text-7xl md:text-8xl text-white drop-shadow-2xl opacity-90 mb-4">
          <span className="text-gradient">Communities</span>
        </h1>
        <p className="font-inter text-dark-300 text-lg sm:text-xl max-w-2xl mx-auto">
          Explore the vibrant groups, tech circles, and creative collectives that make up the Igniter Club ecosystem.
        </p>
      </div>

      {/* 3D Canvas rendering the model full screen */}
      <div className="absolute inset-0 z-0 h-screen mt-16 sm:mt-0">
        <Canvas camera={{ position: [0, 1, 5], fov: 50 }}>
          <Environment preset="city" />
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
          
          <Suspense fallback={null}>
            <Model url="/model/source/stylized.glb" />
            <ContactShadows position={[0, -3.0, 0]} opacity={0.4} scale={10} blur={2.4} />
          </Suspense>

          <OrbitControls 
            enableZoom={true} 
            enablePan={false}
            autoRotate 
            autoRotateSpeed={1}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 4}
            minDistance={2}
            maxDistance={12}
          />
        </Canvas>
      </div>
      
      {/* Loading overlay while React Three Fiber initializes */}
      <div className="absolute inset-0 z-[-1] flex items-center justify-center bg-dark-950">
         <div className="font-outfit text-sm text-dark-400 tracking-widest uppercase animate-pulse">
            Loading Environment...
         </div>
      </div>
    </div>
  );
}

useGLTF.preload('/model/source/stylized.glb');
