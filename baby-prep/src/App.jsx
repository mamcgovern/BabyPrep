import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Tasks from './pages/Tasks';
import Resources from './pages/Resources';
import Inspiration from './pages/Inspiration';
import BabyGear from './pages/BabyGear';
import Planning from './pages/Planning';
import Budget from './pages/Budget';

import { useAuth } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import { ResourceProvider } from './context/ResourceContext';
import { InspirationProvider } from './context/InspirationContext';
import { BabyGearProvider } from './context/BabyGearContext';
import { PlanningProvider } from './context/PlanningContext';
import { BudgetProvider } from './context/BudgetContext';

const navigation = [
  { label: 'Dashboard', path: '/', icon: '⌂' },
  { label: 'Tasks', path: '/tasks', icon: '✓' },
  { label: 'Books & Resources', path: '/resources', icon: '▤' },
  { label: 'Baby Gear', path: '/baby-gear', icon: '□' },
  { label: 'Inspiration', path: '/inspiration', icon: '♡' },
  { label: 'Planning', path: '/planning', icon: '◌' },
  { label: 'Budget', path: '/budget', icon: '$' },
  { label: 'Appointments', path: '/appointments', icon: '□' },
  { label: 'Baby Names', path: '/names', icon: 'A' },
  { label: 'Questions for Us', path: '/questions', icon: '?' },
  { label: 'Notes', path: '/notes', icon: '≡' },
];

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
        <p>
          This section is part of your baby prep plan and will be added as we
          build the app.
        </p>
      </div>
    </div>
  );
}

function AppShell() {
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
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/baby-gear" element={<BabyGear />} />
          <Route path="/inspiration" element={<Inspiration />} />
          <Route path="/planning" element={<Planning />} />
          <Route path="/budget" element={<Budget />} />

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
  );
}

function ProtectedApp() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-loading">
        <span>Loading...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <BudgetProvider>
      <TaskProvider>
        <ResourceProvider>
          <InspirationProvider>
            <BabyGearProvider>
              <PlanningProvider>
                <AppShell />
              </PlanningProvider>
            </BabyGearProvider>
          </InspirationProvider>
        </ResourceProvider>
      </TaskProvider>
    </BudgetProvider>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={<ProtectedApp />} />
    </Routes>
  );
}

export default App;