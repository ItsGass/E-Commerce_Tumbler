import { useMemo } from 'react';
import { Mesh, LatheGeometry, MeshStandardMaterial, DoubleSide, Color, Group, Vector2 } from 'three';

interface ProceduralTumblerProps {
  color?: string;
  texture?: any; // useTexture from @react-three/fiber
}

/**
 * Procedural tumbler using LatheGeometry - fallback when GLB fails to load
 * Creates a tumbler shape by rotating a profile curve around Y axis
 */
export function ProceduralTumbler({ color = '#1a1a1a', texture }: ProceduralTumblerProps) {
  // Create the profile curve for a tumbler shape
  // Profile: bottom radius, height, top radius, wall thickness
  const profilePoints = useMemo(() => {
    const points = [];
    const wallThickness = 0.04;
    const bottomRadius = 0.35;
    const topRadius = 0.38;
    const height = 1.0;
    const rimHeight = 0.05;

    // Outer wall - bottom to top
    points.push({ x: bottomRadius, y: 0 });
    points.push({ x: bottomRadius, y: height - rimHeight });
    points.push({ x: topRadius, y: height - rimHeight });
    points.push({ x: topRadius, y: height });

    // Rim inner edge
    points.push({ x: topRadius - wallThickness, y: height });
    points.push({ x: topRadius - wallThickness, y: height - rimHeight });

    // Inner wall - top to bottom
    points.push({ x: bottomRadius - wallThickness, y: height - rimHeight });
    points.push({ x: bottomRadius - wallThickness, y: 0 });
    points.push({ x: 0, y: 0 });

    return points;
  }, []);

  const geometry = useMemo(() => {
    const shape = profilePoints.map(p => new Vector2(p.x, p.y));
    const geo = new LatheGeometry(shape, 64);
    geo.computeVertexNormals();
    return geo;
  }, [profilePoints]);

  const material = useMemo(() => {
    const mat = new MeshStandardMaterial({
      color: new Color(color),
      roughness: 0.3,
      metalness: 0.7,
      side: DoubleSide,
      envMapIntensity: 1.5,
    });

    if (texture) {
      mat.map = texture;
      mat.needsUpdate = true;
    }

    return mat;
  }, [color, texture]);

  return (
    <group>
      <mesh geometry={geometry} material={material} castShadow receiveShadow />
    </group>
  );
}
