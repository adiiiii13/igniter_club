import { useEffect, useRef, useState, useCallback } from 'react';

const TOTAL_FRAMES = 192;
const getFramePath = (index) => {
  const padded = String(index + 1).padStart(3, '0');
  return `/frames/ezgif-frame-${padded}.jpg`;
};

export default function BackgroundScrubber() {
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const currentFrameRef = useRef(0);
  const rafRef = useRef(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let loadedCount = 0;
    const images = [];

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      img.onload = () => {
        loadedCount++;
        setLoadProgress(Math.round((loadedCount / TOTAL_FRAMES) * 100));
        if (loadedCount === TOTAL_FRAMES) {
          setIsLoaded(true);
          drawFrame(0);
        }
      };
      images[i] = img;
    }

    imagesRef.current = images;

    return () => {
      imagesRef.current = [];
    };
  }, []);

  const drawFrame = useCallback((frameIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const img = imagesRef.current[frameIndex];
    if (!img || !img.complete) return;

    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const imgAspect = img.naturalWidth / img.naturalHeight;
    const canvasAspect = w / h;

    let drawW, drawH, offsetX, offsetY;

    if (canvasAspect > imgAspect) {
      drawW = w;
      drawH = w / imgAspect;
      offsetX = 0;
      offsetY = (h - drawH) / 2;
    } else {
      drawH = h;
      drawW = h * imgAspect;
      offsetX = (w - drawW) / 2;
      offsetY = 0;
    }

    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        if (!isLoaded) return;

        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        let scrollProgress = 0;
        
        if (maxScroll > 0) {
          scrollProgress = window.scrollY / maxScroll;
        }

        const clampedProgress = Math.max(0, Math.min(1, scrollProgress));
        const frameIndex = Math.floor(clampedProgress * (TOTAL_FRAMES - 1));

        if (frameIndex !== currentFrameRef.current) {
          currentFrameRef.current = frameIndex;
          drawFrame(frameIndex);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    
    // Initial draw to handle page loaded halfway down
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isLoaded, drawFrame]);

  return (
    <div className="fixed inset-0 w-full h-full -z-10 bg-dark-950 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ 
          objectFit: 'cover',
          filter: 'contrast(1.3) saturate(1.4) brightness(1.2)' 
        }}
      />

      {/* Dark gradient overlay for text contrast across the whole page */}
      {/* Lightened slightly to let the enhanced Mario fully pop through */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-950/40 via-dark-950/60 to-dark-950/80 z-10" />

      {/* Loading indicator */}
      {!isLoaded && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-dark-950">
          <div className="relative w-48 h-1 bg-dark-800 rounded-full overflow-hidden mb-4">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-ignite-600 to-ignite-400 rounded-full transition-all duration-300"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
          <p className="font-outfit text-sm text-dark-400 tracking-widest uppercase">
            Loading experience — {loadProgress}%
          </p>
        </div>
      )}
    </div>
  );
}
