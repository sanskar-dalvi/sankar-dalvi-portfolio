import { lazy, Suspense, useState, useEffect } from 'react';
import { motion } from 'motion/react';

const Spline = lazy(() => import('@splinetool/react-spline'));

export function Hero() {
  const [shouldLoadSpline, setShouldLoadSpline] = useState(false);
  const [isSplineLoaded, setIsSplineLoaded] = useState(false);

  useEffect(() => {
    // Determine if we should load Spline based on device capability
    const isMobile = window.innerWidth < 768;
    const isLowEnd = navigator.hardwareConcurrency <= 2;
    
    // Optional WebGL check
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    
    if (!isMobile && !isLowEnd && gl) {
      setShouldLoadSpline(true);
    }
  }, []);

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-transparent z-10 px-6 md:px-12 lg:px-24">
      {/* 
        To prevent scroll hijacking from Spline as mentioned in COMMON_PROBLEMS.md, 
        we make sure body has overflow: auto in index.css (done separately) 
      */}
      <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-20">
        
        {/* Left column: Name */}
        <div className="flex flex-col justify-end md:justify-center items-start z-30 h-[40vh] md:h-auto order-2 md:order-1 pt-12 md:pt-0 pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="flex flex-col pointer-events-auto"
          >
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[9rem] font-bold tracking-tighter leading-[0.9] text-white">
              SANSKAR
            </h1>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold tracking-[0.2em] text-white/90 mt-2 ml-1">
              DALVI
            </h2>
          </motion.div>
        </div>

        {/* Right column: Spline 3D Scene */}
        <div className="relative w-full h-[50vh] md:h-[80vh] flex items-center justify-center order-1 md:order-2 pointer-events-none">
          {shouldLoadSpline ? (
            <Suspense fallback={<div className="w-full h-full animate-pulse bg-white/5 rounded-full blur-3xl" />}>
              <div 
                className={`absolute inset-0 transition-opacity duration-1000 ${isSplineLoaded ? 'opacity-100' : 'opacity-0'}`}
                style={{ contain: 'strict' }}
              >
                {/* 
                  Wrapper has pointer-events: none, Spline has pointer-events: auto 
                  so it doesn't block other UI elements but allows interaction 
                */}
                <Spline 
                  scene="https://prod.spline.design/RtfGXygWv012syZM/scene.splinecode" 
                  onLoad={() => setIsSplineLoaded(true)}
                  className="w-full h-full pointer-events-auto"
                />
              </div>
            </Suspense>
          ) : (
            <div className="w-64 h-64 md:w-96 md:h-96 rounded-full border border-white/10 flex items-center justify-center bg-white/5 backdrop-blur-3xl animate-pulse">
              <span className="text-white/40 font-mono tracking-widest text-sm uppercase px-4 text-center">3D Disabled for Performance</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
