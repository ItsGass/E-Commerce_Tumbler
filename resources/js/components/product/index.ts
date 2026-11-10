export { ProductViewer3D } from './ProductViewer3D';
export { ProductCard } from './ProductCard';
export { ProductImage } from './ProductImage';
export { HeroMarquee } from './HeroMarquee';
export type { HeroMarqueeProduct } from './HeroMarquee';
export { VariantSelector } from './VariantSelector';
export type { VariantTexture } from './ProductViewer3D';
// ProceduralTumbler is intentionally not re-exported: it imports three, and the
// catalog/home pages import this barrel for ProductCard only. Re-exporting it
// pulled the whole 3D renderer into the catalog bundle.
