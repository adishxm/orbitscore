/**
 * Chapter 5: Human Engineering Review Gate Scene
 * Architectural review gate barrier, status pillars, and HTTP 423 lock indicators.
 */

import * as THREE from 'three';

export class HumanReviewGateScene {
  public group = new THREE.Group();
  private lockBarrier: THREE.Mesh;
  private pillars: THREE.Mesh[] = [];
  private splineVehicles: THREE.Mesh[] = [];
  private time = 0;

  constructor() {
    // 1. Physical Gate Portal Frame
    const portalGeom = new THREE.TorusGeometry(2.4, 0.08, 16, 64);
    const portalMat = new THREE.MeshStandardMaterial({
      color: 0x1c2530,
      metalness: 0.9,
      roughness: 0.2,
    });
    const portal = new THREE.Mesh(portalGeom, portalMat);
    portal.rotation.y = Math.PI / 6;
    this.group.add(portal);

    // 2. HTTP 423 Strict Lock Barrier Disc
    const lockGeom = new THREE.CircleGeometry(2.2, 48);
    const lockMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b, // Amber lock boundary
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    this.lockBarrier = new THREE.Mesh(lockGeom, lockMat);
    this.lockBarrier.rotation.y = Math.PI / 6;
    this.group.add(this.lockBarrier);

    // 3. Status Pillars (Engineering Sign-off Columns)
    const pillarGeom = new THREE.CylinderGeometry(0.12, 0.12, 4.0, 16);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x0f1722,
      metalness: 0.8,
      roughness: 0.2,
    });

    [-1.8, 1.8].forEach((xPos) => {
      const pillar = new THREE.Mesh(pillarGeom, pillarMat);
      pillar.position.set(xPos, 0, -0.5);
      this.pillars.push(pillar);
      this.group.add(pillar);
    });

    // 4. Moving Agent Packets along Spline Tracks
    const agentGeom = new THREE.BoxGeometry(0.25, 0.12, 0.5);
    const agentMat = new THREE.MeshBasicMaterial({ color: 0x00a1ff });

    for (let i = 0; i < 4; i++) {
      const agent = new THREE.Mesh(agentGeom, agentMat);
      agent.position.set(-1.2 + i * 0.8, -1.2, -i * 1.5);
      this.splineVehicles.push(agent);
      this.group.add(agent);
    }

    this.group.visible = false;
  }

  update(dt: number, _scrollProgress: number): void {
    this.time += dt;

    // Pulse lock barrier
    const pulse = Math.sin(this.time * 2.5) * 0.08 + 0.18;
    (this.lockBarrier.material as THREE.MeshBasicMaterial).opacity = pulse;

    // Advance agent packets forward
    this.splineVehicles.forEach((agent) => {
      agent.position.z += dt * 1.2;
      if (agent.position.z > 2.0) {
        agent.position.z = -4.0;
      }
    });
  }
}
