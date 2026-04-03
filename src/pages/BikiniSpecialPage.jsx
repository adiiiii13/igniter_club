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

    // Set scale and position to make the model larger and well-framed
    scene.scale.set(3.0, 3.0, 3.0);
    scene.position.y = 0;
  }, [actions, scene]);

  return <primitive object={scene} />;
}

export default function BikiniSpecialPage() {
  return (
    <div className="relative min-h-screen pt-32 pb-20 bg-dark-950 selection:bg-rose-500/30">
      {/* Background accents */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-ignite-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-rose-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="noise-overlay" />

      {/* Header */}
      <div className="relative z-10 text-center px-4 mb-12">
        <span className="inline-block font-inter text-xs tracking-[0.3em] uppercase text-ignite-400 mb-4">
          Interactive Exhibition
        </span>
        <h1 className="font-outfit font-black text-4xl sm:text-6xl md:text-7xl text-white drop-shadow-2xl opacity-90 mb-6">
          <span className="text-gradient">Bikini Special</span>
        </h1>
        <p className="font-inter text-dark-300 text-base sm:text-lg max-w-2xl mx-auto">
          A beautifully rendered interactive 3D model exhibition. Click and drag to rotate, scroll to zoom in and out.
        </p>
        <div className="section-divider mx-auto mt-8" />
      </div>

      {/* 3D Container - Glassmorphism Card */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="glass rounded-[2rem] overflow-hidden shadow-2xl shadow-ignite-500/10 border border-white/5 relative bg-dark-900/40" style={{ height: '70vh', minHeight: '600px' }}>

          <Canvas camera={{ position: [0, 1, 5], fov: 50 }} className="z-10">
            <Environment preset="city" />
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />

            <Suspense fallback={null}>
              <Model url="/model2/source/node_0.glb" />
              <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2.4} />
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

          {/* Subtle loading overlay behind canvas */}
          <div className="absolute inset-0 z-[1] flex flex-col items-center justify-center bg-transparent pointer-events-none">
            <div className="w-10 h-10 border-2 border-ignite-500/20 border-t-ignite-500 rounded-full animate-spin mb-4" />
            <div className="font-outfit text-xs text-dark-400 tracking-widest uppercase animate-pulse">
              Loading Model Data
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

useGLTF.preload('/model2/source/node_0.glb');
