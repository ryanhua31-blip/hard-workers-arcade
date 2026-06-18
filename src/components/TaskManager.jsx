import { useState } from 'react';
import useTaskStore from '../stores/taskStore';
import useGameStore from '../stores/gameStore';
import { GAME_PHASES } from '../stores/gameStore';

const CATEGORIES = ['general', 'work', 'personal', 'communication', 'planning', 'organization'];

export default function TaskManager({ isOpen, onToggle }) {
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('general');
  const [activeTab, setActiveTab] = useState('pending');

  const tasks = useTaskStore((s) => s.tasks);
  const machineTaskIds = useTaskStore((s) => s.machineTaskIds);
  const completedTaskIds = useTaskStore((s) => s.completedTaskIds);
  const addTask = useTaskStore((s) => s.addTask);
  const removeTask = useTaskStore((s) => s.removeTask);
  const loadTaskIntoMachine = useTaskStore((s) => s.loadTaskIntoMachine);
  const loadAllPendingIntoMachine = useTaskStore((s) => s.loadAllPendingIntoMachine);
  const completeTaskAction = useTaskStore((s) => s.completeTask);
  const gamePhase = useGameStore((s) => s.gamePhase);

  const pendingTasks = tasks.filter(
    (t) => !machineTaskIds.includes(t.id) && !completedTaskIds.includes(t.id)
  );
  const machineTasks = tasks.filter((t) => machineTaskIds.includes(t.id));
  const completedTasks = tasks.filter((t) => completedTaskIds.includes(t.id));

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    addTask(newTaskText.trim(), newTaskCategory);
    setNewTaskText('');
  };

  const handleLoadAll = () => {
    loadAllPendingIntoMachine();
  };

  const tabCounts = {
    pending: pendingTasks.length,
    machine: machineTasks.length,
    completed: completedTasks.length,
  };

  return (
    <>
      <button className="task-toggle-btn" onClick={onToggle}>
        {isOpen ? '✕' : '☰'} <span>Tasks</span>
      </button>

      <div className={`task-panel ${isOpen ? 'open' : ''}`}>
        <div className="task-panel-header">
          <h2>TASK MANAGER</h2>
        </div>

        {/* Add task form */}
        <form className="add-task-form" onSubmit={handleAddTask}>
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Add a new task..."
            className="task-input"
          />
          <div className="task-form-row">
            <select
              value={newTaskCategory}
              onChange={(e) => setNewTaskCategory(e.target.value)}
              className="task-select"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <button type="submit" className="btn-add">
              +
            </button>
          </div>
        </form>

        {/* Tabs */}
        <div className="task-tabs">
          {['pending', 'machine', 'completed'].map((tab) => (
            <button
              key={tab}
              className={`task-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              <span className="tab-count">{tabCounts[tab]}</span>
            </button>
          ))}
        </div>

        {/* Task list */}
        <div className="task-list">
          {activeTab === 'pending' && (
            <>
              {pendingTasks.length > 0 && (
                <button className="btn-load-all" onClick={handleLoadAll}>
                  LOAD ALL INTO MACHINE
                </button>
              )}
              {pendingTasks.map((task) => (
                <div key={task.id} className="task-item pending">
                  <div className="task-item-color" style={{ background: task.capsuleColor }} />
                  <div className="task-item-content">
                    <span className="task-item-text">{task.text}</span>
                    <span className="task-item-category">{task.category}</span>
                  </div>
                  <div className="task-item-actions">
                    <button
                      className="btn-icon btn-load"
                      onClick={() => loadTaskIntoMachine(task.id)}
                      title="Load into machine"
                    >
                      🎯
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => removeTask(task.id)}
                      title="Delete task"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
              {pendingTasks.length === 0 && (
                <div className="empty-state">
                  <p>No pending tasks</p>
                  <p className="empty-hint">Add tasks above to get started!</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'machine' && (
            <>
              {machineTasks.map((task) => (
                <div key={task.id} className="task-item machine">
                  <div className="task-item-color" style={{ background: task.capsuleColor }} />
                  <div className="task-item-content">
                    <span className="task-item-text">???</span>
                    <span className="task-item-category">Hidden in machine</span>
                  </div>
                </div>
              ))}
              {machineTasks.length === 0 && (
                <div className="empty-state">
                  <p>No tasks in the machine</p>
                  <p className="empty-hint">Load pending tasks to fill it up!</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'completed' && (
            <>
              {completedTasks.map((task) => (
                <div key={task.id} className="task-item completed">
                  <div className="task-item-color" style={{ background: task.capsuleColor }} />
                  <div className="task-item-content">
                    <span className="task-item-text">{task.text}</span>
                    <span className="task-item-category">{task.category}</span>
                  </div>
                  <div className="task-item-check">✓</div>
                </div>
              ))}
              {completedTasks.length === 0 && (
                <div className="empty-state">
                  <p>No completed tasks yet</p>
                  <p className="empty-hint">Play the claw machine to get tasks!</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
