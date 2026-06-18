import { create } from 'zustand';

export const GAME_PHASES = {
  IDLE: 'idle',
  MOVING: 'moving',
  DROPPING: 'dropping',
  GRABBING: 'grabbing',
  LIFTING: 'lifting',
  REVEALING: 'revealing',
  TASK_REVEALED: 'taskRevealed',
};

export const CLAW_BOUNDS = {
  x: { min: -1.2, max: 1.2 },
  z: { min: -0.8, max: 0.8 },
};

export const CLAW_TOP_Y = 3.2;
export const CLAW_DROP_Y = 0.8;
const MOVE_STEP = 0.25;

const useGameStore = create((set, get) => ({
  clawX: 0,
  clawZ: 0,
  gamePhase: GAME_PHASES.IDLE,
  grabbedPrizeIndex: null,
  credits: 5,
  score: 0,
  totalCompleted: 0,

  moveClaw: (direction) => {
    const state = get();
    if (state.gamePhase !== GAME_PHASES.MOVING) return;

    const { clawX, clawZ } = state;
    let newX = clawX;
    let newZ = clawZ;

    switch (direction) {
      case 'left': newX = Math.max(CLAW_BOUNDS.x.min, clawX - MOVE_STEP); break;
      case 'right': newX = Math.min(CLAW_BOUNDS.x.max, clawX + MOVE_STEP); break;
      case 'forward': newZ = Math.max(CLAW_BOUNDS.z.min, clawZ - MOVE_STEP); break;
      case 'backward': newZ = Math.min(CLAW_BOUNDS.z.max, clawZ + MOVE_STEP); break;
      default: return;
    }

    set({ clawX: newX, clawZ: newZ });
  },

  startGame: () => {
    const state = get();
    if (state.credits <= 0 || state.gamePhase !== GAME_PHASES.IDLE) return;
    set({
      gamePhase: GAME_PHASES.MOVING,
      credits: state.credits - 1,
      clawX: 0,
      clawZ: 0,
      grabbedPrizeIndex: null,
    });
  },

  dropClaw: () => {
    const state = get();
    if (state.gamePhase !== GAME_PHASES.MOVING) return;
    set({ gamePhase: GAME_PHASES.DROPPING });
  },

  setGamePhase: (phase) => set({ gamePhase: phase }),

  setGrabbedPrize: (index) => set({ grabbedPrizeIndex: index }),

  completeTask: () => set((state) => ({
    score: state.score + 100,
    totalCompleted: state.totalCompleted + 1,
  })),

  endRound: () => set({
    gamePhase: GAME_PHASES.IDLE,
    clawX: 0,
    clawZ: 0,
    grabbedPrizeIndex: null,
  }),

  addCredits: (amount) => set((state) => ({ credits: state.credits + amount })),
}));

export default useGameStore;
