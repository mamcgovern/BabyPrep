import { useMemo, useState } from 'react';
import FilterPills from '../components/FilterPills';
import ProgressBar from '../components/ProgressBar';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import { useTasks } from '../context/TaskContext';

const phases = ['Before Trying', 'Trying to Conceive', 'Pregnancy Prep'];

function Tasks() {
  const {
    tasks,
    stats,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    changeTaskStatus,
  } = useTasks();

  const [activeFilter, setActiveFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesPerson =
        activeFilter === 'All' || task.assignedTo === activeFilter;

      const matchesStatus =
        statusFilter === 'All' || task.status === statusFilter;

      return matchesPerson && matchesStatus;
    });
  }, [tasks, activeFilter, statusFilter]);

  const handleSaveTask = (taskData) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask(taskData);
    }

    setEditingTask(null);
    setIsModalOpen(false);
  };

  const openAddModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingTask(null);
    setIsModalOpen(false);
  };

  return (
    <div className="page tasks-page">
      <div className="page-header tasks-header">
        <div>
          <p className="eyebrow">OUR TO-DO LIST</p>
          <h1>Getting ready for baby</h1>
          <p className="page-description">
            All the little things we want to figure out before our family
            grows.
          </p>
        </div>

        <button className="primary-button" onClick={openAddModal}>
          + Add Task
        </button>
      </div>

      <section className="task-overview">
        <div className="task-overview-main">
          <div className="task-overview-heading">
            <div>
              <span className="card-label">OVERALL PROGRESS</span>
              <h2>We're getting there!</h2>
            </div>

            <span className="progress-percent">
              {stats.percentage}%
            </span>
          </div>

          <ProgressBar percentage={stats.percentage} />

          <div className="progress-details">
            <span>{stats.complete} completed</span>
            <span>{stats.total} total tasks</span>
          </div>
        </div>

        <div className="task-stats">
          <div className="task-stat stat-total">
            <span>{stats.total}</span>
            <small>Total</small>
          </div>

          <div className="task-stat stat-progress">
            <span>{stats.inProgress}</span>
            <small>In Progress</small>
          </div>

          <div className="task-stat stat-not-started">
            <span>{stats.notStarted}</span>
            <small>Not Started</small>
          </div>

          <div className="task-stat stat-complete">
            <span>{stats.complete}</span>
            <small>Complete</small>
          </div>
        </div>
      </section>

      <section className="task-filters">
        <div>
          <span className="filter-label">WHO</span>

          <FilterPills
            options={['All', 'Maddie', 'Nick', 'Both']}
            value={activeFilter}
            onChange={setActiveFilter}
          />
        </div>

        <div>
          <span className="filter-label">STATUS</span>

          <FilterPills
            options={['All', 'Not Started', 'In Progress', 'Complete']}
            value={statusFilter}
            onChange={setStatusFilter}
          />
        </div>
      </section>

      <div className="tasks-list">
        {phases.map((phase) => {
          const phaseTasks = filteredTasks.filter(
            (task) => task.phase === phase
          );

          if (phaseTasks.length === 0) {
            return null;
          }

          const completedCount = phaseTasks.filter(
            (task) => task.status === 'Complete'
          ).length;

          return (
            <section className="task-phase" key={phase}>
              <div className="task-phase-heading">
                <div>
                  <span className="phase-kicker">
                    {phase === 'Before Trying' && '01'}
                    {phase === 'Trying to Conceive' && '02'}
                    {phase === 'Pregnancy Prep' && '03'}
                  </span>

                  <h2>{phase}</h2>
                </div>

                <span className="phase-count">
                  {completedCount}/{phaseTasks.length}
                </span>
              </div>

              <div className="task-cards">
                {phaseTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={toggleTask}
                    onStatusChange={changeTaskStatus}
                    onEdit={openEditModal}
                    onDelete={deleteTask}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="empty-state task-empty-state">
            <div className="empty-state-icon">♡</div>
            <h2>No tasks here!</h2>
            <p>
              Try changing your filters, or add a new task to your list.
            </p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <TaskModal
          task={editingTask}
          onSave={handleSaveTask}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

export default Tasks;