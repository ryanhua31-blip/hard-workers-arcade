import { create } from 'zustand';

export const CAPSULE_COLORS = [
  '#ff3366',
  '#00f0ff',
  '#ffdd00',
  '#ff6600',
  '#aa44ff',
  '#00ff88',
  '#ff4488',
  '#44aaff',
];

const SEED_TASKS = [
  { text: 'Reply to important emails', category: 'communication' },
  { text: 'Review project proposal', category: 'work' },
  { text: 'Schedule team meeting', category: 'planning' },
  { text: 'Update documentation', category: 'work' },
  { text: 'Clean up desktop files', category: 'organization' },
  { text: 'Plan weekly goals', category: 'planning' },
];

const useTaskStore = create((set, get) => ({
  tasks: [],
  machineTaskIds: [],
  completedTaskIds: [],
  revealedTaskId: null,

  initSeedTasks: () => {
    const existing = get().tasks;
    if (existing.length > 0) return;
    const seedTasks = SEED_TASKS.map((t, i) => ({
      id: `seed-${i}-${Date.now()}`,
      text: t.text,
      category: t.category,
      capsuleColor: CAPSULE_COLORS[i % CAPSULE_COLORS.length],
      createdAt: new Date().toISOString(),
    }));
    set({ tasks: seedTasks });
  },

  addTask: (text, category = 'general') => {
    const id = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const tasks = get().tasks;
    const colorIndex = tasks.length % CAPSULE_COLORS.length;
    const task = {
      id,
      text,
      category,
      capsuleColor: CAPSULE_COLORS[colorIndex],
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ tasks: [...state.tasks, task] }));
    return id;
  },

  removeTask: (id) => set((state) => ({
    tasks: state.tasks.filter((t) => t.id !== id),
    machineTaskIds: state.machineTaskIds.filter((tid) => tid !== id),
    completedTaskIds: state.completedTaskIds.filter((tid) => tid !== id),
  })),

  loadTaskIntoMachine: (id) => set((state) => {
    if (state.machineTaskIds.includes(id)) return state;
    if (state.completedTaskIds.includes(id)) return state;
    return { machineTaskIds: [...state.machineTaskIds, id] };
  }),

  loadAllPendingIntoMachine: () => {
    const state = get();
    const pendingIds = state.tasks
      .filter((t) => !state.machineTaskIds.includes(t.id) && !state.completedTaskIds.includes(t.id))
      .map((t) => t.id);
    set({ machineTaskIds: [...state.machineTaskIds, ...pendingIds] });
  },

  completeTask: (id) => set((state) => ({
    completedTaskIds: [...state.completedTaskIds, id],
    machineTaskIds: state.machineTaskIds.filter((tid) => tid !== id),
    revealedTaskId: null,
  })),

  setRevealedTask: (id) => set({ revealedTaskId: id }),

  skipTask: (id) => set((state) => ({
    machineTaskIds: state.machineTaskIds.filter((tid) => tid !== id),
    revealedTaskId: null,
  })),

  clearRevealedTask: () => set({ revealedTaskId: null }),

  getPendingTasks: () => {
    const state = get();
    return state.tasks.filter(
      (t) => !state.machineTaskIds.includes(t.id) && !state.completedTaskIds.includes(t.id)
    );
  },

  getMachineTasks: () => {
    const state = get();
    return state.tasks.filter((t) => state.machineTaskIds.includes(t.id));
  },

  getCompletedTasks: () => {
    const state = get();
    return state.tasks.filter((t) => state.completedTaskIds.includes(t.id));
  },

  getRevealedTask: () => {
    const state = get();
    if (!state.revealedTaskId) return null;
    return state.tasks.find((t) => t.id === state.revealedTaskId) || null;
  },
}));

export default useTaskStore;
