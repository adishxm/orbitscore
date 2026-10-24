/**
 * GPU Starfield Shader Material
 * Renders high-performance point starfield with harmonic twinkle.
 */

import * as THREE from 'three';

export const StarfieldShader = {
  vertexShader: /* glsl */ `
    uniform float uTime;
    attribute float aSize;
    attribute float aTwinkleSpeed;
    attribute float aPhase;
    varying float vAlpha;

    void main() {
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mvPosition;

      // Distance attenuation
      gl_PointSize = aSize * (300.0 / -mvPosition.z);

      // Twinkle calculation
      float twinkle = sin(uTime * aTwinkleSpeed + aPhase) * 0.5 + 0.5;
      vAlpha = 0.35 + twinkle * 0.65;
    }
  `,
  fragmentShader: /* glsl */ `
    varying float vAlpha;

    void main() {
      // Soft circular point sprite
      vec2 coord = gl_PointCoord - vec2(0.5);
      float dist = length(coord);
      if (dist > 0.5) discard;

      float alpha = smoothstep(0.5, 0.05, dist) * vAlpha;
      gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
    }
  `,
};

export function createStarfield(count = 2000, radius = 250): THREE.Points {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const speeds = new Float32Array(count);
  const phases = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = radius * (0.8 + Math.random() * 0.4);

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    sizes[i] = 1.0 + Math.random() * 2.5;
    speeds[i] = 0.8 + Math.random() * 2.2;
    phases[i] = Math.random() * Math.PI * 2.0;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('aTwinkleSpeed', new THREE.BufferAttribute(speeds, 1));
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

  const material = new THREE.ShaderMaterial({
    vertexShader: StarfieldShader.vertexShader,
    fragmentShader: StarfieldShader.fragmentShader,
    uniforms: {
      uTime: { value: 0 },
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  return new THREE.Points(geometry, material);
}
