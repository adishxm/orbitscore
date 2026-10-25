import React, { useEffect, useState } from 'react';
import { ConnectionStatus } from './ConnectionStatus';
import styles from './OrbitHudNav.module.css';

interface NavPoint {
  id: string;
  code: string;
  label: string;
}

const NAV_POINTS: NavPoint[] = [
  { id: 'hero-section', code: '01', label: 'Overview' },
  { id: 'telemetry-section', code: '02', label: 'Fleet' },
  { id: 'matrix-section', code: '03', label: 'Rules' },
  { id: 'workflow-section', code: '04', label: 'Workflow' },
  { id: 'states-section', code: '05', label: 'Citations' },
  { id: 'lineage-section', code: '06', label: 'Ledger' },
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
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const pct = Math.round(scrollProgress * 100);

  return (
    <div className={styles.statusBarWrapper} role="region" aria-label="Flight Telemetry Navigation Status Bar">
      <nav className={styles.statusBar}>
        {/* Left: Engine Kernel Info */}
        <div className={styles.statusLeft}>
          <span className={styles.dotNominal} />
          <span className={styles.statusEngineText}>
            ORBITSCORE // KERNEL v4.2
          </span>
        </div>

        {/* Center: Command Section Quick Jumps */}
        <div className={styles.statusCenter}>
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
        </div>

        {/* Right: Thin Scroll-Progress Line with Percentage + Compact ConnectionStatus */}
        <div className={styles.statusRight}>
          <ConnectionStatus compact />

          <div className={styles.scrollProgressTrack} title={`Page Scroll Progress: ${pct}%`}>
            <div
              className={styles.scrollProgressBar}
              style={{ width: `${pct}%` }}
              aria-hidden="true"
            />
            <span className={styles.scrollProgressText}>POS: {pct}%</span>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default OrbitHudNav;
