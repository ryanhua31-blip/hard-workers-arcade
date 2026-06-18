import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Stars } from '@react-three/drei';
import Machine from './Machine';
import Claw from './Claw';
import Prizes from './Prizes';

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]} receiveShadow>
      <planeGeometry args={[30, 30]} />
      <meshStandardMaterial
        color="#162E87"
        metalness={0.8}
        roughness={0.4}
      />
    </mesh>
  );
}

export default function Scene() {
  return (
    <Canvas
      camera={{ position: [0, 3.5, 6.5], fov: 45, near: 0.1, far: 100 }}
      shadows="basic"
      gl={{ antialias: true, alpha: false }}
      style={{ background: '#162E87' }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.35} color="#9999ff" />
      <directionalLight
        position={[5, 8, 5]}
        intensity={0.5}
        color="#ffffff"
        castShadow
      />
      <pointLight position={[0, 5, 2]} intensity={1.5} color="#00f0ff" distance={14} decay={2} />
      <pointLight position={[-3, 3, -2]} intensity={0.4} color="#ff00aa" distance={10} decay={2} />
      <pointLight position={[3, 3, -2]} intensity={0.4} color="#ffdd00" distance={10} decay={2} />

      {/* Spotlight on the machine */}
      <spotLight
        position={[0, 7, 3]}
        angle={0.4}
        penumbra={0.5}
        intensity={1.5}
        color="#ffffff"
        castShadow
      />

      {/* Stars in the background */}
      <Stars radius={50} depth={50} count={2000} factor={3} saturation={0.5} fade speed={1} />

      {/* Machine components */}
      <group position={[0, 0.3, 0]}>
        <Machine />
        <Claw />
        <Prizes />
      </group>

      {/* Floor */}
      <Floor />

      {/* Controls - limited orbit */}
      <OrbitControls
        enablePan={false}
        minDistance={4}
        maxDistance={10}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        minAzimuthAngle={-Math.PI / 3}
        maxAzimuthAngle={Math.PI / 3}
        target={[0, 2, 0]}
      />
    </Canvas>
  );
}
