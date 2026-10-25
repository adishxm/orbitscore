import React, { useEffect, useState } from 'react';
import styles from './OrbitHudNav.module.css';

interface NavPoint {
  id: string;
  code: string;
  label: string;
}

const NAV_POINTS: NavPoint[] = [
  { id: 'hero-section', code: '01', label: 'HERO' },
  { id: 'telemetry-strips', code: '02', label: 'TELEMETRY' },
  { id: 'benchmark-section', code: '03', label: 'BENCHMARK' },
  { id: 'stepper-section', code: '04', label: '6-STAGE' },
  { id: 'states-section', code: '05', label: 'TAXONOMY' },
  { id: 'backend-section', code: '06', label: 'CONSOLE' },
];

export const OrbitHudNav: React.FC = () => {
  const [activeId, setActiveId] = useState<string>('hero-section');
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  useEffect(() => {
    let ticking = false;
    let animId: number | null = null;
    let isMounted = true;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      animId = requestAnimationFrame(() => {
        if (!isMounted) return;
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;
        const scrollable = docHeight - windowHeight;
        const progress = scrollable > 0 ? scrollY / scrollable : 0;
        setScrollProgress(progress);

        const viewportCenter = scrollY + windowHeight * 0.35;
        for (let i = NAV_POINTS.length - 1; i >= 0; i--) {
          const pt = NAV_POINTS[i];
          if (!pt) continue;
          const el = document.getElementById(pt.id);
          if (el && el.offsetTop <= viewportCenter) {
            setActiveId(pt.id);
            break;
          }
        }
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      isMounted = false;
      if (animId !== null) cancelAnimationFrame(animId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const rect = el.getBoundingClientRect();
      const targetY = window.scrollY + rect.top - 60;
      window.scrollTo({
        top: Math.max(0, targetY),
        behavior: 'smooth',
      });
    }
  };

  return (
    <nav
      className={styles.statusBar}
      aria-label="Flight Telemetry Navigation Status Bar"
    >
      {/* Left: Engine Kernel Info */}
      <div className={styles.statusLeft}>
        <span className={styles.dotNominal} />
        <span className={styles.statusEngineText}>
          ORBITSCORE // DETERMINISTIC TELEMETRY ENGINE v4.2
        </span>
      </div>

      {/* Center: Command Section Quick Jumps */}
      <nav className={styles.statusCenter} aria-label="Section Quick-Jumps">
        <ul className={styles.jumpList}>
          {NAV_POINTS.map((pt) => {
            const isActive = activeId === pt.id;
            return (
              <li key={pt.id}>
                <button
                  type="button"
                  onClick={() => scrollTo(pt.id)}
                  className={`${styles.jumpBtn} ${isActive ? styles.jumpBtnActive : ''}`}
                  aria-current={isActive ? 'location' : undefined}
                >
                  <span className={styles.jumpCode}>{pt.code}</span>
                  <span className={styles.jumpLabel}>{pt.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Right: Telemetry & Scroll Tabular Metric */}
      <div className={styles.statusRight}>
        <span className={styles.enginePill}>FASTAPI: 127.0.0.1:8000</span>
        <span className={styles.scrollProgressText}>
          POS: {Math.round(scrollProgress * 100)}%
        </span>
      </div>
    </nav>
  );
};

export default OrbitHudNav;
