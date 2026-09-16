import { useEffect, useState } from 'react';

const emptyTask = {
  title: '',
  description: '',
  phase: 'Before Trying',
  assignedTo: 'Both',
  dueDate: '',
  priority: 'Medium',
  status: 'Not Started',
};

function TaskModal({ task, onSave, onClose }) {
  const [formData, setFormData] = useState(task || emptyTask);

  useEffect(() => {
    setFormData(task || emptyTask);
  }, [task]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      return;
    }

    onSave({
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim(),
    });
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="task-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">
              {task ? 'EDIT TASK' : 'NEW TASK'}
            </p>
            <h2>{task ? 'Make a little update' : 'Add something to the list'}</h2>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="title">Task</label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="What do we need to do?"
              autoFocus
            />
          </div>

          <div className="form-field">
            <label htmlFor="description">Notes</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add a little more detail..."
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="phase">Phase</label>
              <select
                id="phase"
                name="phase"
                value={formData.phase}
                onChange={handleChange}
              >
                <option>Before Trying</option>
                <option>Trying to Conceive</option>
                <option>Pregnancy Prep</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="assignedTo">Assigned to</label>
              <select
                id="assignedTo"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
              >
                <option>Maddie</option>
                <option>Nick</option>
                <option>Both</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="dueDate">Due date</label>
              <input
                id="dueDate"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleChange}
              />
            </div>
          </div>

          {task && (
            <div className="form-field">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option>Not Started</option>
                <option>In Progress</option>
                <option>Complete</option>
              </select>
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
            >
              Cancel
            </button>

            <button type="submit" className="primary-button">
              {task ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskModal;