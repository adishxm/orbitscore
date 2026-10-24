import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cinematicEngine } from './engine/Engine';
import { scrollEngine } from './timeline/ScrollEngine';
import { stateMachine, AppState } from './app/StateMachine';
import { CinematicLoader } from './ui/CinematicLoader';
import { CinematicHUD } from './ui/CinematicHUD';
import { AccessibleFallback } from './ui/AccessibleFallback';
import { CHAPTERS } from './config/chapters.config';
import styles from './CinematicExperience.module.css';

export const CinematicExperience: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [appState, setAppState] = useState<AppState>('BOOT');
  const [fallbackReason, setFallbackReason] = useState<string | undefined>();
  const [isEngineReady, setIsEngineReady] = useState<boolean>(false);

  useEffect(() => {
    // 1. Subscribe to State Machine
    const unsub = stateMachine.subscribe((ctx) => {
      setAppState(ctx.currentState);
      if (ctx.fallbackReason) {
        setFallbackReason(ctx.fallbackReason);
      }
    });

    // 2. Initialize 3D Engine on Canvas
    if (canvasRef.current) {
      const success = cinematicEngine.init(canvasRef.current);
      if (success) {
        setIsEngineReady(true);
        scrollEngine.start();
      }
    }

    // 3. Pointer move listener for damped parallax
    const onPointerMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      cinematicEngine.setPointer(x, y);
    };

    // 4. Resize listener with ResizeObserver
    const onResize = () => {
      if (canvasRef.current) {
        cinematicEngine.resize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('mousemove', onPointerMove, { passive: true });
    window.addEventListener('resize', onResize);

    return () => {
      unsub();
      scrollEngine.stop();
      cinematicEngine.dispose();
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  if (appState === 'FALLBACK') {
    return <AccessibleFallback reason={fallbackReason} />;
  }

  const showHUD = appState === 'INTRO' || appState === 'JOURNEY' || appState === 'END';

  return (
    <div className={styles.cinematicContainer}>
      {/* Primary Fullscreen WebGL Canvas */}
      <canvas ref={canvasRef} className={styles.webglCanvas} tabIndex={-1} aria-hidden="true" />

      {/* Cinematic Splash Loader & Audio Gate */}
      <CinematicLoader isEngineReady={isEngineReady} />

      {/* Live Tactical HUD Overlays */}
      {showHUD && <CinematicHUD />}

      {/* Direct Workspace Action Link */}
      {showHUD && (
        <div className={styles.floatingFooter}>
          <Link to="/missions/asteria-3" className={styles.workspaceLink} aria-label="Open Asteria-3 Mission Workspace">
            <span>Open Asteria-3 Workspace</span>
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      )}

      {/* Semantic Crawlable & Screen-Reader Accessible HTML Layer */}
      <div className={styles.srContent}>
        <h2>OrbitScore: Mission Evidence Workspace</h2>
        <p>A source-linked pre-review workspace for student, university, and small spacecraft engineering teams.</p>
        <h3>Cinematic Mission Chapters</h3>
        <ol>
          {CHAPTERS.map((ch) => (
            <li key={ch.id}>
              <h4>{ch.title}</h4>
              <p>{ch.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default CinematicExperience;
