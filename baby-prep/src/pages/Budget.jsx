import { useEffect, useMemo, useState } from 'react';
import {
  budgetCategories,
  budgetPayers,
  budgetStatuses,
  useBudget,
} from '../context/BudgetContext';

const emptyForm = {
  name: '',
  category: 'Baby Gear',
  plannedAmount: '',
  actualAmount: '',
  status: 'Planning',
  payer: 'Shared',
  notes: '',
};

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount || 0);
}

function BudgetModal({
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
        category: editingItem.category || 'Baby Gear',
        plannedAmount:
          editingItem.plannedAmount !== undefined
            ? String(editingItem.plannedAmount)
            : '',
        actualAmount:
          editingItem.actualAmount !== undefined
            ? String(editingItem.actualAmount)
            : '',
        status: editingItem.status || 'Planning',
        payer: editingItem.payer || 'Shared',
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

    if (!form.name.trim()) {
      return;
    }

    await onSave({
      ...form,
      name: form.name.trim(),
    });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="budget-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <div
        className="budget-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="budget-modal-title"
      >
        <div className="budget-modal-header">
          <div>
            <p className="budget-modal-eyebrow">
              {editingItem ? 'UPDATE EXPENSE' : 'ADD EXPENSE'}
            </p>
            <h2 id="budget-modal-title">
              {editingItem ? 'Edit Budget Item' : 'Add Budget Item'}
            </h2>
          </div>

          <button
            type="button"
            className="budget-modal-close"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="budget-form-grid">
            <label className="budget-form-field budget-form-field-full">
              <span>What are we budgeting for?</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Convertible car seat"
                autoFocus
                required
              />
            </label>

            <label className="budget-form-field">
              <span>Category</span>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                {budgetCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="budget-form-field">
              <span>Status</span>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                {budgetStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label className="budget-form-field">
              <span>Planned cost</span>
              <div className="budget-input-with-symbol">
                <span>$</span>
                <input
                  type="number"
                  name="plannedAmount"
                  value={form.plannedAmount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
            </label>

            <label className="budget-form-field">
              <span>Actual cost</span>
              <div className="budget-input-with-symbol">
                <span>$</span>
                <input
                  type="number"
                  name="actualAmount"
                  value={form.actualAmount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
            </label>

            <label className="budget-form-field">
              <span>Paid by</span>
              <select
                name="payer"
                value={form.payer}
                onChange={handleChange}
              >
                {budgetPayers.map((payer) => (
                  <option key={payer} value={payer}>
                    {payer}
                  </option>
                ))}
              </select>
            </label>

            <label className="budget-form-field budget-form-field-full">
              <span>Notes</span>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Add a link, price details, or anything else you want to remember."
              />
            </label>
          </div>

          <div className="budget-modal-actions">
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
                  : 'Add to Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Budget() {
  const {
    items,
    stats,
    loading,
    error,
    addBudgetItem,
    updateBudgetItem,
    deleteBudgetItem,
  } = useBudget();

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

  const spendingPercentage =
    stats.planned > 0
      ? Math.min((stats.spent / stats.planned) * 100, 100)
      : 0;

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
        await updateBudgetItem(editingItem.id, formData);
      } else {
        await addBudgetItem(formData);
      }

      setModalOpen(false);
      setEditingItem(null);
    } catch (saveError) {
      console.error('Error saving budget item:', saveError);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}" from your budget?`)) {
      return;
    }

    try {
      await deleteBudgetItem(item.id);
    } catch (deleteError) {
      console.error('Error deleting budget item:', deleteError);
    }
  };

  return (
    <div className="page budget-page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">PLAN THE COST</p>
          <h1>Budget</h1>
          <p className="page-description">
            Keep track of what we expect to spend getting ready for baby.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={openAddModal}
        >
          + Add Expense
        </button>
      </div>

      <div className="budget-summary">
        <div className="budget-summary-card">
          <span className="budget-summary-label">Planned</span>
          <strong>{formatCurrency(stats.planned)}</strong>
          <small>What we expect to spend</small>
        </div>

        <div className="budget-summary-card">
          <span className="budget-summary-label">Spent</span>
          <strong>{formatCurrency(stats.spent)}</strong>
          <small>What we've actually spent</small>
        </div>

        <div className="budget-summary-card">
          <span className="budget-summary-label">
            {stats.remaining >= 0 ? 'Remaining' : 'Over Budget'}
          </span>
          <strong className={stats.remaining < 0 ? 'over-budget' : ''}>
            {formatCurrency(Math.abs(stats.remaining))}
          </strong>
          <small>
            {stats.remaining >= 0
              ? 'Based on planned costs'
              : 'More spent than planned'}
          </small>
        </div>

        <div className="budget-summary-card">
          <span className="budget-summary-label">Items</span>
          <strong>{stats.items}</strong>
          <small>{stats.purchased} purchased or paid</small>
        </div>
      </div>

      <div className="budget-progress-card">
        <div className="budget-progress-header">
          <div>
            <span>Spending progress</span>
            <small>
              {formatCurrency(stats.spent)} of {formatCurrency(stats.planned)}
            </small>
          </div>
          <strong>{Math.round(spendingPercentage)}%</strong>
        </div>

        <div className="budget-progress-track">
          <div
            className="budget-progress-fill"
            style={{ width: `${spendingPercentage}%` }}
          />
        </div>
      </div>

      <div className="budget-filter-section">
        <div className="budget-filter-group">
          <span className="budget-filter-label">Category</span>

          <div className="board-pills">
            {['All', ...budgetCategories].map((category) => (
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

        <div className="budget-filter-group">
          <span className="budget-filter-label">Status</span>

          <div className="board-pills">
            {['All', ...budgetStatuses].map((status) => (
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

      {loading && (
        <div className="empty-state">
          <p>Loading budget...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {!loading && !error && filteredItems.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">$</div>
          <h2>Nothing here yet</h2>
          <p>
            Start adding the things you're expecting to spend money on.
          </p>

          <button
            className="primary-button"
            onClick={openAddModal}
          >
            + Add Your First Expense
          </button>
        </div>
      )}

      {!loading && !error && filteredItems.length > 0 && (
        <div className="budget-list">
          {filteredItems.map((item) => {
            const planned = Number(item.plannedAmount) || 0;
            const actual = Number(item.actualAmount) || 0;
            const difference = planned - actual;

            return (
              <article className="budget-item" key={item.id}>
                <div className="budget-item-main">
                  <div className="budget-item-heading">
                    <div>
                      <span className="budget-category">
                        {item.category}
                      </span>
                      <h2>{item.name}</h2>
                    </div>

                    <span
                      className={`budget-status budget-status-${item.status
                        ?.toLowerCase()
                        .replace(/\s+/g, '-')}`}
                    >
                      {item.status}
                    </span>
                  </div>

                  {item.notes && (
                    <p className="budget-item-notes">
                      {item.notes}
                    </p>
                  )}

                  <div className="budget-item-meta">
                    <span>Paid by {item.payer || 'Shared'}</span>
                  </div>
                </div>

                <div className="budget-item-numbers">
                  <div>
                    <span>Planned</span>
                    <strong>{formatCurrency(planned)}</strong>
                  </div>

                  <div>
                    <span>Actual</span>
                    <strong>{formatCurrency(actual)}</strong>
                  </div>

                  <div>
                    <span>{difference >= 0 ? 'Under' : 'Over'}</span>
                    <strong className={difference < 0 ? 'over-budget' : ''}>
                      {formatCurrency(Math.abs(difference))}
                    </strong>
                  </div>
                </div>

                <div className="budget-item-actions">
                  <button
                    type="button"
                    className="budget-action-button"
                    onClick={() => openEditModal(item)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="budget-action-button"
                    onClick={() => handleDelete(item)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <BudgetModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        editingItem={editingItem}
        saving={saving}
      />
    </div>
  );
}

export default Budget;