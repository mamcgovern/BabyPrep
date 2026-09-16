import { useMemo, useState } from 'react';
import { useInspiration } from '../context/InspirationContext';

const boards = [
  'All',
  'Nursery',
  'Baby Gear',
  'Baby Clothes',
  'Baby Shower',
  'Announcements',
  'Baby Names',
  'Just for Fun',
];

const emptyForm = {
  title: '',
  board: 'Nursery',
  imageUrl: '',
  url: '',
  notes: '',
  addedBy: 'Maddie',
  favorite: false,
};

function InspirationModal({
  isOpen,
  onClose,
  onSave,
  editingItem,
  saving,
}) {
  const [form, setForm] = useState(
    editingItem
      ? {
          title: editingItem.title || '',
          board: editingItem.board || 'Nursery',
          imageUrl: editingItem.imageUrl || '',
          url: editingItem.url || '',
          notes: editingItem.notes || '',
          addedBy: editingItem.addedBy || 'Maddie',
          favorite: editingItem.favorite || false,
        }
      : emptyForm
  );

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: type === 'checkbox' ? checked : value,
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
      className="inspiration-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="inspiration-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="inspiration-modal-title"
      >
        <div className="inspiration-modal-header">
          <div>
            <p className="inspiration-modal-eyebrow">
              {editingItem ? 'UPDATE IDEA' : 'SAVE AN IDEA'}
            </p>
            <h2 id="inspiration-modal-title">
              {editingItem ? 'Edit Inspiration' : 'Add Inspiration'}
            </h2>
          </div>

          <button
            type="button"
            className="inspiration-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="inspiration-form-grid">
            <label className="inspiration-form-field inspiration-form-field-full">
              <span>Title</span>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Sage green nursery"
                autoFocus
                required
              />
            </label>

            <label className="inspiration-form-field">
              <span>Board</span>
              <select
                name="board"
                value={form.board}
                onChange={handleChange}
              >
                {boards
                  .filter((board) => board !== 'All')
                  .map((board) => (
                    <option key={board} value={board}>
                      {board}
                    </option>
                  ))}
              </select>
            </label>

            <label className="inspiration-form-field">
              <span>Added by</span>
              <select
                name="addedBy"
                value={form.addedBy}
                onChange={handleChange}
              >
                <option value="Maddie">Maddie</option>
                <option value="Nick">Nick</option>
                <option value="Both">Both</option>
              </select>
            </label>

            <label className="inspiration-form-field inspiration-form-field-full">
              <span>Image URL</span>
              <input
                type="url"
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="https://..."
              />
              <small>
                Paste the direct URL to an image you want to save.
              </small>
            </label>

            <label className="inspiration-form-field inspiration-form-field-full">
              <span>Source URL</span>
              <input
                type="url"
                name="url"
                value={form.url}
                onChange={handleChange}
                placeholder="https://..."
              />
              <small>
                Add the webpage, Pinterest pin, product, or post where you
                found it.
              </small>
            </label>

            <label className="inspiration-form-field inspiration-form-field-full">
              <span>Notes</span>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="What do we like about this?"
              />
            </label>
          </div>

          <label className="inspiration-checkbox">
            <input
              type="checkbox"
              name="favorite"
              checked={form.favorite}
              onChange={handleChange}
            />
            <span>Mark as a favorite</span>
          </label>

          <div className="inspiration-modal-actions">
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
                  : 'Add Inspiration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Inspiration() {
  const {
    items,
    loading,
    error,
    stats,
    addInspiration,
    updateInspiration,
    deleteInspiration,
  } = useInspiration();

  const [activeBoard, setActiveBoard] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);

  const filteredItems = useMemo(() => {
    if (activeBoard === 'All') {
      return items;
    }

    return items.filter((item) => item.board === activeBoard);
  }, [items, activeBoard]);

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
        await updateInspiration(editingItem.id, formData);
      } else {
        await addInspiration(formData);
      }

      setModalOpen(false);
      setEditingItem(null);
    } catch (saveError) {
      console.error('Error saving inspiration:', saveError);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.title}"?`)) {
      return;
    }

    try {
      await deleteInspiration(item.id);
    } catch (deleteError) {
      console.error('Error deleting inspiration:', deleteError);
    }
  };

  return (
    <div className="page inspiration-page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">COLLECT & DREAM</p>
          <h1>Inspiration</h1>
          <p className="page-description">
            Save things we love while we figure out what we want.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={openAddModal}
        >
          + Add Inspiration
        </button>
      </div>

      <div className="inspiration-stats">
        <div className="stat-card">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Saved</span>
        </div>

        <div className="stat-card">
          <span className="stat-number">{stats.favorites}</span>
          <span className="stat-label">Favorites</span>
        </div>

        <div className="stat-card">
          <span className="stat-number">{stats.boards}</span>
          <span className="stat-label">Boards</span>
        </div>
      </div>

      <div className="board-pills">
        {boards.map((board) => (
          <button
            key={board}
            className={`filter-pill ${
              activeBoard === board ? 'active' : ''
            }`}
            onClick={() => setActiveBoard(board)}
          >
            {board}
          </button>
        ))}
      </div>

      {loading && (
        <div className="empty-state">
          <p>Loading inspiration...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {!loading && !error && filteredItems.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">♡</div>
          <h2>Nothing here yet</h2>
          <p>
            Start saving ideas you love and they'll show up here.
          </p>
          <button
            className="primary-button"
            onClick={openAddModal}
          >
            + Add Your First Idea
          </button>
        </div>
      )}

      {!loading && !error && filteredItems.length > 0 && (
        <div className="inspiration-grid">
          {filteredItems.map((item) => (
            <article
              className="inspiration-card"
              key={item.id}
            >
              {item.imageUrl ? (
                <div className="inspiration-image-wrapper">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="inspiration-image"
                  />
                </div>
              ) : (
                <div className="inspiration-no-image">
                  <span>♡</span>
                  <p>No image added</p>
                </div>
              )}

              <div className="inspiration-card-content">
                <div className="inspiration-card-top">
                  <span className="inspiration-board">
                    {item.board}
                  </span>

                  {item.favorite && (
                    <span className="inspiration-favorite">
                      ♥
                    </span>
                  )}
                </div>

                <h2>{item.title}</h2>

                {item.notes && (
                  <p className="inspiration-notes">
                    {item.notes}
                  </p>
                )}

                <div className="inspiration-card-footer">
                  <div className="inspiration-card-actions">
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inspiration-source-link"
                      >
                        View source ↗
                      </a>
                    )}

                    <button
                      type="button"
                      className="inspiration-action-button"
                      onClick={() => openEditModal(item)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="inspiration-action-button"
                      onClick={() => handleDelete(item)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <InspirationModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        editingItem={editingItem}
        saving={saving}
      />
    </div>
  );
}

export default Inspiration;