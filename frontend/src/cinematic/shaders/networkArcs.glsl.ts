/**
 * Great-Circle Network Arcs Shader Material
 * Renders animated travelling light pulses along orbital and terrestrial baseline splines.
 */

import * as THREE from 'three';

export const NetworkArcShader = {
  vertexShader: /* glsl */ `
    attribute float aProgress;
    varying float vProgress;

    void main() {
      vProgress = aProgress;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 uColor;
    uniform float uTime;
    uniform float uPulseSpeed;
    uniform float uPulseLength;
    varying float vProgress;

    void main() {
      // Base static glow
      float baseLine = 0.22;

      // Travelling pulse equation
      float pulsePos = fract(uTime * uPulseSpeed);
      float dist = abs(vProgress - pulsePos);
      dist = min(dist, 1.0 - dist); // wrap-around

      float pulse = smoothstep(uPulseLength, 0.0, dist);
      float alpha = clamp(baseLine + pulse * 0.78, 0.0, 1.0);

      gl_FragColor = vec4(uColor, alpha);
    }
  `,
};

export function createNetworkArcMaterial(color = 0x00a1ff, speed = 0.45, length = 0.12): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: NetworkArcShader.vertexShader,
    fragmentShader: NetworkArcShader.fragmentShader,
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uTime: { value: 0 },
      uPulseSpeed: { value: speed },
      uPulseLength: { value: length },
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
}
