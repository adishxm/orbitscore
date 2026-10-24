import React, { useEffect, useState } from 'react';
import styles from './OrbitHudNav.module.css';

interface HudSection {
  id: string;
  key: string;
  title: string;
  subSections: { id: string; label: string }[];
}

const HUD_SECTIONS: HudSection[] = [
  {
    id: 'hero-section',
    key: 'DISCOVERY',
    title: 'MISSION DISCOVERY',
    subSections: [
      { id: 'hero-section', label: 'Overview' },
      { id: 'challenge-section', label: 'Challenge' },
      { id: 'solution-section', label: 'Solution' },
    ],
  },
  {
    id: 'workflow-section',
    key: 'WORKFLOW',
    title: 'TWO-STEP WORKFLOW',
    subSections: [
      { id: 'workflow-section', label: 'Ingest' },
      { id: 'stepper-section', label: '6-Stage Gate' },
    ],
  },
  {
    id: 'subsystems-section',
    key: 'SUBSYSTEMS',
    title: 'EVIDENCE TELEMETRY',
    subSections: [
      { id: 'subsystems-section', label: 'Parameters' },
      { id: 'states-section', label: '5 States' },
    ],
  },
  {
    id: 'limits-section',
    key: 'GOVERNANCE',
    title: 'BOUNDARY MATRIX',
    subSections: [
      { id: 'limits-section', label: 'Scope' },
      { id: 'traceability-section', label: 'Citation Chain' },
    ],
  },
  {
    id: 'backend-section',
    key: 'OPERATIONAL',
    title: 'LIVE PROVENANCE',
    subSections: [
      { id: 'backend-section', label: 'Live Core' },
      { id: 'missions-section', label: 'Workspaces' },
    ],
  },
];

export const OrbitHudNav: React.FC = () => {
  const [activeSectionId, setActiveSectionId] = useState<string>('hero-section');
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollY / docHeight : 0;
      setScrollProgress(progress);

      // Determine which section is currently centered in viewport
      const viewportCenter = scrollY + window.innerHeight * 0.35;
      for (let i = HUD_SECTIONS.length - 1; i >= 0; i--) {
        const sec = HUD_SECTIONS[i];
        if (!sec) continue;
        const el = document.getElementById(sec.id);
        if (el && el.offsetTop <= viewportCenter) {
          setActiveSectionId(sec.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className={styles.hudNav} aria-label="Scroll-Driven Mission Progress HUD">
      <div className={styles.hudInner}>
        {HUD_SECTIONS.map((sec) => {
          const isActive = activeSectionId === sec.id;
          return (
            <div
              key={sec.id}
              className={`${styles.navSection} ${isActive ? styles.navSectionActive : ''}`}
            >
              <div className={styles.sectionHeader}>
                <span className={styles.sectionKey}>{sec.key}</span>
                <span className={styles.sectionTitle}>{sec.title}</span>
              </div>
              <div className={styles.subList}>
                {sec.subSections.map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => scrollTo(sub.id)}
                    className={styles.subBtn}
                  >
                    <span>{sub.label}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className={styles.progressBarBg} aria-hidden="true">
        <div
          className={styles.progressBarFill}
          style={{ width: `${Math.round(scrollProgress * 100)}%` }}
        />
      </div>
    </nav>
  );
};
