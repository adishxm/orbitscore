/**
 * Quality Manager & Device Tier Classifier
 * Dynamically benchmarks frame rendering times and adapts DPR and visual tiers.
 */

import { QualityTier, QualityProfile, QUALITY_PROFILES, QUALITY_BENCHMARK } from '../config/quality.config';
import { eventBus } from '../app/EventBus';

export class QualityManager {
  private currentTier: QualityTier = 'HIGH';
  private frameTimes: number[] = [];
  private consecutiveSlowFrames = 0;
  private isBenchmarking = true;
  private totalSampledFrames = 0;

  constructor() {
    this.detectInitialTier();
  }

  get tier(): QualityTier {
    return this.currentTier;
  }

  get profile(): QualityProfile {
    return QUALITY_PROFILES[this.currentTier];
  }

  private detectInitialTier(): void {
    if (typeof window === 'undefined') {
      this.currentTier = 'MEDIUM';
      return;
    }

    const isMobile = window.innerWidth <= 768 || /Mobi|Android|iPhone/i.test(navigator.userAgent);
    const cores = navigator.hardwareConcurrency || 4;

    if (isMobile) {
      this.currentTier = cores >= 8 ? 'MEDIUM' : 'LOW';
    } else {
      this.currentTier = cores >= 6 ? 'HIGH' : 'MEDIUM';
    }
  }

  recordFrame(deltaTimeSeconds: number): void {
    const frameMs = deltaTimeSeconds * 1000;
    this.totalSampledFrames++;

    if (this.isBenchmarking) {
      this.frameTimes.push(frameMs);
      if (this.frameTimes.length >= QUALITY_BENCHMARK.initialEvaluationFrames) {
        this.isBenchmarking = false;
        const avgMs = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
        if (avgMs > QUALITY_BENCHMARK.downgradeThresholdMs) {
          this.downgrade('initial benchmark average exceeded threshold');
        }
      }
      return;
    }

    // Ongoing runtime monitoring for thermal throttling or sudden drop
    if (frameMs > QUALITY_BENCHMARK.downgradeThresholdMs) {
      this.consecutiveSlowFrames++;
      if (this.consecutiveSlowFrames >= QUALITY_BENCHMARK.downgradeConsecutiveFrames) {
        this.downgrade('consecutive frame rate drop detected');
        this.consecutiveSlowFrames = 0;
      }
    } else {
      this.consecutiveSlowFrames = Math.max(0, this.consecutiveSlowFrames - 1);
    }
  }

  downgrade(reason: string): void {
    if (this.currentTier === 'HIGH') {
      this.currentTier = 'MEDIUM';
      console.warn(`[QualityManager] Downgraded to MEDIUM tier: ${reason}`);
      eventBus.emit('quality:change', { tier: 'MEDIUM' });
    } else if (this.currentTier === 'MEDIUM') {
      this.currentTier = 'LOW';
      console.warn(`[QualityManager] Downgraded to LOW tier: ${reason}`);
      eventBus.emit('quality:change', { tier: 'LOW' });
    }
  }

  clampDpr(desiredDpr: number): number {
    return Math.min(desiredDpr, this.profile.maxDpr);
  }
}

export const qualityManager = new QualityManager();
