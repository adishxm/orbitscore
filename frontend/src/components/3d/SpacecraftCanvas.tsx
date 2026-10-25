import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useReducedMotion } from 'framer-motion';
import styles from './SpacecraftCanvas.module.css';

interface SubsystemHotspot {
  id: string;
  name: string;
  code: string;
  citation: string;
  position: [number, number, number];
  description: string;
  state: 'confirmed' | 'unconfirmed' | 'conflicting';
}

const SUBSYSTEM_HOTSPOTS: SubsystemHotspot[] = [
  {
    id: 'envelope',
    name: '3U Aluminum Chassis',
    code: 'STR-CHASSIS-3U',
    citation: 'DWG-3U-01 Rev C',
    position: [0, 0, 0.9],
    description: '100.0 x 100.0 x 340.5 mm stowed envelope with anodized 6061-T6 deployment rails.',
    state: 'confirmed',
  },
  {
    id: 'solar',
    name: 'Deployable Solar Arrays',
    code: 'EPS-SOLAR-02',
    citation: 'Vendor Acceptance VA-2024-11',
    position: [1.8, 0.4, 0],
    description: '4-panel articulated photovoltaic array; triple-junction cells, 32W BOL generation.',
    state: 'confirmed',
  },
  {
    id: 'optics',
    name: 'Multispectral Imager',
    code: 'PL-OPT-01',
    citation: 'Payload Spec PS-EO-301',
    position: [0, 1.4, 0.2],
    description: 'Earth-observation optical telescope with 6-band optical filters and baffle assembly.',
    state: 'confirmed',
  },
  {
    id: 'battery',
    name: 'Battery Vacuum Bay',
    code: 'EPS-BAT-01',
    citation: 'TR-BAT-092 Rev B (Pending)',
    position: [0, -0.6, 0.3],
    description: 'Dual-channel Li-ion cell bank with thermal runaway containment barrier.',
    state: 'unconfirmed',
  },
  {
    id: 'antenna',
    name: 'S-Band Patch & Antennas',
    code: 'RF-LIC-01',
    citation: 'FCC Part 25 Form 312',
    position: [-0.6, 0.8, -0.6],
    description: 'S-band patch antenna and deployable tape-spring UHF/VHF tracking beacon.',
    state: 'conflicting',
  },
];

interface SpacecraftCanvasProps {
  scrollProgress?: number;
  className?: string;
}

export const SpacecraftCanvas: React.FC<SpacecraftCanvasProps> = ({
  scrollProgress = 0,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const [webglSupported, setWebglSupported] = useState<boolean>(true);
  const [activeHotspot, setActiveHotspot] = useState<SubsystemHotspot | null>(
    SUBSYSTEM_HOTSPOTS[0] ?? null
  );
  const [telemetry, setTelemetry] = useState({
    roll: '+14.2°',
    pitch: '-06.8°',
    bus: '3U CUBESAT',
    mass: '4.15 kg',
    envelope: '100x100x340.5 mm',
  });

  // Check WebGL availability safely
  useEffect(() => {
    try {
      const testCanvas = document.createElement('canvas');
      const gl = (testCanvas.getContext('webgl2') ||
        testCanvas.getContext('webgl') ||
        testCanvas.getContext('experimental-webgl')) as WebGLRenderingContext | WebGL2RenderingContext | null;
      if (!gl) {
        setWebglSupported(false);
        return;
      }
      const vHigh = gl.getShaderPrecisionFormat?.(gl.VERTEX_SHADER, gl.HIGH_FLOAT);
      const fHigh = gl.getShaderPrecisionFormat?.(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
      const vMed = gl.getShaderPrecisionFormat?.(gl.VERTEX_SHADER, gl.MEDIUM_FLOAT);
      const fMed = gl.getShaderPrecisionFormat?.(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT);
      const hasPrecision = Boolean((vHigh && fHigh && vHigh.precision > 0 && fHigh.precision > 0) ||
                                   (vMed && fMed && vMed.precision > 0 && fMed.precision > 0));
      if (!hasPrecision) {
        setWebglSupported(false);
      }
    } catch {
      setWebglSupported(false);
    }
  }, []);

  // Three.js Scene Setup & Render Loop
  useEffect(() => {
    if (!webglSupported || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;

    let width = container.clientWidth || 500;
    let height = container.clientHeight || 500;

    // Renderer
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
    } catch {
      setWebglSupported(false);
      return;
    }

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(2.8, 1.8, 3.8);
    camera.lookAt(0, 0, 0);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x0a1626, 2.5);
    scene.add(ambientLight);

    // Key directional light (Sunlight)
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.5);
    keyLight.position.set(5, 8, 4);
    scene.add(keyLight);

    // Electric-blue rim light (Earth albedo / atmosphere scatter)
    const rimLight = new THREE.DirectionalLight(0x00a1ff, 2.8);
    rimLight.position.set(-6, -3, -4);
    scene.add(rimLight);

    // Cyan accent light
    const accentLight = new THREE.PointLight(0x168bff, 2.0, 10);
    accentLight.position.set(0, 2, 2);
    scene.add(accentLight);

    // Spacecraft Master Group
    const satelliteGroup = new THREE.Group();
    scene.add(satelliteGroup);

    // 1. Materials
    const aluminumMaterial = new THREE.MeshStandardMaterial({
      color: 0x222a36,
      metalness: 0.92,
      roughness: 0.25,
    });

    const mliGoldMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.88,
      roughness: 0.35,
      bumpScale: 0.05,
    });

    const solarCellMaterial = new THREE.MeshStandardMaterial({
      color: 0x07152d,
      metalness: 0.85,
      roughness: 0.18,
      emissive: 0x020814,
      emissiveIntensity: 0.2,
    });

    const glassLensMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x00d0ff,
      metalness: 0.1,
      roughness: 0.1,
      transmission: 0.7,
      ior: 1.52,
      reflectivity: 0.9,
    });

    const titaniumNozzleMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a5568,
      metalness: 0.95,
      roughness: 0.3,
    });

    // 2. Chassis: 3U CubeSat Bus (approx dimensions normalized: 0.8 x 2.4 x 0.8)
    const busGeometry = new THREE.BoxGeometry(0.8, 2.4, 0.8);
    const busMesh = new THREE.Mesh(busGeometry, mliGoldMaterial);
    satelliteGroup.add(busMesh);

    // Structural Aluminum Rails & Corner Caps
    const railGeometry = new THREE.BoxGeometry(0.84, 2.44, 0.84);
    const wireframeGeo = new THREE.WireframeGeometry(railGeometry);
    const railsLine = new THREE.LineSegments(
      wireframeGeo,
      new THREE.LineBasicMaterial({ color: 0x48586e, linewidth: 2 })
    );
    satelliteGroup.add(railsLine);

    // 4 Corner Rail Standoffs (Deployment Guides)
    const standoffGeo = new THREE.CylinderGeometry(0.02, 0.02, 2.5, 8);
    const cornerOffsets: [number, number, number][] = [
      [-0.42, 0, -0.42],
      [0.42, 0, -0.42],
      [-0.42, 0, 0.42],
      [0.42, 0, 0.42],
    ];
    cornerOffsets.forEach(([x, y, z]) => {
      const rail = new THREE.Mesh(standoffGeo, aluminumMaterial);
      rail.position.set(x, y, z);
      satelliteGroup.add(rail);
    });

    // 3. Deployable Solar Panels (Left and Right Wings)
    const panelWidth = 1.4;
    const panelHeight = 2.1;
    const panelThickness = 0.03;

    // Left Panel Wing
    const panelGeo = new THREE.BoxGeometry(panelWidth, panelHeight, panelThickness);
    const leftPanel = new THREE.Group();
    const leftPanelMesh = new THREE.Mesh(panelGeo, solarCellMaterial);
    leftPanelMesh.position.set(-panelWidth / 2, 0, 0);
    leftPanel.position.set(-0.42, 0, 0);
    leftPanel.rotation.y = 0.35; // slightly deployed angle
    leftPanel.add(leftPanelMesh);
    satelliteGroup.add(leftPanel);

    // Solar Cell Grid Lines on Left Panel
    const gridHelperLeft = new THREE.GridHelper(panelHeight, 6, 0x168bff, 0x0055aa);
    gridHelperLeft.rotation.z = Math.PI / 2;
    gridHelperLeft.position.set(-panelWidth / 2, 0, panelThickness / 2 + 0.002);
    gridHelperLeft.scale.set(0.65, 1, 1);
    leftPanel.add(gridHelperLeft);

    // Right Panel Wing
    const rightPanel = new THREE.Group();
    const rightPanelMesh = new THREE.Mesh(panelGeo, solarCellMaterial);
    rightPanelMesh.position.set(panelWidth / 2, 0, 0);
    rightPanel.position.set(0.42, 0, 0);
    rightPanel.rotation.y = -0.35;
    rightPanel.add(rightPanelMesh);
    satelliteGroup.add(rightPanel);

    // Solar Cell Grid Lines on Right Panel
    const gridHelperRight = new THREE.GridHelper(panelHeight, 6, 0x168bff, 0x0055aa);
    gridHelperRight.rotation.z = Math.PI / 2;
    gridHelperRight.position.set(panelWidth / 2, 0, panelThickness / 2 + 0.002);
    gridHelperRight.scale.set(0.65, 1, 1);
    rightPanel.add(gridHelperRight);

    // 4. Optical Payload Telescope (Nadir face: +Y direction)
    const opticsGroup = new THREE.Group();
    opticsGroup.position.set(0, 1.25, 0);

    const barrelGeo = new THREE.CylinderGeometry(0.22, 0.25, 0.5, 32);
    const barrel = new THREE.Mesh(barrelGeo, aluminumMaterial);
    opticsGroup.add(barrel);

    const lensGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.05, 32);
    const lens = new THREE.Mesh(lensGeo, glassLensMaterial);
    lens.position.set(0, 0.25, 0);
    opticsGroup.add(lens);

    satelliteGroup.add(opticsGroup);

    // 5. RF Patch Antenna & Deployable Whips (Zenith face: -Y direction)
    const rfGroup = new THREE.Group();
    rfGroup.position.set(0, -1.22, 0);

    const patchGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.04, 24);
    const patch = new THREE.Mesh(patchGeo, aluminumMaterial);
    rfGroup.add(patch);

    // 4 Whip Antennas extending from the base
    const whipGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.9, 8);
    const whipMaterial = new THREE.MeshStandardMaterial({
      color: 0x8899aa,
      metalness: 0.9,
      roughness: 0.2,
    });
    for (let i = 0; i < 4; i++) {
      const whip = new THREE.Mesh(whipGeo, whipMaterial);
      const angle = (i * Math.PI) / 2;
      whip.position.set(Math.cos(angle) * 0.35, -0.4, Math.sin(angle) * 0.35);
      whip.rotation.z = Math.cos(angle) * 0.45;
      whip.rotation.x = Math.sin(angle) * 0.45;
      rfGroup.add(whip);
    }
    satelliteGroup.add(rfGroup);

    // 6. Cold Gas / Micro-Thruster Nozzle Bell
    const thrusterGeo = new THREE.ConeGeometry(0.08, 0.18, 16);
    const thruster = new THREE.Mesh(thrusterGeo, titaniumNozzleMaterial);
    thruster.rotation.x = Math.PI;
    thruster.position.set(0.25, -1.25, 0.25);
    satelliteGroup.add(thruster);

    // 7. Subtle Starfield Particles in Background
    const starsCount = 400;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 40;
      starPositions[i + 1] = (Math.random() - 0.5) * 40;
      starPositions[i + 2] = (Math.random() - 0.5) * 40 - 10;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x88aacc,
      size: 0.06,
      transparent: true,
      opacity: 0.6,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    // 8. Distant Earth Horizon Curvature Arc
    const horizonGeo = new THREE.TorusGeometry(12, 0.08, 16, 100, Math.PI / 1.5);
    const horizonMat = new THREE.MeshBasicMaterial({
      color: 0x0088ff,
      transparent: true,
      opacity: 0.25,
    });
    const horizon = new THREE.Mesh(horizonGeo, horizonMat);
    horizon.position.set(0, -11, -3);
    horizon.rotation.x = Math.PI / 2.3;
    scene.add(horizon);

    // Mouse Drag Interaction Handling
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotationY = 0.5;
    let targetRotationX = 0.35;

    const handlePointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      targetRotationY += deltaX * 0.008;
      targetRotationX += deltaY * 0.008;

      // Update telemetry readout based on rotation
      setTelemetry((prev) => ({
        ...prev,
        roll: `${((targetRotationY * 180) / Math.PI % 360).toFixed(1)}°`,
        pitch: `${((targetRotationX * 180) / Math.PI % 360).toFixed(1)}°`,
      }));
    };

    const handlePointerUp = (e: PointerEvent) => {
      isDragging = false;
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        // Safe ignore
      }
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      if (!shouldReduceMotion) {
        // Natural orbital floating drift if not dragging
        if (!isDragging) {
          targetRotationY += 0.0015;
        }

        // Damped rotation interpolation
        satelliteGroup.rotation.y += (targetRotationY - satelliteGroup.rotation.y) * 0.08;
        satelliteGroup.rotation.x += (targetRotationX - satelliteGroup.rotation.x) * 0.08;

        // Subtle attitude oscillation
        satelliteGroup.position.y = Math.sin(elapsed * 0.8) * 0.06;
        satelliteGroup.rotation.z = Math.sin(elapsed * 0.5) * 0.03;

        // Subtle solar panel solar-tracking micro-articulation
        leftPanel.rotation.y = 0.35 + Math.sin(elapsed * 0.4) * 0.04;
        rightPanel.rotation.y = -0.35 - Math.sin(elapsed * 0.4) * 0.04;
      }

      // Camera sync with scroll progress
      if (scrollProgress > 0) {
        const scrollOffset = Math.min(scrollProgress, 1);
        camera.position.x = 2.8 - scrollOffset * 1.2;
        camera.position.y = 1.8 - scrollOffset * 0.6;
        camera.position.z = 3.8 - scrollOffset * 0.8;
        camera.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      width = containerRef.current.clientWidth;
      height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointercancel', handlePointerUp);

      // Dispose Three.js resources thoroughly to prevent context leak
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.geometry?.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else {
            mesh.material?.dispose();
          }
        }
      });
      scene.clear();
      renderer.dispose();
      renderer.forceContextLoss?.();
    };
  }, [webglSupported, shouldReduceMotion, scrollProgress]);

  const selectHotspot = useCallback((spot: SubsystemHotspot) => {
    setActiveHotspot(spot);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`${styles.viewportWrap} ${className}`}
      aria-label="Interactive 3D Mission Spacecraft Visualizer"
    >
      {webglSupported ? (
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          aria-hidden="true"
        />
      ) : (
        /* Accessible Precision Blueprint when WebGL is unavailable */
        <div className={styles.fallbackGraphic} role="img" aria-label="3U Aluminum Chassis CAD Blueprint">
          <svg
            className={styles.fallbackSvg}
            viewBox="0 0 460 360"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Technical Grid Background */}
            <defs>
              <pattern id="cadGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0, 161, 255, 0.07)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cadGrid)" />

            {/* Dimensional Guideline Indicators */}
            <line x1="130" y1="30" x2="130" y2="330" stroke="rgba(148, 163, 184, 0.25)" strokeDasharray="3 3" />
            <line x1="330" y1="30" x2="330" y2="330" stroke="rgba(148, 163, 184, 0.25)" strokeDasharray="3 3" />
            
            {/* 3U Chassis Main Body */}
            <rect x="175" y="45" width="110" height="270" rx="3" fill="#090d14" stroke="#00a1ff" strokeWidth="1.8" />
            <rect x="180" y="50" width="100" height="85" rx="2" fill="#0d1522" stroke="rgba(0, 161, 255, 0.35)" />
            <rect x="180" y="140" width="100" height="85" rx="2" fill="#0d1522" stroke="rgba(0, 161, 255, 0.35)" />
            <rect x="180" y="230" width="100" height="80" rx="2" fill="#0d1522" stroke="rgba(0, 161, 255, 0.35)" />

            {/* Deployable Solar Array Wings */}
            <rect x="35" y="70" width="130" height="220" rx="2" fill="#070d18" stroke="#00a1ff" strokeWidth="1.2" strokeDasharray="4 2" />
            <line x1="35" y1="125" x2="165" y2="125" stroke="rgba(0, 161, 255, 0.4)" />
            <line x1="35" y1="180" x2="165" y2="180" stroke="rgba(0, 161, 255, 0.4)" />
            <line x1="35" y1="235" x2="165" y2="235" stroke="rgba(0, 161, 255, 0.4)" />

            <rect x="295" y="70" width="130" height="220" rx="2" fill="#070d18" stroke="#00a1ff" strokeWidth="1.2" strokeDasharray="4 2" />
            <line x1="295" y1="125" x2="425" y2="125" stroke="rgba(0, 161, 255, 0.4)" />
            <line x1="295" y1="180" x2="425" y2="180" stroke="rgba(0, 161, 255, 0.4)" />
            <line x1="295" y1="235" x2="425" y2="235" stroke="rgba(0, 161, 255, 0.4)" />

            {/* Optical Payload Aperture */}
            <circle cx="230" cy="92" r="26" fill="#05070a" stroke="#00a1ff" strokeWidth="1.5" />
            <circle cx="230" cy="92" r="16" fill="#021427" stroke="#38bdf8" strokeWidth="1" />
            <circle cx="230" cy="92" r="6" fill="#00a1ff" />

            {/* S-Band Patch & Battery Compartment Markers */}
            <rect x="210" y="165" width="40" height="35" rx="2" fill="#09182a" stroke="#34d399" strokeWidth="1.2" />
            <circle cx="230" cy="270" r="12" fill="#17120a" stroke="#f59e0b" strokeWidth="1.2" />

            {/* Technical Annotations */}
            <text x="230" y="25" textAnchor="middle" fill="#00a1ff" fontSize="11" fontFamily="monospace" fontWeight="bold">
              3U ALUMINUM CHASSIS (CAD DWG-3U-01)
            </text>
            <text x="230" y="345" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">
              STOWED: 100.0 x 100.0 x 340.5 mm // DEPLOYED WINGSPAN: 830.0 mm
            </text>
          </svg>
        </div>
      )}

      {/* Real-Time Telemetry HUD Overlay */}
      <div className={styles.hudTopRight} aria-hidden="true">
        <div className={styles.hudItem}>
          <span className={styles.hudLabel}>BUS STANDARD</span>
          <span className={styles.hudValue}>{telemetry.bus}</span>
        </div>
        <div className={styles.hudItem}>
          <span className={styles.hudLabel}>STOWED ENVELOPE</span>
          <span className={styles.hudValue}>{telemetry.envelope}</span>
        </div>
        <div className={styles.hudItem}>
          <span className={styles.hudLabel}>ATTITUDE ORIENTATION</span>
          <span className={styles.hudValue}>
            R: {telemetry.roll} / P: {telemetry.pitch}
          </span>
        </div>
      </div>

      {/* Subsystem Selection Tags (Pin Callouts) */}
      <div className={styles.subsystemBar} role="tablist" aria-label="Subsystem Inspector Tabs">
        {SUBSYSTEM_HOTSPOTS.map((spot) => {
          const isActive = activeHotspot?.id === spot.id;
          return (
            <button
              key={spot.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => selectHotspot(spot)}
              className={`${styles.hotspotBtn} ${isActive ? styles.hotspotBtnActive : ''}`}
            >
              <span className={styles.hotspotDot} data-state={spot.state} />
              <span className={styles.hotspotName}>{spot.name}</span>
            </button>
          );
        })}
      </div>

      {/* Active Subsystem Detail Card */}
      {activeHotspot && (
        <div className={styles.inspectorCard} role="region" aria-label="Selected Subsystem Details">
          <div className={styles.inspectorHeader}>
            <div>
              <span className={styles.inspectorCode}>{activeHotspot.code}</span>
              <div className={styles.inspectorTitle}>{activeHotspot.name}</div>
            </div>
            <span className={`${styles.stateBadge} ${styles[`stateBadge_${activeHotspot.state}`]}`}>
              {activeHotspot.state.toUpperCase()}
            </span>
          </div>
          <p className={styles.inspectorDesc}>{activeHotspot.description}</p>
          <div className={styles.citationRow}>
            <span className={styles.citationLabel}>PRIMARY CITATION:</span>
            <span className={styles.citationValue}>{activeHotspot.citation}</span>
          </div>
        </div>
      )}

      {/* Interactive Drag Hint */}
      <div className={styles.dragHint} aria-hidden="true">
        <span>⟲ Drag to rotate 360° spacecraft model</span>
      </div>
    </div>
  );
};
