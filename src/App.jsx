import { useState, useEffect, Suspense } from 'react';
import Scene from './components/Scene';
import GameUI from './components/GameUI';
import TaskManager from './components/TaskManager';
import TaskReveal from './components/TaskReveal';
import useTaskStore from './stores/taskStore';
import './App.css';

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-title">
          <span className="title-neon">HARD WORKERS'</span>{' '}
          <span className="title-accent">ARCADE</span>
        </div>
        <div className="loading-bar">
          <div className="loading-bar-fill" />
        </div>
        <p className="loading-text">Loading arcade...</p>
      </div>
    </div>
  );
}

export default function App() {
  const [taskPanelOpen, setTaskPanelOpen] = useState(false);

  useEffect(() => {
    // Initialize seed tasks and auto-load them into the machine
    const store = useTaskStore.getState();
    store.initSeedTasks();
    // Auto-load seed tasks into the machine so users can play immediately
    setTimeout(() => {
      useTaskStore.getState().loadAllPendingIntoMachine();
    }, 100);
  }, []);

  return (
    <div className="app">
      {/* 3D Scene */}
      <div className="scene-container">
        <Suspense fallback={<LoadingScreen />}>
          <Scene />
        </Suspense>
      </div>

      {/* Game UI Overlay */}
      <GameUI />

      {/* Task Reveal Modal */}
      <TaskReveal />

      {/* Task Manager Panel */}
      <TaskManager
        isOpen={taskPanelOpen}
        onToggle={() => setTaskPanelOpen(!taskPanelOpen)}
      />

      {/* Scanline overlay */}
      <div className="scanlines" />
    </div>
  );
}
