import { useEffect, useCallback } from 'react';
import useGameStore from '../stores/gameStore';
import useTaskStore from '../stores/taskStore';
import { GAME_PHASES } from '../stores/gameStore';

export default function GameUI() {
  // Only subscribe to primitive values to avoid reference issues
  const gamePhase = useGameStore((s) => s.gamePhase);
  const credits = useGameStore((s) => s.credits);
  const score = useGameStore((s) => s.score);
  const totalCompleted = useGameStore((s) => s.totalCompleted);
  const machineTaskCount = useTaskStore((s) => s.machineTaskIds.length);

  // Call store actions via getState() to avoid subscribing to function references
  const handleKeyDown = useCallback(
    (e) => {
      if (gamePhase !== GAME_PHASES.MOVING) return;

      const { moveClaw, dropClaw } = useGameStore.getState();

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          moveClaw('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          moveClaw('right');
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          moveClaw('forward');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          moveClaw('backward');
          break;
        case ' ':
          e.preventDefault();
          dropClaw();
          break;
      }
    },
    [gamePhase]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const isIdle = gamePhase === GAME_PHASES.IDLE;
  const isMoving = gamePhase === GAME_PHASES.MOVING;
  const isPlaying = gamePhase !== GAME_PHASES.IDLE;

  return (
    <div className="game-ui">
      {/* Top bar */}
      <div className="game-top-bar">
        <div className="game-title">
          <span className="title-neon">HARD WORKERS'</span>{' '}
          <span className="title-accent">ARCADE</span>
        </div>
        <div className="game-stats">
          <div className="stat">
            <span className="stat-label">CREDITS</span>
            <span className="stat-value credits-value">{credits}</span>
          </div>
          <div className="stat">
            <span className="stat-label">SCORE</span>
            <span className="stat-value score-value">{score}</span>
          </div>
          <div className="stat">
            <span className="stat-label">DONE</span>
            <span className="stat-value done-value">{totalCompleted}</span>
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="game-bottom-bar">
        {isIdle && (
          <div className="play-section">
            <button
              className="btn-play"
              onClick={() => useGameStore.getState().startGame()}
              disabled={credits <= 0 || machineTaskCount === 0}
            >
              {credits <= 0 ? 'NO CREDITS' : machineTaskCount === 0 ? 'LOAD TASKS' : 'INSERT COIN'}
            </button>
            {machineTaskCount === 0 && (
              <p className="hint-text">Add tasks and load them into the machine to play</p>
            )}
          </div>
        )}

        {isMoving && (
          <div className="controls-section">
            <div className="dpad">
              <button className="dpad-btn dpad-up" onClick={() => useGameStore.getState().moveClaw('forward')}>
                ▲
              </button>
              <div className="dpad-middle">
                <button className="dpad-btn dpad-left" onClick={() => useGameStore.getState().moveClaw('left')}>
                  ◀
                </button>
                <div className="dpad-center" />
                <button className="dpad-btn dpad-right" onClick={() => useGameStore.getState().moveClaw('right')}>
                  ▶
                </button>
              </div>
              <button className="dpad-btn dpad-down" onClick={() => useGameStore.getState().moveClaw('backward')}>
                ▼
              </button>
            </div>
            <button className="btn-drop" onClick={() => useGameStore.getState().dropClaw()}>
              DROP!
            </button>
            <p className="hint-text">Arrow keys / WASD to move, SPACE to drop</p>
          </div>
        )}

        {isPlaying && !isMoving && gamePhase !== GAME_PHASES.TASK_REVEALED && (
          <div className="status-section">
            <div className="status-indicator">
              {gamePhase === GAME_PHASES.DROPPING && '⬇ Descending...'}
              {gamePhase === GAME_PHASES.GRABBING && '🤞 Grabbing...'}
              {gamePhase === GAME_PHASES.LIFTING && '⬆ Lifting...'}
              {gamePhase === GAME_PHASES.REVEALING && '✨ Revealing...'}
            </div>
          </div>
        )}
      </div>

      {/* Phase indicator */}
      {isMoving && (
        <div className="phase-indicator">
          <div className="phase-dot active" />
          <span>MOVE THE CLAW</span>
        </div>
      )}
    </div>
  );
}
