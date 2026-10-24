/**
 * Web Audio Engine & Procedural Sound Design
 * Zero external payloads: synthesized multi-stem ambient bed, cross-fades, and interaction cues.
 */

import { TOKENS } from '../config/tokens';
import { eventBus } from '../app/EventBus';
import { CHAPTERS } from '../config/chapters.config';

export class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private limiter: DynamicsCompressorNode | null = null;

  // Stems
  private melodyGain: GainNode | null = null;
  private bassGain: GainNode | null = null;
  private instrumentsGain: GainNode | null = null;

  // Synthesis Oscillators & Nodes
  private bassOsc: OscillatorNode | null = null;
  private melodyOscA: OscillatorNode | null = null;
  private melodyOscB: OscillatorNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private noiseFilter: BiquadFilterNode | null = null;

  private isMuted = true;
  private isInitialized = false;

  constructor() {
    this.bindEvents();
  }

  private bindEvents(): void {
    eventBus.on('experienceStart', () => {
      this.init();
      this.setMuted(false);
    });

    eventBus.on('audio:toggle', ({ muted }) => {
      this.setMuted(muted);
    });

    eventBus.on('audio:cue', ({ name }) => {
      this.playCue(name);
    });

    eventBus.on('scroll:progress', ({ progress, velocity }) => {
      this.updateMix(progress, velocity);
    });

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (!this.ctx) return;
        if (document.hidden) {
          this.ctx.suspend();
        } else if (!this.isMuted) {
          this.ctx.resume();
        }
      });
    }
  }

  init(): void {
    if (this.isInitialized || typeof window === 'undefined') return;

    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtxClass();

      // Master Limiter
      this.limiter = this.ctx.createDynamicsCompressor();
      this.limiter.threshold.setValueAtTime(-1.0, this.ctx.currentTime);
      this.limiter.knee.setValueAtTime(4.0, this.ctx.currentTime);
      this.limiter.ratio.setValueAtTime(12.0, this.ctx.currentTime);
      this.limiter.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.limiter.release.setValueAtTime(0.25, this.ctx.currentTime);
      this.limiter.connect(this.ctx.destination);

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.masterGain.connect(this.limiter);

      // Stem Buses
      this.melodyGain = this.ctx.createGain();
      this.melodyGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.melodyGain.connect(this.masterGain);

      this.bassGain = this.ctx.createGain();
      this.bassGain.gain.setValueAtTime(0.6, this.ctx.currentTime);
      this.bassGain.connect(this.masterGain);

      this.instrumentsGain = this.ctx.createGain();
      this.instrumentsGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.instrumentsGain.connect(this.masterGain);

      // 1. Procedural Sub-Bass Drone (55 Hz A1)
      this.bassOsc = this.ctx.createOscillator();
      this.bassOsc.type = 'sine';
      this.bassOsc.frequency.setValueAtTime(55, this.ctx.currentTime);

      const bassFilter = this.ctx.createBiquadFilter();
      bassFilter.type = 'lowpass';
      bassFilter.frequency.setValueAtTime(160, this.ctx.currentTime);

      this.bassOsc.connect(bassFilter);
      bassFilter.connect(this.bassGain);
      this.bassOsc.start();

      // 2. Procedural Ambient Melody Pad (Dual Detuned Triangle/Sine)
      this.melodyOscA = this.ctx.createOscillator();
      this.melodyOscA.type = 'triangle';
      this.melodyOscA.frequency.setValueAtTime(220, this.ctx.currentTime);

      this.melodyOscB = this.ctx.createOscillator();
      this.melodyOscB.type = 'sine';
      this.melodyOscB.frequency.setValueAtTime(330, this.ctx.currentTime);
      this.melodyOscB.detune.setValueAtTime(7, this.ctx.currentTime);

      const melodyFilter = this.ctx.createBiquadFilter();
      melodyFilter.type = 'lowpass';
      melodyFilter.frequency.setValueAtTime(600, this.ctx.currentTime);

      this.melodyOscA.connect(melodyFilter);
      this.melodyOscB.connect(melodyFilter);
      melodyFilter.connect(this.melodyGain);

      this.melodyOscA.start();
      this.melodyOscB.start();

      // 3. Filtered Noise Shimmer (Instruments Stem)
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = noiseBuffer;
      this.noiseNode.loop = true;

      this.noiseFilter = this.ctx.createBiquadFilter();
      this.noiseFilter.type = 'bandpass';
      this.noiseFilter.frequency.setValueAtTime(1200, this.ctx.currentTime);
      this.noiseFilter.Q.setValueAtTime(3.0, this.ctx.currentTime);

      this.noiseNode.connect(this.noiseFilter);
      this.noiseFilter.connect(this.instrumentsGain);
      this.noiseNode.start();

      this.isInitialized = true;
    } catch (err) {
      console.warn('[AudioManager] Failed to initialize AudioContext:', err);
    }
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (!this.ctx || !this.masterGain) return;

    if (this.ctx.state === 'suspended' && !muted) {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    const targetGain = muted ? 0.0 : TOKENS.audio.masterVolume * 0.45;
    this.masterGain.gain.setTargetAtTime(targetGain, now, 0.5);
  }

  updateMix(progress: number, velocity: number): void {
    if (!this.ctx || !this.isInitialized || this.isMuted) return;

    let activeChapter = CHAPTERS[0]!;
    for (const ch of CHAPTERS) {
      if (progress >= ch.scroll.start && progress <= ch.scroll.end) {
        activeChapter = ch;
        break;
      }
    }

    const { melody, bass, instruments } = activeChapter.audio.stems;
    const now = this.ctx.currentTime;
    const fadeTau = TOKENS.audio.stemFadeDurSeconds;

    if (this.melodyGain) this.melodyGain.gain.setTargetAtTime(melody, now, fadeTau);
    if (this.bassGain) this.bassGain.gain.setTargetAtTime(bass, now, fadeTau);
    if (this.instrumentsGain) this.instrumentsGain.gain.setTargetAtTime(instruments, now, fadeTau);

    // Filter opening on scroll velocity
    if (this.noiseFilter) {
      const baseFreq = 1000 + velocity * 15000;
      this.noiseFilter.frequency.setTargetAtTime(Math.min(4000, baseFreq), now, 0.1);
    }
  }

  playCue(name: string): void {
    if (!this.ctx || this.isMuted) return;

    switch (name) {
      case 'click':
      case 'btn':
        this.playDigitalClick();
        break;
      case 'scramble':
        this.playScrambleTick();
        break;
      case 'chime':
        this.playHarmonicChime();
        break;
      default:
        this.playDigitalClick();
        break;
    }
  }

  private playDigitalClick(): void {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.035);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.035);

    osc.connect(gain);
    gain.connect(this.masterGain || this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  private playScrambleTick(): void {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(800 + Math.random() * 600, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.02);

    osc.connect(gain);
    gain.connect(this.masterGain || this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.025);
  }

  private playHarmonicChime(): void {
    if (!this.ctx) return;
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5 major arpeggio
    freqs.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = this.ctx.currentTime + i * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.12, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);

      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.65);
    });
  }
}

export const audioManager = new AudioManager();
