import {
  Check,
  CircleUserRound,
  LoaderCircle,
  Pencil,
  Plus,
  Settings as SettingsIcon,
  Tag,
  Trash2,
  Baby,
  X,
} from 'lucide-react';
import {
  useEffect,
  useState,
} from 'react';
import { useAuth } from '../context/AuthContext';
import { useNames } from '../context/NameContext';

function Settings() {
  const {
    themes,
    names,
    babyNamePlaceholder,
    addTheme,
    updateTheme,
    deleteTheme,
    updateBabyNamePlaceholder,
  } = useNames();

  const { user, logout } = useAuth();

  const [newTheme, setNewTheme] = useState('');
  const [editingTheme, setEditingTheme] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [savingTheme, setSavingTheme] = useState(false);
  const [themeError, setThemeError] = useState('');

  const [showAddTheme, setShowAddTheme] = useState(false);

  const [
    babyPlaceholderValue,
    setBabyPlaceholderValue,
  ] = useState(babyNamePlaceholder);

  const [
    editingBabyPlaceholder,
    setEditingBabyPlaceholder,
  ] = useState(false);

  const [
    savingBabyPlaceholder,
    setSavingBabyPlaceholder,
  ] = useState(false);

  const [
    babyPlaceholderError,
    setBabyPlaceholderError,
  ] = useState('');

  useEffect(() => {
    setBabyPlaceholderValue(babyNamePlaceholder);
  }, [babyNamePlaceholder]);

  const getThemeCount = (theme) => {
    return names.filter((name) =>
      Array.isArray(name.themes)
        ? name.themes.includes(theme)
        : name.theme === theme
    ).length;
  };

  const handleBabyPlaceholderSave = async (
    event
  ) => {
    event.preventDefault();

    if (!babyPlaceholderValue.trim()) {
      return;
    }

    setSavingBabyPlaceholder(true);
    setBabyPlaceholderError('');

    try {
      await updateBabyNamePlaceholder(
        babyPlaceholderValue
      );

      setEditingBabyPlaceholder(false);
    } catch (error) {
      console.error(
        'Error updating baby name placeholder:',
        error
      );

      setBabyPlaceholderError(
        error.message ||
          'We could not update the baby name placeholder.'
      );
    } finally {
      setSavingBabyPlaceholder(false);
    }
  };

  const handleBabyPlaceholderCancel = () => {
    setBabyPlaceholderValue(
      babyNamePlaceholder
    );
    setBabyPlaceholderError('');
    setEditingBabyPlaceholder(false);
  };

  const handleAddTheme = async (event) => {
    event.preventDefault();

    if (!newTheme.trim()) {
      return;
    }

    setSavingTheme(true);
    setThemeError('');

    try {
      await addTheme(newTheme);
      setNewTheme('');
      setShowAddTheme(false);
    } catch (error) {
      console.error('Error adding theme:', error);

      setThemeError(
        error.message ||
          'We could not add that theme.'
      );
    } finally {
      setSavingTheme(false);
    }
  };

  const startEditingTheme = (theme) => {
    setThemeError('');
    setEditingTheme(theme);
    setEditingValue(theme);
  };

  const cancelEditingTheme = () => {
    setEditingTheme(null);
    setEditingValue('');
  };

  const handleUpdateTheme = async (event) => {
    event.preventDefault();

    if (!editingValue.trim()) {
      return;
    }

    setSavingTheme(true);
    setThemeError('');

    try {
      await updateTheme(
        editingTheme,
        editingValue
      );

      cancelEditingTheme();
    } catch (error) {
      console.error(
        'Error updating theme:',
        error
      );

      setThemeError(
        error.message ||
          'We could not update that theme.'
      );
    } finally {
      setSavingTheme(false);
    }
  };

  const handleDeleteTheme = async (theme) => {
    const count = getThemeCount(theme);

    const message =
      count > 0
        ? `"${theme}" is currently assigned to ${count} ${
            count === 1 ? 'name' : 'names'
          }. Deleting it will remove the theme from those names. Continue?`
        : `Delete the "${theme}" theme?`;

    if (!window.confirm(message)) {
      return;
    }

    setSavingTheme(true);
    setThemeError('');

    try {
      await deleteTheme(theme);
    } catch (error) {
      console.error(
        'Error deleting theme:',
        error
      );

      setThemeError(
        error.message ||
          'We could not delete that theme.'
      );
    } finally {
      setSavingTheme(false);
    }
  };

  useEffect(() => {
    if (!showAddTheme) {
      setNewTheme('');
    }
  }, [showAddTheme]);

  return (
    <main className="settings-page">
      <header className="settings-header">
        <div>
          <p className="page-eyebrow">Customize</p>

          <h1>Settings</h1>

          <p className="settings-header-description">
            Manage the details and preferences that make
            Before Baby work for you.
          </p>
        </div>
      </header>

      <div className="settings-layout">
        <section className="settings-section settings-baby-profile">
          <div className="settings-section-header">
            <div className="settings-section-icon settings-section-icon--pink">
              <Baby size={20} />
            </div>

            <div>
              <h2>Baby Profile</h2>

              <p>
                Customize how your little one is
                referred to throughout Before Baby.
              </p>
            </div>
          </div>

          <div className="settings-baby-placeholder-card">
            <div className="settings-baby-placeholder-copy">
              <span className="settings-field-label">
                Baby's placeholder name
              </span>

              <p>
                This is just a placeholder until you
                have a name picked out.
              </p>
            </div>

            {editingBabyPlaceholder ? (
              <form
                className="settings-baby-placeholder-form"
                onSubmit={
                  handleBabyPlaceholderSave
                }
              >
                <input
                  type="text"
                  value={babyPlaceholderValue}
                  onChange={(event) =>
                    setBabyPlaceholderValue(
                      event.target.value
                    )
                  }
                  placeholder="Baby Bergan"
                  autoFocus
                  disabled={
                    savingBabyPlaceholder
                  }
                />

                <div className="settings-theme-actions">
                  <button
                    type="submit"
                    className="icon-button settings-icon-success"
                    disabled={
                      savingBabyPlaceholder ||
                      !babyPlaceholderValue.trim()
                    }
                    aria-label="Save baby placeholder"
                  >
                    {savingBabyPlaceholder ? (
                      <LoaderCircle
                        size={16}
                        className="spinner"
                      />
                    ) : (
                      <Check size={16} />
                    )}
                  </button>

                  <button
                    type="button"
                    className="icon-button"
                    onClick={
                      handleBabyPlaceholderCancel
                    }
                    disabled={
                      savingBabyPlaceholder
                    }
                    aria-label="Cancel editing"
                  >
                    <X size={16} />
                  </button>
                </div>
              </form>
            ) : (
              <div className="settings-baby-placeholder-display">
                <strong>
                  {babyNamePlaceholder}
                </strong>

                <button
                  type="button"
                  className="icon-button"
                  onClick={() => {
                    setBabyPlaceholderError('');
                    setEditingBabyPlaceholder(
                      true
                    );
                  }}
                  aria-label="Edit baby placeholder"
                >
                  <Pencil size={15} />
                </button>
              </div>
            )}
          </div>

          {babyPlaceholderError && (
            <div className="settings-error">
              <span>
                {babyPlaceholderError}
              </span>

              <button
                type="button"
                onClick={() =>
                  setBabyPlaceholderError('')
                }
                aria-label="Dismiss error"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </section>

        <section className="settings-section">
          <div className="settings-section-header">
            <div className="settings-section-icon settings-section-icon--pink">
              <Tag size={20} />
            </div>

            <div>
              <h2>Baby Name Themes</h2>

              <p>
                Customize the themes you use to organize
                your name ideas.
              </p>
            </div>

            <button
              type="button"
              className="button button-primary settings-add-button"
              onClick={() => {
                setThemeError('');
                setShowAddTheme(true);
              }}
            >
              <Plus size={16} />
              Add Theme
            </button>
          </div>

          {themeError && (
            <div className="settings-error">
              <span>{themeError}</span>

              <button
                type="button"
                onClick={() => setThemeError('')}
                aria-label="Dismiss error"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="settings-theme-list">
            {themes.map((theme) => {
              const count = getThemeCount(theme);
              const isEditing =
                editingTheme === theme;

              return (
                <div
                  key={theme}
                  className="settings-theme-row"
                >
                  {isEditing ? (
                    <form
                      className="settings-theme-edit"
                      onSubmit={
                        handleUpdateTheme
                      }
                    >
                      <input
                        type="text"
                        value={editingValue}
                        onChange={(event) =>
                          setEditingValue(
                            event.target.value
                          )
                        }
                        autoFocus
                      />

                      <div className="settings-theme-actions">
                        <button
                          type="submit"
                          className="icon-button settings-icon-success"
                          disabled={
                            savingTheme ||
                            !editingValue.trim()
                          }
                          aria-label="Save theme"
                        >
                          {savingTheme ? (
                            <LoaderCircle
                              size={16}
                              className="spinner"
                            />
                          ) : (
                            <Check size={16} />
                          )}
                        </button>

                        <button
                          type="button"
                          className="icon-button"
                          onClick={
                            cancelEditingTheme
                          }
                          disabled={savingTheme}
                          aria-label="Cancel editing"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="settings-theme-info">
                        <div className="settings-theme-dot" />

                        <div>
                          <strong>
                            {theme}
                          </strong>

                          <span>
                            {count}{' '}
                            {count === 1
                              ? 'name'
                              : 'names'}
                          </span>
                        </div>
                      </div>

                      <div className="settings-theme-actions">
                        <button
                          type="button"
                          className="icon-button"
                          onClick={() =>
                            startEditingTheme(
                              theme
                            )
                          }
                          aria-label={`Edit ${theme}`}
                          disabled={savingTheme}
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          type="button"
                          className="icon-button icon-button-danger"
                          onClick={() =>
                            handleDeleteTheme(
                              theme
                            )
                          }
                          aria-label={`Delete ${theme}`}
                          disabled={savingTheme}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {themes.length === 0 && (
            <div className="settings-empty">
              <Tag size={22} />

              <p>
                You haven't created any name themes
                yet.
              </p>
            </div>
          )}

          {showAddTheme && (
            <div className="settings-add-theme">
              <form onSubmit={handleAddTheme}>
                <div className="settings-add-theme-content">
                  <div>
                    <strong>Add a theme</strong>

                    <span>
                      Give this group of names a
                      name.
                    </span>
                  </div>

                  <input
                    type="text"
                    value={newTheme}
                    onChange={(event) =>
                      setNewTheme(
                        event.target.value
                      )
                    }
                    placeholder="Theme name"
                    autoFocus
                  />
                </div>

                <div className="settings-add-theme-actions">
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() =>
                      setShowAddTheme(false)
                    }
                    disabled={savingTheme}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="button button-primary"
                    disabled={
                      savingTheme ||
                      !newTheme.trim()
                    }
                  >
                    {savingTheme ? (
                      <LoaderCircle
                        size={16}
                        className="spinner"
                      />
                    ) : (
                      <Plus size={16} />
                    )}

                    Add Theme
                  </button>
                </div>
              </form>
            </div>
          )}
        </section>

        <section className="settings-section">
          <div className="settings-section-header">
            <div className="settings-section-icon settings-section-icon--blue">
              <CircleUserRound size={20} />
            </div>

            <div>
              <h2>Account</h2>

              <p>
                The Google account currently signed
                into Before Baby.
              </p>
            </div>
          </div>

          <div className="settings-account-card">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt=""
                className="settings-account-avatar"
              />
            ) : (
              <div className="settings-account-avatar settings-account-avatar--fallback">
                <CircleUserRound size={22} />
              </div>
            )}

            <div className="settings-account-info">
              <strong>
                {user?.displayName ||
                  'Before Baby user'}
              </strong>

              <span>
                {user?.email ||
                  'Google account'}
              </span>
            </div>

            <button
              type="button"
              className="button button-secondary"
              onClick={logout}
            >
              Sign Out
            </button>
          </div>
        </section>

        <section className="settings-section settings-section--small">
          <div className="settings-section-header">
            <div className="settings-section-icon settings-section-icon--lavender">
              <SettingsIcon size={20} />
            </div>

            <div>
              <h2>About Before Baby</h2>

              <p>
                Your private workspace for getting
                ready together.
              </p>
            </div>
          </div>

          <div className="settings-about-list">
            <div className="settings-about-row">
              <span>Workspace</span>
              <strong>
                Maddie & Nick
              </strong>
            </div>

            <div className="settings-about-row">
              <span>Baby name themes</span>
              <strong>
                {themes.length}
              </strong>
            </div>

            <div className="settings-about-row">
              <span>Names saved</span>
              <strong>
                {names.length}
              </strong>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Settings;