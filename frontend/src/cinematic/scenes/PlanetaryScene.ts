/**
 * Chapter 2: Planetary Network & Spatial Debris Density Scene
 * Full-frame Earth globe with ground station nodes, great-circle arcs, and debris clouds.
 */

import * as THREE from 'three';
import { createEarthMaterial } from '../shaders/earth.glsl';
import { createAtmosphereMaterial } from '../shaders/atmosphere.glsl';
import { createNetworkArcMaterial } from '../shaders/networkArcs.glsl';
import { latLonToVector3 } from '../utils/math';

interface GroundStation {
  name: string;
  lat: number;
  lon: number;
}

const GROUND_STATIONS: GroundStation[] = [
  { name: 'Svalbard Satellite Station', lat: 78.22, lon: 15.4 },
  { name: 'ISRO ISTRAC Bangalore', lat: 12.97, lon: 77.59 },
  { name: 'NASA Goldstone DSN', lat: 35.42, lon: -116.89 },
  { name: 'ESA Kiruna Station', lat: 67.85, lon: 20.96 },
  { name: 'Canberra Deep Space', lat: -35.40, lon: 148.98 },
  { name: 'ESA Redu Station', lat: 50.00, lon: 5.14 },
  { name: 'Inuvik Satellite Station', lat: 68.36, lon: -133.72 },
  { name: 'Singapore Ground Pass', lat: 1.35, lon: 103.82 },
];

export class PlanetaryScene {
  public group = new THREE.Group();
  public earth = new THREE.Group();
  private arcs: THREE.Line[] = [];
  private nodePoints: THREE.Points | null = null;
  private debrisCloud: THREE.Points | null = null;
  private time = 0;

  constructor() {
    this.buildGlobe();
    this.buildStationsAndArcs();
    this.buildDebrisCloud();
    this.group.visible = false; // toggled active when scrolling into chapter
  }

  private buildGlobe(): void {
    const radius = 3.6;
    const earthGeom = new THREE.SphereGeometry(radius, 64, 64);
    const earthMat = createEarthMaterial();
    const earthMesh = new THREE.Mesh(earthGeom, earthMat);
    this.earth.add(earthMesh);

    const atmosGeom = new THREE.SphereGeometry(radius * 1.035, 64, 64);
    const atmosMat = createAtmosphereMaterial(0x00a1ff, 2.0, 3.2);
    const atmosMesh = new THREE.Mesh(atmosGeom, atmosMat);
    this.earth.add(atmosMesh);

    this.group.add(this.earth);
  }

  private buildStationsAndArcs(): void {
    const radius = 3.62;
    const nodeCount = GROUND_STATIONS.length;
    const nodePositions = new Float32Array(nodeCount * 3);

    const nodeCoords: THREE.Vector3[] = [];

    GROUND_STATIONS.forEach((st, i) => {
      const [x, y, z] = latLonToVector3(st.lat, st.lon, radius);
      nodePositions[i * 3] = x;
      nodePositions[i * 3 + 1] = y;
      nodePositions[i * 3 + 2] = z;
      nodeCoords.push(new THREE.Vector3(x, y, z));
    });

    const nodeGeom = new THREE.BufferGeometry();
    nodeGeom.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
    const nodeMat = new THREE.PointsMaterial({
      color: 0x00a1ff,
      size: 0.16,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
    this.nodePoints = new THREE.Points(nodeGeom, nodeMat);
    this.earth.add(this.nodePoints);

    // Build Great-Circle Arcs between adjacent stations
    for (let i = 0; i < nodeCoords.length; i++) {
      const start = nodeCoords[i]!;
      const end = nodeCoords[(i + 1) % nodeCoords.length]!;

      // Intermediate arc points along sphere curvature
      const numPoints = 36;
      const arcPositions: number[] = [];
      const arcProgress: number[] = [];

      for (let j = 0; j <= numPoints; j++) {
        const t = j / numPoints;
        const p = new THREE.Vector3().lerpVectors(start, end, t);
        // Elevate middle of arc
        const midAltitude = 1.0 + Math.sin(t * Math.PI) * 0.18;
        p.normalize().multiplyScalar(radius * midAltitude);

        arcPositions.push(p.x, p.y, p.z);
        arcProgress.push(t);
      }

      const arcGeom = new THREE.BufferGeometry();
      arcGeom.setAttribute('position', new THREE.Float32BufferAttribute(arcPositions, 3));
      arcGeom.setAttribute('aProgress', new THREE.Float32BufferAttribute(arcProgress, 1));

      const arcMat = createNetworkArcMaterial(0x00a1ff, 0.5 + (i % 3) * 0.2, 0.14);
      const arcLine = new THREE.Line(arcGeom, arcMat);
      this.arcs.push(arcLine);
      this.earth.add(arcLine);
    }
  }

  private buildDebrisCloud(): void {
    // NASA SPARK / ORDEM Synthetic Spatial Debris Point Cloud
    const debrisCount = 1200;
    const positions = new Float32Array(debrisCount * 3);
    const colors = new Float32Array(debrisCount * 3);

    for (let i = 0; i < debrisCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      // LEO orbital shells (500 km - 1200 km) -> normalized radius 4.2 to 5.4
      const r = 4.0 + Math.random() * 1.6;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Amber/Crimson debris alerts vs cyan operational nodes
      const isCritical = Math.random() > 0.85;
      if (isCritical) {
        colors[i * 3] = 0.96;
        colors[i * 3 + 1] = 0.62;
        colors[i * 3 + 2] = 0.04;
      } else {
        colors[i * 3] = 0.0;
        colors[i * 3 + 1] = 0.63;
        colors[i * 3 + 2] = 1.0;
      }
    }

    const debrisGeom = new THREE.BufferGeometry();
    debrisGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    debrisGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const debrisMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });

    this.debrisCloud = new THREE.Points(debrisGeom, debrisMat);
    this.group.add(this.debrisCloud);
  }

  update(dt: number, pointer: { x: number; y: number }): void {
    this.time += dt;

    // Slow planetary rotation with slight pointer tilt
    this.earth.rotation.y += dt * 0.08 + pointer.x * 0.01;
    this.earth.rotation.x = pointer.y * 0.05;

    // Orbiting debris cloud rotates in reverse
    if (this.debrisCloud) {
      this.debrisCloud.rotation.y -= dt * 0.04;
    }

    // Update travelling pulse shaders on arcs
    this.arcs.forEach((arc) => {
      if ((arc.material as any).uniforms?.uTime) {
        (arc.material as any).uniforms.uTime.value = this.time;
      }
    });
  }
}
