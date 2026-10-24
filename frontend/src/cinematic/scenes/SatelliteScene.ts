/**
 * Chapter 1: Orbital Telemetry & 3U CubeSat Hero Scene
 * Procedural 3U CubeSat model with dual solar panel arrays, Earth limb, and atmosphere.
 */

import * as THREE from 'three';
import { createAtmosphereMaterial } from '../shaders/atmosphere.glsl';
import { createEarthMaterial } from '../shaders/earth.glsl';

export class SatelliteScene {
  public group = new THREE.Group();
  public satellite = new THREE.Group();
  public earth = new THREE.Group();
  private solarPanels: THREE.Mesh[] = [];
  private time = 0;

  constructor() {
    this.buildEarth();
    this.buildSatellite();
  }

  private buildEarth(): void {
    // Earth Sphere at orbital distance
    const earthRadius = 18.0;
    const earthGeom = new THREE.SphereGeometry(earthRadius, 64, 64);
    const earthMat = createEarthMaterial();
    const earthMesh = new THREE.Mesh(earthGeom, earthMat);

    // Position Earth so its curved limb frames the lower portion of the viewport
    this.earth.position.set(0, -19.8, -4.0);
    this.earth.rotation.z = THREE.MathUtils.degToRad(23.44); // Earth axial tilt
    this.earth.add(earthMesh);

    // Atmospheric limb glow
    const atmosGeom = new THREE.SphereGeometry(earthRadius * 1.025, 64, 64);
    const atmosMat = createAtmosphereMaterial(0x00a1ff, 2.2, 3.4);
    const atmosMesh = new THREE.Mesh(atmosGeom, atmosMat);
    this.earth.add(atmosMesh);

    this.group.add(this.earth);
  }

  private buildSatellite(): void {
    // 3U CubeSat main chassis (100 x 100 x 340.5 mm -> normalized scale: 0.8 x 0.8 x 2.4)
    const chassisGeom = new THREE.BoxGeometry(0.8, 0.8, 2.4);
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x1a212b,
      metalness: 0.88,
      roughness: 0.22,
    });
    const chassis = new THREE.Mesh(chassisGeom, chassisMat);
    this.satellite.add(chassis);

    // Gold multi-layer insulation (MLI) foil patch on side
    const mliGeom = new THREE.PlaneGeometry(0.72, 1.8);
    const mliMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37, // Aerospace Kapton Gold
      metalness: 0.95,
      roughness: 0.15,
      side: THREE.DoubleSide,
    });
    const mliPatch1 = new THREE.Mesh(mliGeom, mliMat);
    mliPatch1.position.set(0.405, 0, 0);
    mliPatch1.rotation.y = Math.PI / 2;
    this.satellite.add(mliPatch1);

    const mliPatch2 = mliPatch1.clone();
    mliPatch2.position.set(-0.405, 0, 0);
    mliPatch2.rotation.y = -Math.PI / 2;
    this.satellite.add(mliPatch2);

    // Deployable Solar Panel Arrays (Left and Right wings)
    const panelGeom = new THREE.BoxGeometry(2.4, 0.04, 1.0);
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x051a33, // Deep blue photovoltaic cells
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x001a33,
      emissiveIntensity: 0.2,
    });

    const leftWing = new THREE.Mesh(panelGeom, panelMat);
    leftWing.position.set(-1.6, 0, 0);
    this.satellite.add(leftWing);
    this.solarPanels.push(leftWing);

    const rightWing = new THREE.Mesh(panelGeom, panelMat);
    rightWing.position.set(1.6, 0, 0);
    this.satellite.add(rightWing);
    this.solarPanels.push(rightWing);

    // Solar panel cell grid lines
    const gridHelperLeft = new THREE.GridHelper(2.4, 8, 0x00a1ff, 0x004488);
    gridHelperLeft.position.set(-1.6, 0.025, 0);
    gridHelperLeft.rotation.x = Math.PI / 2;
    this.satellite.add(gridHelperLeft);

    const gridHelperRight = gridHelperLeft.clone();
    gridHelperRight.position.set(1.6, 0.025, 0);
    this.satellite.add(gridHelperRight);

    // Antenna boom & optical payload aperture
    const lensGeom = new THREE.CylinderGeometry(0.22, 0.22, 0.1, 32);
    const lensMat = new THREE.MeshStandardMaterial({
      color: 0x00a1ff,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0x0055aa,
      emissiveIntensity: 0.6,
    });
    const lens = new THREE.Mesh(lensGeom, lensMat);
    lens.position.set(0, 0, 1.25);
    lens.rotation.x = Math.PI / 2;
    this.satellite.add(lens);

    // Satellite initial framing
    this.satellite.position.set(0, 0.2, 2.5);
    this.satellite.rotation.set(0.35, -0.45, 0.15);

    this.group.add(this.satellite);
  }

  update(dt: number, _scrollProgress: number, pointer: { x: number; y: number }): void {
    this.time += dt;

    // Slow orbital drift of Earth
    this.earth.rotation.y += dt * 0.025;

    // Gentle satellite floating roll and yaw
    this.satellite.rotation.y = -0.45 + Math.sin(this.time * 0.4) * 0.08 + pointer.x * 0.15;
    this.satellite.rotation.x = 0.35 + Math.cos(this.time * 0.35) * 0.05 + pointer.y * 0.1;
    this.satellite.position.y = 0.2 + Math.sin(this.time * 0.6) * 0.04;

    // Update Earth shader time
    this.earth.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.material && (obj.material as any).uniforms?.uTime) {
        (obj.material as any).uniforms.uTime.value = this.time;
      }
    });
  }
}
