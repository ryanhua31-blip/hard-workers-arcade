import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import useGameStore from '../stores/gameStore';
import useTaskStore from '../stores/taskStore';
import { GAME_PHASES, CLAW_TOP_Y, CLAW_DROP_Y } from '../stores/gameStore';

function ClawFinger({ angle, openAmount, color = '#b0b0c0' }) {
  const ref = useRef();

  useFrame(() => {
    if (ref.current) {
      const openAngle = openAmount * 0.5;
      ref.current.rotation.z = angle + openAngle;
    }
  });

  return (
    <group ref={ref} position={[0, -0.15, 0]} rotation={[0, 0, angle]}>
      <mesh position={[0.12, -0.18, 0]}>
        <boxGeometry args={[0.04, 0.3, 0.04]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.08, -0.4, 0]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.03, 0.2, 0.03]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.04, -0.5, 0]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#ff3366" emissive="#ff3366" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

export default function Claw() {
  const groupRef = useRef();
  const zRailRef = useRef();
  const cableRef = useRef();

  const clawX = useGameStore((s) => s.clawX);
  const clawZ = useGameStore((s) => s.clawZ);
  const gamePhase = useGameStore((s) => s.gamePhase);

  // Local animation state (not in store to avoid 60fps store updates)
  const animY = useRef(CLAW_TOP_Y);
  const animOpen = useRef(1);
  const animTimer = useRef(0);
  const grabCheckDone = useRef(false);
  const prevPhase = useRef(gamePhase);

  // Reset animation state when phase changes back to IDLE or MOVING
  useEffect(() => {
    if (gamePhase === GAME_PHASES.IDLE) {
      animY.current = CLAW_TOP_Y;
      animOpen.current = 1;
      grabCheckDone.current = false;
    }
    if (gamePhase === GAME_PHASES.MOVING) {
      animY.current = CLAW_TOP_Y;
      animOpen.current = 1;
      grabCheckDone.current = false;
    }
    if (gamePhase === GAME_PHASES.DROPPING) {
      grabCheckDone.current = false;
    }
  }, [gamePhase]);

  useFrame((_, delta) => {
    const state = useGameStore.getState();
    const phase = state.gamePhase;
    const speed = 3.0;
    const openSpeed = 3.0;

    if (phase === GAME_PHASES.DROPPING) {
      animY.current -= speed * delta;
      if (animY.current <= CLAW_DROP_Y) {
        animY.current = CLAW_DROP_Y;
        state.setGamePhase(GAME_PHASES.GRABBING);
        animTimer.current = 0;
        grabCheckDone.current = false;
      }
    }

    if (phase === GAME_PHASES.GRABBING) {
      animOpen.current -= openSpeed * delta;
      if (animOpen.current <= 0) {
        animOpen.current = 0;

        if (!grabCheckDone.current) {
          grabCheckDone.current = true;
          const cx = state.clawX;
          const cz = state.clawZ;
          const grabRadius = 0.6;
          const machineTasks = useTaskStore.getState().getMachineTasks();

          let closestIdx = -1;
          let closestDist = Infinity;

          machineTasks.forEach((task, i) => {
            const prizePos = getPrizePosition(i, machineTasks.length);
            const dist = Math.sqrt(
              (cx - prizePos.x) ** 2 + (cz - prizePos.z) ** 2
            );
            if (dist < closestDist && dist < grabRadius) {
              closestDist = dist;
              closestIdx = i;
            }
          });

          if (closestIdx >= 0 && Math.random() < 0.8) {
            const grabbedTask = machineTasks[closestIdx];
            state.setGrabbedPrize(closestIdx);
            useTaskStore.getState().setRevealedTask(grabbedTask.id);
          } else {
            state.setGrabbedPrize(-1);
          }

          state.setGamePhase(GAME_PHASES.LIFTING);
        }
      }
    }

    if (phase === GAME_PHASES.LIFTING) {
      animY.current += speed * delta;
      if (animY.current >= CLAW_TOP_Y) {
        animY.current = CLAW_TOP_Y;
        state.setGamePhase(GAME_PHASES.REVEALING);
        animTimer.current = 0;
      }
    }

    if (phase === GAME_PHASES.REVEALING) {
      animTimer.current += delta;
      if (animTimer.current > 1.5) {
        state.setGamePhase(GAME_PHASES.TASK_REVEALED);
        animOpen.current = 1;
      }
    }

    // Update visual positions using local refs (no store updates)
    const currentX = state.clawX;
    const currentZ = state.clawZ;
    const currentY = animY.current;
    const currentOpen = animOpen.current;

    if (groupRef.current) {
      groupRef.current.position.x = currentX;
      groupRef.current.position.z = currentZ;
      groupRef.current.position.y = currentY;
    }

    if (zRailRef.current) {
      zRailRef.current.position.x = currentX;
    }

    if (cableRef.current) {
      const cableLen = Math.max(0.01, 3.8 - currentY);
      cableRef.current.scale.y = cableLen;
      cableRef.current.position.y = 3.8 - cableLen / 2;
      cableRef.current.position.x = currentX;
      cableRef.current.position.z = currentZ;
    }
  });

  // Read clawOpen from local ref for finger animation
  // We pass the ref value through a simple approach
  const clawOpenValue = animOpen.current;

  return (
    <>
      {/* Z-axis rail (moves with X position) */}
      <mesh ref={zRailRef} position={[0, 3.8, 0]}>
        <boxGeometry args={[0.06, 0.06, 2.6]} />
        <meshStandardMaterial color="#244890" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Carriage on the Z rail */}
      <mesh position={[clawX, 3.78, clawZ]}>
        <boxGeometry args={[0.15, 0.08, 0.15]} />
        <meshStandardMaterial color="#2e52a0" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Cable */}
      <mesh ref={cableRef} position={[clawX, 3.5, clawZ]}>
        <cylinderGeometry args={[0.012, 0.012, 1, 6]} />
        <meshStandardMaterial color="#808090" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Claw group */}
      <group ref={groupRef} position={[clawX, CLAW_TOP_Y, clawZ]}>
        {/* Claw body */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 0.15, 8]} />
          <meshStandardMaterial color="#c0c0d8" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Claw fingers */}
        <ClawFingersAnimated openRef={animOpen} />

        {/* Center light */}
        <mesh position={[0, -0.08, 0]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial
            color="#00f0ff"
            emissive="#00f0ff"
            emissiveIntensity={1.5}
            toneMapped={false}
          />
        </mesh>
      </group>
    </>
  );
}

// Separate component that reads the open ref directly in useFrame
function ClawFingersAnimated({ openRef }) {
  const finger1 = useRef();
  const finger2 = useRef();
  const finger3 = useRef();

  const angles = [0, Math.PI * 0.667, Math.PI * 1.333];

  useFrame(() => {
    const openAmount = openRef.current * 0.5;
    if (finger1.current) finger1.current.rotation.z = angles[0] + openAmount;
    if (finger2.current) finger2.current.rotation.z = angles[1] + openAmount;
    if (finger3.current) finger3.current.rotation.z = angles[2] + openAmount;
  });

  const fingerGeometry = (
    <>
      <mesh position={[0.12, -0.18, 0]}>
        <boxGeometry args={[0.04, 0.3, 0.04]} />
        <meshStandardMaterial color="#c8c8e0" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.08, -0.4, 0]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.03, 0.2, 0.03]} />
        <meshStandardMaterial color="#c8c8e0" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.04, -0.5, 0]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#ff3366" emissive="#ff3366" emissiveIntensity={0.5} />
      </mesh>
    </>
  );

  return (
    <>
      <group ref={finger1} position={[0, -0.15, 0]} rotation={[0, 0, angles[0]]}>
        {fingerGeometry}
      </group>
      <group ref={finger2} position={[0, -0.15, 0]} rotation={[0, 0, angles[1]]}>
        {fingerGeometry}
      </group>
      <group ref={finger3} position={[0, -0.15, 0]} rotation={[0, 0, angles[2]]}>
        {fingerGeometry}
      </group>
    </>
  );
}

// Helper: deterministic prize position based on index
export function getPrizePosition(index, total) {
  const cols = Math.ceil(Math.sqrt(total));
  const rows = Math.ceil(total / cols);
  const col = index % cols;
  const row = Math.floor(index / cols);

  const spacingX = total > 1 ? 2.0 / Math.max(cols - 1, 1) : 0;
  const spacingZ = total > 1 ? 1.4 / Math.max(rows - 1, 1) : 0;

  const x = -1.0 + col * spacingX + (Math.sin(index * 1.7) * 0.15);
  const z = -0.7 + row * spacingZ + (Math.cos(index * 2.3) * 0.1);

  return { x, y: 0.28, z };
}
