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
    <div className="absolute inset-0 bg-panel animate-pulse flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
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
    <div className={cn('relative aspect-square w-full bg-panel rounded-xl overflow-hidden flex items-center justify-center', className)}>
      {src ? (
        <img 
          src={src} 
          alt={message}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="text-center p-4 text-muted">
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
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetToken, setResetToken] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleLoad = useCallback(() => {
    setStatus('ready');
    onLoad?.();
  }, [onLoad]);

  const handleInteract = useCallback(() => {
    setHasInteracted(true);
  }, []);

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
    <div className={cn('relative aspect-square w-full bg-panel rounded-xl overflow-hidden', className)}>
      <Suspense fallback={<ViewerSkeleton />}>
        <ViewerInner
          glbUrl={glbUrl}
          variantTextures={variantTextures}
          defaultVariantIndex={defaultVariantIndex}
          autoRotate={autoRotate}
          resetToken={resetToken}
          onInteract={handleInteract}
          onLoad={handleLoad}
          onError={handleError}
        />
      </Suspense>

      {status === 'loading' && <ViewerSkeleton />}

      {/*
        Viewer dock. The canvas has no visible chrome of its own, so nothing
        told visitors the model could be dragged. The hint fades on first
        interaction and the two controls stay available afterwards.
      */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-2 p-3">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full bg-surface/80 px-2.5 py-1.5 text-xs font-medium text-muted ring-1 ring-ink/10 backdrop-blur transition-opacity duration-300',
            hasInteracted ? 'opacity-0' : 'opacity-100'
          )}
          aria-hidden={hasInteracted}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 7.5A8.25 8.25 0 0112 3.75c2.9 0 5.44 1.5 6.9 3.77m0 0V3.75m0 3.77h-3.77M19.5 16.5A8.25 8.25 0 0112 20.25a8.25 8.25 0 01-6.9-3.77m0 0v3.77m0-3.77h3.77" />
          </svg>
          Drag to rotate
        </span>

        <div className="pointer-events-auto flex items-center gap-1 rounded-full bg-surface/90 p-1 shadow-card ring-1 ring-ink/10 backdrop-blur">
          <button
            type="button"
            onClick={() => setAutoRotate((value) => !value)}
            aria-pressed={autoRotate}
            aria-label={autoRotate ? 'Stop auto-rotation' : 'Start auto-rotation'}
            title={autoRotate ? 'Stop auto-rotation' : 'Start auto-rotation'}
            className={cn(
              'inline-flex h-11 w-11 sm:h-9 sm:w-9 items-center justify-center rounded-full transition-colors',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:ring-offset-page',
              autoRotate
                ? 'bg-accent text-accent-foreground hover:bg-accent-hover'
                : 'text-muted hover:bg-panel hover:text-accent dark:text-muted hover:text-ink'
            )}
          >
            {autoRotate ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="7" y="6" width="3.5" height="12" rx="1" />
                <rect x="13.5" y="6" width="3.5" height="12" rx="1" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5.5v13a1 1 0 001.53.85l10-6.5a1 1 0 000-1.7l-10-6.5A1 1 0 008 5.5z" />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={() => setResetToken((value) => value + 1)}
            aria-label="Reset view"
            title="Reset view"
            className={cn(
              'inline-flex h-11 w-11 sm:h-9 sm:w-9 items-center justify-center rounded-full text-muted transition-colors',
              'hover:bg-panel hover:text-accent dark:text-muted hover:text-ink',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:ring-offset-page'
            )}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12a8.25 8.25 0 1116.5 0 8.25 8.25 0 01-16.5 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v3.75l2.5 1.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
