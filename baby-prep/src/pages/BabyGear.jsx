import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  gearCategories,
  gearStatuses,
  useBabyGear,
} from '../context/BabyGearContext';

const emptyForm = {
  name: '',
  category: 'Strollers',
  brand: '',
  price: '',
  productLink: '',
  image: '',
  status: 'Researching',
  maddieRating: '',
  nickRating: '',
  notes: '',
  sharedNotes: '',
  pros: '',
  cons: '',
  favorite: false,
};

const statusDescriptions = {
  Researching: 'Still exploring',
  Considering: 'On our shortlist',
  Decided: 'We have a decision',
  "Don't Want": 'Not for us',
};

const statusClassNames = {
  Researching: 'researching',
  Considering: 'considering',
  Decided: 'decided',
  "Don't Want": 'dont-want',
};

function formatCurrency(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return '$0';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(number);
}

function getRatingLabel(rating) {
  if (!rating) {
    return 'Not rated';
  }

  return `${rating}/5`;
}

function splitList(value) {
  if (!value) {
    return [];
  }

  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function GearModal({
  isOpen,
  editingItem,
  onClose,
  onSave,
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
        category: editingItem.category || 'Strollers',
        brand: editingItem.brand || '',
        price:
          editingItem.price === null ||
          editingItem.price === undefined
            ? ''
            : String(editingItem.price),
        productLink: editingItem.productLink || '',
        image: editingItem.image || '',
        status: editingItem.status || 'Researching',
        maddieRating:
          editingItem.maddieRating === null ||
          editingItem.maddieRating === undefined
            ? ''
            : String(editingItem.maddieRating),
        nickRating:
          editingItem.nickRating === null ||
          editingItem.nickRating === undefined
            ? ''
            : String(editingItem.nickRating),
        notes: editingItem.notes || '',
        sharedNotes: editingItem.sharedNotes || '',
        pros: editingItem.pros || '',
        cons: editingItem.cons || '',
        favorite: Boolean(editingItem.favorite),
      });
    } else {
      setForm(emptyForm);
    }
  }, [isOpen, editingItem]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
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
      brand: form.brand.trim(),
      price:
        form.price === '' ? null : Number(form.price),
      maddieRating:
        form.maddieRating === ''
          ? null
          : Number(form.maddieRating),
      nickRating:
        form.nickRating === ''
          ? null
          : Number(form.nickRating),
      productLink: form.productLink.trim(),
      image: form.image.trim(),
      notes: form.notes.trim(),
      sharedNotes: form.sharedNotes.trim(),
      pros: form.pros.trim(),
      cons: form.cons.trim(),
    });
  };

  return (
    <div
      className="gear-modal-overlay"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !saving
        ) {
          onClose();
        }
      }}
    >
      <div className="gear-modal">
        <div className="gear-modal-header">
          <div>
            <p className="card-eyebrow">
              {editingItem ? 'Update Research' : 'New Product'}
            </p>
            <h2>
              {editingItem
                ? 'Edit baby gear'
                : 'Add baby gear'}
            </h2>
            <p>
              Keep product details, opinions, and notes
              together while you research.
            </p>
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
          <div className="gear-form-section">
            <div className="gear-form-section-heading">
              <span className="gear-form-number">01</span>
              <div>
                <strong>Product details</strong>
                <span>What are you researching?</span>
              </div>
            </div>

            <div className="gear-form-grid">
              <label className="gear-form-field gear-form-field-wide">
                <span>Product name</span>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Nuna TRVL stroller"
                  autoFocus
                  required
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
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="gear-form-field">
                <span>Brand</span>
                <input
                  type="text"
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  placeholder="Brand"
                />
              </label>

              <label className="gear-form-field">
                <span>Price</span>
                <div className="gear-money-input">
                  <span>$</span>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="0"
                  />
                </div>
              </label>

              <label className="gear-form-field gear-form-field-wide">
                <span>Product link</span>
                <input
                  type="url"
                  name="productLink"
                  value={form.productLink}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </label>

              <label className="gear-form-field gear-form-field-wide">
                <span>Image URL</span>
                <input
                  type="url"
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </label>
            </div>
          </div>

          <div className="gear-form-section">
            <div className="gear-form-section-heading">
              <span className="gear-form-number">02</span>
              <div>
                <strong>Where you stand</strong>
                <span>Track your current thinking</span>
              </div>
            </div>

            <div className="gear-status-options">
              {gearStatuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  className={`gear-status-option ${
                    form.status === status
                      ? `selected ${statusClassNames[status]}`
                      : ''
                  }`}
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      status,
                    }))
                  }
                >
                  <span>{status}</span>
                  <small>
                    {statusDescriptions[status]}
                  </small>
                </button>
              ))}
            </div>

            <label className="gear-favorite-toggle">
              <input
                type="checkbox"
                name="favorite"
                checked={form.favorite}
                onChange={handleChange}
              />
              <span className="gear-checkbox">
                {form.favorite ? '★' : ''}
              </span>
              <span>
                <strong>Favorite this product</strong>
                <small>Keep it easy to find later.</small>
              </span>
            </label>
          </div>

          <div className="gear-form-section">
            <div className="gear-form-section-heading">
              <span className="gear-form-number">03</span>
              <div>
                <strong>Your ratings</strong>
                <span>How does each of you feel about it?</span>
              </div>
            </div>

            <div className="gear-rating-grid">
              <label className="gear-rating-card">
                <span className="gear-rating-person">M</span>
                <div>
                  <strong>Maddie</strong>
                  <small>Your rating</small>
                </div>
                <select
                  name="maddieRating"
                  value={form.maddieRating}
                  onChange={handleChange}
                >
                  <option value="">Not rated</option>
                  <option value="1">1 / 5</option>
                  <option value="2">2 / 5</option>
                  <option value="3">3 / 5</option>
                  <option value="4">4 / 5</option>
                  <option value="5">5 / 5</option>
                </select>
              </label>

              <label className="gear-rating-card">
                <span className="gear-rating-person gear-rating-person-blue">
                  N
                </span>
                <div>
                  <strong>Nick</strong>
                  <small>His rating</small>
                </div>
                <select
                  name="nickRating"
                  value={form.nickRating}
                  onChange={handleChange}
                >
                  <option value="">Not rated</option>
                  <option value="1">1 / 5</option>
                  <option value="2">2 / 5</option>
                  <option value="3">3 / 5</option>
                  <option value="4">4 / 5</option>
                  <option value="5">5 / 5</option>
                </select>
              </label>
            </div>
          </div>

          <div className="gear-form-section">
            <div className="gear-form-section-heading">
              <span className="gear-form-number">04</span>
              <div>
                <strong>Notes</strong>
                <span>Capture what matters</span>
              </div>
            </div>

            <div className="gear-form-grid">
              <label className="gear-form-field">
                <span>Pros</span>
                <textarea
                  name="pros"
                  value={form.pros}
                  onChange={handleChange}
                  rows="4"
                  placeholder="One item per line"
                />
              </label>

              <label className="gear-form-field">
                <span>Cons</span>
                <textarea
                  name="cons"
                  value={form.cons}
                  onChange={handleChange}
                  rows="4"
                  placeholder="One item per line"
                />
              </label>

              <label className="gear-form-field">
                <span>Maddie's notes</span>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Your thoughts..."
                />
              </label>

              <label className="gear-form-field">
                <span>Shared notes</span>
                <textarea
                  name="sharedNotes"
                  value={form.sharedNotes}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Things to discuss together..."
                />
              </label>
            </div>
          </div>

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
                  : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function GearCard({
  item,
  budgetItem,
  onEdit,
  onDelete,
  onToggleFavorite,
  onAddToBudget,
  onRemoveFromBudget,
  onViewBudget,
  onCompare,
  isComparing,
  compareDisabled,
}) {
  const pros = splitList(item.pros);
  const cons = splitList(item.cons);
  const statusClass =
    statusClassNames[item.status] || 'researching';

  return (
    <article className="gear-card">
      <div className="gear-card-image">
        {item.image ? (
          <img
            src={item.image}
            alt=""
            loading="lazy"
          />
        ) : (
          <div className="gear-card-image-placeholder">
            <span>✦</span>
            <small>Baby gear</small>
          </div>
        )}

        <button
          type="button"
          className={`gear-favorite-button ${
            item.favorite ? 'active' : ''
          }`}
          onClick={() => onToggleFavorite(item)}
          aria-label={
            item.favorite
              ? 'Remove from favorites'
              : 'Add to favorites'
          }
        >
          {item.favorite ? '★' : '☆'}
        </button>

        <span
          className={`gear-status-badge ${statusClass}`}
        >
          {item.status}
        </span>
      </div>

      <div className="gear-card-content">
        <div className="gear-card-heading">
          <div>
            <p className="gear-card-category">
              {item.category}
            </p>
            <h2>{item.name}</h2>
            {item.brand && (
              <p className="gear-card-brand">
                {item.brand}
              </p>
            )}
          </div>

          {item.price !== null &&
            item.price !== undefined &&
            item.price !== '' && (
              <strong className="gear-card-price">
                {formatCurrency(item.price)}
              </strong>
            )}
        </div>

        <div className="gear-card-ratings">
          <div>
            <span className="gear-rating-avatar">
              M
            </span>
            <span>Maddie</span>
            <strong>
              {getRatingLabel(item.maddieRating)}
            </strong>
          </div>

          <div>
            <span className="gear-rating-avatar blue">
              N
            </span>
            <span>Nick</span>
            <strong>
              {getRatingLabel(item.nickRating)}
            </strong>
          </div>
        </div>

        {(pros.length > 0 || cons.length > 0) && (
          <div className="gear-card-pros-cons">
            {pros.length > 0 && (
              <div>
                <span className="gear-list-heading">
                  Pros
                </span>
                <ul>
                  {pros.slice(0, 3).map((pro, index) => (
                    <li key={`${pro}-${index}`}>{pro}</li>
                  ))}
                </ul>
              </div>
            )}

            {cons.length > 0 && (
              <div>
                <span className="gear-list-heading">
                  Cons
                </span>
                <ul>
                  {cons.slice(0, 3).map((con, index) => (
                    <li key={`${con}-${index}`}>{con}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {item.sharedNotes && (
          <div className="gear-shared-note">
            <span>Shared note</span>
            <p>{item.sharedNotes}</p>
          </div>
        )}

        <div className="gear-budget-section">
          <div className="gear-budget-heading">
            <div>
              <span className="gear-budget-label">
                Budget
              </span>
              {budgetItem ? (
                <strong>Connected</strong>
              ) : (
                <small>Not added yet</small>
              )}
            </div>

            {budgetItem &&
              budgetItem.actualAmount !== null &&
              budgetItem.actualAmount !== undefined && (
                <span className="gear-budget-spent">
                  {formatCurrency(
                    budgetItem.actualAmount
                  )}{' '}
                  spent
                </span>
              )}
          </div>

          {budgetItem ? (
            <div className="gear-budget-connected">
              <span>
                Planned{' '}
                <strong>
                  {formatCurrency(
                    budgetItem.plannedAmount
                  )}
                </strong>
              </span>

              <button
                type="button"
                onClick={onViewBudget}
              >
                View Budget
              </button>

              <button
                type="button"
                className="subtle-danger"
                onClick={onRemoveFromBudget}
              >
                Remove
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="gear-add-budget-button"
              onClick={onAddToBudget}
              disabled={
                item.price === null ||
                item.price === undefined ||
                item.price === ''
              }
            >
              <span>+</span>
              Add {item.price ? 'to Budget' : 'a price to budget'}
            </button>
          )}
        </div>

        <div className="gear-card-actions">
          <label
            className={`gear-compare-control ${
              isComparing ? 'active' : ''
            } ${compareDisabled ? 'disabled' : ''}`}
          >
            <input
              type="checkbox"
              checked={isComparing}
              disabled={compareDisabled && !isComparing}
              onChange={() => onCompare(item.id)}
            />
            <span>
              {isComparing
                ? 'Comparing'
                : 'Compare'}
            </span>
          </label>

          <div className="gear-card-links">
            {item.productLink && (
              <a
                href={item.productLink}
                target="_blank"
                rel="noreferrer"
              >
                View product ↗
              </a>
            )}

            <button
              type="button"
              onClick={() => onEdit(item)}
            >
              Edit
            </button>

            <button
              type="button"
              className="danger"
              onClick={() => onDelete(item)}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function ComparePanel({
  items,
  onRemove,
  onClose,
}) {
  if (items.length === 0) {
    return null;
  }

  const comparisonFields = [
    {
      label: 'Category',
      getValue: (item) => item.category || '—',
    },
    {
      label: 'Brand',
      getValue: (item) => item.brand || '—',
    },
    {
      label: 'Price',
      getValue: (item) =>
        item.price === null ||
        item.price === undefined ||
        item.price === ''
          ? 'Not listed'
          : formatCurrency(item.price),
    },
    {
      label: 'Status',
      getValue: (item) => item.status || '—',
    },
    {
      label: 'Maddie',
      getValue: (item) =>
        getRatingLabel(item.maddieRating),
    },
    {
      label: 'Nick',
      getValue: (item) =>
        getRatingLabel(item.nickRating),
    },
    {
      label: 'Pros',
      getValue: (item) =>
        splitList(item.pros).length > 0
          ? splitList(item.pros).join(', ')
          : '—',
    },
    {
      label: 'Cons',
      getValue: (item) =>
        splitList(item.cons).length > 0
          ? splitList(item.cons).join(', ')
          : '—',
    },
    {
      label: 'Notes',
      getValue: (item) =>
        item.sharedNotes ||
        item.notes ||
        '—',
    },
  ];

  return (
    <div className="compare-panel-overlay">
      <div className="compare-panel">
        <div className="compare-panel-header">
          <div>
            <p className="card-eyebrow">
              Side by side
            </p>
            <h2>Compare baby gear</h2>
            <p>
              Look at your options together before
              making a decision.
            </p>
          </div>

          <button
            type="button"
            className="gear-modal-close"
            onClick={onClose}
            aria-label="Close comparison"
          >
            ×
          </button>
        </div>

        <div className="compare-table-wrap">
          <table className="compare-table">
            <thead>
              <tr>
                <th></th>
                {items.map((item) => (
                  <th key={item.id}>
                    <div className="compare-product">
                      <div className="compare-product-image">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt=""
                          />
                        ) : (
                          <span>✦</span>
                        )}
                      </div>

                      <strong>{item.name}</strong>

                      <button
                        type="button"
                        onClick={() => onRemove(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {comparisonFields.map((field) => (
                <tr key={field.label}>
                  <th>{field.label}</th>
                  {items.map((item) => (
                    <td key={item.id}>
                      {field.getValue(item)}
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
  const navigate = useNavigate();

  const {
    items,
    stats,
    loading,
    error,
    addGear,
    updateGear,
    deleteGear,
    addGearToBudget,
    removeGearFromBudget,
    getBudgetItem,
  } = useBabyGear();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] =
    useState('all');
  const [statusFilter, setStatusFilter] =
    useState('all');
  const [favoriteOnly, setFavoriteOnly] =
    useState(false);

  const [showModal, setShowModal] =
    useState(false);
  const [editingItem, setEditingItem] =
    useState(null);
  const [saving, setSaving] =
    useState(false);
  const [pageError, setPageError] =
    useState('');

  const [compareIds, setCompareIds] =
    useState([]);
  const [showCompare, setShowCompare] =
    useState(false);

  const visibleItems = useMemo(() => {
    const searchValue = search
      .trim()
      .toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        !searchValue ||
        [
          item.name,
          item.brand,
          item.category,
          item.notes,
          item.sharedNotes,
          item.pros,
          item.cons,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(searchValue);

      const matchesCategory =
        categoryFilter === 'all' ||
        item.category === categoryFilter;

      const matchesStatus =
        statusFilter === 'all' ||
        item.status === statusFilter;

      const matchesFavorite =
        !favoriteOnly || item.favorite;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus &&
        matchesFavorite
      );
    });
  }, [
    items,
    search,
    categoryFilter,
    statusFilter,
    favoriteOnly,
  ]);

  const compareItems = useMemo(
    () =>
      compareIds
        .map((id) =>
          items.find((item) => item.id === id)
        )
        .filter(Boolean),
    [compareIds, items]
  );

  const openAddModal = () => {
    setEditingItem(null);
    setPageError('');
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setPageError('');
    setShowModal(true);
  };

  const handleSave = async (data) => {
    setSaving(true);
    setPageError('');

    try {
      if (editingItem) {
        await updateGear(editingItem.id, data);
      } else {
        await addGear(data);
      }

      setShowModal(false);
      setEditingItem(null);
    } catch (saveError) {
      console.error(
        'Error saving baby gear:',
        saveError
      );
      setPageError(
        'We could not save that product. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Delete "${item.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteGear(item.id);

      setCompareIds((current) =>
        current.filter((id) => id !== item.id)
      );
    } catch (deleteError) {
      console.error(
        'Error deleting baby gear:',
        deleteError
      );
      setPageError(
        'We could not delete that product.'
      );
    }
  };

  const handleToggleFavorite = async (item) => {
    try {
      await updateGear(item.id, {
        favorite: !item.favorite,
      });
    } catch (favoriteError) {
      console.error(
        'Error updating favorite:',
        favoriteError
      );
      setPageError(
        'We could not update that favorite.'
      );
    }
  };

  const handleAddToBudget = async (item) => {
    try {
      await addGearToBudget(item.id);
    } catch (budgetError) {
      console.error(
        'Error adding gear to budget:',
        budgetError
      );
      setPageError(
        budgetError.message ||
          'We could not add that product to your budget.'
      );
    }
  };

  const handleRemoveFromBudget = async (item) => {
    try {
      await removeGearFromBudget(item.id);
    } catch (budgetError) {
      console.error(
        'Error removing gear from budget:',
        budgetError
      );
      setPageError(
        'We could not remove that product from your budget.'
      );
    }
  };

  const handleCompare = (itemId) => {
    setCompareIds((current) => {
      if (current.includes(itemId)) {
        return current.filter((id) => id !== itemId);
      }

      if (current.length >= 4) {
        return current;
      }

      return [...current, itemId];
    });
  };

  const clearFilters = () => {
    setSearch('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setFavoriteOnly(false);
  };

  const activeFilterCount =
    Number(categoryFilter !== 'all') +
    Number(statusFilter !== 'all') +
    Number(favoriteOnly);

  return (
    <div className="page baby-gear-page">
      <header className="gear-page-header">
        <div>
          <p className="page-eyebrow">
            Research & Compare
          </p>
          <h1>Baby Gear</h1>
          <p className="page-description">
            Research the things you might want,
            compare your options, and keep track of
            what you both think.
          </p>
        </div>

        <button
          type="button"
          className="primary-button gear-add-button"
          onClick={openAddModal}
        >
          <span>+</span>
          Add Product
        </button>
      </header>

      {(error || pageError) && (
        <div className="gear-error">
          <span>{pageError || error}</span>
          <button
            type="button"
            onClick={() => setPageError('')}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      <section className="gear-stats-grid">
        <div className="gear-stat-card gear-stat-total">
          <div className="gear-stat-icon">✦</div>
          <div className="gear-stat-content">
            <span className="gear-stat-label">
              Products
            </span>
            <strong>{stats.total}</strong>
            <small>
              {stats.total === 1
                ? 'product in your research'
                : 'products in your research'}
            </small>
          </div>
        </div>

        <div className="gear-stat-card gear-stat-researching">
          <div className="gear-stat-icon">◌</div>
          <div className="gear-stat-content">
            <span className="gear-stat-label">
              Researching
            </span>
            <strong>{stats.researching}</strong>
            <small>Still exploring</small>
          </div>
        </div>

        <div className="gear-stat-card gear-stat-considering">
          <div className="gear-stat-icon">♡</div>
          <div className="gear-stat-content">
            <span className="gear-stat-label">
              Considering
            </span>
            <strong>{stats.considering}</strong>
            <small>On our shortlist</small>
          </div>
        </div>

        <div className="gear-stat-card gear-stat-budgeted">
          <div className="gear-stat-icon">$</div>
          <div className="gear-stat-content">
            <span className="gear-stat-label">
              Budgeted
            </span>
            <strong>{stats.budgeted}</strong>
            <small>Connected to Budget</small>
          </div>
        </div>
      </section>

      {compareItems.length > 0 && (
        <section className="gear-compare-bar">
          <div>
            <span className="gear-compare-count">
              {compareItems.length} of 4
            </span>
            <div>
              <strong>
                Products selected for comparison
              </strong>
              <small>
                Add up to four products to compare
                side by side.
              </small>
            </div>
          </div>

          <div className="gear-compare-bar-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => setCompareIds([])}
            >
              Clear
            </button>

            <button
              type="button"
              className="primary-button"
              onClick={() => setShowCompare(true)}
            >
              Compare Products
            </button>
          </div>
        </section>
      )}

      <section className="gear-toolbar">
        <div className="gear-search">
          <span>⌕</span>
          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search products, brands, notes..."
          />
        </div>

        <div className="gear-toolbar-controls">
          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(event.target.value)
            }
          >
            <option value="all">
              All Categories
            </option>
            {gearCategories.map((category) => (
              <option
                key={category}
                value={category}
              >
                {category}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="all">
              All Statuses
            </option>
            {gearStatuses.map((status) => (
              <option
                key={status}
                value={status}
              >
                {status}
              </option>
            ))}
          </select>

          <button
            type="button"
            className={`gear-filter-button ${
              favoriteOnly ? 'active' : ''
            }`}
            onClick={() =>
              setFavoriteOnly((current) => !current)
            }
          >
            <span>★</span>
            Favorites
          </button>
        </div>
      </section>

      {activeFilterCount > 0 && (
        <div className="gear-filter-summary">
          <span>
            {activeFilterCount}{' '}
            {activeFilterCount === 1
              ? 'filter'
              : 'filters'}{' '}
            applied
          </span>

          <button
            type="button"
            onClick={clearFilters}
          >
            Clear filters
          </button>
        </div>
      )}

      {loading ? (
        <div className="gear-empty-state">
          <div className="gear-empty-icon">✦</div>
          <h2>Loading your baby gear...</h2>
          <p>
            Pulling together everything you're
            researching.
          </p>
        </div>
      ) : visibleItems.length === 0 ? (
        <div className="gear-empty-state">
          <div className="gear-empty-icon">
            {items.length === 0 ? '✦' : '⌕'}
          </div>

          <h2>
            {items.length === 0
              ? 'Nothing here yet'
              : 'No products found'}
          </h2>

          <p>
            {items.length === 0
              ? 'Start saving products as you research what you might want for your baby.'
              : 'Try changing your search or filters.'}
          </p>

          {items.length === 0 ? (
            <button
              type="button"
              className="primary-button"
              onClick={openAddModal}
            >
              Add Your First Product
            </button>
          ) : (
            <button
              type="button"
              className="secondary-button"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <section className="gear-card-grid">
          {visibleItems.map((item) => (
            <GearCard
              key={item.id}
              item={item}
              budgetItem={
                item.budgetItemId
                  ? getBudgetItem(item.budgetItemId)
                  : null
              }
              onEdit={openEditModal}
              onDelete={handleDelete}
              onToggleFavorite={handleToggleFavorite}
              onAddToBudget={() =>
                handleAddToBudget(item)
              }
              onRemoveFromBudget={() =>
                handleRemoveFromBudget(item)
              }
              onViewBudget={() =>
                navigate('/budget')
              }
              onCompare={handleCompare}
              isComparing={compareIds.includes(
                item.id
              )}
              compareDisabled={
                compareIds.length >= 4 &&
                !compareIds.includes(item.id)
              }
            />
          ))}
        </section>
      )}

      <GearModal
        isOpen={showModal}
        editingItem={editingItem}
        onClose={() => {
          if (!saving) {
            setShowModal(false);
            setEditingItem(null);
          }
        }}
        onSave={handleSave}
        saving={saving}
      />

      {showCompare && (
        <ComparePanel
          items={compareItems}
          onRemove={handleCompare}
          onClose={() => setShowCompare(false)}
        />
      )}
    </div>
  );
}

export default BabyGear;