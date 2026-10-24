import { describe, it, expect, vi, beforeEach } from 'vitest';
import { eventBus } from '../cinematic/app/EventBus';
import { stateMachine } from '../cinematic/app/StateMachine';
import { qualityManager } from '../cinematic/engine/QualityManager';
import { CHAPTERS } from '../cinematic/config/chapters.config';
import { TOKENS } from '../cinematic/config/tokens';

describe('Cinematic Experience Architecture Tests', () => {
  beforeEach(() => {
    eventBus.clear();
  });

  describe('EventBus', () => {
    it('publishes and subscribes to events with payload', () => {
      const fn = vi.fn();
      const unsub = eventBus.on('scroll:progress', fn);

      eventBus.emit('scroll:progress', { progress: 0.42, rawScroll: 13440, velocity: 1.2 });
      expect(fn).toHaveBeenCalledWith({ progress: 0.42, rawScroll: 13440, velocity: 1.2 });

      unsub();
      eventBus.emit('scroll:progress', { progress: 0.5, rawScroll: 16000, velocity: 0 });
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('clears all listeners on clear', () => {
      const fn1 = vi.fn();
      const fn2 = vi.fn();
      eventBus.on('audio:toggle', fn1);
      eventBus.on('quality:change', fn2);

      eventBus.clear();
      eventBus.emit('audio:toggle', { muted: false });
      eventBus.emit('quality:change', { tier: 'LOW' });

      expect(fn1).not.toHaveBeenCalled();
      expect(fn2).not.toHaveBeenCalled();
    });
  });

  describe('StateMachine', () => {
    it('supports subscription and context querying', () => {
      const listener = vi.fn();
      const unsub = stateMachine.subscribe(listener);

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          currentState: expect.any(String),
          activeChapterIndex: expect.any(Number),
        })
      );

      unsub();
    });

    it('manages loading progress within [0, 1] bounds', () => {
      stateMachine.setLoadingProgress(0.5);
      expect(stateMachine.context.loadingProgress).toBeGreaterThanOrEqual(0.5);

      stateMachine.setLoadingProgress(1.5);
      expect(stateMachine.context.loadingProgress).toBe(1.0);
    });

    it('updates active chapter on navigation', () => {
      stateMachine.setActiveChapter(3);
      expect(stateMachine.context.activeChapterIndex).toBe(3);
    });

    it('toggles audio mute and notifies listeners', () => {
      const audioListener = vi.fn();
      const unsub = eventBus.on('audio:toggle', audioListener);

      stateMachine.setAudioMuted(false);
      expect(stateMachine.context.isAudioMuted).toBe(false);
      expect(audioListener).toHaveBeenCalledWith({ muted: false });

      unsub();
    });
  });

  describe('QualityManager', () => {
    it('initializes with a valid quality tier and profile', () => {
      const currentTier = qualityManager.tier;
      expect(['HIGH', 'MEDIUM', 'LOW']).toContain(currentTier);

      const profile = qualityManager.profile;
      expect(profile.maxDpr).toBeGreaterThanOrEqual(1.0);
      expect(profile.maxDpr).toBeLessThanOrEqual(2.0);
      expect(profile.particles).toBeGreaterThan(0);
      expect(typeof profile.bloom).toBe('boolean');
    });

    it('clamps DPR correctly against current profile maximum', () => {
      const clamped = qualityManager.clampDpr(3.0);
      expect(clamped).toBeLessThanOrEqual(qualityManager.profile.maxDpr);
    });

    it('downgrades gracefully under slow frame sequences', () => {
      const listener = vi.fn();
      const unsub = eventBus.on('quality:change', listener);

      qualityManager.downgrade('manual test downgrade');
      expect(['MEDIUM', 'LOW']).toContain(qualityManager.tier);

      unsub();
    });
  });

  describe('Chapters Config & Storyline Integrity', () => {
    it('defines exactly 6 chapters matching Master Specification narrative', () => {
      expect(CHAPTERS).toHaveLength(6);
    });

    it('maintains continuous, non-overlapping scroll intervals spanning [0, 1]', () => {
      expect(CHAPTERS[0]!.scroll.start).toBe(0.0);
      expect(CHAPTERS[CHAPTERS.length - 1]!.scroll.end).toBe(1.0);

      for (let i = 0; i < CHAPTERS.length; i++) {
        const ch = CHAPTERS[i]!;
        expect(ch.scroll.start).toBeLessThan(ch.scroll.end);
        expect(ch.index).toBe(i + 1);

        if (i > 0) {
          const prev = CHAPTERS[i - 1]!;
          expect(ch.scroll.start).toBeCloseTo(prev.scroll.end, 2);
        }
      }
    });

    it('supplies required camera keys and valid ease for each chapter', () => {
      for (const ch of CHAPTERS) {
        expect(ch.camera.keys.length).toBeGreaterThanOrEqual(2);
        for (const key of ch.camera.keys) {
          expect(key.position).toHaveLength(3);
          expect(key.lookAt).toHaveLength(3);
          expect(key.fov).toBeGreaterThan(20);
          expect(key.fov).toBeLessThan(90);
        }
      }
    });

    it('contains measured tokens aligned with audit specifications', () => {
      expect(TOKENS.colors.background.black).toBe('#000000');
      expect(TOKENS.colors.accents.cyan).toBe('#00a1ff');
      expect(TOKENS.colors.text.white).toBe('#ffffff');
      expect(TOKENS.scroll.totalScrollPx).toBe(32000);
      expect(TOKENS.scroll.snapPoints).toHaveLength(7);
      expect(TOKENS.motion.revealMinMs).toBe(3000);
    });
  });
});
