import { useMemo } from 'react';
import { DoubleSide, Vector2, type Texture } from 'three';

interface ProceduralTumblerProps {
  color?: string;
  texture?: Texture | null;
  /** Variant name, used to pick metallic vs painted surface values. */
  finishName?: string;
}

const METALLIC_FINISH = /silver|steel|chrome|copper|gold|metal|titanium/i;

/**
 * Tumbler profile rotated around the Y axis.
 *
 * The polyline is closed on the axis at both ends (y = 0 and y = 0.055), so the
 * lathe produces a hollow body with real wall thickness instead of two
 * coincident surfaces. Proportions follow a 20oz tumbler: h/d ≈ 2.1.
 */
const PROFILE: Array<[number, number]> = [
  // recessed base, then the outer wall
  [0.0, 0.0],
  [0.15, 0.0],
  [0.196, 0.004],
  [0.212, 0.02],
  [0.216, 0.06],
  [0.22, 0.4],
  [0.224, 0.82],
  [0.228, 0.92],
  [0.232, 0.94],
  // rounded rim
  [0.23, 0.948],
  [0.226, 0.948],
  [0.22, 0.94],
  // inner wall
  [0.212, 0.92],
  [0.208, 0.82],
  [0.206, 0.4],
  [0.204, 0.09],
  [0.196, 0.062],
  // inner floor (5.5cm of solid base)
  [0.12, 0.055],
  [0.0, 0.055],
];

const LID_TOP = 0.977;

export function ProceduralTumbler({
  color = '#1a1a1a',
  texture = null,
  finishName = '',
}: ProceduralTumblerProps) {
  const points = useMemo(() => PROFILE.map(([x, y]) => new Vector2(x, y)), []);
  const isMetallic = METALLIC_FINISH.test(finishName);

  return (
    <group>
      {/* Body: painted finishes get a clearcoat; metals go fully reflective. */}
      <mesh castShadow receiveShadow>
        <latheGeometry args={[points, 96]} />
        <meshPhysicalMaterial
          color={color}
          map={texture ?? undefined}
          side={DoubleSide}
          metalness={isMetallic ? 1 : 0.05}
          roughness={isMetallic ? 0.3 : 0.55}
          clearcoat={isMetallic ? 0.15 : 0.4}
          clearcoatRoughness={0.45}
          envMapIntensity={isMetallic ? 1.2 : 0.9}
        />
      </mesh>

      {/* Lid and its steel band */}
      <mesh position={[0, 0.962, 0]} castShadow>
        <cylinderGeometry args={[0.233, 0.233, 0.03, 64]} />
        <meshPhysicalMaterial
          color="#c2c8cc"
          metalness={0.95}
          roughness={0.28}
          envMapIntensity={1.1}
        />
      </mesh>
      <mesh position={[0, 0.952, 0]} castShadow>
        <cylinderGeometry args={[0.234, 0.234, 0.012, 64]} />
        <meshPhysicalMaterial
          color="#9aa2a6"
          metalness={0.95}
          roughness={0.35}
          envMapIntensity={1}
        />
      </mesh>

      {/* Sip opening: a dark disc flush with the lid top (no CSG needed). */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.09, LID_TOP + 0.001, 0]}>
        <circleGeometry args={[0.028, 24]} />
        <meshStandardMaterial color="#23272a" roughness={0.8} metalness={0} />
      </mesh>

      {/* Rubber base ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <torusGeometry args={[0.142, 0.008, 12, 64]} />
        <meshStandardMaterial color="#15181a" roughness={0.9} metalness={0} />
      </mesh>
    </group>
  );
}
