import { useMemo } from 'react';
import * as THREE from 'three';

function GlassPanel({ position, size, rotation = [0, 0, 0] }) {
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <meshPhysicalMaterial
        color="#88ccff"
        transparent
        opacity={0.12}
        roughness={0.05}
        metalness={0.1}
        side={THREE.DoubleSide}
        envMapIntensity={0.5}
      />
    </mesh>
  );
}

function NeonEdge({ start, end, color = '#00f0ff' }) {
  const points = useMemo(() => [new THREE.Vector3(...start), new THREE.Vector3(...end)], [start, end]);
  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    return geom;
  }, [points]);

  return (
    <group>
      <line geometry={geometry}>
        <lineBasicMaterial color={color} linewidth={2} />
      </line>
      <mesh>
        <tubeGeometry args={[new THREE.CatmullRomCurve3(points), 8, 0.025, 8, false]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function Sign() {
  return (
    <group position={[0, 4.8, 0]}>
      {/* Sign background */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[3.2, 0.7, 0.08]} />
        <meshStandardMaterial color="#1e3a80" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Neon border - top */}
      <NeonEdge start={[-1.5, 0.3, 0]} end={[1.5, 0.3, 0]} color="#ff00aa" />
      {/* Neon border - bottom */}
      <NeonEdge start={[-1.5, -0.3, 0]} end={[1.5, -0.3, 0]} color="#ff00aa" />
      {/* Neon border - left */}
      <NeonEdge start={[-1.5, -0.3, 0]} end={[-1.5, 0.3, 0]} color="#ff00aa" />
      {/* Neon border - right */}
      <NeonEdge start={[1.5, -0.3, 0]} end={[1.5, 0.3, 0]} color="#ff00aa" />
    </group>
  );
}

export default function Machine() {
  const W = 3.6;
  const D = 2.8;
  const H = 4.5;
  const halfW = W / 2;
  const halfD = D / 2;

  const neonColor = '#00f0ff';
  const accentColor = '#ff00aa';

  return (
    <group>
      {/* Floor */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W - 0.1, D - 0.1]} />
        <meshStandardMaterial
          color="#1a2d70"
          metalness={0.9}
          roughness={0.3}
        />
      </mesh>

      {/* Back wall - solid dark */}
      <mesh position={[0, H / 2, -halfD]}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial
          color="#14276a"
          metalness={0.5}
          roughness={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Glass panels */}
      {/* Front */}
      <GlassPanel position={[0, H / 2, halfD]} size={[W, H]} />
      {/* Left */}
      <GlassPanel
        position={[-halfW, H / 2, 0]}
        size={[D, H]}
        rotation={[0, Math.PI / 2, 0]}
      />
      {/* Right */}
      <GlassPanel
        position={[halfW, H / 2, 0]}
        size={[D, H]}
        rotation={[0, -Math.PI / 2, 0]}
      />
      {/* Glass panels with slightly higher opacity */}
      <mesh position={[0, H / 2, halfD]} rotation={[0, 0, 0]}>
        <planeGeometry args={[W - 0.1, H - 0.1]} />
        <meshPhysicalMaterial
          color="#88ccff"
          transparent
          opacity={0.06}
          roughness={0.05}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Neon edges - front face */}
      <NeonEdge start={[-halfW, 0, halfD]} end={[halfW, 0, halfD]} color={neonColor} />
      <NeonEdge start={[-halfW, H, halfD]} end={[halfW, H, halfD]} color={neonColor} />
      <NeonEdge start={[-halfW, 0, halfD]} end={[-halfW, H, halfD]} color={neonColor} />
      <NeonEdge start={[halfW, 0, halfD]} end={[halfW, H, halfD]} color={neonColor} />

      {/* Neon edges - back face */}
      <NeonEdge start={[-halfW, 0, -halfD]} end={[halfW, 0, -halfD]} color={accentColor} />
      <NeonEdge start={[-halfW, H, -halfD]} end={[halfW, H, -halfD]} color={accentColor} />

      {/* Neon edges - left face */}
      <NeonEdge start={[-halfW, 0, -halfD]} end={[-halfW, 0, halfD]} color={neonColor} />
      <NeonEdge start={[-halfW, H, -halfD]} end={[-halfW, H, halfD]} color={neonColor} />

      {/* Neon edges - right face */}
      <NeonEdge start={[halfW, 0, -halfD]} end={[halfW, 0, halfD]} color={neonColor} />
      <NeonEdge start={[halfW, H, -halfD]} end={[halfW, H, halfD]} color={neonColor} />

      {/* Top panel */}
      <mesh position={[0, H + 0.05, 0]}>
        <boxGeometry args={[W + 0.2, 0.1, D + 0.2]} />
        <meshStandardMaterial color="#1e3a80" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Bottom base */}
      <mesh position={[0, -0.15, 0]}>
        <boxGeometry args={[W + 0.3, 0.3, D + 0.3]} />
        <meshStandardMaterial color="#1e3a80" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Corner pillars */}
      {[
        [-halfW, -halfD],
        [halfW, -halfD],
        [-halfW, halfD],
        [halfW, halfD],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, H / 2, z]}>
          <boxGeometry args={[0.08, H, 0.08]} />
          <meshStandardMaterial
            color="#1e3a80"
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      ))}

      {/* Sign on top */}
      <Sign />

      {/* Claw rail - X axis */}
      <mesh position={[0, 3.8, 0]}>
        <boxGeometry args={[W - 0.3, 0.06, 0.06]} />
        <meshStandardMaterial color="#244890" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Claw rail - Z axis (moves with claw) - rendered in Claw component */}
    </group>
  );
}
