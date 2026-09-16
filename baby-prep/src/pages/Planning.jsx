import { useEffect, useMemo, useState } from 'react';
import {
  planningCategories,
  planningStatuses,
  usePlanning,
} from '../context/PlanningContext';
import { useNames } from '../context/NameContext';

const emptyForm = {
  title: '',
  category: 'Childcare',
  status: 'Not Discussed',
  maddieThoughts: '',
  nickThoughts: '',
  decision: '',
  notes: '',
};

const { babyNamePlaceholder } = useNames();

function PlanningModal({
  isOpen,
  onClose,
  onSave,
  editingItem,
  saving,
}) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (editingItem) {
      setForm({
        title: editingItem.title || '',
        category: editingItem.category || 'Childcare',
        status: editingItem.status || 'Not Discussed',
        maddieThoughts: editingItem.maddieThoughts || '',
        nickThoughts: editingItem.nickThoughts || '',
        decision: editingItem.decision || '',
        notes: editingItem.notes || '',
      });
    } else {
      setForm(emptyForm);
    }
  }, [isOpen, editingItem]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      return;
    }

    await onSave({
      ...form,
      title: form.title.trim(),
    });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="planning-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <div
        className="planning-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="planning-modal-title"
      >
        <div className="planning-modal-header">
          <div>
            <p className="planning-modal-eyebrow">
              {editingItem ? 'UPDATE DECISION' : 'ADD DECISION'}
            </p>

            <h2 id="planning-modal-title">
              {editingItem ? 'Edit Planning Item' : 'Add Planning Item'}
            </h2>
          </div>

          <button
            type="button"
            className="planning-modal-close"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="planning-form-grid">
            <label className="planning-form-field planning-form-field-full">
              <span>Question or decision</span>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. What kind of childcare do we want?"
                autoFocus
                required
              />
            </label>

            <label className="planning-form-field">
              <span>Category</span>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                {planningCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="planning-form-field">
              <span>Status</span>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                {planningStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <div className="planning-form-section planning-form-field-full">
              <div className="planning-section-heading">
                <span>Think about it separately</span>
                <small>
                  Add your thoughts independently before making a decision
                  together.
                </small>
              </div>

              <div className="planning-thoughts-grid">
                <label className="planning-form-field">
                  <span>Maddie's thoughts</span>
                  <textarea
                    name="maddieThoughts"
                    value={form.maddieThoughts}
                    onChange={handleChange}
                    placeholder="What do I think?"
                  />
                </label>

                <label className="planning-form-field">
                  <span>Nick's thoughts</span>
                  <textarea
                    name="nickThoughts"
                    value={form.nickThoughts}
                    onChange={handleChange}
                    placeholder="What does Nick think?"
                  />
                </label>
              </div>
            </div>

            <label className="planning-form-field planning-form-field-full">
              <span>Our decision</span>
              <textarea
                name="decision"
                value={form.decision}
                onChange={handleChange}
                placeholder="What did we decide together?"
              />
            </label>

            <label className="planning-form-field planning-form-field-full">
              <span>Notes</span>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Anything else we want to remember?"
              />
            </label>
          </div>

          <div className="planning-modal-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={saving || !form.title.trim()}
            >
              {saving
                ? 'Saving...'
                : editingItem
                  ? 'Save Changes'
                  : 'Add Decision'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Planning() {
  const {
    items,
    stats,
    loading,
    error,
    addPlanningItem,
    updatePlanningItem,
    deletePlanningItem,
  } = usePlanning();

  const [activeCategory, setActiveCategory] = useState('All');
  const [activeStatus, setActiveStatus] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory =
        activeCategory === 'All' || item.category === activeCategory;

      const matchesStatus =
        activeStatus === 'All' || item.status === activeStatus;

      return matchesCategory && matchesStatus;
    });
  }, [items, activeCategory, activeStatus]);

  const openAddModal = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditingItem(null);
  };

  const handleSave = async (formData) => {
    setSaving(true);

    try {
      if (editingItem) {
        await updatePlanningItem(editingItem.id, formData);
      } else {
        await addPlanningItem(formData);
      }

      setModalOpen(false);
      setEditingItem(null);
    } catch (saveError) {
      console.error('Error saving planning item:', saveError);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.title}"?`)) {
      return;
    }

    try {
      await deletePlanningItem(item.id);
    } catch (deleteError) {
      console.error('Error deleting planning item:', deleteError);
    }
  };

  return (
    <div className="page planning-page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">THINK & DECIDE</p>
          <h1>Planning</h1>
          <p className="page-description">
            Everything you're working through before {babyNamePlaceholder} arrives.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={openAddModal}
        >
          + Add Decision
        </button>
      </div>

      <div className="planning-stats">
        <div className="stat-card">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Total</span>
        </div>

        <div className="stat-card">
          <span className="stat-number">{stats.notDiscussed}</span>
          <span className="stat-label">Not Discussed</span>
        </div>

        <div className="stat-card">
          <span className="stat-number">{stats.discussing}</span>
          <span className="stat-label">Discussing</span>
        </div>

        <div className="stat-card">
          <span className="stat-number">{stats.decided}</span>
          <span className="stat-label">Decided</span>
        </div>
      </div>

      <div className="planning-filter-section">
        <div className="planning-filter-group">
          <span className="planning-filter-label">Category</span>

          <div className="board-pills">
            {['All', ...planningCategories].map((category) => (
              <button
                key={category}
                className={`filter-pill ${activeCategory === category ? 'active' : ''
                  }`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="planning-filter-group">
          <span className="planning-filter-label">Status</span>

          <div className="board-pills">
            {['All', ...planningStatuses].map((status) => (
              <button
                key={status}
                className={`filter-pill ${activeStatus === status ? 'active' : ''
                  }`}
                onClick={() => setActiveStatus(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="empty-state">
          <p>Loading planning items...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {!loading && !error && filteredItems.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">◌</div>
          <h2>Nothing here yet</h2>
          <p>
            Add the conversations and decisions you want to work through
            together.
          </p>

          <button
            className="primary-button"
            onClick={openAddModal}
          >
            + Add Your First Decision
          </button>
        </div>
      )}

      {!loading && !error && filteredItems.length > 0 && (
        <div className="planning-grid">
          {filteredItems.map((item) => (
            <article className="planning-card" key={item.id}>
              <div className="planning-card-top">
                <span className="planning-category">
                  {item.category}
                </span>

                <span
                  className={`planning-status planning-status-${item.status
                    ?.toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/'/g, '')}`}
                >
                  {item.status}
                </span>
              </div>

              <h2>{item.title}</h2>

              <div className="planning-responses">
                <div className="planning-response">
                  <span>Maddie</span>
                  <p>
                    {item.maddieThoughts || 'No thoughts added yet.'}
                  </p>
                </div>

                <div className="planning-response">
                  <span>Nick</span>
                  <p>
                    {item.nickThoughts || 'No thoughts added yet.'}
                  </p>
                </div>
              </div>

              {item.decision && (
                <div className="planning-decision">
                  <span>Our decision</span>
                  <p>{item.decision}</p>
                </div>
              )}

              {item.notes && (
                <div className="planning-notes">
                  <span>Notes</span>
                  <p>{item.notes}</p>
                </div>
              )}

              <div className="planning-card-footer">
                <button
                  type="button"
                  className="planning-action-button"
                  onClick={() => openEditModal(item)}
                >
                  Edit
                </button>

                <button
                  type="button"
                  className="planning-action-button"
                  onClick={() => handleDelete(item)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <PlanningModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        editingItem={editingItem}
        saving={saving}
      />
    </div>
  );
}

export default Planning;