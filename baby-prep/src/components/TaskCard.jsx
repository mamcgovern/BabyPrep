const statusOptions = ['Not Started', 'In Progress', 'Complete'];

function TaskCard({
  task,
  onToggle,
  onStatusChange,
  onEdit,
  onDelete,
}) {
  const isComplete = task.status === 'Complete';

  return (
    <article className={`task-card ${isComplete ? 'complete' : ''}`}>
      <button
        type="button"
        className={`task-checkbox ${isComplete ? 'checked' : ''}`}
        onClick={() => onToggle(task.id)}
        aria-label={
          isComplete ? 'Mark task incomplete' : 'Mark task complete'
        }
      >
        {isComplete ? '✓' : ''}
      </button>

      <div className="task-card-content">
        <div className="task-card-top">
          <div>
            <h3>{task.title}</h3>

            {task.description && (
              <p className="task-description">{task.description}</p>
            )}
          </div>

          <div className="task-card-actions">
            <button
              type="button"
              onClick={() => onEdit(task)}
              aria-label="Edit task"
            >
              Edit
            </button>

            <button
              type="button"
              className="delete-action"
              onClick={() => onDelete(task.id)}
              aria-label="Delete task"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="task-card-bottom">
          <div className="task-meta">
            <span className={`person-badge ${task.assignedTo.toLowerCase()}`}>
              {task.assignedTo}
            </span>

            <span className={`priority-badge ${task.priority.toLowerCase()}`}>
              {task.priority}
            </span>

            {task.dueDate && (
              <span className="task-due-date">
                Due {task.dueDate}
              </span>
            )}
          </div>

          <select
            className="task-status-select"
            value={task.status}
            onChange={(event) =>
              onStatusChange(task.id, event.target.value)
            }
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>
    </article>
  );
}

export default TaskCard;