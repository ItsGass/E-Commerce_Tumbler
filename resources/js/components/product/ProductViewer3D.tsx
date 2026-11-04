'use client';

import { Suspense, lazy, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

export interface VariantTexture {
  id: number;
  name: string;
  color_hex: string;
  texture_url: string | null;
  glb_url: string | null;
}

interface ProductViewer3DProps {
  glbUrl: string | null;
  variantTextures: VariantTexture[];
  defaultVariantIndex?: number;
  fallbackImage?: string;
  className?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

// Lazy load the heavy 3D inner component
const ViewerInner = lazy(() => 
  import('./ViewerInner').then(module => ({ default: module.ViewerInner }))
);

function ViewerSkeleton() {
  return (
    <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 animate-pulse flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary-600 dark:border-primary-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

/** WebGL capability check: `Canvas fallback` only fills <canvas> children. */
function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

function FallbackImage({ 
  src, 
  message = '3D model unavailable',
  className 
}: { 
  src?: string; 
  message?: string; 
  className?: string;
}) {
  return (
    <div className={cn('relative aspect-square w-full bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden flex items-center justify-center', className)}>
      {src ? (
        <img 
          src={src} 
          alt={message}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="text-center p-4 text-gray-500 dark:text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">{message}</p>
        </div>
      )}
    </div>
  );
}

export function ProductViewer3D({
  glbUrl,
  variantTextures = [],
  defaultVariantIndex = 0,
  fallbackImage,
  className,
  onLoad,
  onError,
}: ProductViewer3DProps) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [webglAvailable] = useState(() => typeof window !== 'undefined' && detectWebGL());

  const handleLoad = useCallback(() => {
    setStatus('ready');
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback((e: Error) => {
    setStatus('error');
    onError?.(e);
  }, [onError]);

  // If WebGL is unavailable (or the model failed), show the image fallback.
  if (!webglAvailable || status === 'error') {
    return (
      <div className={cn('relative aspect-square w-full rounded-xl overflow-hidden', className)}>
        <FallbackImage
          src={fallbackImage}
          message={webglAvailable ? '3D model failed to load' : '3D preview unavailable'}
        />
      </div>
    );
  }

  return (
    <div className={cn('relative aspect-square w-full bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden', className)}>
      <Suspense fallback={<ViewerSkeleton />}>
        <ViewerInner
          glbUrl={glbUrl}
          variantTextures={variantTextures}
          defaultVariantIndex={defaultVariantIndex}
          onLoad={handleLoad}
          onError={handleError}
        />
      </Suspense>
      
      {status === 'loading' && <ViewerSkeleton />}
    </div>
  );
}
