/**
 * Chapter 3: Autonomous Deterministic Engines Scene
 * Architectural hall of telemetry verification racks, scanning beam, and C-01 to C-06 rule matrix.
 */

import * as THREE from 'three';

export class RulesEngineScene {
  public group = new THREE.Group();
  private racks: THREE.Group[] = [];
  private scanBeam: THREE.Mesh | null = null;
  private time = 0;

  constructor() {
    this.buildHall();
    this.buildScanBeam();
    this.group.visible = false;
  }

  private buildHall(): void {
    const rackCount = 10;
    const rackSpacing = 1.8;

    const rackGeom = new THREE.BoxGeometry(0.8, 3.2, 0.9);
    const rackMat = new THREE.MeshStandardMaterial({
      color: 0x0c1118,
      metalness: 0.9,
      roughness: 0.3,
    });

    const ledGeom = new THREE.PlaneGeometry(0.7, 0.08);

    for (let i = 0; i < rackCount; i++) {
      const isLeft = i % 2 === 0;
      const x = isLeft ? -1.8 : 1.8;
      const z = -(Math.floor(i / 2) * rackSpacing);

      const rackGroup = new THREE.Group();
      rackGroup.position.set(x, 0, z);

      const body = new THREE.Mesh(rackGeom, rackMat);
      rackGroup.add(body);

      // Add LED status rows to each rack
      for (let j = 0; j < 6; j++) {
        const isConflict = i === 2 && j === 3; // Synthetic discrepancy on Check C-03
        const ledMat = new THREE.MeshBasicMaterial({
          color: isConflict ? 0xf59e0b : 0x00a1ff,
        });
        const led = new THREE.Mesh(ledGeom, ledMat);
        led.position.set(0, 1.1 - j * 0.45, 0.46);
        rackGroup.add(led);
      }

      this.racks.push(rackGroup);
      this.group.add(rackGroup);
    }

    // Floor and Ceiling Grid Guides
    const grid = new THREE.GridHelper(30, 30, 0x1c2530, 0x0c1118);
    grid.position.y = -1.6;
    this.group.add(grid);
  }

  private buildScanBeam(): void {
    // Additive plane scanning light beam
    const beamGeom = new THREE.PlaneGeometry(3.6, 3.4);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x00a1ff,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });

    this.scanBeam = new THREE.Mesh(beamGeom, beamMat);
    this.scanBeam.position.set(0, 0, -3.0);
    this.group.add(this.scanBeam);
  }

  update(dt: number, pointer: { x: number; y: number }): void {
    this.time += dt;

    // Move scanning beam according to pointer and sine wave
    if (this.scanBeam) {
      this.scanBeam.position.z = -2.0 - Math.sin(this.time * 1.5) * 4.0;
      this.scanBeam.position.x = pointer.x * 0.8;
      this.scanBeam.rotation.y = pointer.x * 0.1;
    }

    // Subtle rack LED flickering
    this.racks.forEach((rack, i) => {
      const pulse = Math.sin(this.time * 3.0 + i) * 0.1;
      rack.position.y = pulse * 0.05;
    });
  }
}
