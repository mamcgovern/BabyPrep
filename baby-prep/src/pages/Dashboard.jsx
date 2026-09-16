import { Link } from 'react-router-dom';
import ProgressBar from '../components/ProgressBar';
import { useTasks } from '../context/TaskContext';

function Dashboard() {
  const { tasks, stats, loading } = useTasks();

  const activeTasks = tasks.filter(
    (task) => task.status !== 'Complete'
  );

  const highPriorityTasks = activeTasks
    .filter((task) => task.priority === 'High')
    .slice(0, 4);

  const recentTasks = activeTasks.slice(0, 5);

  if (loading) {
    return (
      <div className="page">
        <div className="dashboard-loading">
          <span>Loading your plans...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page dashboard-page">
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">WELCOME BACK</p>
          <h1>Before Baby</h1>
          <p className="page-description">
            A little space for Maddie & Nick to plan, research, and get ready
            for whatever comes next.
          </p>
        </div>

        <Link to="/tasks" className="primary-button">
          View all tasks
        </Link>
      </div>

      <section className="dashboard-hero">
        <div className="dashboard-hero-content">
          <p className="eyebrow">YOUR PROGRESS</p>
          <div className="progress-heading">
            <h2>{stats.percentage}%</h2>
            <span>ready so far</span>
          </div>

          <ProgressBar percentage={stats.percentage} />

          <p className="progress-description">
            {stats.complete === 0
              ? 'You are just getting started. There is plenty of time to figure this out together.'
              : `${stats.complete} of ${stats.total} preparation tasks are complete.`}
          </p>
        </div>

        <div className="dashboard-hero-mark">✦</div>
      </section>

      <section className="dashboard-stats">
        <div className="dashboard-stat-card">
          <span className="stat-label">TOTAL TASKS</span>
          <strong>{stats.total}</strong>
          <span className="stat-detail">things to prepare</span>
        </div>

        <div className="dashboard-stat-card">
          <span className="stat-label">IN PROGRESS</span>
          <strong>{stats.inProgress}</strong>
          <span className="stat-detail">currently underway</span>
        </div>

        <div className="dashboard-stat-card">
          <span className="stat-label">NOT STARTED</span>
          <strong>{stats.notStarted}</strong>
          <span className="stat-detail">still on the list</span>
        </div>

        <div className="dashboard-stat-card">
          <span className="stat-label">COMPLETE</span>
          <strong>{stats.complete}</strong>
          <span className="stat-detail">already checked off</span>
        </div>
      </section>

      <div className="dashboard-grid">
        <section className="dashboard-card">
          <div className="dashboard-card-header">
            <div>
              <p className="eyebrow">HIGH PRIORITY</p>
              <h2>Things to focus on</h2>
            </div>

            <Link to="/tasks">See all</Link>
          </div>

          {highPriorityTasks.length === 0 ? (
            <div className="dashboard-empty">
              <span>✦</span>
              <p>No high-priority tasks right now.</p>
            </div>
          ) : (
            <div className="dashboard-task-list">
              {highPriorityTasks.map((task) => (
                <Link
                  key={task.id}
                  to="/tasks"
                  className="dashboard-task"
                >
                  <div className="dashboard-task-icon">
                    {task.status === 'In Progress' ? '◐' : '○'}
                  </div>

                  <div className="dashboard-task-content">
                    <strong>{task.title}</strong>
                    <span>
                      {task.assignedTo} · {task.phase}
                    </span>
                  </div>

                  <span className={`task-status ${task.status.toLowerCase().replace(' ', '-')}`}>
                    {task.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-card">
          <div className="dashboard-card-header">
            <div>
              <p className="eyebrow">UP NEXT</p>
              <h2>Our preparation list</h2>
            </div>

            <Link to="/tasks">Manage</Link>
          </div>

          {recentTasks.length === 0 ? (
            <div className="dashboard-empty">
              <span>✓</span>
              <p>Everything is complete!</p>
            </div>
          ) : (
            <div className="dashboard-task-list">
              {recentTasks.map((task) => (
                <Link
                  key={task.id}
                  to="/tasks"
                  className="dashboard-task"
                >
                  <div className="dashboard-task-icon">
                    {task.status === 'In Progress' ? '◐' : '○'}
                  </div>

                  <div className="dashboard-task-content">
                    <strong>{task.title}</strong>
                    <span>
                      {task.assignedTo} · {task.priority} priority
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="dashboard-timeline">
        <div>
          <p className="eyebrow">OUR TIMELINE</p>
          <h2>Getting ready, one step at a time</h2>
          <p>
            Once we decide when we're ready to start trying, we'll add our
            timeline here with important milestones and dates.
          </p>
        </div>

        <div className="timeline-placeholder">
          <div className="timeline-dot active" />
          <div className="timeline-line" />
          <div className="timeline-dot" />
          <div className="timeline-line" />
          <div className="timeline-dot" />
        </div>

        <div className="timeline-labels">
          <span>Before Trying</span>
          <span>Trying</span>
          <span>Pregnancy</span>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;