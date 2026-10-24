/**
 * Procedural Earth Surface & Night Lights Shader Material
 * Renders day/night illumination blend with illuminated night clusters.
 */

import * as THREE from 'three';

export const EarthShader = {
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vUv = uv;
      vNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 uSunDirection;
    uniform vec3 uOceanColor;
    uniform vec3 uLandColor;
    uniform vec3 uNightCityColor;
    uniform float uTime;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    // Procedural pseudo-noise for continental silhouettes
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
        u.y
      );
    }

    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      vec2 shift = vec2(100.0);
      mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
      for (int i = 0; i < 5; ++i) {
        v += a * noise(p);
        p = rot * p * 2.0 + shift;
        a *= 0.5;
      }
      return v;
    }

    void main() {
      // Continental mask from noise
      vec2 uvCoords = vUv * vec2(8.0, 4.0);
      float landMask = fbm(uvCoords);
      landMask = smoothstep(0.48, 0.55, landMask);

      // Sun lighting factor
      float NdotL = dot(vNormal, normalize(uSunDirection));
      float dayFactor = clamp(NdotL * 1.5 + 0.1, 0.0, 1.0);
      float nightFactor = 1.0 - dayFactor;

      // Base daylight color
      vec3 surfaceDay = mix(uOceanColor, uLandColor, landMask);

      // Night city lights on land
      float cityDensity = noise(uvCoords * 4.0) * landMask;
      cityDensity = step(0.65, cityDensity);
      vec3 cityGlow = uNightCityColor * cityDensity * 2.2 * nightFactor;

      // Atmosphere rim fade
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      float rim = 1.0 - max(dot(viewDir, vNormal), 0.0);
      vec3 atmosphericRim = vec3(0.0, 0.63, 1.0) * pow(rim, 3.0) * dayFactor * 0.8;

      vec3 finalColor = surfaceDay * dayFactor + cityGlow + atmosphericRim;
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `,
};

export function createEarthMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: EarthShader.vertexShader,
    fragmentShader: EarthShader.fragmentShader,
    uniforms: {
      uSunDirection: { value: new THREE.Vector3(1.2, 0.8, 1.0).normalize() },
      uOceanColor: { value: new THREE.Color(0x06111e) },
      uLandColor: { value: new THREE.Color(0x132333) },
      uNightCityColor: { value: new THREE.Color(0xffbf33) },
      uTime: { value: 0 },
    },
    roughness: 0.6,
  } as any);
}
