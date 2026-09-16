import { useState } from 'react';
import { useNames } from '../context/NameContext';

function ThemeRow({
  theme,
  nameCount,
  onUpdate,
  onDelete,
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(theme);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!value.trim()) {
      setError('Theme name cannot be empty.');
      return;
    }

    if (value.trim() === theme) {
      setEditing(false);
      setError('');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await onUpdate(theme, value);
      setEditing(false);
    } catch (updateError) {
      console.error('Error updating theme:', updateError);
      setError(
        updateError.message ||
          'We could not update this theme.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setValue(theme);
    setError('');
    setEditing(false);
  };

  const handleDelete = async () => {
    const message =
      nameCount > 0
        ? `Delete "${theme}"? ${nameCount} ${
            nameCount === 1 ? 'name is' : 'names are'
          } currently using this theme and will be moved to No Theme.`
        : `Delete "${theme}"?`;

    const confirmed = window.confirm(message);

    if (!confirmed) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      await onDelete(theme);
    } catch (deleteError) {
      console.error('Error deleting theme:', deleteError);
      setError(
        deleteError.message ||
          'We could not delete this theme.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="theme-row">
      {editing ? (
        <div className="theme-edit">
          <div className="theme-edit-input">
            <input
              type="text"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleSave();
                }

                if (event.key === 'Escape') {
                  handleCancel();
                }
              }}
              autoFocus
            />

            {error && (
              <span className="theme-row-error">
                {error}
              </span>
            )}
          </div>

          <div className="theme-row-actions">
            <button
              type="button"
              className="button button-secondary button-small"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="button"
              className="button button-primary button-small"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="theme-row-info">
            <div className="theme-icon">✦</div>

            <div>
              <strong>{theme}</strong>

              <span>
                {nameCount === 0
                  ? 'No names using this theme'
                  : `${nameCount} ${
                      nameCount === 1 ? 'name' : 'names'
                    }`}
              </span>
            </div>
          </div>

          <div className="theme-row-actions">
            <button
              type="button"
              className="button button-secondary button-small"
              onClick={() => setEditing(true)}
              disabled={saving}
            >
              Edit
            </button>

            <button
              type="button"
              className="button button-danger button-small"
              onClick={handleDelete}
              disabled={saving}
            >
              Delete
            </button>
          </div>

          {error && (
            <span className="theme-row-error">
              {error}
            </span>
          )}
        </>
      )}
    </div>
  );
}

export default function Settings() {
  const {
    names,
    themes,
    themesLoading,
    themesError,
    addTheme,
    updateTheme,
    deleteTheme,
  } = useNames();

  const [newTheme, setNewTheme] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  const getThemeNameCount = (theme) => {
    return names.filter((name) => name.theme === theme).length;
  };

  const handleAddTheme = async (event) => {
    event.preventDefault();

    if (!newTheme.trim()) {
      setAddError('Enter a theme name.');
      return;
    }

    setAdding(true);
    setAddError('');

    try {
      await addTheme(newTheme);
      setNewTheme('');
    } catch (error) {
      console.error('Error adding theme:', error);
      setAddError(
        error.message || 'We could not add this theme.'
      );
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="page settings-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">SETTINGS</p>

          <h1>Settings</h1>

          <p className="page-description">
            Customize your Before Baby workspace.
          </p>
        </div>
      </div>

      <section className="settings-section">
        <div className="settings-section-header">
          <div>
            <p className="eyebrow">BABY NAMES</p>
            <h2>Name themes</h2>

            <p>
              Create your own themes for organizing names. These
              will appear when adding or filtering baby names.
            </p>
          </div>
        </div>

        <div className="settings-card">
          <div className="settings-card-header">
            <div>
              <h3>Your themes</h3>

              <p>
                Use themes for anything that helps you organize
                your list.
              </p>
            </div>

            <span className="theme-count">
              {themes.length}{' '}
              {themes.length === 1 ? 'theme' : 'themes'}
            </span>
          </div>

          {themesError && (
            <div className="error-banner">
              {themesError}
            </div>
          )}

          {themesLoading ? (
            <div className="settings-loading">
              Loading themes...
            </div>
          ) : (
            <div className="theme-list">
              {themes.map((theme) => (
                <ThemeRow
                  key={theme}
                  theme={theme}
                  nameCount={getThemeNameCount(theme)}
                  onUpdate={updateTheme}
                  onDelete={deleteTheme}
                />
              ))}
            </div>
          )}

          <form
            className="add-theme-form"
            onSubmit={handleAddTheme}
          >
            <div className="add-theme-input">
              <label htmlFor="new-theme">
                Add a new theme
              </label>

              <input
                id="new-theme"
                type="text"
                value={newTheme}
                onChange={(event) =>
                  setNewTheme(event.target.value)
                }
                placeholder="e.g. Vermeer"
              />

              {addError && (
                <span className="theme-form-error">
                  {addError}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="button button-primary"
              disabled={adding || !newTheme.trim()}
            >
              {adding ? 'Adding...' : '+ Add Theme'}
            </button>
          </form>
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-card settings-info-card">
          <div className="settings-info-icon">✦</div>

          <div>
            <h3>About themes</h3>

            <p>
              Themes are completely customizable. If you delete a
              theme that is being used by names, those names will
              automatically be changed to <strong>No Theme</strong>.
            </p>

            <p>
              Names without a theme will still appear normally in
              your list and can be assigned a theme whenever you
              want.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}