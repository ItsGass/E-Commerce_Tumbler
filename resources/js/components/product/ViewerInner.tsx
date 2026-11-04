'use client';

import { useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls, Environment, Lightformer } from '@react-three/drei';
import { ProceduralTumbler } from './ProceduralTumbler';
import * as THREE from 'three';

interface VariantTexture {
  id: number;
  name: string;
  color_hex: string;
  texture_url: string | null;
  glb_url: string | null;
}

interface ViewerInnerProps {
  glbUrl: string | null;
  variantTextures: VariantTexture[];
  defaultVariantIndex?: number;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

interface GLTFResult {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
  cameras: THREE.Camera[];
  assets: { generator: string; version: string };
  parser: any;
  userData: any;
}

declare global {
  namespace THREE {
    interface Group {}
    interface AnimationClip {}
    interface Camera {}
  }
}

// Separate component for GLB model to handle loading errors
function GLBModel({ url, onLoad, onError }: { url: string; onLoad?: () => void; onError?: (error: Error) => void }) {
  const gltf = useLoader(GLTFLoader, url);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (gltf?.scene && groupRef.current) {
      groupRef.current.add(gltf.scene);
      onLoad?.();
    }
  }, [gltf, onLoad]);

  useEffect(() => {
    return () => {
      if (gltf?.scene) {
        gltf.scene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry?.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach(m => m.dispose());
            } else {
              child.material?.dispose();
            }
          }
        });
      }
    };
  }, [gltf]);

  return <group ref={groupRef} />;
}

/**
 * Soft contact shadow.
 *
 * drei's ContactShadows produced nothing with three 0.187 (verified with
 * opacity 1, a red colour and a mid-height position), so draw a deterministic
 * radial gradient instead. The tumbler is symmetric, so a centred ellipse is
 * the correct ground contact.
 */
function SoftShadow() {
  const texture = useMemo(() => {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return null;
    }
    const gradient = ctx.createRadialGradient(
      size / 2,
      size / 2,
      size * 0.04,
      size / 2,
      size / 2,
      size * 0.5,
    );
    gradient.addColorStop(0, 'rgba(15, 23, 42, 0.5)');
    gradient.addColorStop(0.5, 'rgba(15, 23, 42, 0.22)');
    gradient.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  useEffect(() => () => texture?.dispose(), [texture]);

  if (!texture) {
    return null;
  }

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
      <planeGeometry args={[1.1, 1.1]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

// Main viewer component with controls
function ViewerContent({
  glbUrl,
  variantTextures,
  defaultVariantIndex = 0,
  onLoad,
  onError,
}: ViewerInnerProps) {
  // Follow the page-level variant selector instead of keeping a private index.
  const variantIndex = Math.min(
    Math.max(defaultVariantIndex, 0),
    Math.max(variantTextures.length - 1, 0),
  );
  const [useProcedural, setUseProcedural] = useState(!glbUrl);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const textureRef = useRef<THREE.Texture | null>(null);

  // Load the optional variant texture and dispose the previous one.
  useEffect(() => {
    let cancelled = false;
    const variant = variantTextures[variantIndex];

    textureRef.current?.dispose();
    textureRef.current = null;
    setTexture(null);

    if (variant?.texture_url) {
      new THREE.TextureLoader().load(variant.texture_url, (tex) => {
        if (cancelled) {
          tex.dispose();
          return;
        }
        tex.colorSpace = THREE.SRGBColorSpace;
        textureRef.current = tex;
        setTexture(tex);
      });
    }

    return () => {
      cancelled = true;
    };
  }, [variantIndex, variantTextures]);

  useEffect(() => () => textureRef.current?.dispose(), []);

  // The procedural model is available as soon as it mounts; without this the
  // loading skeleton stays on top of the canvas forever.
  useEffect(() => {
    if (useProcedural) {
      onLoad?.();
    }
  }, [useProcedural, onLoad]);

  // Handle GLB load error
  const handleGLBError = (e: Error) => {
    console.warn('GLB failed to load, switching to procedural:', e);
    setUseProcedural(true);
    onError?.(e);
  };

  // Switch to variant's GLB if available
  const variant = variantTextures[variantIndex];
  const activeGlbUrl = variant?.glb_url || glbUrl;

  return (
    <>
      {/* Local studio environment: no remote HDR download, works offline. */}
      <Environment resolution={256} frames={1}>
        <Lightformer
          form="rect"
          intensity={4}
          position={[0, 3, 2]}
          scale={[6, 3, 1]}
          target={[0, 0.5, 0]}
        />
        <Lightformer
          form="rect"
          intensity={2}
          position={[-3, 1.5, 1]}
          scale={[3, 4, 1]}
          target={[0, 0.5, 0]}
        />
        <Lightformer
          form="ring"
          intensity={3}
          position={[2.5, 2.5, -1]}
          scale={2}
          target={[0, 0.5, 0]}
        />
        {/* Large front fill so metals reflect a broad light surface instead of
            reading as black. */}
        <Lightformer
          form="rect"
          intensity={1.2}
          position={[0, 0.8, 4]}
          scale={[8, 5, 1]}
          target={[0, 0.5, 0]}
        />
      </Environment>

      <directionalLight position={[3, 4, 2]} intensity={1.4} />
      <directionalLight position={[-3, 2, -2]} intensity={0.5} color="#bcd7d5" />

      <SoftShadow />

      {!useProcedural && activeGlbUrl ? (
        <Suspense
          fallback={
            <ProceduralTumbler
              color={variant?.color_hex || '#1a1a1a'}
              texture={texture}
              finishName={variant?.name}
            />
          }
        >
          <GLBModel url={activeGlbUrl} onLoad={onLoad} onError={handleGLBError} />
        </Suspense>
      ) : (
        <ProceduralTumbler
          color={variant?.color_hex || '#1a1a1a'}
          texture={texture}
          finishName={variant?.name}
        />
      )}

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.06}
        target={[0, 0.52, 0]}
        minDistance={1.6}
        maxDistance={3.6}
        minPolarAngle={0.35}
        maxPolarAngle={1.45}
        enablePan={false}
        autoRotate={false}
        touches={{
          ONE: THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.DOLLY_ROTATE,
        }}
      />
    </>
  );
}

export function ViewerInner({
  glbUrl,
  variantTextures,
  defaultVariantIndex = 0,
  onLoad,
  onError,
}: ViewerInnerProps) {
  return (
    <Canvas
      // 3/4 view aimed at the middle of the body: sphere-fit distance for a
      // 1-unit model at fov 33. The previous setup cropped the rim.
      camera={{ position: [0.9, 1.21, 1.83], fov: 33, near: 0.1, far: 20 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <ViewerContent
        glbUrl={glbUrl}
        variantTextures={variantTextures}
        defaultVariantIndex={defaultVariantIndex}
        onLoad={onLoad}
        onError={onError}
      />
    </Canvas>
  );
}
