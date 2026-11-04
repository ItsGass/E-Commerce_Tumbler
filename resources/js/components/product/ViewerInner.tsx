'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls, Environment, Html, ContactShadows } from '@react-three/drei';
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

// Error boundary fallback for GLB
function GLBFallback({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// Main viewer component with controls
function ViewerContent({
  glbUrl,
  variantTextures,
  defaultVariantIndex = 0,
  onLoad,
  onError,
}: ViewerInnerProps) {
  const [currentVariant, setCurrentVariant] = useState(defaultVariantIndex);
  const [useProcedural, setUseProcedural] = useState(!glbUrl);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const { gl } = useThree();

  // Load texture for current variant
  useEffect(() => {
    const variant = variantTextures[currentVariant];
    if (variant?.texture_url) {
      const loader = new THREE.TextureLoader();
      loader.load(variant.texture_url, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        setTexture(tex);
      });
    } else {
      setTexture(null);
    }
  }, [currentVariant, variantTextures]);

  // Handle GLB load error
  const handleGLBError = (e: Error) => {
    console.warn('GLB failed to load, switching to procedural:', e);
    setUseProcedural(true);
    onError?.(e);
  };

  // Switch to variant's GLB if available
  const variant = variantTextures[currentVariant];
  const activeGlbUrl = variant?.glb_url || glbUrl;

  return (
    <>
      <Environment preset="studio" background={false} />
      <ContactShadows opacity={0.3} scale={1.5} blur={2} far={10} position={[0, -0.5, 0]} />
      
      {!useProcedural && activeGlbUrl ? (
        <Suspense fallback={<ProceduralTumbler color={variant?.color_hex || '#1a1a1a'} texture={texture || undefined} />}>
          <GLBModel
            url={activeGlbUrl}
            onLoad={onLoad}
            onError={handleGLBError}
          />
        </Suspense>
      ) : (
        <ProceduralTumbler color={variant?.color_hex || '#1a1a1a'} texture={texture || undefined} />
      )}

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minZoom={0.5}
        maxZoom={3}
        maxPolarAngle={Math.PI / 2 - 0.05}
        minPolarAngle={0.1}
        enablePan={false}
        autoRotate={false}
        touches={{
          ONE: THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.DOLLY_ROTATE,
        }}
      />

      {/* Variant selector overlay */}
      <Html
        position={[0, 1.3, 0]}
        transform={true}
        style={{ pointerEvents: 'none', zIndex: 10 }}
      >
        <div className="flex gap-2" style={{ pointerEvents: 'auto' }}>
          {variantTextures.map((v, i) => (
            <button
              key={v.id}
              onClick={() => setCurrentVariant(i)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                i === currentVariant
                  ? 'border-white scale-110 shadow-lg'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
              style={{
                backgroundColor: v.texture_url
                  ? `url(${v.texture_url})`
                  : v.color_hex,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
              aria-label={v.name}
              title={v.name}
            />
          ))}
        </div>
      </Html>
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
      camera={{ position: [0, 1.2, 2.5], fov: 45 }}
      onCreated={({ gl }) => {
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
      }}
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
