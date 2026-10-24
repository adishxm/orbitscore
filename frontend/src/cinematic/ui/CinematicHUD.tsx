import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Volume2, VolumeX } from 'lucide-react';
import { CHAPTERS, ChapterConfig } from '../config/chapters.config';
import { scrollEngine } from '../timeline/ScrollEngine';
import { stateMachine } from '../app/StateMachine';
import { eventBus } from '../app/EventBus';
import styles from './CinematicHUD.module.css';

export const CinematicHUD: React.FC = () => {
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(1);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(true);

  useEffect(() => {
    const unsubState = stateMachine.subscribe((ctx) => {
      setActiveChapterIndex(ctx.activeChapterIndex);
      setIsAudioMuted(ctx.isAudioMuted);
    });

    const unsubScroll = eventBus.on('scroll:progress', ({ progress }) => {
      setScrollProgress(progress);
    });

    return () => {
      unsubState();
      unsubScroll();
    };
  }, []);

  const activeChapter: ChapterConfig =
    CHAPTERS.find((c) => c.index === activeChapterIndex) || CHAPTERS[0]!;

  const handleJumpToChapter = (chapter: ChapterConfig) => {
    scrollEngine.jumpTo(chapter.scroll.start + 0.01);
    eventBus.emit('audio:cue', { name: 'click' });
  };

  const handleToggleAudio = () => {
    const nextMuted = !isAudioMuted;
    stateMachine.setAudioMuted(nextMuted);
    eventBus.emit('audio:cue', { name: 'click' });
  };

  return (
    <div className={styles.hudRoot} aria-hidden="false">
      {/* Precision Corner Brackets */}
      <div className={styles.cornerTL} aria-hidden="true" />
      <div className={styles.cornerTR} aria-hidden="true" />
      <div className={styles.cornerBL} aria-hidden="true" />
      <div className={styles.cornerBR} aria-hidden="true" />

      {/* Center Target Reticle */}
      <div className={styles.crosshair} aria-hidden="true" />

      {/* Top Header Bar */}
      <header className={styles.topBar}>
        <Link to="/" className={styles.headerBrand} aria-label="OrbitScore Home">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="#00a1ff" strokeWidth="2" strokeDasharray="3 3" />
            <circle cx="12" cy="12" r="4" fill="#ffffff" />
          </svg>
          <span className={styles.brandWordmark}>ORBITSCORE</span>
        </Link>

        <div className={styles.topControls}>
          {/* Chapter Navigation Rail (01 - 06) */}
          <nav className={styles.chapterRail} aria-label="Cinematic Chapters">
            {CHAPTERS.map((ch) => {
              const isActive = ch.index === activeChapterIndex;
              return (
                <button
                  key={ch.id}
                  type="button"
                  className={`${styles.chapterBtn} ${isActive ? styles.chapterBtnActive : ''}`}
                  onClick={() => handleJumpToChapter(ch)}
                  aria-label={`Jump to Chapter ${ch.index}: ${ch.title}`}
                >
                  0{ch.index}
                </button>
              );
            })}
          </nav>

          {/* Sound Toggle Button */}
          <button
            type="button"
            className={styles.soundBtn}
            onClick={handleToggleAudio}
            aria-label={isAudioMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isAudioMuted ? (
              <>
                <VolumeX size={14} aria-hidden="true" />
                <span>MUTED</span>
              </>
            ) : (
              <>
                <Volume2 size={14} aria-hidden="true" />
                <span className={styles.soundBars} aria-hidden="true">
                  <span className={`${styles.soundBar} ${styles.soundBarPlaying}`} />
                  <span className={`${styles.soundBar} ${styles.soundBarPlaying}`} />
                  <span className={`${styles.soundBar} ${styles.soundBarPlaying}`} />
                </span>
                <span>AUDIO ON</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Live Chapter Telemetry Overlay */}
      <section className={styles.telemetryOverlay} aria-live="polite">
        <div className={styles.kickerRow}>
          <span className={styles.kickerBadge}>{activeChapter.kicker}</span>
        </div>
        <h2 className={styles.chapterTitle}>{activeChapter.title}</h2>
        <p className={styles.chapterDesc}>{activeChapter.subheading}</p>

        <div className={styles.hudPillRow} aria-label="Active Chapter Telemetry">
          {activeChapter.hud.map((item) => (
            <div key={item.id} className={styles.hudPill}>
              <span className={styles.hudPillLabel}>{item.label}:</span>
              <span className={styles.hudPillVal}>
                {item.value} {item.unit ?? ''}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Side Progress Rail */}
      <div className={styles.progressRail} aria-hidden="true">
        <div
          className={styles.progressRailThumb}
          style={{ transform: `translateY(${scrollProgress * 176}px)` }}
        />
      </div>

      {/* Persistent Governance Caption */}
      <p className={styles.persistentCaption} role="note">
        Illustrative synthetic data — not live tracking, collision prediction, or operational guidance.
      </p>
    </div>
  );
};

export default CinematicHUD;
