import { NavLink, Route, Routes } from 'react-router-dom'

const navigation = [
  { label: 'Dashboard', path: '/', icon: '⌂' },
  { label: 'Tasks', path: '/tasks', icon: '✓' },
  { label: 'Books & Resources', path: '/resources', icon: '▤' },
  { label: 'Registry', path: '/registry', icon: '□' },
  { label: 'Inspiration', path: '/inspiration', icon: '♡' },
  { label: 'Planning', path: '/planning', icon: '◌' },
  { label: 'Budget', path: '/budget', icon: '$' },
  { label: 'Appointments', path: '/appointments', icon: '□' },
  { label: 'Baby Names', path: '/names', icon: 'A' },
  { label: 'Questions for Us', path: '/questions', icon: '?' },
  { label: 'Notes', path: '/notes', icon: '≡' },
]

function PlaceholderPage({ title, description }) {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">COMING SOON</p>
          <h1>{title}</h1>
          <p className="page-description">{description}</p>
        </div>
      </div>

      <div className="empty-state">
        <div className="empty-state-icon">✦</div>
        <h2>We'll build this next</h2>
        <p>This section is part of your baby prep plan and will be added as we build the app.</p>
      </div>
    </div>
  )
}

function Dashboard() {
  return (
    <div className="page dashboard">
      <div className="welcome">
        <div>
          <p className="eyebrow">MADDIE & NICK</p>
          <h1>Getting ready for baby.</h1>
          <p className="page-description">
            One place for all the things you're figuring out before you become parents.
          </p>
        </div>

        <button className="primary-button">+ Add something</button>
      </div>

      <section className="countdown-grid">
        <div className="countdown-card">
          <p className="card-label">START TRYING</p>
          <div className="countdown-number">—</div>
          <p className="countdown-caption">Set your start date in Settings</p>
        </div>

        <div className="countdown-card accent">
          <p className="card-label">EARLIEST BABY</p>
          <div className="countdown-number">—</div>
          <p className="countdown-caption">We'll calculate this for you</p>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-card progress-card">
          <div className="card-heading">
            <div>
              <p className="card-label">GETTING READY</p>
              <h2>You're just getting started</h2>
            </div>
            <span className="progress-percent">0%</span>
          </div>

          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '0%' }} />
          </div>

          <div className="progress-details">
            <span>0 tasks complete</span>
            <span>0 total tasks</span>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-heading">
            <div>
              <p className="card-label">UP NEXT</p>
              <h2>Things to do</h2>
            </div>
            <NavLink to="/tasks" className="card-link">View all</NavLink>
          </div>

          <div className="task-preview empty-preview">
            <span>No tasks yet</span>
            <NavLink to="/tasks">Add your first task →</NavLink>
          </div>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-heading">
            <div>
              <p className="card-label">READING</p>
              <h2>Books & resources</h2>
            </div>
            <NavLink to="/resources" className="card-link">View all</NavLink>
          </div>

          <div className="resource-preview">
            <div className="resource-icon">▤</div>
            <div>
              <strong>Nothing here yet</strong>
              <p>Add books, podcasts, articles, and classes you want to explore together.</p>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-heading">
            <div>
              <p className="card-label">INSPIRATION</p>
              <h2>Recently saved</h2>
            </div>
            <NavLink to="/inspiration" className="card-link">View all</NavLink>
          </div>

          <div className="inspiration-empty">
            <span>♡</span>
            <p>Your nursery ideas, baby gear, names, and other inspiration will live here.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">✦</div>
          <div>
            <div className="brand-name">Before Baby</div>
            <div className="brand-subtitle">Maddie & Nick</div>
          </div>
        </div>

        <nav className="navigation">
          <p className="nav-section-label">PLAN</p>

          {navigation.slice(0, 5).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}

          <p className="nav-section-label">PREPARE</p>

          {navigation.slice(5).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <NavLink to="/settings" className="settings-link">
            <span className="nav-icon">⚙</span>
            <span>Settings</span>
          </NavLink>

          <div className="couple-card">
            <div className="avatar">M</div>
            <div>
              <strong>Maddie & Nick</strong>
              <span>Our baby prep</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />

          <Route
            path="/tasks"
            element={
              <PlaceholderPage
                title="Tasks"
                description="Everything you want to get done before baby."
              />
            }
          />

          <Route
            path="/resources"
            element={
              <PlaceholderPage
                title="Books & Resources"
                description="Keep track of what you're reading, watching, listening to, and learning together."
              />
            }
          />

          <Route
            path="/registry"
            element={
              <PlaceholderPage
                title="Registry"
                description="Research, compare, save, and eventually register for the things you actually want."
              />
            }
          />

          <Route
            path="/inspiration"
            element={
              <PlaceholderPage
                title="Inspiration"
                description="A shared place for nursery ideas, baby gear, names, and anything else that inspires you."
              />
            }
          />

          <Route
            path="/planning"
            element={
              <PlaceholderPage
                title="Planning"
                description="The bigger conversations and decisions you'll want to make together."
              />
            }
          />

          <Route
            path="/budget"
            element={
              <PlaceholderPage
                title="Budget"
                description="Plan for the costs that come with getting ready for baby."
              />
            }
          />

          <Route
            path="/appointments"
            element={
              <PlaceholderPage
                title="Appointments"
                description="Classes, appointments, tours, and other important dates."
              />
            }
          />

          <Route
            path="/names"
            element={
              <PlaceholderPage
                title="Baby Names"
                description="Keep track of the names you love, like, maybe, and absolutely don't want."
              />
            }
          />

          <Route
            path="/questions"
            element={
              <PlaceholderPage
                title="Questions for Us"
                description="Thoughtful questions to answer separately, discuss together, and revisit later."
              />
            }
          />

          <Route
            path="/notes"
            element={
              <PlaceholderPage
                title="Notes"
                description="A shared space for everything else."
              />
            }
          />

          <Route
            path="/settings"
            element={
              <PlaceholderPage
                title="Settings"
                description="Customize your baby prep workspace."
              />
            }
          />
        </Routes>
      </main>
    </div>
  )
}

export default App