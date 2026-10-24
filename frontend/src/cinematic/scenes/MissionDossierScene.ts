/**
 * Chapter 6: Regulatory Mission Dossier Scene
 * Floating holographic review dossier tablets, cryptographic seal, and return-to-orbit perspective.
 */

import * as THREE from 'three';

export class MissionDossierScene {
  public group = new THREE.Group();
  private tablets: THREE.Group[] = [];
  private sealRing: THREE.Mesh;
  private time = 0;

  constructor() {
    // 1. Dual Holographic Dossier Tablets (ODAR & EOMP)
    const tabletGeom = new THREE.PlaneGeometry(1.6, 2.2);
    const tabletMat = new THREE.MeshBasicMaterial({
      color: 0x00a1ff,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });

    // Left Tablet: NASA-STD-8719.14 ODAR
    const leftTablet = new THREE.Group();
    leftTablet.position.set(-1.4, 0, 0);
    leftTablet.rotation.y = Math.PI / 8;
    const leftMesh = new THREE.Mesh(tabletGeom, tabletMat);
    leftTablet.add(leftMesh);

    // Border Frame for Left Tablet
    const edgesLeft = new THREE.LineSegments(
      new THREE.EdgesGeometry(tabletGeom),
      new THREE.LineBasicMaterial({ color: 0x00a1ff, linewidth: 2 })
    );
    leftTablet.add(edgesLeft);
    this.tablets.push(leftTablet);
    this.group.add(leftTablet);

    // Right Tablet: ISRO DFSM 2030 / FCC EOMP
    const rightTablet = new THREE.Group();
    rightTablet.position.set(1.4, 0, 0);
    rightTablet.rotation.y = -Math.PI / 8;
    const rightMesh = new THREE.Mesh(tabletGeom, tabletMat);
    rightTablet.add(rightMesh);

    const edgesRight = new THREE.LineSegments(
      new THREE.EdgesGeometry(tabletGeom),
      new THREE.LineBasicMaterial({ color: 0x34d399, linewidth: 2 })
    );
    rightTablet.add(edgesRight);
    this.tablets.push(rightTablet);
    this.group.add(rightTablet);

    // 2. Cryptographic SHA-256 Provenance Seal Ring
    const sealGeom = new THREE.RingGeometry(0.8, 0.85, 48);
    const sealMat = new THREE.MeshBasicMaterial({
      color: 0x00a1ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
    this.sealRing = new THREE.Mesh(sealGeom, sealMat);
    this.sealRing.position.set(0, 0, -0.2);
    this.group.add(this.sealRing);

    this.group.visible = false;
  }

  update(dt: number, pointer: { x: number; y: number }): void {
    this.time += dt;

    // Gentle floating tablet pitch & yaw
    this.tablets[0]!.position.y = Math.sin(this.time * 0.8) * 0.08 + pointer.y * 0.1;
    this.tablets[0]!.rotation.y = Math.PI / 8 + pointer.x * 0.08;

    this.tablets[1]!.position.y = Math.cos(this.time * 0.8) * 0.08 + pointer.y * 0.1;
    this.tablets[1]!.rotation.y = -Math.PI / 8 + pointer.x * 0.08;

    // Slowly rotating cryptographic provenance seal ring
    this.sealRing.rotation.z += dt * 0.4;
  }
}
