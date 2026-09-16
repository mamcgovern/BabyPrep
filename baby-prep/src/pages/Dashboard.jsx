import { NavLink } from 'react-router-dom';
import { useTasks } from '../context/TaskContext';

function Dashboard() {
  const { tasks, stats } = useTasks();

  const upcomingTasks = tasks
    .filter((task) => task.status !== 'Complete')
    .slice(0, 3);

  return (
    <div className="page dashboard-page">
      <div className="welcome">
        <div>
          <p className="eyebrow">MADDIE & NICK</p>
          <h1>Getting ready for baby</h1>
          <p className="page-description">
            Our little command center for everything we want to figure out
            before our family grows.
          </p>
        </div>

        <NavLink to="/tasks" className="primary-button">
          View our tasks
        </NavLink>
      </div>

      <section className="countdown-grid">
        <div className="countdown-card">
          <div className="card-label">COUNTDOWN</div>

          <div className="countdown-number">—</div>

          <p className="countdown-caption">
            days until we start trying
          </p>
        </div>

        <div className="countdown-card accent">
          <div className="card-label">EARLIEST POSSIBILITY</div>

          <div className="countdown-number">—</div>

          <p className="countdown-caption">
            We'll add our dates when we're ready.
          </p>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-heading">
            <div>
              <span className="card-label">OUR PREP</span>
              <h2>Getting there!</h2>
            </div>

            <span className="progress-percent">
              {stats.percentage}%
            </span>
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${stats.percentage}%` }}
            />
          </div>

          <div className="progress-details">
            <span>{stats.complete} completed</span>
            <span>{stats.total} total tasks</span>
          </div>

          <div className="task-preview">
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map((task) => (
                <div className="empty-preview" key={task.id}>
                  <span>{task.title}</span>
                  <NavLink to="/tasks">View</NavLink>
                </div>
              ))
            ) : (
              <div className="empty-preview">
                <span>We've finished everything!</span>
                <NavLink to="/tasks">View tasks</NavLink>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-heading">
            <div>
              <span className="card-label">BOOKS & RESOURCES</span>
              <h2>What we're learning</h2>
            </div>

            <NavLink to="/resources" className="card-link">
              View all
            </NavLink>
          </div>

          <div className="resource-preview">
            <div className="resource-icon">▤</div>

            <div>
              <strong>Nothing added yet</strong>
              <p>
                Save books, podcasts, classes, articles, and other resources
                we want to explore.
              </p>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-heading">
            <div>
              <span className="card-label">UP NEXT</span>
              <h2>Things to think about</h2>
            </div>

            <NavLink to="/planning" className="card-link">
              Planning
            </NavLink>
          </div>

          <div className="resource-preview">
            <div className="resource-icon">◌</div>

            <div>
              <strong>Big decisions will live here</strong>
              <p>
                Childcare, work, parenting, feeding, finances, and all the
                other things we want to talk through together.
              </p>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-heading">
            <div>
              <span className="card-label">INSPIRATION</span>
              <h2>Ideas we're saving</h2>
            </div>

            <NavLink to="/inspiration" className="card-link">
              View all
            </NavLink>
          </div>

          <div className="inspiration-empty">
            <span>♡</span>

            <p>
              Save nursery ideas, baby gear, clothes, announcements, and
              anything else that makes us excited.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;