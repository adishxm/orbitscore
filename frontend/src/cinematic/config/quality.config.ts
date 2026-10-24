/**
 * Quality Tier Profiles and Hardware Classification Configuration
 */

export type QualityTier = 'HIGH' | 'MEDIUM' | 'LOW';

export interface QualityProfile {
  tier: QualityTier;
  dpr: number;
  maxDpr: number;
  particles: number;
  bloom: boolean;
  grain: boolean;
  smaa: boolean;
  shadows: boolean;
  textureScale: number;
}

export const QUALITY_PROFILES: Record<QualityTier, QualityProfile> = {
  HIGH: {
    tier: 'HIGH',
    dpr: 2.0,
    maxDpr: 2.0,
    particles: 120000,
    bloom: true,
    grain: true,
    smaa: true,
    shadows: false, // baked lighting per specification
    textureScale: 1.0,
  },
  MEDIUM: {
    tier: 'MEDIUM',
    dpr: 1.5,
    maxDpr: 1.5,
    particles: 50000,
    bloom: true,
    grain: false,
    smaa: false,
    shadows: false,
    textureScale: 0.75,
  },
  LOW: {
    tier: 'LOW',
    dpr: 1.0,
    maxDpr: 1.0,
    particles: 15000,
    bloom: false,
    grain: false,
    smaa: false,
    shadows: false,
    textureScale: 0.5,
  },
};

export const QUALITY_BENCHMARK = {
  initialEvaluationFrames: 90,
  downgradeThresholdMs: 22.0, // ~45 fps boundary
  downgradeConsecutiveFrames: 60,
  allowMidSessionUpgrade: false,
} as const;
