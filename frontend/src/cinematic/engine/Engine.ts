/**
 * Master 3D WebGL Engine (Imperative Singleton)
 * Executes outside React render cycles and drives camera rig, scenes, and shaders via master loop.
 */

import * as THREE from 'three';
import { qualityManager } from './QualityManager';
import { eventBus } from '../app/EventBus';
import { stateMachine } from '../app/StateMachine';
import { damp } from '../utils/math';
import { disposeHierarchy } from '../utils/disposal';
import { CHAPTERS } from '../config/chapters.config';

// Chapter Scenes & Shared Assets
import { createStarfield } from '../shaders/starfield.glsl';
import { SatelliteScene } from '../scenes/SatelliteScene';
import { PlanetaryScene } from '../scenes/PlanetaryScene';
import { RulesEngineScene } from '../scenes/RulesEngineScene';
import { SpaceCreditCoreScene } from '../scenes/SpaceCreditCoreScene';
import { HumanReviewGateScene } from '../scenes/HumanReviewGateScene';
import { MissionDossierScene } from '../scenes/MissionDossierScene';

export class CinematicEngine {
  public renderer: THREE.WebGLRenderer | null = null;
  public scene: THREE.Scene = new THREE.Scene();
  public camera: THREE.PerspectiveCamera;

  // Chapter Scene Instances
  public satelliteScene: SatelliteScene;
  public planetaryScene: PlanetaryScene;
  public rulesScene: RulesEngineScene;
  public spaceCreditScene: SpaceCreditCoreScene;
  public reviewGateScene: HumanReviewGateScene;
  public dossierScene: MissionDossierScene;
  public stars: THREE.Points;

  // Camera & Interaction Rig
  private targetCameraPos = new THREE.Vector3(0, 1.8, 8.5);
  private currentCameraPos = new THREE.Vector3(0, 1.8, 8.5);
  private targetCameraLookAt = new THREE.Vector3(0, 0, 0);
  private currentCameraLookAt = new THREE.Vector3(0, 0, 0);

  private pointerTarget = { x: 0, y: 0 };
  private pointerCurrent = { x: 0, y: 0 };

  private scrollProgress = 0;
  private isRunning = false;
  private lastTime = 0;
  private chromaticPulse = 0;

  // Pre-allocated scratch vectors to prevent render-loop GC allocations
  private scratchVecA = new THREE.Vector3();
  private scratchVecB = new THREE.Vector3();

  constructor() {
    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 1000);
    this.scene.background = new THREE.Color(0x000000);

    // Ambient & Directional Sun Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.4);
    sunLight.position.set(12, 8, 10);
    this.scene.add(sunLight);

    // Deep-space starfield
    this.stars = createStarfield(qualityManager.profile.particles, 300);
    this.scene.add(this.stars);

    // Instantiate scenes
    this.satelliteScene = new SatelliteScene();
    this.scene.add(this.satelliteScene.group);

    this.planetaryScene = new PlanetaryScene();
    this.scene.add(this.planetaryScene.group);

    this.rulesScene = new RulesEngineScene();
    this.scene.add(this.rulesScene.group);

    this.spaceCreditScene = new SpaceCreditCoreScene();
    this.scene.add(this.spaceCreditScene.group);

    this.reviewGateScene = new HumanReviewGateScene();
    this.scene.add(this.reviewGateScene.group);

    this.dossierScene = new MissionDossierScene();
    this.scene.add(this.dossierScene.group);

    this.bindEvents();
  }

  private bindEvents(): void {
    eventBus.on('chromatic:play', (_data) => {
      this.chromaticPulse = 1.0;
    });

    eventBus.on('scroll:progress', ({ progress }) => {
      this.setScrollProgress(progress);
    });

    eventBus.on('cta:hover', () => {
      // Gentle camera nudge towards scene
      this.targetCameraPos.z = 7.8;
    });

    eventBus.on('cta:unhover', () => {
      this.targetCameraPos.z = 8.5;
    });

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.pause();
        } else {
          this.resume();
        }
      });
    }
  }

  private detectWebGLCapabilities(canvas: HTMLCanvasElement): {
    supported: boolean;
    precision: 'highp' | 'mediump';
    powerPreference: 'high-performance' | 'default';
  } {
    try {
      const gl = (canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl')) as WebGLRenderingContext | WebGL2RenderingContext | null;

      if (!gl) {
        return { supported: false, precision: 'mediump', powerPreference: 'default' };
      }

      // Check shader precision capabilities safely without throwing if format returns null
      const vHigh = gl.getShaderPrecisionFormat?.(gl.VERTEX_SHADER, gl.HIGH_FLOAT);
      const fHigh = gl.getShaderPrecisionFormat?.(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
      const hasHighPrecision = Boolean(vHigh && fHigh && vHigh.precision > 0 && fHigh.precision > 0);

      const vMed = gl.getShaderPrecisionFormat?.(gl.VERTEX_SHADER, gl.MEDIUM_FLOAT);
      const fMed = gl.getShaderPrecisionFormat?.(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT);
      const hasMedPrecision = Boolean(vMed && fMed && vMed.precision > 0 && fMed.precision > 0);

      if (!hasHighPrecision && !hasMedPrecision) {
        return { supported: false, precision: 'mediump', powerPreference: 'default' };
      }

      return {
        supported: true,
        precision: hasHighPrecision ? 'highp' : 'mediump',
        powerPreference: 'default',
      };
    } catch {
      return { supported: false, precision: 'mediump', powerPreference: 'default' };
    }
  }

  init(canvas: HTMLCanvasElement): boolean {
    const caps = this.detectWebGLCapabilities(canvas);
    if (!caps.supported) {
      const userReason = 'Hardware acceleration is disabled or unsupported in this browser environment.';
      console.warn('[CinematicEngine] WebGL capability check failed; transitioning to accessible 2D fallback');
      eventBus.emit('engine:fallback', { reason: userReason });
      stateMachine.transition('FALLBACK', { fallbackReason: userReason });
      return false;
    }

    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: qualityManager.profile.smaa || true,
        alpha: false,
        powerPreference: caps.powerPreference,
        precision: caps.precision,
        preserveDrawingBuffer: false,
      });

      this.renderer.setPixelRatio(qualityManager.clampDpr(window.devicePixelRatio));
      this.renderer.setSize(canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight, false);
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.1;

      // Warm-up compilation
      try {
        this.renderer.compile(this.scene, this.camera);
      } catch (compileErr) {
        console.warn('[CinematicEngine] Pre-compilation warning:', compileErr);
      }

      this.resize(canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight);
      this.start();
      return true;
    } catch (err: any) {
      console.warn('[CinematicEngine] Failed to initialize WebGL context:', err);
      const userReason = 'Hardware acceleration is disabled or unsupported in this browser environment.';
      eventBus.emit('engine:fallback', { reason: userReason });
      stateMachine.transition('FALLBACK', { fallbackReason: userReason });
      return false;
    }
  }

  setPointer(x: number, y: number): void {
    this.pointerTarget.x = x;
    this.pointerTarget.y = y;
  }

  setScrollProgress(p: number): void {
    this.scrollProgress = Math.max(0, Math.min(1, p));
    this.updateChapterVisibility(this.scrollProgress);
    this.interpolateCameraPath(this.scrollProgress);
  }

  private updateChapterVisibility(p: number): void {
    // 01: Satellite: 0.00 - 0.14
    this.satelliteScene.group.visible = p < 0.18;

    // 02: Planetary: 0.14 - 0.28
    this.planetaryScene.group.visible = p >= 0.12 && p < 0.32;

    // 03: Rules Engine: 0.28 - 0.54
    this.rulesScene.group.visible = p >= 0.26 && p < 0.58;

    // 04: Space Credit: 0.54 - 0.71
    this.spaceCreditScene.group.visible = p >= 0.52 && p < 0.74;

    // 05: Review Gate: 0.71 - 0.85
    this.reviewGateScene.group.visible = p >= 0.69 && p < 0.88;

    // 06: Dossier: 0.85 - 1.00
    this.dossierScene.group.visible = p >= 0.83;

    // Determine active chapter for state machine
    for (const ch of CHAPTERS) {
      if (p >= ch.scroll.start && p <= ch.scroll.end) {
        stateMachine.setActiveChapter(ch.index);
        break;
      }
    }
  }

  private interpolateCameraPath(p: number): void {
    // Match camera keys based on current scroll position
    let activeChapter = CHAPTERS[0]!;
    for (const ch of CHAPTERS) {
      if (p >= ch.scroll.start && p <= ch.scroll.end) {
        activeChapter = ch;
        break;
      }
    }

    const { start, end } = activeChapter.scroll;
    const localT = (p - start) / Math.max(0.001, end - start);

    const key0 = activeChapter.camera.keys[0]!;
    const key1 = activeChapter.camera.keys[1] ?? key0;

    this.scratchVecA.set(key0.position[0], key0.position[1], key0.position[2]);
    this.scratchVecB.set(key1.position[0], key1.position[1], key1.position[2]);
    this.targetCameraPos.lerpVectors(this.scratchVecA, this.scratchVecB, localT);

    this.scratchVecA.set(key0.lookAt[0], key0.lookAt[1], key0.lookAt[2]);
    this.scratchVecB.set(key1.lookAt[0], key1.lookAt[1], key1.lookAt[2]);
    this.targetCameraLookAt.lerpVectors(this.scratchVecA, this.scratchVecB, localT);
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop();
  }

  pause(): void {
    this.isRunning = false;
  }

  resume(): void {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastTime = performance.now();
      this.loop();
    }
  }

  resize(width: number, height: number): void {
    if (!this.renderer || width === 0 || height === 0) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(qualityManager.clampDpr(window.devicePixelRatio));
  }

  private loop = (): void => {
    if (!this.isRunning) return;

    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;

    // Record frame time for quality manager
    qualityManager.recordFrame(dt);

    if (this.chromaticPulse > 0) {
      this.chromaticPulse = Math.max(0, this.chromaticPulse - dt * 2.0);
    }

    // Exponential pointer damping (k = 5.0)
    this.pointerCurrent.x = damp(this.pointerCurrent.x, this.pointerTarget.x, 5.0, dt);
    this.pointerCurrent.y = damp(this.pointerCurrent.y, this.pointerTarget.y, 5.0, dt);

    // Exponential camera damping (k = 2.5)
    this.currentCameraPos.x = damp(this.currentCameraPos.x, this.targetCameraPos.x, 2.5, dt);
    this.currentCameraPos.y = damp(this.currentCameraPos.y, this.targetCameraPos.y, 2.5, dt);
    this.currentCameraPos.z = damp(this.currentCameraPos.z, this.targetCameraPos.z, 2.5, dt);

    this.currentCameraLookAt.x = damp(this.currentCameraLookAt.x, this.targetCameraLookAt.x, 2.5, dt);
    this.currentCameraLookAt.y = damp(this.currentCameraLookAt.y, this.targetCameraLookAt.y, 2.5, dt);
    this.currentCameraLookAt.z = damp(this.currentCameraLookAt.z, this.targetCameraLookAt.z, 2.5, dt);

    // Add pointer parallax offset to camera position
    const parallaxX = this.pointerCurrent.x * 0.4;
    const parallaxY = this.pointerCurrent.y * 0.25;

    this.camera.position.set(
      this.currentCameraPos.x + parallaxX,
      this.currentCameraPos.y + parallaxY,
      this.currentCameraPos.z
    );
    this.camera.lookAt(this.currentCameraLookAt);

    // Starfield twinkle
    if (this.stars.material && (this.stars.material as any).uniforms?.uTime) {
      (this.stars.material as any).uniforms.uTime.value += dt;
    }

    // Update active scenes
    if (this.satelliteScene.group.visible) {
      this.satelliteScene.update(dt, this.scrollProgress, this.pointerCurrent);
    }
    if (this.planetaryScene.group.visible) {
      this.planetaryScene.update(dt, this.pointerCurrent);
    }
    if (this.rulesScene.group.visible) {
      this.rulesScene.update(dt, this.pointerCurrent);
    }
    if (this.spaceCreditScene.group.visible) {
      this.spaceCreditScene.update(dt, this.pointerCurrent);
    }
    if (this.reviewGateScene.group.visible) {
      this.reviewGateScene.update(dt, this.scrollProgress);
    }
    if (this.dossierScene.group.visible) {
      this.dossierScene.update(dt, this.pointerCurrent);
    }

    // Render frame
    if (this.renderer) {
      this.renderer.render(this.scene, this.camera);
    }

    requestAnimationFrame(this.loop);
  };

  dispose(): void {
    this.pause();
    disposeHierarchy(this.scene);
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
      this.renderer = null;
    }
  }
}

export const cinematicEngine = new CinematicEngine();
