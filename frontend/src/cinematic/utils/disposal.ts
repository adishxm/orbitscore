/**
 * Three.js Resource Disposal Utilities
 * Prevents memory leaks by recursively releasing GPU memory, textures, and buffers.
 */

import * as THREE from 'three';

export function disposeHierarchy(root: THREE.Object3D): void {
  root.traverse((obj) => {
    if (obj instanceof THREE.Mesh || obj instanceof THREE.Points || obj instanceof THREE.Line) {
      if (obj.geometry) {
        obj.geometry.dispose();
      }

      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(disposeMaterial);
        } else {
          disposeMaterial(obj.material);
        }
      }
    }
  });
}

export function disposeMaterial(material: THREE.Material): void {
  material.dispose();

  // Inspect material uniforms and properties for textures
  const matAny = material as any;
  for (const key of Object.keys(matAny)) {
    const val = matAny[key];
    if (val && typeof val === 'object' && val.isTexture) {
      val.dispose();
    }
    if (key === 'uniforms' && val) {
      for (const uKey of Object.keys(val)) {
        const uVal = val[uKey]?.value;
        if (uVal && typeof uVal === 'object' && uVal.isTexture) {
          uVal.dispose();
        }
      }
    }
  }
}

export function disposeRenderTarget(target: THREE.WebGLRenderTarget | null): void {
  if (target) {
    if (target.texture) target.texture.dispose();
    if (target.depthTexture) target.depthTexture.dispose();
    target.dispose();
  }
}
