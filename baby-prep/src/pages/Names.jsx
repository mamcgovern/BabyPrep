import { useMemo, useState } from 'react';
import {
  nameGenders,
  nameRatings,
  nameStatuses,
  useNames,
} from '../context/NameContext';

const emptyForm = {
  name: '',
  middleNames: '',
  gender: 'Gender Neutral',
  themes: [],
  status: 'New',
  maddieRating: 'No Opinion',
  nickRating: 'No Opinion',
  nicknames: '',
  meaning: '',
  notes: '',
  maddieNotes: '',
  nickNotes: '',
  favorite: false,
};

function arrayToText(value) {
  return Array.isArray(value) ? value.join(', ') : '';
}

function textToArray(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeThemes(name) {
  if (Array.isArray(name.themes)) {
    return name.themes;
  }

  if (typeof name.theme === 'string' && name.theme.trim()) {
    return [name.theme];
  }

  return [];
}

function getRatingClass(rating) {
  return rating?.toLowerCase().replace(/\s+/g, '-') || 'no-opinion';
}

function NameModal({ name, onClose }) {
  const { addName, updateName, themes } = useNames();

  const [form, setForm] = useState(() => {
    if (!name) {
      return emptyForm;
    }

    return {
      name: name.name || '',
      middleNames: arrayToText(name.middleNames),
      gender: name.gender || 'Gender Neutral',
      themes: normalizeThemes(name),
      status: name.status || 'New',
      maddieRating: name.maddieRating || 'No Opinion',
      nickRating: name.nickRating || 'No Opinion',
      nicknames: arrayToText(name.nicknames),
      meaning: name.meaning || '',
      notes: name.notes || '',
      maddieNotes: name.maddieNotes || '',
      nickNotes: name.nickNotes || '',
      favorite: Boolean(name.favorite),
    };
  });

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const handleChange = (event) => {
    const { name: fieldName, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [fieldName]: type === 'checkbox' ? checked : value,
    }));
  };

  const toggleTheme = (theme) => {
    setForm((current) => {
      const selected = current.themes.includes(theme);

      return {
        ...current,
        themes: selected
          ? current.themes.filter(
              (selectedTheme) => selectedTheme !== theme
            )
          : [...current.themes, theme],
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      const nameData = {
        name: form.name.trim(),
        middleNames: textToArray(form.middleNames),
        gender: form.gender,
        themes: form.themes,
        status: form.status,
        maddieRating: form.maddieRating,
        nickRating: form.nickRating,
        nicknames: textToArray(form.nicknames),
        meaning: form.meaning.trim(),
        notes: form.notes.trim(),
        maddieNotes: form.maddieNotes.trim(),
        nickNotes: form.nickNotes.trim(),
        favorite: form.favorite,
      };

      if (name) {
        await updateName(name.id, nameData);
      } else {
        await addName(nameData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving name:', error);
      setFormError('We could not save this name. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="name-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">
              {name ? 'EDIT NAME' : 'ADD NAME'}
            </p>
            <h2>{name ? 'Edit baby name' : 'Add a baby name'}</h2>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {formError && (
          <div className="form-error">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="form-field form-field-full">
              <span>First name</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Oliver"
                autoFocus
              />
            </label>

            <label className="form-field">
              <span>Gender</span>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
              >
                {nameGenders.map((gender) => (
                  <option key={gender} value={gender}>
                    {gender}
                  </option>
                ))}
              </select>
            </label>

            <div className="form-field form-field-full">
              <span>Themes</span>

              <div className="theme-picker">
                {themes.map((theme) => {
                  const selected = form.themes.includes(theme);

                  return (
                    <button
                      key={theme}
                      type="button"
                      className={`theme-option ${
                        selected ? 'selected' : ''
                      }`}
                      onClick={() => toggleTheme(theme)}
                    >
                      <span className="theme-option-check">
                        {selected ? '✓' : ''}
                      </span>

                      <span>{theme}</span>
                    </button>
                  );
                })}
              </div>

              {form.themes.length > 0 && (
                <div className="selected-theme-summary">
                  {form.themes.length}{' '}
                  {form.themes.length === 1
                    ? 'theme selected'
                    : 'themes selected'}
                </div>
              )}

              {themes.length === 0 && (
                <small>
                  Add themes from Settings before assigning them
                  to names.
                </small>
              )}
            </div>

            <label className="form-field">
              <span>Status</span>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                {nameStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Maddie's rating</span>
              <select
                name="maddieRating"
                value={form.maddieRating}
                onChange={handleChange}
              >
                {nameRatings.map((rating) => (
                  <option key={rating} value={rating}>
                    {rating}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Nick's rating</span>
              <select
                name="nickRating"
                value={form.nickRating}
                onChange={handleChange}
              >
                {nameRatings.map((rating) => (
                  <option key={rating} value={rating}>
                    {rating}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field form-field-full">
              <span>Middle name ideas</span>
              <input
                type="text"
                name="middleNames"
                value={form.middleNames}
                onChange={handleChange}
                placeholder="James, Nicholas, William"
              />
              <small>Separate multiple names with commas.</small>
            </label>

            <label className="form-field form-field-full">
              <span>Nicknames</span>
              <input
                type="text"
                name="nicknames"
                value={form.nicknames}
                onChange={handleChange}
                placeholder="Ollie, Olly"
              />
            </label>

            <label className="form-field form-field-full">
              <span>Meaning / origin</span>
              <input
                type="text"
                name="meaning"
                value={form.meaning}
                onChange={handleChange}
                placeholder="Olive tree, peace"
              />
            </label>

            <label className="form-field form-field-full">
              <span>Maddie's notes</span>
              <textarea
                name="maddieNotes"
                value={form.maddieNotes}
                onChange={handleChange}
                rows="3"
                placeholder="What do you like or dislike about it?"
              />
            </label>

            <label className="form-field form-field-full">
              <span>Nick's notes</span>
              <textarea
                name="nickNotes"
                value={form.nickNotes}
                onChange={handleChange}
                rows="3"
                placeholder="What do you like or dislike about it?"
              />
            </label>

            <label className="form-field form-field-full">
              <span>Our notes</span>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows="3"
                placeholder="Nicknames, initials, sibling names, concerns, etc."
              />
            </label>

            <label className="checkbox-field form-field-full">
              <input
                type="checkbox"
                name="favorite"
                checked={form.favorite}
                onChange={handleChange}
              />
              <span>Save as one of our favorites</span>
            </label>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="button button-secondary"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="button button-primary"
              disabled={saving || !form.name.trim()}
            >
              {saving
                ? 'Saving...'
                : name
                  ? 'Save Changes'
                  : 'Add Name'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function NameCard({ name, onEdit, onDelete }) {
  const [showDetails, setShowDetails] = useState(false);
  const nameThemes = normalizeThemes(name);

  const middleNames = Array.isArray(name.middleNames)
    ? name.middleNames
    : [];

  const nicknames = Array.isArray(name.nicknames)
    ? name.nicknames
    : [];

  return (
    <article
      className={`name-card ${name.favorite ? 'favorite' : ''}`}
    >
      <div className="name-card-top">
        <div>
          <div className="name-title-row">
            <h2>{name.name}</h2>

            {name.favorite && (
              <span className="favorite-star">★</span>
            )}
          </div>

          <div className="name-meta">
            <span>{name.gender}</span>

            <span
              className={`status-pill status-${getRatingClass(
                name.status
              )}`}
            >
              {name.status}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="name-menu-button"
          onClick={() => setShowDetails((current) => !current)}
          aria-label="Show name options"
        >
          ···
        </button>
      </div>

      {nameThemes.length > 0 && (
        <div className="theme-tags">
          {nameThemes.map((theme) => (
            <span key={theme} className="theme-tag">
              <span className="theme-tag-icon">✦</span>
              {theme}
            </span>
          ))}
        </div>
      )}

      {middleNames.length > 0 && (
        <div className="middle-name-section">
          <span className="detail-label">Middle name ideas</span>

          <div className="middle-name-list">
            {middleNames.map((middleName) => (
              <span key={middleName} className="middle-name-pill">
                {name.name} {middleName}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="ratings-row">
        <div className="rating">
          <span className="rating-person">Maddie</span>

          <span
            className={`rating-value rating-${getRatingClass(
              name.maddieRating
            )}`}
          >
            {name.maddieRating || 'No Opinion'}
          </span>
        </div>

        <div className="rating">
          <span className="rating-person">Nick</span>

          <span
            className={`rating-value rating-${getRatingClass(
              name.nickRating
            )}`}
          >
            {name.nickRating || 'No Opinion'}
          </span>
        </div>
      </div>

      {(name.meaning || nicknames.length > 0) && (
        <div className="name-details">
          {name.meaning && (
            <div>
              <span className="detail-label">Meaning</span>
              <p>{name.meaning}</p>
            </div>
          )}

          {nicknames.length > 0 && (
            <div>
              <span className="detail-label">Nicknames</span>
              <p>{nicknames.join(', ')}</p>
            </div>
          )}
        </div>
      )}

      {showDetails && (
        <div className="name-card-actions">
          <button
            type="button"
            className="button button-secondary"
            onClick={() => onEdit(name)}
          >
            Edit
          </button>

          <button
            type="button"
            className="button button-danger"
            onClick={() => onDelete(name)}
          >
            Delete
          </button>
        </div>
      )}
    </article>
  );
}

export default function Names() {
  const {
    names,
    themes,
    stats,
    loading,
    error,
    deleteName,
  } = useNames();

  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('All');
  const [themeFilter, setThemeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showFavoritesOnly, setShowFavoritesOnly] =
    useState(false);
  const [editingName, setEditingName] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const filteredNames = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return names.filter((name) => {
      const nameThemes = normalizeThemes(name);

      const matchesSearch =
        !searchTerm ||
        name.name?.toLowerCase().includes(searchTerm) ||
        name.middleNames?.some((middleName) =>
          middleName.toLowerCase().includes(searchTerm)
        ) ||
        nameThemes.some((theme) =>
          theme.toLowerCase().includes(searchTerm)
        );

      const matchesGender =
        genderFilter === 'All' || name.gender === genderFilter;

      const matchesTheme =
        themeFilter === 'All' ||
        nameThemes.includes(themeFilter);

      const matchesStatus =
        statusFilter === 'All' || name.status === statusFilter;

      const matchesFavorite =
        !showFavoritesOnly || name.favorite;

      return (
        matchesSearch &&
        matchesGender &&
        matchesTheme &&
        matchesStatus &&
        matchesFavorite
      );
    });
  }, [
    names,
    search,
    genderFilter,
    themeFilter,
    statusFilter,
    showFavoritesOnly,
  ]);

  const handleDelete = async (name) => {
    const confirmed = window.confirm(
      `Delete ${name.name}? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    await deleteName(name.id);
  };

  const openAddModal = () => {
    setEditingName(null);
    setShowModal(true);
  };

  const openEditModal = (name) => {
    setEditingName(name);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingName(null);
  };

  return (
    <div className="page names-page">
      <div className="page-header names-header">
        <div>
          <p className="eyebrow">BABY NAMES</p>

          <h1>Names we love</h1>

          <p className="page-description">
            Keep track of the names we're considering and what
            each of us thinks.
          </p>
        </div>

        <button
          type="button"
          className="button button-primary"
          onClick={openAddModal}
        >
          + Add Name
        </button>
      </div>

      <div className="name-stats">
        <div className="name-stat-card">
          <span className="name-stat-number">
            {stats.active}
          </span>
          <span className="name-stat-label">Considering</span>
        </div>

        <div className="name-stat-card">
          <span className="name-stat-number">
            {stats.favorites}
          </span>
          <span className="name-stat-label">Favorites</span>
        </div>

        <div className="name-stat-card">
          <span className="name-stat-number">
            {stats.bothLike}
          </span>
          <span className="name-stat-label">We both love</span>
        </div>

        <div className="name-stat-card">
          <span className="name-stat-number">
            {stats.girls}
          </span>
          <span className="name-stat-label">Girl names</span>
        </div>

        <div className="name-stat-card">
          <span className="name-stat-number">
            {stats.boys}
          </span>
          <span className="name-stat-label">Boy names</span>
        </div>
      </div>

      <div className="names-toolbar">
        <div className="name-search">
          <span>⌕</span>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search names..."
          />
        </div>

        <div className="name-filters">
          <select
            value={genderFilter}
            onChange={(event) =>
              setGenderFilter(event.target.value)
            }
          >
            <option value="All">All genders</option>

            {nameGenders.map((gender) => (
              <option key={gender} value={gender}>
                {gender}
              </option>
            ))}
          </select>

          <select
            value={themeFilter}
            onChange={(event) =>
              setThemeFilter(event.target.value)
            }
          >
            <option value="All">All themes</option>

            {themes.map((theme) => (
              <option key={theme} value={theme}>
                {theme}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="All">All statuses</option>

            {nameStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <button
            type="button"
            className={`filter-button ${
              showFavoritesOnly ? 'active' : ''
            }`}
            onClick={() =>
              setShowFavoritesOnly((current) => !current)
            }
          >
            ★ Favorites
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="empty-state">
          <div className="empty-state-icon">✦</div>
          <h2>Loading names...</h2>
        </div>
      ) : filteredNames.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">♡</div>

          <h2>
            {names.length === 0
              ? 'No names yet'
              : 'No names match your filters'}
          </h2>

          <p>
            {names.length === 0
              ? 'Start your list with a name you both love, a name you are unsure about, or anything you want to remember.'
              : 'Try changing your search or filters.'}
          </p>

          {names.length === 0 && (
            <button
              type="button"
              className="button button-primary"
              onClick={openAddModal}
            >
              + Add Your First Name
            </button>
          )}
        </div>
      ) : (
        <div className="names-grid">
          {filteredNames.map((name) => (
            <NameCard
              key={name.id}
              name={name}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showModal && (
        <NameModal
          name={editingName}
          onClose={closeModal}
        />
      )}
    </div>
  );
}