/**
 * Typed Event Bus for the Cinematic WebGL System
 * Decouples the 3D engine, camera rig, audio synthesizer, and React overlays.
 */

import { QualityTier } from '../config/quality.config';

export type EventMap = {
  'cta:hover': void;
  'cta:unhover': void;
  'chromatic:play': { duration?: number };
  'experienceStart': void;
  'state:change': { from: string; to: string };
  'chapter:change': { chapterIndex: number; chapterId: string; progress: number };
  'scroll:progress': { progress: number; rawScroll: number; velocity: number };
  'audio:toggle': { muted: boolean };
  'audio:cue': { name: string };
  'quality:change': { tier: QualityTier };
  'target:select': { targetId: string; label: string };
  'engine:fallback': { reason: string };
};

type EventHandler<T> = (data: T) => void;

class TypedEventBus {
  private handlers = new Map<keyof EventMap, Set<EventHandler<any>>>();

  on<K extends keyof EventMap>(event: K, handler: EventHandler<EventMap[K]>): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    const set = this.handlers.get(event)!;
    set.add(handler);
    return () => this.off(event, handler);
  }

  off<K extends keyof EventMap>(event: K, handler: EventHandler<EventMap[K]>): void {
    const set = this.handlers.get(event);
    if (set) {
      set.delete(handler);
    }
  }

  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    const set = this.handlers.get(event);
    if (set) {
      set.forEach((fn) => {
        try {
          fn(data);
        } catch (err) {
          console.error(`[EventBus] Error in handler for event "${event}":`, err);
        }
      });
    }
  }

  clear(): void {
    this.handlers.clear();
  }
}

export const eventBus = new TypedEventBus();
