import { useMemo, useState } from 'react';
import { useResources } from '../context/ResourceContext';

const resourceTypes = [
  'All',
  'Book',
  'Article',
  'Podcast',
  'Video',
  'Class',
];

const statuses = [
  'Want to Read',
  'In Progress',
  'Finished',
  'Not for Us',
];

function Resources() {
  const {
    resources,
    stats,
    loading,
    error,
    addResource,
    updateResource,
    deleteResource,
  } = useResources();

  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [personFilter, setPersonFilter] = useState('All');
  const [showFavorites, setShowFavorites] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState(null);

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesType =
        typeFilter === 'All' || resource.type === typeFilter;

      const matchesStatus =
        statusFilter === 'All' || resource.status === statusFilter;

      const matchesPerson =
        personFilter === 'All' ||
        resource.assignedTo === personFilter ||
        resource.assignedTo === 'Both';

      const matchesFavorite =
        !showFavorites || resource.favorite;

      return (
        matchesType &&
        matchesStatus &&
        matchesPerson &&
        matchesFavorite
      );
    });
  }, [
    resources,
    typeFilter,
    statusFilter,
    personFilter,
    showFavorites,
  ]);

  const handleDelete = async (resource) => {
    const confirmed = window.confirm(
      `Delete "${resource.title}"?`
    );

    if (!confirmed) {
      return;
    }

    await deleteResource(resource.id);
  };

  const handleEdit = (resource) => {
    setEditingResource(resource);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingResource(null);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="page">
        <div className="dashboard-loading">
          <span>Loading your resources...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page resources-page">
      <div className="page-header resources-header">
        <div>
          <p className="eyebrow">LEARN TOGETHER</p>
          <h1>Books & Resources</h1>
          <p className="page-description">
            Keep track of what we're reading, watching, listening to,
            and learning together.
          </p>
        </div>

        <button className="primary-button" onClick={handleAdd}>
          + Add resource
        </button>
      </div>

      <div className="resource-stats">
        <div>
          <strong>{stats.total}</strong>
          <span>Total resources</span>
        </div>

        <div>
          <strong>{stats.inProgress}</strong>
          <span>In progress</span>
        </div>

        <div>
          <strong>{stats.completed}</strong>
          <span>Finished</span>
        </div>

        <div>
          <strong>{stats.favorites}</strong>
          <span>Favorites</span>
        </div>
      </div>

      <div className="resource-toolbar">
        <div className="filter-group">
          {resourceTypes.map((type) => (
            <button
              key={type}
              className={`filter-pill ${
                typeFilter === type ? 'active' : ''
              }`}
              onClick={() => setTypeFilter(type)}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="resource-filter-selects">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="All">All statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            value={personFilter}
            onChange={(event) => setPersonFilter(event.target.value)}
          >
            <option value="All">Everyone</option>
            <option value="Maddie">Maddie</option>
            <option value="Nick">Nick</option>
          </select>

          <button
            className={`favorite-filter ${
              showFavorites ? 'active' : ''
            }`}
            onClick={() => setShowFavorites(!showFavorites)}
          >
            ♡ Favorites
          </button>
        </div>
      </div>

      {error && <div className="resource-error">{error}</div>}

      {filteredResources.length === 0 ? (
        <div className="resources-empty">
          <div>✦</div>
          <h2>No resources found</h2>
          <p>
            Try changing your filters or add something you'd like to
            learn about.
          </p>
          <button className="primary-button" onClick={handleAdd}>
            Add a resource
          </button>
        </div>
      ) : (
        <div className="resources-grid">
          {filteredResources.map((resource) => (
            <article key={resource.id} className="resource-card">
              <div className="resource-card-top">
                <span className="resource-type">
                  {resource.type}
                </span>

                <button
                  className={`favorite-button ${
                    resource.favorite ? 'active' : ''
                  }`}
                  onClick={() =>
                    updateResource(resource.id, {
                      favorite: !resource.favorite,
                    })
                  }
                  aria-label="Toggle favorite"
                >
                  {resource.favorite ? '♥' : '♡'}
                </button>
              </div>

              <h2>{resource.title}</h2>

              <div className="resource-meta">
                <span>{resource.topic}</span>
                <span>·</span>
                <span>{resource.assignedTo}</span>
              </div>

              <div className="resource-status">
                <span className={`status-dot ${resource.status
                  .toLowerCase()
                  .replaceAll(' ', '-')}`}
                />
                {resource.status}
              </div>

              {(resource.maddieRating || resource.nickRating) && (
                <div className="resource-ratings">
                  {resource.maddieRating && (
                    <span>
                      Maddie {'★'.repeat(resource.maddieRating)}
                    </span>
                  )}

                  {resource.nickRating && (
                    <span>
                      Nick {'★'.repeat(resource.nickRating)}
                    </span>
                  )}
                </div>
              )}

              {resource.notes && (
                <p className="resource-notes">
                  {resource.notes}
                </p>
              )}

              <div className="resource-card-actions">
                <button onClick={() => handleEdit(resource)}>
                  Edit
                </button>
                <button onClick={() => handleDelete(resource)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {showForm && (
        <ResourceModal
          resource={editingResource}
          onClose={() => {
            setShowForm(false);
            setEditingResource(null);
          }}
          onSave={async (resourceData) => {
            if (editingResource) {
              await updateResource(
                editingResource.id,
                resourceData
              );
            } else {
              await addResource(resourceData);
            }

            setShowForm(false);
            setEditingResource(null);
          }}
        />
      )}
    </div>
  );
}

function ResourceModal({ resource, onClose, onSave }) {
  const [form, setForm] = useState({
    title: resource?.title ?? '',
    type: resource?.type ?? 'Book',
    topic: resource?.topic ?? 'Before Trying',
    assignedTo: resource?.assignedTo ?? 'Both',
    status: resource?.status ?? 'Want to Read',
    favorite: resource?.favorite ?? false,
    maddieRating: resource?.maddieRating ?? '',
    nickRating: resource?.nickRating ?? '',
    notes: resource?.notes ?? '',
  });

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    await onSave({
      ...form,
      maddieRating: form.maddieRating
        ? Number(form.maddieRating)
        : null,
      nickRating: form.nickRating
        ? Number(form.nickRating)
        : null,
    });
  };

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div
        className="modal resource-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">
              {resource ? 'EDIT RESOURCE' : 'NEW RESOURCE'}
            </p>
            <h2>{resource ? 'Edit resource' : 'Add a resource'}</h2>
          </div>

          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label>
            Title
            <input
              value={form.title}
              onChange={(event) =>
                updateField('title', event.target.value)
              }
              placeholder="What do you want to learn from?"
              required
            />
          </label>

          <div className="form-grid">
            <label>
              Type
              <select
                value={form.type}
                onChange={(event) =>
                  updateField('type', event.target.value)
                }
              >
                {resourceTypes
                  .filter((type) => type !== 'All')
                  .map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
              </select>
            </label>

            <label>
              Topic
              <select
                value={form.topic}
                onChange={(event) =>
                  updateField('topic', event.target.value)
                }
              >
                <option>Before Trying</option>
                <option>Pregnancy</option>
                <option>Birth</option>
                <option>Newborn</option>
                <option>Parenting</option>
                <option>Feeding</option>
                <option>Childcare</option>
                <option>Finances</option>
                <option>Other</option>
              </select>
            </label>
          </div>

          <div className="form-grid">
            <label>
              For
              <select
                value={form.assignedTo}
                onChange={(event) =>
                  updateField('assignedTo', event.target.value)
                }
              >
                <option>Maddie</option>
                <option>Nick</option>
                <option>Both</option>
              </select>
            </label>

            <label>
              Status
              <select
                value={form.status}
                onChange={(event) =>
                  updateField('status', event.target.value)
                }
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-grid">
            <label>
              Maddie's rating
              <select
                value={form.maddieRating}
                onChange={(event) =>
                  updateField('maddieRating', event.target.value)
                }
              >
                <option value="">Not rated</option>
                <option value="1">★</option>
                <option value="2">★★</option>
                <option value="3">★★★</option>
                <option value="4">★★★★</option>
                <option value="5">★★★★★</option>
              </select>
            </label>

            <label>
              Nick's rating
              <select
                value={form.nickRating}
                onChange={(event) =>
                  updateField('nickRating', event.target.value)
                }
              >
                <option value="">Not rated</option>
                <option value="1">★</option>
                <option value="2">★★</option>
                <option value="3">★★★</option>
                <option value="4">★★★★</option>
                <option value="5">★★★★★</option>
              </select>
            </label>
          </div>

          <label>
            Notes
            <textarea
              value={form.notes}
              onChange={(event) =>
                updateField('notes', event.target.value)
              }
              placeholder="Thoughts, takeaways, or things to discuss..."
              rows="4"
            />
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.favorite}
              onChange={(event) =>
                updateField('favorite', event.target.checked)
              }
            />
            <span>Save as a favorite</span>
          </label>

          <div className="modal-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
            >
              Cancel
            </button>

            <button type="submit" className="primary-button">
              {resource ? 'Save changes' : 'Add resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Resources;