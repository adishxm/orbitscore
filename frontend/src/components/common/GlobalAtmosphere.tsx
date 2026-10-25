import React, { useEffect, useRef } from 'react';
import styles from './GlobalAtmosphere.module.css';

interface Star {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  speed: number;
  phase: number;
}

export const GlobalAtmosphere: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number | null = null;
    let isVisible = document.visibilityState === 'visible';

    // Reduced motion check
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Generate 150 fixed stars
    const starCount = 150;
    const stars: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() < 0.25 ? 1.8 : Math.random() < 0.7 ? 1.2 : 0.8,
        baseAlpha: 0.15 + Math.random() * 0.45,
        speed: 0.5 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      // Re-scatter bounds
      for (const star of stars) {
        if (star.x > width) star.x = Math.random() * width;
        if (star.y > height) star.y = Math.random() * height;
      }
      if (prefersReducedMotion) {
        drawStatic();
      }
    };

    const handleVisibility = () => {
      isVisible = document.visibilityState === 'visible';
      if (isVisible && !prefersReducedMotion && animId === null) {
        animId = requestAnimationFrame(render);
      }
    };

    const drawStatic = () => {
      ctx.clearRect(0, 0, width, height);
      for (const star of stars) {
        ctx.fillStyle = `rgba(238, 243, 255, ${star.baseAlpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    let lastTime = performance.now();

    const render = (time: number) => {
      if (!isVisible) {
        animId = null;
        return;
      }

      const dt = (time - lastTime) / 1000;
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      for (const star of stars) {
        star.phase += dt * star.speed;
        const twinkle = 0.5 + 0.5 * Math.sin(star.phase);
        const alpha = star.baseAlpha * (0.6 + 0.4 * twinkle);

        ctx.fillStyle = `rgba(238, 243, 255, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);

    if (prefersReducedMotion) {
      drawStatic();
    } else {
      animId = requestAnimationFrame(render);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (animId !== null) cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className={styles.atmosphereRoot} aria-hidden="true">
      {/* 1. Custom Deep Blue Aura Background Layer */}
      <div className={styles.wallpaperLayer} />

      {/* 2. Top-Hero Ethereal Blue Glow Pool */}
      <div className={styles.topHeroGlow} />

      {/* 3. Faint 48px Technical Precision Grid with radial vignette mask */}
      <div className={styles.technicalGrid} />

      {/* 4. Fixed Canvas Starfield */}
      <canvas ref={canvasRef} className={styles.starfieldCanvas} />

      {/* 5. Fine SVG Film Grain (3-4% opacity to eliminate gradient banding) */}
      <div className={styles.filmGrain} />
    </div>
  );
};

export default GlobalAtmosphere;
