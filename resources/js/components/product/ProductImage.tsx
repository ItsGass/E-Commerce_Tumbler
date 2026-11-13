'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ProductImageProps {
  src?: string | null;
  alt: string;
  /** Applied to the image, or to the fallback tile when there is no image. */
  className?: string;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
}

/**
 * Product thumbnail with a designed fallback.
 *
 * Seeded products reference image rows whose files do not exist yet, and an
 * upload can be removed after a product is saved. Both cases used to render the
 * browser's broken-image glyph. Reset the failure state whenever `src` changes
 * so a newly uploaded image is retried instead of staying broken.
 */
export function ProductImage({
  src,
  alt,
  className,
  loading = 'lazy',
  decoding = 'async',
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        className={cn(
          'flex h-full w-full items-center justify-center bg-gradient-to-br from-tint-1 via-surface to-tint-4',
          className
        )}
        role="img"
        aria-label={alt}
      >
        <svg
          viewBox="0 0 64 80"
          className="h-[72%] w-auto text-accent/25"
          fill="none"
          aria-hidden="true"
        >
          {/* Tumbler silhouette: tapered body, lid band and straw. */}
          <path
            d="M18 8h28l-2.6 8H20.6L18 8Z"
            fill="currentColor"
            fillOpacity="0.55"
          />
          <path
            d="M21.5 18h21l-2.4 48a6 6 0 0 1-6 5.6H29.9a6 6 0 0 1-6-5.6l-2.4-48Z"
            fill="currentColor"
          />
          <path
            d="M22.6 26h18.8l-2.3 46.2H24.9L22.6 26Z"
            fill="currentColor"
            fillOpacity="0.35"
          />
          <rect x="31" y="1" width="2" height="10" rx="1" fill="currentColor" fillOpacity="0.5" />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn('h-full w-full object-cover', className)}
      loading={loading}
      decoding={decoding}
      onError={() => setFailed(true)}
    />
  );
}
