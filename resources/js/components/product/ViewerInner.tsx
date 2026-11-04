'use client';

import { useEffect, useMemo, useRef, useState, Suspense, type ComponentRef } from 'react';
import { Canvas, useLoader, useThree } from '@react-three/fiber';
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
  autoRotate?: boolean;
  /** Increment to snap the camera back to its default framing. */
  resetToken?: number;
  onInteract?: () => void;
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

// Camera framing shared by the controls and the reset state.
const CAMERA_TARGET: [number, number, number] = [0, 0.52, 0];

/**
 * Tailwind's `dark:` variant follows the OS colour scheme here, so the canvas
 * has to read the same media query instead of a class on <html>.
 */
function usePrefersDark(): boolean {
  const [isDark, setIsDark] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches,
  );

  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent) => setIsDark(event.matches);
    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, []);

  return isDark;
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
  const prefersDark = usePrefersDark();
  const invalidate = useThree((state) => state.invalidate);

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
    // A dark slate shadow is invisible on the dark surface, so dark mode gets a
    // cool teal bounce instead: it reads as light spilling under the tumbler.
    const stops = prefersDark
      ? ['rgba(127, 196, 191, 0.4)', 'rgba(75, 167, 161, 0.15)', 'rgba(75, 167, 161, 0)']
      : ['rgba(15, 23, 42, 0.5)', 'rgba(15, 23, 42, 0.22)', 'rgba(15, 23, 42, 0)'];
    gradient.addColorStop(0, stops[0]);
    gradient.addColorStop(0.5, stops[1]);
    gradient.addColorStop(1, stops[2]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [prefersDark]);

  useEffect(() => () => texture?.dispose(), [texture]);

  // frameloop="demand" would keep the old shadow after an OS theme switch.
  useEffect(() => {
    invalidate();
  }, [texture, invalidate]);

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
  autoRotate = false,
  resetToken = 0,
  onInteract,
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
  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null);
  const invalidate = useThree((state) => state.invalidate);

  // OrbitControls is built before the `target` prop is applied, so its saved
  // `target0` would be the origin and "Reset view" would aim at the base.
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) {
      return;
    }
    controls.target.set(...CAMERA_TARGET);
    controls.update();
    controls.saveState();
  }, []);

  // Restore the default framing. `reset()` dispatches a change event, which
  // three's controls forward to R3F's invalidate, so this also repaints under
  // frameloop="demand".
  useEffect(() => {
    if (resetToken > 0) {
      controlsRef.current?.reset();
    }
  }, [resetToken]);

  // frameloop="demand" only renders when something invalidates, and
  // OrbitControls.start() on auto-rotation only reports a change once a frame
  // has run. Drive the loop from rAF while auto-rotation is enabled; it is the
  // only state where the scene is not static.
  useEffect(() => {
    if (!autoRotate) {
      return;
    }
    let frame = 0;
    const tick = () => {
      invalidate();
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [autoRotate, invalidate]);

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
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.06}
        target={CAMERA_TARGET}
        minDistance={1.6}
        maxDistance={3.6}
        minPolarAngle={0.35}
        maxPolarAngle={1.45}
        enablePan={false}
        autoRotate={autoRotate}
        autoRotateSpeed={1.6}
        onStart={onInteract}
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
  autoRotate = false,
  resetToken = 0,
  onInteract,
  onLoad,
  onError,
}: ViewerInnerProps) {
  return (
    <Canvas
      className="viewer-canvas"
      // 3/4 view aimed at the middle of the body: sphere-fit distance for a
      // 1-unit model at fov 33. The previous setup cropped the rim.
      camera={{ position: [0.9, 1.21, 1.83], fov: 33, near: 0.1, far: 20 }}
      dpr={[1, 1.75]}
      // The scene is static between gestures: repaint only when OrbitControls
      // reports movement instead of rendering at 60fps forever.
      frameloop="demand"
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <ViewerContent
        glbUrl={glbUrl}
        variantTextures={variantTextures}
        defaultVariantIndex={defaultVariantIndex}
        autoRotate={autoRotate}
        resetToken={resetToken}
        onInteract={onInteract}
        onLoad={onLoad}
        onError={onError}
      />
    </Canvas>
  );
}
