/**
 * Virtual Scroll Engine
 * Mapped across 32,000 px virtual track length with lerp smoothing, snap waypoints, and keyboard jumps.
 */

import { TOKENS } from '../config/tokens';
import { eventBus } from '../app/EventBus';
import { clamp, lerp } from '../utils/math';

export class ScrollEngine {
  private targetProgress = 0;
  private currentProgress = 0;
  private velocity = 0;
  private isSnapping = false;
  private lastScrollTime = 0;
  private touchStartY = 0;
  private isTouching = false;
  private rafId: number | null = null;
  private isRunning = false;

  constructor() {
    this.bindInputs();
  }

  get progress(): number {
    return this.currentProgress;
  }

  private bindInputs(): void {
    if (typeof window === 'undefined') return;

    // 1. Wheel input
    window.addEventListener(
      'wheel',
      (e) => {
        const deltaNormalized = e.deltaY / TOKENS.scroll.totalScrollPx;
        this.addScroll(deltaNormalized);
      },
      { passive: true }
    );

    // 2. Keyboard Navigation (Arrows, PageUp/Down, Home/End, 1-6 keys)
    window.addEventListener('keydown', (e) => {
      // Avoid intercepting input if typing in forms
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      switch (e.key) {
        case 'ArrowDown':
        case 'PageDown':
          e.preventDefault();
          this.addScroll(TOKENS.scroll.keyStep);
          break;
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          this.addScroll(-TOKENS.scroll.keyStep);
          break;
        case 'Home':
          e.preventDefault();
          this.jumpTo(0.0);
          break;
        case 'End':
          e.preventDefault();
          this.jumpTo(1.0);
          break;
        case '1':
          this.jumpTo(0.06);
          break;
        case '2':
          this.jumpTo(0.205);
          break;
        case '3':
          this.jumpTo(0.44);
          break;
        case '4':
          this.jumpTo(0.61);
          break;
        case '5':
          this.jumpTo(0.78);
          break;
        case '6':
          this.jumpTo(1.0);
          break;
      }
    });

    // 3. Touch Drag with Inertia
    window.addEventListener(
      'touchstart',
      (e) => {
        if (e.touches[0]) {
          this.touchStartY = e.touches[0].clientY;
          this.isTouching = true;
        }
      },
      { passive: true }
    );

    window.addEventListener(
      'touchmove',
      (e) => {
        if (!this.isTouching || !e.touches[0]) return;
        const currentY = e.touches[0].clientY;
        const deltaPx = this.touchStartY - currentY;
        this.touchStartY = currentY;

        // Mobile touch sensitivity
        const deltaProgress = (deltaPx * 2.2) / TOKENS.scroll.totalScrollPx;
        this.addScroll(deltaProgress);
      },
      { passive: true }
    );

    window.addEventListener('touchend', () => {
      this.isTouching = false;
    });
  }

  addScroll(delta: number): void {
    this.targetProgress = clamp(this.targetProgress + delta, 0.0, 1.0);
    this.lastScrollTime = performance.now();
    this.isSnapping = false;
  }

  jumpTo(progress: number): void {
    this.targetProgress = clamp(progress, 0.0, 1.0);
    this.lastScrollTime = performance.now();
    this.isSnapping = false;
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.tick();
  }

  stop(): void {
    this.isRunning = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private tick = (): void => {
    if (!this.isRunning) return;

    const prev = this.currentProgress;

    // Check for idle waypoint snapping
    const idleSeconds = (performance.now() - this.lastScrollTime) / 1000;
    if (TOKENS.scroll.snapEnabled && idleSeconds >= TOKENS.scroll.snapDelaySeconds && !this.isSnapping) {
      for (const snapPoint of TOKENS.scroll.snapPoints) {
        if (Math.abs(this.targetProgress - snapPoint) <= TOKENS.scroll.snapRange) {
          this.targetProgress = snapPoint;
          this.isSnapping = true;
          break;
        }
      }
    }

    // Lerp progress smoothing
    this.currentProgress = lerp(this.currentProgress, this.targetProgress, TOKENS.scroll.lerpSpeed);
    this.velocity = Math.abs(this.currentProgress - prev);

    // Emit event if moved
    if (Math.abs(this.currentProgress - prev) > 0.00001) {
      eventBus.emit('scroll:progress', {
        progress: this.currentProgress,
        rawScroll: this.currentProgress * TOKENS.scroll.totalScrollPx,
        velocity: this.velocity,
      });
    }

    this.rafId = requestAnimationFrame(this.tick);
  };
}

export const scrollEngine = new ScrollEngine();
