import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import useTaskStore from '../stores/taskStore';
import useGameStore from '../stores/gameStore';
import { GAME_PHASES } from '../stores/gameStore';
import { getPrizePosition } from './Claw';

function Capsule({ position, color }) {
  const groupRef = useRef();
  const baseY = position[1];

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = baseY + Math.sin(state.clock.elapsedTime * 1.5 + position[0] * 3) * 0.02;
      groupRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Bottom hemisphere */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.22, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>
      {/* Top hemisphere (lighter) */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.22, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.5}
          roughness={0.1}
          metalness={0.3}
        />
      </mesh>
      {/* Seam ring */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.22, 0.015, 8, 24]} />
        <meshStandardMaterial
          color="#ccccdd"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      {/* Inner glow */}
      <pointLight
        position={[0, 0, 0]}
        color={color}
        intensity={0.3}
        distance={0.5}
        decay={2}
      />
    </group>
  );
}

export default function Prizes() {
  const machineTaskIds = useTaskStore((s) => s.machineTaskIds);
  const tasks = useTaskStore((s) => s.tasks);
  const grabbedPrizeIndex = useGameStore((s) => s.grabbedPrizeIndex);
  const gamePhase = useGameStore((s) => s.gamePhase);

  const machineTasks = useMemo(
    () => tasks.filter((t) => machineTaskIds.includes(t.id)),
    [tasks, machineTaskIds]
  );

  const isGrabPhase = gamePhase === GAME_PHASES.LIFTING ||
    gamePhase === GAME_PHASES.REVEALING ||
    gamePhase === GAME_PHASES.TASK_REVEALED;

  return (
    <group>
      {machineTasks.map((task, i) => {
        const pos = getPrizePosition(i, machineTasks.length);
        const isGrabbed = grabbedPrizeIndex === i && isGrabPhase;

        if (isGrabbed) return null;

        return (
          <Capsule
            key={task.id}
            position={[pos.x, pos.y, pos.z]}
            color={task.capsuleColor}
          />
        );
      })}

      {/* Empty machine placeholder */}
      {machineTasks.length === 0 && (
        <group>
          <mesh position={[0, 0.15, 0]}>
            <sphereGeometry args={[0.15, 12, 12]} />
            <meshStandardMaterial
              color="#1a1a3e"
              emissive="#1a1a3e"
              emissiveIntensity={0.2}
              transparent
              opacity={0.4}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}
