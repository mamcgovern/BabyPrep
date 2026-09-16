import { useEffect, useMemo, useState } from 'react';
import {
  gearCategories,
  gearStatuses,
  useBabyGear,
} from '../context/BabyGearContext';

const emptyForm = {
  name: '',
  brand: '',
  category: 'Strollers',
  price: '',
  productUrl: '',
  imageUrl: '',
  status: 'Researching',
  maddieRating: 0,
  nickRating: 0,
  favorite: false,
  pros: '',
  cons: '',
  notes: '',
  comparisonFields: {
    weight: '',
    dimensions: '',
    fold: '',
    compatibility: '',
  },
};

function Rating({ value, onChange, label }) {
  return (
    <div className="gear-rating">
      <span>{label}</span>

      <div className="gear-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={star <= value ? 'selected' : ''}
            onClick={() => onChange(star === value ? 0 : star)}
            aria-label={`${star} out of 5`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );
}

function GearModal({
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
        name: editingItem.name || '',
        brand: editingItem.brand || '',
        category: editingItem.category || 'Strollers',
        price: editingItem.price ?? '',
        productUrl: editingItem.productUrl || '',
        imageUrl: editingItem.imageUrl || '',
        status: editingItem.status || 'Researching',
        maddieRating: editingItem.maddieRating || 0,
        nickRating: editingItem.nickRating || 0,
        favorite: editingItem.favorite || false,
        pros: editingItem.pros || '',
        cons: editingItem.cons || '',
        notes: editingItem.notes || '',
        comparisonFields: {
          weight: editingItem.comparisonFields?.weight || '',
          dimensions: editingItem.comparisonFields?.dimensions || '',
          fold: editingItem.comparisonFields?.fold || '',
          compatibility:
            editingItem.comparisonFields?.compatibility || '',
        },
      });
    } else {
      setForm(emptyForm);
    }
  }, [isOpen, editingItem]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleComparisonChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      comparisonFields: {
        ...currentForm.comparisonFields,
        [name]: value,
      },
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      return;
    }

    await onSave({
      ...form,
      name: form.name.trim(),
      price: form.price === '' ? null : Number(form.price),
    });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="gear-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <div
        className="gear-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gear-modal-title"
      >
        <div className="gear-modal-header">
          <div>
            <p className="gear-modal-eyebrow">
              {editingItem ? 'UPDATE GEAR' : 'ADD GEAR'}
            </p>

            <h2 id="gear-modal-title">
              {editingItem ? 'Edit Baby Gear' : 'Add Baby Gear'}
            </h2>
          </div>

          <button
            type="button"
            className="gear-modal-close"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="gear-form-grid">
            <label className="gear-form-field gear-form-field-full">
              <span>Product name</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. UPPAbaby Vista V3"
                autoFocus
                required
              />
            </label>

            <label className="gear-form-field">
              <span>Brand</span>
              <input
                type="text"
                name="brand"
                value={form.brand}
                onChange={handleChange}
                placeholder="e.g. UPPAbaby"
              />
            </label>

            <label className="gear-form-field">
              <span>Category</span>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                {gearCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="gear-form-field">
              <span>Price</span>
              <div className="gear-price-input">
                <span>$</span>
                <input
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
            </label>

            <label className="gear-form-field">
              <span>Status</span>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                {gearStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label className="gear-form-field gear-form-field-full">
              <span>Product URL</span>
              <input
                type="url"
                name="productUrl"
                value={form.productUrl}
                onChange={handleChange}
                placeholder="https://..."
              />
            </label>

            <label className="gear-form-field gear-form-field-full">
              <span>Image URL</span>
              <input
                type="url"
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="https://..."
              />
            </label>

            <div className="gear-form-section gear-form-field-full">
              <div className="gear-form-section-heading">
                <div>
                  <span>Our ratings</span>
                  <small>Rate it separately before discussing it together.</small>
                </div>
              </div>

              <div className="gear-ratings-grid">
                <Rating
                  label="Maddie"
                  value={form.maddieRating}
                  onChange={(value) =>
                    setForm((currentForm) => ({
                      ...currentForm,
                      maddieRating: value,
                    }))
                  }
                />

                <Rating
                  label="Nick"
                  value={form.nickRating}
                  onChange={(value) =>
                    setForm((currentForm) => ({
                      ...currentForm,
                      nickRating: value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="gear-form-section gear-form-field-full">
              <div className="gear-form-section-heading">
                <div>
                  <span>Comparison details</span>
                  <small>
                    Add the details you may want to compare later.
                  </small>
                </div>
              </div>

              <div className="gear-comparison-form-grid">
                <label className="gear-form-field">
                  <span>Weight</span>
                  <input
                    type="text"
                    name="weight"
                    value={form.comparisonFields.weight}
                    onChange={handleComparisonChange}
                    placeholder="e.g. 26.5 lb"
                  />
                </label>

                <label className="gear-form-field">
                  <span>Dimensions</span>
                  <input
                    type="text"
                    name="dimensions"
                    value={form.comparisonFields.dimensions}
                    onChange={handleComparisonChange}
                    placeholder="e.g. 36 × 25 × 18 in"
                  />
                </label>

                <label className="gear-form-field">
                  <span>Fold / setup</span>
                  <input
                    type="text"
                    name="fold"
                    value={form.comparisonFields.fold}
                    onChange={handleComparisonChange}
                    placeholder="e.g. One-handed"
                  />
                </label>

                <label className="gear-form-field">
                  <span>Compatibility</span>
                  <input
                    type="text"
                    name="compatibility"
                    value={form.comparisonFields.compatibility}
                    onChange={handleComparisonChange}
                    placeholder="e.g. Infant car seat"
                  />
                </label>
              </div>
            </div>

            <label className="gear-form-field">
              <span>Pros</span>
              <textarea
                name="pros"
                value={form.pros}
                onChange={handleChange}
                placeholder="What do we like?"
              />
            </label>

            <label className="gear-form-field">
              <span>Cons</span>
              <textarea
                name="cons"
                value={form.cons}
                onChange={handleChange}
                placeholder="What concerns us?"
              />
            </label>

            <label className="gear-form-field gear-form-field-full">
              <span>Notes</span>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Anything else we want to remember?"
              />
            </label>
          </div>

          <label className="gear-checkbox">
            <input
              type="checkbox"
              name="favorite"
              checked={form.favorite}
              onChange={handleChange}
            />
            <span>Mark as a favorite</span>
          </label>

          <div className="gear-modal-actions">
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
              disabled={saving || !form.name.trim()}
            >
              {saving
                ? 'Saving...'
                : editingItem
                  ? 'Save Changes'
                  : 'Add Gear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ComparisonModal({ items, onClose }) {
  if (!items.length) {
    return null;
  }

  const comparisonRows = [
    {
      label: 'Brand',
      getValue: (item) => item.brand || '—',
    },
    {
      label: 'Price',
      getValue: (item) =>
        item.price != null ? `$${Number(item.price).toLocaleString()}` : '—',
    },
    {
      label: 'Status',
      getValue: (item) => item.status || '—',
    },
    {
      label: 'Maddie',
      getValue: (item) =>
        item.maddieRating
          ? `${'★'.repeat(item.maddieRating)}${'☆'.repeat(
              5 - item.maddieRating
            )}`
          : '—',
    },
    {
      label: 'Nick',
      getValue: (item) =>
        item.nickRating
          ? `${'★'.repeat(item.nickRating)}${'☆'.repeat(
              5 - item.nickRating
            )}`
          : '—',
    },
    {
      label: 'Weight',
      getValue: (item) => item.comparisonFields?.weight || '—',
    },
    {
      label: 'Dimensions',
      getValue: (item) => item.comparisonFields?.dimensions || '—',
    },
    {
      label: 'Fold / setup',
      getValue: (item) => item.comparisonFields?.fold || '—',
    },
    {
      label: 'Compatibility',
      getValue: (item) => item.comparisonFields?.compatibility || '—',
    },
    {
      label: 'Pros',
      getValue: (item) => item.pros || '—',
    },
    {
      label: 'Cons',
      getValue: (item) => item.cons || '—',
    },
  ];

  return (
    <div
      className="gear-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="gear-comparison-modal">
        <div className="gear-modal-header">
          <div>
            <p className="gear-modal-eyebrow">COMPARE</p>
            <h2>Baby Gear Comparison</h2>
          </div>

          <button
            type="button"
            className="gear-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="gear-comparison-scroll">
          <table className="gear-comparison-table">
            <thead>
              <tr>
                <th>Details</th>

                {items.map((item) => (
                  <th key={item.id}>
                    <div className="comparison-product">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt=""
                        />
                      ) : (
                        <div className="comparison-product-placeholder">
                          ♡
                        </div>
                      )}

                      <strong>{item.name}</strong>

                      {item.productUrl && (
                        <a
                          href={item.productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View product ↗
                        </a>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.label}>
                  <th>{row.label}</th>

                  {items.map((item) => (
                    <td key={item.id}>
                      {row.getValue(item)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function BabyGear() {
  const {
    items,
    stats,
    loading,
    error,
    addGear,
    updateGear,
    deleteGear,
  } = useBabyGear();

  const [activeCategory, setActiveCategory] = useState('All');
  const [activeStatus, setActiveStatus] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
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
        await updateGear(editingItem.id, formData);
      } else {
        await addGear(formData);
      }

      closeModal();
    } catch (saveError) {
      console.error('Error saving baby gear:', saveError);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}"?`)) {
      return;
    }

    try {
      await deleteGear(item.id);
      setSelectedItems((current) =>
        current.filter((id) => id !== item.id)
      );
    } catch (deleteError) {
      console.error('Error deleting baby gear:', deleteError);
    }
  };

  const toggleSelected = (itemId) => {
    setSelectedItems((current) => {
      if (current.includes(itemId)) {
        return current.filter((id) => id !== itemId);
      }

      if (current.length >= 4) {
        return current;
      }

      return [...current, itemId];
    });
  };

  const comparisonItems = selectedItems
    .map((id) => items.find((item) => item.id === id))
    .filter(Boolean);

  return (
    <div className="page baby-gear-page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">RESEARCH & COMPARE</p>
          <h1>Baby Gear</h1>
          <p className="page-description">
            Research the things we might want before we actually buy anything.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={openAddModal}
        >
          + Add Gear
        </button>
      </div>

      <div className="gear-stats">
        <div className="stat-card">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Total</span>
        </div>

        <div className="stat-card">
          <span className="stat-number">{stats.researching}</span>
          <span className="stat-label">Researching</span>
        </div>

        <div className="stat-card">
          <span className="stat-number">{stats.considering}</span>
          <span className="stat-label">Considering</span>
        </div>

        <div className="stat-card">
          <span className="stat-number">{stats.decided}</span>
          <span className="stat-label">Decided</span>
        </div>
      </div>

      <div className="gear-filter-section">
        <div className="gear-filter-group">
          <span className="gear-filter-label">Category</span>

          <div className="board-pills">
            {['All', ...gearCategories].map((category) => (
              <button
                key={category}
                className={`filter-pill ${
                  activeCategory === category ? 'active' : ''
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="gear-filter-group">
          <span className="gear-filter-label">Status</span>

          <div className="board-pills">
            {['All', ...gearStatuses].map((status) => (
              <button
                key={status}
                className={`filter-pill ${
                  activeStatus === status ? 'active' : ''
                }`}
                onClick={() => setActiveStatus(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedItems.length > 0 && (
        <div className="gear-comparison-bar">
          <div>
            <strong>{selectedItems.length} selected</strong>
            <span>
              {selectedItems.length < 2
                ? 'Select at least 2 items to compare.'
                : 'Compare up to 4 products side by side.'}
            </span>
          </div>

          <div className="gear-comparison-bar-actions">
            <button
              className="secondary-button"
              onClick={() => setSelectedItems([])}
            >
              Clear
            </button>

            <button
              className="primary-button"
              onClick={() => setComparisonOpen(true)}
              disabled={selectedItems.length < 2}
            >
              Compare Selected
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="empty-state">
          <p>Loading baby gear...</p>
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
          <h2>No gear here yet</h2>
          <p>
            Start saving products you want to research and compare.
          </p>

          <button
            className="primary-button"
            onClick={openAddModal}
          >
            + Add Your First Item
          </button>
        </div>
      )}

      {!loading && !error && filteredItems.length > 0 && (
        <div className="baby-gear-grid">
          {filteredItems.map((item) => {
            const isSelected = selectedItems.includes(item.id);

            return (
              <article
                className={`baby-gear-card ${
                  isSelected ? 'selected' : ''
                }`}
                key={item.id}
              >
                <div className="baby-gear-image-wrapper">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="baby-gear-image"
                    />
                  ) : (
                    <div className="baby-gear-no-image">
                      <span>♡</span>
                      <p>No image added</p>
                    </div>
                  )}

                  <button
                    type="button"
                    className={`gear-select-button ${
                      isSelected ? 'selected' : ''
                    }`}
                    onClick={() => toggleSelected(item.id)}
                    aria-label={
                      isSelected
                        ? 'Remove from comparison'
                        : 'Add to comparison'
                    }
                  >
                    {isSelected ? '✓' : '+'}
                  </button>

                  {item.favorite && (
                    <span className="baby-gear-favorite">
                      ♥
                    </span>
                  )}
                </div>

                <div className="baby-gear-card-content">
                  <div className="baby-gear-card-top">
                    <span className="baby-gear-category">
                      {item.category}
                    </span>

                    <span
                      className={`gear-status gear-status-${item.status
                        ?.toLowerCase()
                        .replace(/\s+/g, '-')}`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <h2>{item.name}</h2>

                  {item.brand && (
                    <p className="baby-gear-brand">
                      {item.brand}
                    </p>
                  )}

                  {item.price != null && (
                    <p className="baby-gear-price">
                      ${Number(item.price).toLocaleString()}
                    </p>
                  )}

                  <div className="baby-gear-ratings">
                    <div>
                      <span>Maddie</span>
                      <strong>
                        {item.maddieRating
                          ? `${'★'.repeat(item.maddieRating)}${'☆'.repeat(
                              5 - item.maddieRating
                            )}`
                          : 'Not rated'}
                      </strong>
                    </div>

                    <div>
                      <span>Nick</span>
                      <strong>
                        {item.nickRating
                          ? `${'★'.repeat(item.nickRating)}${'☆'.repeat(
                              5 - item.nickRating
                            )}`
                          : 'Not rated'}
                      </strong>
                    </div>
                  </div>

                  {item.notes && (
                    <p className="baby-gear-notes">
                      {item.notes}
                    </p>
                  )}

                  <div className="baby-gear-card-footer">
                    <div className="baby-gear-card-actions">
                      {item.productUrl && (
                        <a
                          href={item.productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="baby-gear-source-link"
                        >
                          View product ↗
                        </a>
                      )}

                      <button
                        type="button"
                        className="baby-gear-action-button"
                        onClick={() => openEditModal(item)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="baby-gear-action-button"
                        onClick={() => handleDelete(item)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <GearModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        editingItem={editingItem}
        saving={saving}
      />

      {comparisonOpen && (
        <ComparisonModal
          items={comparisonItems}
          onClose={() => setComparisonOpen(false)}
        />
      )}
    </div>
  );
}

export default BabyGear;