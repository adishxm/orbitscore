import React, { useState, useEffect, useRef } from 'react';
import { TOKENS } from '../config/tokens';
import { stateMachine } from '../app/StateMachine';
import { eventBus } from '../app/EventBus';
import styles from './CinematicLoader.module.css';

interface CinematicLoaderProps {
  onComplete?: () => void;
  isEngineReady?: boolean;
}

export const CinematicLoader: React.FC<CinematicLoaderProps> = ({ onComplete, isEngineReady = true }) => {
  const [displayPercent, setDisplayPercent] = useState<number>(0);
  const [phase, setPhase] = useState<'loading' | 'curtain_open' | 'docked' | 'clicked' | 'dismissed'>('loading');
  const [isBlinking, setIsBlinking] = useState<boolean>(false);

  const startTimeRef = useRef<number>(Date.now());
  const rafRef = useRef<number | null>(null);

  // Replay check from sessionStorage
  const isReplay = typeof window !== 'undefined' && sessionStorage.getItem('orbitscoreReplay') === '1';

  useEffect(() => {
    stateMachine.transition('LOADING');
    const minHoldMs = isReplay ? 0 : TOKENS.motion.revealMinMs;

    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const targetPercent = isEngineReady
        ? Math.min(100, Math.floor((elapsed / (TOKENS.motion.fakeFillMs + 200)) * 100))
        : Math.min(85, Math.floor((elapsed / TOKENS.motion.fakeFillMs) * 75));

      setDisplayPercent((prev) => {
        const next = prev + (targetPercent - prev) * TOKENS.motion.easePerFrame;
        const rounded = Math.min(100, Math.floor(next));

        // Check if loading criteria met
        if (rounded >= 100 && elapsed >= minHoldMs && isEngineReady) {
          if (phase === 'loading') {
            triggerRevealSequence();
          }
          return 100;
        }
        return rounded;
      });

      if (phase === 'loading') {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isEngineReady, isReplay, phase]);

  const triggerRevealSequence = () => {
    // 1. Settle pause then open split curtain bands
    setTimeout(() => {
      setPhase('curtain_open');

      // 2. Logo docks to header
      setTimeout(() => {
        setPhase('docked');
        stateMachine.transition('GATE');
      }, 600);
    }, TOKENS.motion.revealSettleMs);
  };

  const handleCtaClick = () => {
    if (phase !== 'docked') return;

    setIsBlinking(true);
    setPhase('clicked');

    // Trigger visual flourish and audio start
    eventBus.emit('chromatic:play', { duration: 0.8 });
    eventBus.emit('experienceStart', undefined);
    stateMachine.setAudioMuted(false);
    stateMachine.markUserInteracted();
    stateMachine.transition('INTRO');

    setTimeout(() => {
      stateMachine.transition('JOURNEY');
      setPhase('dismissed');
      onComplete?.();
    }, 1500);
  };

  if (phase === 'dismissed') return null;

  // Split digits for rolling reels
  const hundreds = Math.floor(displayPercent / 100);
  const tens = Math.floor((displayPercent % 100) / 10);
  const units = Math.floor(displayPercent % 10);

  const isBandsOpen = phase !== 'loading';
  const isDocked = phase === 'docked' || phase === 'clicked';
  const isClicked = phase === 'clicked';

  return (
    <div
      className={`${styles.splashWrapper} ${isBandsOpen ? styles.bandsOpen : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Mission Intelligence Loading Sequence"
    >
      {/* 50% Black Scrim Layer */}
      <div className={`${styles.scrim} ${isClicked ? styles.scrimClicked : ''}`} aria-hidden="true" />

      {/* Split Curtain Bands */}
      <div className={`${styles.bandTop} ${isBandsOpen ? styles.bandTopOpen : ''}`} aria-hidden="true" />
      <div className={`${styles.bandBottom} ${isBandsOpen ? styles.bandBottomOpen : ''}`} aria-hidden="true" />

      {/* Center / Docking Wordmark Logo */}
      <div
        className={`${styles.splashLogo} ${isDocked ? styles.logoDocked : styles.logoCenter}`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 155 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={styles.logoSvg}
        >
          {/* Stylized ORBITSCORE Technical Monogram */}
          <path
            d="M14 26C20.6274 26 26 20.6274 26 14C26 7.37258 20.6274 2 14 2C7.37258 2 2 7.37258 2 14C2 20.6274 7.37258 26 14 26Z"
            stroke="#ffffff"
            strokeWidth="3.2"
          />
          <path d="M2 14H26" stroke="#00a1ff" strokeWidth="2" strokeDasharray="3 3" />
          <path d="M14 2V26" stroke="#ffffff" strokeWidth="1.5" />
          <text
            x="36"
            y="20"
            fill="#ffffff"
            fontFamily="Space Grotesk, sans-serif"
            fontWeight="700"
            fontSize="18"
            letterSpacing="0.08em"
          >
            ORBITSCORE
          </text>
        </svg>
      </div>

      {/* Progress Readout (Only visible in loading phase) */}
      <div
        className={`${styles.progressContainer} ${isBandsOpen ? styles.progressHidden : ''}`}
        style={{ top: 'calc(50% + 40px)' }}
        aria-live="polite"
        aria-label={`System Initialization: ${displayPercent}%`}
      >
        {/* Hundreds Reel */}
        <span className={styles.digitCol}>
          <span className={styles.digitReel} style={{ transform: `translateY(-${hundreds * 1.2}em)` }}>
            {[0, 1].map((d) => (
              <span key={d} className={styles.digitChar}>
                {d === 0 ? '' : d}
              </span>
            ))}
          </span>
        </span>

        {/* Tens Reel */}
        <span className={styles.digitCol}>
          <span className={styles.digitReel} style={{ transform: `translateY(-${tens * 1.2}em)` }}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
              <span key={d} className={styles.digitChar}>
                {d}
              </span>
            ))}
          </span>
        </span>

        {/* Units Reel */}
        <span className={styles.digitCol}>
          <span className={styles.digitReel} style={{ transform: `translateY(-${units * 1.2}em)` }}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
              <span key={d} className={styles.digitChar}>
                {d}
              </span>
            ))}
          </span>
        </span>

        <span className={styles.pctSign}>%</span>
      </div>

      {/* Title Group revealed after curtain bands open */}
      <div
        className={`${styles.titleGroup} ${
          isDocked && !isClicked
            ? styles.titleGroupVisible
            : isClicked
            ? styles.titleGroupDismissed
            : ''
        }`}
      >
        <h2 className={styles.displayTitle}>
          ORBITAL EVIDENCE{'\n'}AT PLANETARY SCALE
        </h2>
        <p className={styles.subtitle}>
          ORCHESTRATING THE FOUNDATION OF MISSION VERIFICATION{'\n'}FROM LOW EARTH ORBIT.
        </p>

        {/* Fixed-Height Slot with Interactive CTA */}
        <div className={styles.ctaSlot}>
          <button
            type="button"
            id="cinematic-initiate-btn"
            className={`${styles.ctaButton} ${isBlinking ? styles.ctaBlink : ''}`}
            onClick={handleCtaClick}
            onMouseEnter={() => eventBus.emit('cta:hover', undefined)}
            onMouseLeave={() => eventBus.emit('cta:unhover', undefined)}
            aria-label="Initiate OrbitScore System with Audio"
          >
            <span className={styles.ctaLabel}>INITIATE SYSTEM</span>
          </button>
        </div>
      </div>

      {/* Bottom Headphones Audio Notice */}
      <div
        className={`${styles.headphonesNotice} ${
          isDocked && !isClicked
            ? styles.headphonesVisible
            : isClicked
            ? styles.headphonesDismissed
            : ''
        }`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" className={styles.headphonesIcon} aria-hidden="true">
          <path d="M12 3a9 9 0 0 0-9 9v7a3 3 0 0 0 3 3h1a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1H5v-2a7 7 0 1 1 14 0v2h-2a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h1a3 3 0 0 0 3-3v-7a9 9 0 0 0-9-9z" />
        </svg>
        <span className={styles.headphonesText}>Experience with headphones</span>
      </div>
    </div>
  );
};

export default CinematicLoader;
