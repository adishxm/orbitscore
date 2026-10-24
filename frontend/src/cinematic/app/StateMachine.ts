/**
 * Application Lifecycle State Machine
 * BOOT -> LOADING -> GATE -> INTRO -> JOURNEY -> END (with FALLBACK reachable from BOOT and LOADING)
 */

import { eventBus } from './EventBus';

export type AppState = 'BOOT' | 'LOADING' | 'GATE' | 'INTRO' | 'JOURNEY' | 'END' | 'FALLBACK';

export interface StateContext {
  currentState: AppState;
  previousState: AppState | null;
  activeChapterIndex: number;
  loadingProgress: number;
  isAudioMuted: boolean;
  hasUserInteracted: boolean;
  isReducedMotion: boolean;
  fallbackReason?: string;
}

const VALID_TRANSITIONS: Record<AppState, AppState[]> = {
  BOOT: ['LOADING', 'FALLBACK'],
  LOADING: ['GATE', 'FALLBACK'],
  GATE: ['INTRO', 'JOURNEY'],
  INTRO: ['JOURNEY'],
  JOURNEY: ['JOURNEY', 'END'],
  END: ['JOURNEY'], // can return to orbit
  FALLBACK: [],
};

class LifecycleStateMachine {
  private state: StateContext = {
    currentState: 'BOOT',
    previousState: null,
    activeChapterIndex: 1,
    loadingProgress: 0,
    isAudioMuted: true,
    hasUserInteracted: false,
    isReducedMotion: false,
  };

  private listeners = new Set<(state: StateContext) => void>();

  constructor() {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.state.isReducedMotion = mediaQuery.matches;
      mediaQuery.addEventListener('change', (e) => {
        this.state.isReducedMotion = e.matches;
        this.notify();
      });
    }
  }

  get current(): AppState {
    return this.state.currentState;
  }

  get context(): Readonly<StateContext> {
    return this.state;
  }

  transition(next: AppState, meta?: { fallbackReason?: string; chapterIndex?: number }): boolean {
    const validNextStates = VALID_TRANSITIONS[this.state.currentState];
    if (!validNextStates.includes(next)) {
      console.warn(`[StateMachine] Invalid transition requested: ${this.state.currentState} -> ${next}`);
      return false;
    }

    const prev = this.state.currentState;
    this.state.previousState = prev;
    this.state.currentState = next;

    if (meta?.fallbackReason) {
      this.state.fallbackReason = meta.fallbackReason;
    }
    if (meta?.chapterIndex !== undefined) {
      this.state.activeChapterIndex = meta.chapterIndex;
    }

    eventBus.emit('state:change', { from: prev, to: next });
    this.notify();
    return true;
  }

  setLoadingProgress(progress: number): void {
    this.state.loadingProgress = Math.min(1.0, Math.max(this.state.loadingProgress, progress));
    this.notify();
  }

  setActiveChapter(index: number): void {
    if (this.state.activeChapterIndex !== index) {
      this.state.activeChapterIndex = index;
      this.notify();
    }
  }

  setAudioMuted(muted: boolean): void {
    this.state.isAudioMuted = muted;
    eventBus.emit('audio:toggle', { muted });
    this.notify();
  }

  markUserInteracted(): void {
    this.state.hasUserInteracted = true;
    this.notify();
  }

  subscribe(listener: (state: StateContext) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((fn) => {
      try {
        fn(this.state);
      } catch (err) {
        console.error('[StateMachine] Error in state listener:', err);
      }
    });
  }
}

export const stateMachine = new LifecycleStateMachine();
