import {
  ArrowLeft,
  ArrowRight,
  Heart,
  LoaderCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  nameRatings,
  useNames,
} from '../context/NameContext';

const REVIEW_FILTERS = [
  {
    value: 'all',
    label: 'All names',
  },
  {
    value: 'unrated',
    label: 'Needs review',
  },
  {
    value: 'favorites',
    label: 'Favorites',
  },
  {
    value: 'considering',
    label: 'Considering',
  },
];

function getThemes(name) {
  if (Array.isArray(name.themes)) {
    return name.themes;
  }

  if (
    typeof name.theme === 'string' &&
    name.theme.trim()
  ) {
    return [name.theme];
  }

  return [];
}

function getNicknames(name) {
  if (Array.isArray(name.nicknames)) {
    return name.nicknames;
  }

  if (typeof name.nicknames === 'string') {
    return name.nicknames
      .split(',')
      .map((nickname) => nickname.trim())
      .filter(Boolean);
  }

  return [];
}

function getRatingStatus(name) {
  const maddieRated =
    name.maddieRating &&
    name.maddieRating !== 'No Opinion';

  const nickRated =
    name.nickRating &&
    name.nickRating !== 'No Opinion';

  if (maddieRated && nickRated) {
    return 'both';
  }

  if (maddieRated || nickRated) {
    return 'one';
  }

  return 'none';
}

function NameReview() {
  const navigate = useNavigate();

  const {
    names,
    loading,
    updateName,
  } = useNames();

  const [filter, setFilter] =
    useState('unrated');

  const [reviewQueueIds, setReviewQueueIds] =
    useState([]);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [saving, setSaving] =
    useState('');

  const [showComplete, setShowComplete] =
    useState(false);

  const availableNames = useMemo(() => {
    const activeNames = names.filter(
      (name) => name.status !== 'No'
    );

    switch (filter) {
      case 'unrated':
        return activeNames.filter(
          (name) =>
            getRatingStatus(name) !== 'both'
        );

      case 'favorites':
        return activeNames.filter(
          (name) =>
            name.favorite ||
            name.status === 'Favorite'
        );

      case 'considering':
        return activeNames.filter(
          (name) =>
            name.status === 'Considering'
        );

      default:
        return activeNames;
    }
  }, [names, filter]);

  /*
   * Build the review queue when the filter changes.
   *
   * The queue intentionally uses IDs instead of the filtered
   * names themselves. This keeps the order stable while ratings
   * are being saved to Firestore.
   */
  useEffect(() => {
    setReviewQueueIds(
      availableNames.map((name) => name.id)
    );
    setCurrentIndex(0);
    setShowComplete(false);
  }, [filter]);

  /*
   * If names are loaded for the first time after the component
   * mounts, initialize the queue.
   */
  useEffect(() => {
    if (
      reviewQueueIds.length === 0 &&
      availableNames.length > 0 &&
      !loading
    ) {
      setReviewQueueIds(
        availableNames.map((name) => name.id)
      );
    }
  }, [
    availableNames,
    loading,
    reviewQueueIds.length,
  ]);

  const reviewQueue = useMemo(() => {
    return reviewQueueIds
      .map((id) =>
        names.find((name) => name.id === id)
      )
      .filter(Boolean);
  }, [names, reviewQueueIds]);

  const currentName =
    reviewQueue[currentIndex] || null;

  const reviewedCount = reviewQueue.filter(
    (name) =>
      getRatingStatus(name) === 'both'
  ).length;

  const progress =
    reviewQueue.length > 0
      ? Math.round(
          (reviewedCount /
            reviewQueue.length) *
            100
        )
      : 0;

  const handleFilterChange = (newFilter) => {
    const nextNames = (() => {
      const activeNames = names.filter(
        (name) => name.status !== 'No'
      );

      switch (newFilter) {
        case 'unrated':
          return activeNames.filter(
            (name) =>
              getRatingStatus(name) !== 'both'
          );

        case 'favorites':
          return activeNames.filter(
            (name) =>
              name.favorite ||
              name.status === 'Favorite'
          );

        case 'considering':
          return activeNames.filter(
            (name) =>
              name.status === 'Considering'
          );

        default:
          return activeNames;
      }
    })();

    setFilter(newFilter);
    setReviewQueueIds(
      nextNames.map((name) => name.id)
    );
    setCurrentIndex(0);
    setShowComplete(false);
  };

  const handleRatingChange = async (
    person,
    rating
  ) => {
    if (!currentName) {
      return;
    }

    const field =
      person === 'maddie'
        ? 'maddieRating'
        : 'nickRating';

    setSaving(field);

    try {
      await updateName(
        currentName.id,
        {
          [field]: rating,
        }
      );
    } catch (error) {
      console.error(
        'Error saving name rating:',
        error
      );
    } finally {
      setSaving('');
    }
  };

  const goNext = () => {
    if (
      currentIndex <
      reviewQueue.length - 1
    ) {
      setCurrentIndex(
        (current) => current + 1
      );
      return;
    }

    setShowComplete(true);
  };

  const goPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(
        (current) => current - 1
      );
    }
  };

  const restart = () => {
    setCurrentIndex(0);
    setShowComplete(false);
  };

  if (loading) {
    return (
      <div className="name-review-page">
        <div className="name-review-loading">
          <LoaderCircle
            size={28}
            className="spinner"
          />
          <p>Loading your names...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="name-review-page">
      <header className="name-review-header">
        <button
          type="button"
          className="name-review-back"
          onClick={() => navigate('/names')}
        >
          <ArrowLeft size={17} />
          Back to Baby Names
        </button>

        <div className="name-review-heading">
          <div>
            <p className="name-review-eyebrow">
              Baby Names
            </p>

            <h1>Review Names</h1>

            <p>
              Go through your names together and
              give each one a rating.
            </p>
          </div>

          <div className="name-review-sparkle">
            <Sparkles size={24} />
          </div>
        </div>
      </header>

      <section className="name-review-toolbar">
        <div className="name-review-filter-group">
          <span className="name-review-filter-label">
            Reviewing
          </span>

          <div className="name-review-filter-pills">
            {REVIEW_FILTERS.map(
              (reviewFilter) => (
                <button
                  key={reviewFilter.value}
                  type="button"
                  className={
                    filter ===
                    reviewFilter.value
                      ? 'name-review-filter name-review-filter--active'
                      : 'name-review-filter'
                  }
                  onClick={() =>
                    handleFilterChange(
                      reviewFilter.value
                    )
                  }
                >
                  {reviewFilter.label}
                </button>
              )
            )}
          </div>
        </div>

        <div className="name-review-progress">
          <div className="name-review-progress-text">
            <span>
              {reviewQueue.length === 0
                ? 'No names'
                : `${Math.min(
                    currentIndex + 1,
                    reviewQueue.length
                  )} of ${
                    reviewQueue.length
                  }`}
            </span>

            {reviewQueue.length > 0 && (
              <span>
                {reviewedCount} reviewed
              </span>
            )}
          </div>

          {reviewQueue.length > 0 && (
            <div className="name-review-progress-track">
              <div
                className="name-review-progress-fill"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          )}
        </div>
      </section>

      {showComplete ? (
        <section className="name-review-complete">
          <div className="name-review-complete-icon">
            <Heart
              size={32}
              fill="currentColor"
            />
          </div>

          <p className="name-review-eyebrow">
            Review complete
          </p>

          <h2>You made it through the list!</h2>

          <p>
            You can go back through the names,
            switch to another view, or head back
            to your full name list.
          </p>

          <div className="name-review-complete-actions">
            <button
              type="button"
              className="button button-secondary"
              onClick={restart}
            >
              <RotateCcw size={17} />
              Start Over
            </button>

            <button
              type="button"
              className="button button-primary"
              onClick={() =>
                navigate('/names')
              }
            >
              Back to Names
            </button>
          </div>
        </section>
      ) : !currentName ? (
        <section className="name-review-empty">
          <div className="name-review-empty-icon">
            <Heart size={28} />
          </div>

          <h2>
            {filter === 'unrated'
              ? "You're all caught up"
              : 'No names here'}
          </h2>

          <p>
            {filter === 'unrated'
              ? 'There are no names waiting for both of you to review.'
              : 'Try another review filter or add more names.'}
          </p>

          {filter === 'unrated' && (
            <button
              type="button"
              className="button button-secondary"
              onClick={() =>
                handleFilterChange('all')
              }
            >
              Review All Names
            </button>
          )}
        </section>
      ) : (
        <main className="name-review-main">
          <article className="name-review-card">
            <div className="name-review-card-top">
              <span
                className={`name-review-gender name-review-gender--${currentName.gender
                  ?.toLowerCase()
                  .replace(/\s+/g, '-')}`}
              >
                {currentName.gender ||
                  'Gender Neutral'}
              </span>

              {(currentName.favorite ||
                currentName.status ===
                  'Favorite') && (
                <span className="name-review-favorite">
                  <Heart
                    size={14}
                    fill="currentColor"
                  />
                  Favorite
                </span>
              )}
            </div>

            <div className="name-review-name-area">
              <h2>{currentName.name}</h2>

              {currentName.middleNames?.length >
                0 && (
                <p className="name-review-middle-names">
                  Middle names:{' '}
                  {currentName.middleNames.join(
                    ', '
                  )}
                </p>
              )}
            </div>

            {getThemes(currentName).length >
              0 && (
              <div className="name-review-section">
                <span className="name-review-label">
                  Themes
                </span>

                <div className="name-review-tags">
                  {getThemes(currentName).map(
                    (theme) => (
                      <span
                        key={theme}
                        className="name-review-tag"
                      >
                        {theme}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}

            {currentName.meaning && (
              <div className="name-review-section">
                <span className="name-review-label">
                  Meaning
                </span>

                <p className="name-review-meaning">
                  {currentName.meaning}
                </p>
              </div>
            )}

            {getNicknames(currentName)
              .length > 0 && (
              <div className="name-review-section">
                <span className="name-review-label">
                  Nicknames
                </span>

                <div className="name-review-nicknames">
                  {getNicknames(
                    currentName
                  ).map((nickname) => (
                    <span
                      key={nickname}
                      className="name-review-nickname"
                    >
                      {nickname}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="name-review-divider" />

            <div className="name-review-ratings">
              <div className="name-review-rating">
                <label
                  htmlFor="maddie-rating"
                  className="name-review-rating-label"
                >
                  <span>
                    Maddie's rating
                  </span>
                </label>

                <div className="name-review-select-wrap">
                  <select
                    id="maddie-rating"
                    value={
                      currentName.maddieRating ||
                      'No Opinion'
                    }
                    onChange={(event) =>
                      handleRatingChange(
                        'maddie',
                        event.target.value
                      )
                    }
                    disabled={
                      saving ===
                      'maddieRating'
                    }
                  >
                    {nameRatings.map(
                      (rating) => (
                        <option
                          key={rating}
                          value={rating}
                        >
                          {rating}
                        </option>
                      )
                    )}
                  </select>

                  {saving ===
                    'maddieRating' && (
                    <LoaderCircle
                      size={16}
                      className="spinner"
                    />
                  )}
                </div>
              </div>

              <div className="name-review-rating">
                <label
                  htmlFor="nick-rating"
                  className="name-review-rating-label"
                >
                  <span>
                    Nick's rating
                  </span>
                </label>

                <div className="name-review-select-wrap">
                  <select
                    id="nick-rating"
                    value={
                      currentName.nickRating ||
                      'No Opinion'
                    }
                    onChange={(event) =>
                      handleRatingChange(
                        'nick',
                        event.target.value
                      )
                    }
                    disabled={
                      saving ===
                      'nickRating'
                    }
                  >
                    {nameRatings.map(
                      (rating) => (
                        <option
                          key={rating}
                          value={rating}
                        >
                          {rating}
                        </option>
                      )
                    )}
                  </select>

                  {saving ===
                    'nickRating' && (
                    <LoaderCircle
                      size={16}
                      className="spinner"
                    />
                  )}
                </div>
              </div>
            </div>
          </article>

          <div className="name-review-navigation">
            <button
              type="button"
              className="name-review-nav-button name-review-nav-button--secondary"
              onClick={goPrevious}
              disabled={currentIndex === 0}
            >
              <ArrowLeft size={17} />
              Previous
            </button>

            <div className="name-review-dots">
              {reviewQueue.length <= 9 &&
                reviewQueue.map(
                  (name, index) => (
                    <button
                      key={name.id}
                      type="button"
                      className={
                        index === currentIndex
                          ? 'name-review-dot name-review-dot--active'
                          : getRatingStatus(
                                name
                              ) === 'both'
                            ? 'name-review-dot name-review-dot--complete'
                            : 'name-review-dot'
                      }
                      onClick={() =>
                        setCurrentIndex(index)
                      }
                      aria-label={`Go to ${name.name}`}
                    />
                  )
                )}
            </div>

            <button
              type="button"
              className="name-review-nav-button name-review-nav-button--primary"
              onClick={goNext}
            >
              {currentIndex ===
              reviewQueue.length - 1
                ? 'Finish'
                : 'Next'}
              <ArrowRight size={17} />
            </button>
          </div>

          <p className="name-review-hint">
            Your ratings save automatically.
          </p>
        </main>
      )}
    </div>
  );
}

export default NameReview;