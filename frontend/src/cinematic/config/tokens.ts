/**
 * OrbitScore Cinematic WebGL Design Tokens
 * Single source of truth derived from measured reference audit and project styles.
 */

export const TOKENS = {
  colors: {
    background: {
      black: '#000000',
      deep: '#05070a',
      base: '#090d12',
      overlay50: 'rgba(0, 0, 0, 0.50)',
      surfaceCard: '#141a23',
    },
    text: {
      white: '#ffffff',
      light: '#f0f4f8',
      muted: '#C4C7C7',
      secondary: '#9daec2',
      dim: '#4d5c6f',
    },
    hairline: {
      subtle: '#1c2530',
      mid: '#2b3644',
      bright: '#3f4e62',
      interactive: '#00a1ff',
    },
    accents: {
      cyan: '#00a1ff',
      cyanHover: '#33b4ff',
      amber: '#f59e0b',
      crimson: '#f43f5e',
      emerald: '#34d399',
      purple: '#c084fc',
    },
  },
  typography: {
    display: {
      fontFamily: "'Space Grotesk', -apple-system, sans-serif",
      heroSize: 'clamp(44px, 8.9vw, 96px)',
      heroWeight: 300,
      heroLineHeight: 1.04,
      heroLetterSpacing: '0.01em',
    },
    subtitle: {
      fontFamily: "'Space Grotesk', -apple-system, sans-serif",
      size: 'clamp(11px, 3.2vw, 14px)',
      weight: 400,
      letterSpacing: '0.12em',
    },
    monospace: {
      fontFamily: "'JetBrains Mono', monospace",
      size: '0.75rem',
      weight: 500,
      letterSpacing: '0.1em',
    },
    body: {
      fontFamily: "'Inter', -apple-system, sans-serif",
      size: '0.9375rem',
      weight: 400,
      lineHeight: 1.6,
    },
  },
  dimensions: {
    loader: {
      logoWidthDesktop: 430,
      logoWidthMobile: 366,
      progressGapPx: 20,
      viewBoxWidth: 155,
      viewBoxHeight: 28,
    },
    header: {
      logoWidthDesktop: 156,
      logoTopDesktop: 40,
      logoLeftDesktop: 60,
      logoWidthMobile: 108,
      logoTopMobile: 20,
      logoLeftMobile: 20,
      breakpointMobile: 768,
    },
    cta: {
      paddingDesktop: '1.2rem 3rem',
      paddingMobile: '0.96rem 2.4rem',
      fontSizeDesktop: '0.75rem',
      fontSizeMobile: '0.6rem',
    },
  },
  scroll: {
    totalScrollPx: 32000,
    lerpSpeed: 0.1,
    keyStep: 0.12,
    snapEnabled: true,
    snapDelaySeconds: 1.0,
    snapRange: 0.014,
    snapPoints: [0.06, 0.145, 0.205, 0.44, 0.52, 0.61, 1.0],
  },
  motion: {
    revealMinMs: 3000,
    fakeFillMs: 3500,
    assetShare: 0.35,
    creepTauMs: 8000,
    easePerFrame: 0.1,
    revealSettleMs: 800,
    bandOpenMs: 1600,
    logoFadeSeconds: 1.2,
    titleFadeSeconds: 3.0,
    titleBlurPx: 14,
    ctaClickBlinkDuration: 0.2,
  },
  audio: {
    masterVolume: 1.0,
    crossFadeDurSeconds: 1.5,
    musicToggleFadeSeconds: 1.0,
    stemVolume: 1.0,
    stemFadeInSeconds: 2.0,
    stemFadeDurSeconds: 1.2,
  },
  camera: {
    maxTiltYawDeg: 15.0,
    maxTiltPitchDeg: 2.0,
    maxOffsetUnits: [0.1, 0.1, 0.0] as [number, number, number],
    smoothing: 0.1,
    freezeAtProgress: 0.2,
    freezeFade: 0.04,
  },
} as const;

export type Tokens = typeof TOKENS;
