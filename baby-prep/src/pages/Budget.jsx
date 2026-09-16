import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  budgetCategories,
  budgetStatuses,
  useBudget,
} from '../context/BudgetContext';

const emptyForm = {
  name: '',
  category: 'Other',
  plannedAmount: '',
  actualAmount: '',
  status: 'Planned',
  notes: '',
};

const defaultStats = {
  total: 0,
  planned: 0,
  spent: 0,
  remaining: 0,
  purchased: 0,
  skipped: 0,
};

function formatCurrency(amount) {
  return `$${Number(amount || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
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
        category: editingItem.category || 'Other',
        plannedAmount: editingItem.plannedAmount ?? '',
        actualAmount: editingItem.actualAmount ?? '',
        status: editingItem.status || 'Planned',
        notes: editingItem.notes || '',
      });
    } else {
      setForm({
        ...emptyForm,
      });
    }
  }, [isOpen, editingItem]);

  if (!isOpen) {
    return null;
  }

  const isBabyGearItem =
    editingItem?.sourceType === 'babyGear';

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
      plannedAmount:
        form.plannedAmount === ''
          ? 0
          : Number(form.plannedAmount),
      actualAmount:
        form.actualAmount === ''
          ? null
          : Number(form.actualAmount),
    });
  };

  return (
    <div
      className="budget-modal-overlay"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !saving
        ) {
          onClose();
        }
      }}
    >
      <div className="budget-modal">
        <div className="budget-modal-header">
          <div>
            <p className="budget-modal-eyebrow">
              {editingItem
                ? 'UPDATE EXPENSE'
                : 'ADD EXPENSE'}
            </p>

            <h2>
              {editingItem
                ? 'Edit Budget Item'
                : 'Add Budget Item'}
            </h2>
          </div>

          <button
            type="button"
            className="budget-modal-close"
            onClick={onClose}
            disabled={saving}
          >
            ×
          </button>
        </div>

        {isBabyGearItem && (
          <div className="budget-linked-notice">
            <strong>
              This item is connected to Baby Gear.
            </strong>

            <p>
              The planned amount comes from the product
              price in Baby Gear. To change that amount,
              edit the product there.
            </p>

            <Link
              to="/baby-gear"
              onClick={onClose}
            >
              View Baby Gear →
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="budget-form-grid">
            <label className="budget-form-field budget-form-field-full">
              <span>What are we budgeting for?</span>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Baby monitor"
                required
                disabled={isBabyGearItem}
              />
            </label>

            <label className="budget-form-field">
              <span>Category</span>

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                disabled={isBabyGearItem}
              >
                {budgetCategories.map((category) => (
                  <option
                    key={category}
                    value={category}
                  >
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
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label className="budget-form-field">
              <span>Planned amount</span>

              <div className="budget-price-input">
                <span>$</span>

                <input
                  type="number"
                  name="plannedAmount"
                  min="0"
                  step="0.01"
                  value={form.plannedAmount}
                  onChange={handleChange}
                  placeholder="0.00"
                  disabled={isBabyGearItem}
                />
              </div>
            </label>

            <label className="budget-form-field">
              <span>Actual amount</span>

              <div className="budget-price-input">
                <span>$</span>

                <input
                  type="number"
                  name="actualAmount"
                  min="0"
                  step="0.01"
                  value={form.actualAmount ?? ''}
                  onChange={handleChange}
                  placeholder="Not purchased yet"
                />
              </div>
            </label>

            <label className="budget-form-field budget-form-field-full">
              <span>Notes</span>

              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Anything we want to remember?"
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
              disabled={
                saving || !form.name.trim()
              }
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Budget() {
  const {
    items = [],
    stats: contextStats,
    loading,
    error,
    addBudgetItem,
    updateBudgetItem,
    deleteBudgetItem,
  } = useBudget();

  const stats = contextStats || defaultStats;

  const [activeCategory, setActiveCategory] =
    useState('All');

  const [activeStatus, setActiveStatus] =
    useState('All');

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editingItem, setEditingItem] =
    useState(null);

  const [saving, setSaving] =
    useState(false);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory =
        activeCategory === 'All' ||
        item.category === activeCategory;

      const matchesStatus =
        activeStatus === 'All' ||
        item.status === activeStatus;

      return (
        matchesCategory &&
        matchesStatus
      );
    });
  }, [
    items,
    activeCategory,
    activeStatus,
  ]);

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
        await updateBudgetItem(
          editingItem.id,
          formData
        );
      } else {
        await addBudgetItem(formData);
      }

      setModalOpen(false);
      setEditingItem(null);
    } catch (saveError) {
      console.error(
        'Error saving budget item:',
        saveError
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (
      !window.confirm(
        `Remove "${item.name}" from your Budget?`
      )
    ) {
      return;
    }

    try {
      await deleteBudgetItem(item.id);
    } catch (deleteError) {
      console.error(
        'Error deleting budget item:',
        deleteError
      );
    }
  };

  const handleMarkPurchased = async (item) => {
    const actualAmount = window.prompt(
      `What did you actually pay for "${item.name}"?`,
      item.actualAmount ??
        item.plannedAmount ??
        ''
    );

    if (actualAmount === null) {
      return;
    }

    const amount = Number(actualAmount);

    if (
      Number.isNaN(amount) ||
      amount < 0
    ) {
      return;
    }

    try {
      await updateBudgetItem(item.id, {
        status: 'Purchased',
        actualAmount: amount,
      });
    } catch (updateError) {
      console.error(
        'Error marking budget item purchased:',
        updateError
      );
    }
  };

  return (
    <div className="page budget-page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            PLAN & TRACK
          </p>

          <h1>Budget</h1>

          <p className="page-description">
            Keep track of what we expect to spend and
            what we actually spend.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={openAddModal}
        >
          + Add Expense
        </button>
      </div>

      <div className="budget-summary-grid">
        <div className="budget-summary-card budget-summary-planned">
          <span>Planned</span>

          <strong>
            {formatCurrency(stats.planned)}
          </strong>

          <small>
            {stats.total} budget items
          </small>
        </div>

        <div className="budget-summary-card budget-summary-actual">
          <span>Spent</span>

          <strong>
            {formatCurrency(stats.spent)}
          </strong>

          <small>
            {stats.purchased} purchased
          </small>
        </div>

        <div className="budget-summary-card budget-summary-remaining">
          <span>Still planned</span>

          <strong>
            {formatCurrency(stats.remaining)}
          </strong>

          <small>
            {Math.max(
              0,
              stats.total -
                stats.purchased -
                stats.skipped
            )}{' '}
            not purchased
          </small>
        </div>

        <div className="budget-summary-card budget-summary-gear">
          <span>Baby Gear</span>

          <strong>
            {
              items.filter(
                (item) =>
                  item.sourceType === 'babyGear'
              ).length
            }
          </strong>

          <small>
            connected items
          </small>
        </div>
      </div>

      <div className="budget-gear-callout">
        <div>
          <span className="budget-gear-callout-icon">
            □
          </span>

          <div>
            <strong>
              Researching something?
            </strong>

            <p>
              Add it in Baby Gear first, then
              connect it to your Budget when
              you're ready.
            </p>
          </div>
        </div>

        <Link
          to="/baby-gear"
          className="secondary-button"
        >
          View Baby Gear
        </Link>
      </div>

      <div className="budget-filter-section">
        <div className="budget-filter-group">
          <span className="budget-filter-label">
            Category
          </span>

          <div className="board-pills">
            {[
              'All',
              ...budgetCategories,
            ].map((category) => (
              <button
                key={category}
                type="button"
                className={`filter-pill ${
                  activeCategory === category
                    ? 'active'
                    : ''
                }`}
                onClick={() =>
                  setActiveCategory(category)
                }
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="budget-filter-group">
          <span className="budget-filter-label">
            Status
          </span>

          <div className="board-pills">
            {[
              'All',
              ...budgetStatuses,
            ].map((status) => (
              <button
                key={status}
                type="button"
                className={`filter-pill ${
                  activeStatus === status
                    ? 'active'
                    : ''
                }`}
                onClick={() =>
                  setActiveStatus(status)
                }
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

      {!loading &&
        !error &&
        filteredItems.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">
              $
            </div>

            <h2>No budget items yet</h2>

            <p>
              Add expenses directly here or connect
              something you've decided on in Baby Gear.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={openAddModal}
            >
              + Add Your First Expense
            </button>
          </div>
        )}

      {!loading &&
        !error &&
        filteredItems.length > 0 && (
          <div className="budget-list">
            {filteredItems.map((item) => {
              const planned =
                Number(item.plannedAmount) || 0;

              const actual =
                item.actualAmount == null
                  ? null
                  : Number(item.actualAmount);

              const difference =
                actual == null
                  ? null
                  : actual - planned;

              return (
                <article
                  className="budget-card"
                  key={item.id}
                >
                  <div className="budget-card-main">
                    <div className="budget-card-heading">
                      <div>
                        <div className="budget-card-meta">
                          <span className="budget-category">
                            {item.category}
                          </span>

                          {item.sourceType ===
                            'babyGear' && (
                            <span className="budget-source">
                              Baby Gear
                            </span>
                          )}
                        </div>

                        <h2>{item.name}</h2>
                      </div>

                      <span
                        className={`budget-status budget-status-${item.status
                          ?.toLowerCase()
                          .replace(
                            /\s+/g,
                            '-'
                          )}`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="budget-amounts">
                      <div>
                        <span>Planned</span>

                        <strong>
                          {formatCurrency(
                            planned
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>Actual</span>

                        <strong>
                          {actual == null
                            ? 'Not purchased'
                            : formatCurrency(
                                actual
                              )}
                        </strong>
                      </div>

                      {difference != null && (
                        <div>
                          <span>
                            Difference
                          </span>

                          <strong
                            className={
                              difference > 0
                                ? 'budget-over'
                                : difference < 0
                                  ? 'budget-under'
                                  : ''
                            }
                          >
                            {difference > 0
                              ? '+'
                              : ''}
                            {formatCurrency(
                              difference
                            )}
                          </strong>
                        </div>
                      )}
                    </div>

                    {item.notes && (
                      <p className="budget-notes">
                        {item.notes}
                      </p>
                    )}

                    {item.sourceType ===
                      'babyGear' && (
                      <div className="budget-connected">
                        <span>
                          Connected to Baby Gear
                        </span>

                        <Link to="/baby-gear">
                          View gear ↗
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="budget-card-actions">
                    {item.status !==
                      'Purchased' && (
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() =>
                          handleMarkPurchased(
                            item
                          )
                        }
                      >
                        Mark Purchased
                      </button>
                    )}

                    <button
                      type="button"
                      className="budget-action-button"
                      onClick={() =>
                        openEditModal(item)
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="budget-action-button"
                      onClick={() =>
                        handleDelete(item)
                      }
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