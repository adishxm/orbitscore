/**
 * Chapter 4: Space Credit & Provenance Core Scene
 * Central luminous compute core, orbiting 4-pillar gimbal rings, and curl-noise particle cloud.
 */

import * as THREE from 'three';
import { createParticleCore } from '../shaders/particles.glsl';

export class SpaceCreditCoreScene {
  public group = new THREE.Group();
  public coreMesh: THREE.Mesh;
  public rings: THREE.Group[] = [];
  public particles: THREE.Points;
  private time = 0;
  private rippleIntensity = 0;

  constructor() {
    // 1. Central Luminous Core
    const coreGeom = new THREE.IcosahedronGeometry(0.7, 3);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x00a1ff,
      emissive: 0x0055aa,
      emissiveIntensity: 1.4,
      wireframe: true,
      roughness: 0.1,
      metalness: 0.9,
    });
    this.coreMesh = new THREE.Mesh(coreGeom, coreMat);
    this.group.add(this.coreMesh);

    // 2. Four Orbiting Gimbal Rings (The 4 Pillars of Space Credit Readiness)
    const ringRadii = [1.1, 1.4, 1.7, 2.0];
    const ringColors = [0x00a1ff, 0x34d399, 0xf59e0b, 0xc084fc];

    ringRadii.forEach((r, idx) => {
      const ringGeom = new THREE.TorusGeometry(r, 0.015, 16, 100);
      const ringMat = new THREE.MeshBasicMaterial({
        color: ringColors[idx],
        transparent: true,
        opacity: 0.75,
      });
      const ringMesh = new THREE.Mesh(ringGeom, ringMat);
      const ringGroup = new THREE.Group();
      ringGroup.add(ringMesh);
      ringGroup.rotation.set((idx * Math.PI) / 4, (idx * Math.PI) / 3, 0);

      this.rings.push(ringGroup);
      this.group.add(ringGroup);
    });

    // 3. GPU Curl-Noise Particle Cloud
    this.particles = createParticleCore(18000, 2.2);
    this.group.add(this.particles);

    this.group.visible = false;
  }

  triggerRipple(): void {
    this.rippleIntensity = 1.0;
  }

  update(dt: number, pointer: { x: number; y: number }): void {
    this.time += dt;

    // Decay ripple
    if (this.rippleIntensity > 0) {
      this.rippleIntensity = Math.max(0, this.rippleIntensity - dt * 2.0);
    }

    // Core pulsing & rotation
    this.coreMesh.rotation.y += dt * 0.5 + pointer.x * 0.2;
    this.coreMesh.rotation.x += dt * 0.3 + pointer.y * 0.2;

    const pulse = Math.sin(this.time * 2.0) * 0.05 + 1.0 + this.rippleIntensity * 0.25;
    this.coreMesh.scale.set(pulse, pulse, pulse);

    // Orbiting rings counter-rotation
    this.rings.forEach((ring, idx) => {
      const speed = (idx + 1) * 0.2;
      ring.rotation.x += dt * speed;
      ring.rotation.y += dt * speed * 0.7;
    });

    // Update particle uniforms
    if ((this.particles.material as any).uniforms) {
      const uniforms = (this.particles.material as any).uniforms;
      uniforms.uTime.value = this.time;
      uniforms.uDisplacement.value = 0.15 + this.rippleIntensity * 0.4;
      uniforms.uPointer.value.set(pointer.x * 2.0, pointer.y * 2.0, 0);
    }
  }
}
