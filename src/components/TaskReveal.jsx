import { useEffect, useState, useMemo } from 'react';
import useGameStore from '../stores/gameStore';
import useTaskStore from '../stores/taskStore';
import { GAME_PHASES } from '../stores/gameStore';

export default function TaskReveal() {
  const gamePhase = useGameStore((s) => s.gamePhase);
  const grabbedPrizeIndex = useGameStore((s) => s.grabbedPrizeIndex);
  const endRound = useGameStore((s) => s.endRound);
  const completeTask = useGameStore((s) => s.completeTask);
  const addCredits = useGameStore((s) => s.addCredits);

  const revealedTaskId = useTaskStore((s) => s.revealedTaskId);
  const tasks = useTaskStore((s) => s.tasks);
  const completeTaskAction = useTaskStore((s) => s.completeTask);
  const skipTask = useTaskStore((s) => s.skipTask);

  const revealedTask = useMemo(() => {
    if (!revealedTaskId) return null;
    return tasks.find((t) => t.id === revealedTaskId) || null;
  }, [revealedTaskId, tasks]);

  const [animPhase, setAnimPhase] = useState('closed'); // closed, opening, revealed
  const [showActions, setShowActions] = useState(false);

  const isTaskRevealed = gamePhase === GAME_PHASES.TASK_REVEALED;
  const isGrabMiss = grabbedPrizeIndex === -1 && isTaskRevealed;

  useEffect(() => {
    if (isTaskRevealed) {
      setAnimPhase('opening');
      const t1 = setTimeout(() => setAnimPhase('revealed'), 800);
      const t2 = setTimeout(() => setShowActions(true), 1200);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } else {
      setAnimPhase('closed');
      setShowActions(false);
    }
  }, [isTaskRevealed]);

  const handleComplete = () => {
    if (revealedTask) {
      completeTaskAction(revealedTask.id);
      completeTask();
      addCredits(1);
    }
    endRound();
  };

  const handleSkip = () => {
    if (revealedTask) {
      skipTask(revealedTask.id);
    }
    endRound();
  };

  const handleMiss = () => {
    endRound();
  };

  if (!isTaskRevealed) return null;

  return (
    <div className={`task-reveal-overlay ${animPhase}`}>
      <div className="task-reveal-container">
        {isGrabMiss ? (
          <>
            <div className="reveal-miss">
              <div className="miss-icon">💨</div>
              <h2 className="miss-title">MISSED!</h2>
              <p className="miss-subtitle">The claw slipped! Try again!</p>
            </div>
            {showActions && (
              <div className="reveal-actions">
                <button className="btn-action btn-try-again" onClick={handleMiss}>
                  TRY AGAIN
                </button>
              </div>
            )}
          </>
        ) : (
          revealedTask && (
            <>
              <div className="reveal-capsule">
                <div
                  className="capsule-visual"
                  style={{ '--capsule-color': revealedTask.capsuleColor }}
                >
                  <div className="capsule-top" />
                  <div className="capsule-bottom" />
                  <div className="capsule-seam" />
                </div>
              </div>

              {animPhase === 'revealed' && (
                <div className="reveal-content">
                  <div className="reveal-label">YOUR TASK:</div>
                  <h2 className="reveal-task-text">{revealedTask.text}</h2>
                  <div className="reveal-category">{revealedTask.category}</div>
                </div>
              )}

              {showActions && (
                <div className="reveal-actions">
                  <button className="btn-action btn-complete" onClick={handleComplete}>
                    COMPLETE +100pts
                  </button>
                  <button className="btn-action btn-skip" onClick={handleSkip}>
                    SKIP
                  </button>
                </div>
              )}
            </>
          )
        )}
      </div>
    </div>
  );
}
