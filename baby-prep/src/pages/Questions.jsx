import {
  Check,
  FileText,
  HelpCircle,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import { db } from '../services/firebase';
import { FAMILY_ID } from '../config/baby';

const emptyQuestion = {
  question: '',
  answer: '',
  status: 'Unanswered',
};

const emptyNote = {
  title: '',
  content: '',
};

const questionStatuses = [
  'Unanswered',
  'Discussing',
  'Answered',
];

function formatDate(timestamp) {
  if (!timestamp?.toDate) {
    return '';
  }

  return timestamp.toDate().toLocaleDateString(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }
  );
}

function Questions() {
  const [questions, setQuestions] = useState([]);
  const [notes, setNotes] = useState([]);

  const [questionsLoading, setQuestionsLoading] =
    useState(true);
  const [notesLoading, setNotesLoading] =
    useState(true);

  const [activeSection, setActiveSection] =
    useState('questions');

  const [search, setSearch] = useState('');

  const [showQuestionModal, setShowQuestionModal] =
    useState(false);
  const [showNoteModal, setShowNoteModal] =
    useState(false);

  const [editingQuestionId, setEditingQuestionId] =
    useState(null);
  const [editingNoteId, setEditingNoteId] =
    useState(null);

  const [questionForm, setQuestionForm] =
    useState(emptyQuestion);
  const [noteForm, setNoteForm] =
    useState(emptyNote);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const questionsRef = collection(
      db,
      'families',
      FAMILY_ID,
      'questions'
    );

    const unsubscribe = onSnapshot(
      questionsRef,
      (snapshot) => {
        const loadedQuestions =
          snapshot.docs.map((questionDoc) => ({
            id: questionDoc.id,
            ...questionDoc.data(),
          }));

        loadedQuestions.sort((a, b) => {
          const aTime =
            a.createdAt?.toMillis?.() ?? 0;
          const bTime =
            b.createdAt?.toMillis?.() ?? 0;

          return bTime - aTime;
        });

        setQuestions(loadedQuestions);
        setQuestionsLoading(false);
      },
      (firebaseError) => {
        console.error(
          'Error loading questions:',
          firebaseError
        );
        setQuestionsLoading(false);
        setError(
          'We could not load your questions.'
        );
      }
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    const notesRef = collection(
      db,
      'families',
      FAMILY_ID,
      'notes'
    );

    const unsubscribe = onSnapshot(
      notesRef,
      (snapshot) => {
        const loadedNotes =
          snapshot.docs.map((noteDoc) => ({
            id: noteDoc.id,
            ...noteDoc.data(),
          }));

        loadedNotes.sort((a, b) => {
          const aTime =
            a.createdAt?.toMillis?.() ?? 0;
          const bTime =
            b.createdAt?.toMillis?.() ?? 0;

          return bTime - aTime;
        });

        setNotes(loadedNotes);
        setNotesLoading(false);
      },
      (firebaseError) => {
        console.error(
          'Error loading notes:',
          firebaseError
        );
        setNotesLoading(false);
        setError(
          'We could not load your notes.'
        );
      }
    );

    return unsubscribe;
  }, []);

  const filteredQuestions = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return questions;
    }

    return questions.filter((question) => {
      return [
        question.question,
        question.answer,
        question.status,
      ]
        .filter(Boolean)
        .some((value) =>
          value.toLowerCase().includes(query)
        );
    });
  }, [questions, search]);

  const filteredNotes = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return notes;
    }

    return notes.filter((note) => {
      return [
        note.title,
        note.content,
      ]
        .filter(Boolean)
        .some((value) =>
          value.toLowerCase().includes(query)
        );
    });
  }, [notes, search]);

  const questionStats = useMemo(() => {
    return {
      total: questions.length,
      unanswered: questions.filter(
        (question) =>
          question.status === 'Unanswered'
      ).length,
      discussing: questions.filter(
        (question) =>
          question.status === 'Discussing'
      ).length,
      answered: questions.filter(
        (question) =>
          question.status === 'Answered'
      ).length,
    };
  }, [questions]);

  const resetQuestionForm = () => {
    setQuestionForm(emptyQuestion);
    setEditingQuestionId(null);
  };

  const resetNoteForm = () => {
    setNoteForm(emptyNote);
    setEditingNoteId(null);
  };

  const openAddQuestion = () => {
    setError('');
    resetQuestionForm();
    setShowQuestionModal(true);
  };

  const openEditQuestion = (question) => {
    setError('');

    setQuestionForm({
      question: question.question || '',
      answer: question.answer || '',
      status:
        question.status || 'Unanswered',
    });

    setEditingQuestionId(question.id);
    setShowQuestionModal(true);
  };

  const openAddNote = () => {
    setError('');
    resetNoteForm();
    setShowNoteModal(true);
  };

  const openEditNote = (note) => {
    setError('');

    setNoteForm({
      title: note.title || '',
      content: note.content || '',
    });

    setEditingNoteId(note.id);
    setShowNoteModal(true);
  };

  const handleQuestionSubmit = async (event) => {
    event.preventDefault();

    if (!questionForm.question.trim()) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      const questionData = {
        question: questionForm.question.trim(),
        answer: questionForm.answer.trim(),
        status: questionForm.status,
        updatedAt: serverTimestamp(),
      };

      if (editingQuestionId) {
        await updateDoc(
          doc(
            db,
            'families',
            FAMILY_ID,
            'questions',
            editingQuestionId
          ),
          questionData
        );
      } else {
        await addDoc(
          collection(
            db,
            'families',
            FAMILY_ID,
            'questions'
          ),
          {
            ...questionData,
            createdAt: serverTimestamp(),
          }
        );
      }

      setShowQuestionModal(false);
      resetQuestionForm();
    } catch (firebaseError) {
      console.error(
        'Error saving question:',
        firebaseError
      );
      setError(
        'We could not save that question.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleNoteSubmit = async (event) => {
    event.preventDefault();

    if (
      !noteForm.title.trim() &&
      !noteForm.content.trim()
    ) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      const noteData = {
        title: noteForm.title.trim() || 'Untitled Note',
        content: noteForm.content.trim(),
        updatedAt: serverTimestamp(),
      };

      if (editingNoteId) {
        await updateDoc(
          doc(
            db,
            'families',
            FAMILY_ID,
            'notes',
            editingNoteId
          ),
          noteData
        );
      } else {
        await addDoc(
          collection(
            db,
            'families',
            FAMILY_ID,
            'notes'
          ),
          {
            ...noteData,
            createdAt: serverTimestamp(),
          }
        );
      }

      setShowNoteModal(false);
      resetNoteForm();
    } catch (firebaseError) {
      console.error(
        'Error saving note:',
        firebaseError
      );
      setError(
        'We could not save that note.'
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteQuestion = async (questionId) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this question?'
      )
    ) {
      return;
    }

    try {
      await deleteDoc(
        doc(
          db,
          'families',
          FAMILY_ID,
          'questions',
          questionId
        )
      );
    } catch (firebaseError) {
      console.error(
        'Error deleting question:',
        firebaseError
      );
      setError(
        'We could not delete that question.'
      );
    }
  };

  const deleteNote = async (noteId) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this note?'
      )
    ) {
      return;
    }

    try {
      await deleteDoc(
        doc(
          db,
          'families',
          FAMILY_ID,
          'notes',
          noteId
        )
      );
    } catch (firebaseError) {
      console.error(
        'Error deleting note:',
        firebaseError
      );
      setError(
        'We could not delete that note.'
      );
    }
  };

  const updateQuestionStatus = async (
    question,
    status
  ) => {
    try {
      await updateDoc(
        doc(
          db,
          'families',
          FAMILY_ID,
          'questions',
          question.id
        ),
        {
          status,
          updatedAt: serverTimestamp(),
        }
      );
    } catch (firebaseError) {
      console.error(
        'Error updating question status:',
        firebaseError
      );
      setError(
        'We could not update that question.'
      );
    }
  };

  const loading =
    questionsLoading || notesLoading;

  return (
    <main className="thoughts-page">
      <header className="thoughts-header">
        <div>
          <p className="page-eyebrow">
            Before Baby
          </p>

          <h1>Thoughts & Questions</h1>

          <p className="thoughts-header-description">
            A place to talk things through, keep
            track of questions, and save the
            thoughts you don't want to lose.
          </p>
        </div>
      </header>

      {error && (
        <div className="thoughts-error">
          {error}
          <button
            type="button"
            onClick={() => setError('')}
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <section className="thoughts-overview">
        <button
          type="button"
          className={
            activeSection === 'questions'
              ? 'thoughts-overview-card thoughts-overview-card--active'
              : 'thoughts-overview-card'
          }
          onClick={() =>
            setActiveSection('questions')
          }
        >
          <div className="thoughts-overview-icon thoughts-overview-icon--pink">
            <HelpCircle size={21} />
          </div>

          <div>
            <strong>
              {questionStats.total}
            </strong>
            <span>Questions</span>
          </div>

          <small>
            {questionStats.answered} answered
          </small>
        </button>

        <button
          type="button"
          className={
            activeSection === 'notes'
              ? 'thoughts-overview-card thoughts-overview-card--active'
              : 'thoughts-overview-card'
          }
          onClick={() =>
            setActiveSection('notes')
          }
        >
          <div className="thoughts-overview-icon thoughts-overview-icon--lavender">
            <FileText size={21} />
          </div>

          <div>
            <strong>{notes.length}</strong>
            <span>Notes</span>
          </div>

          <small>
            {notes.length === 0
              ? 'Nothing saved yet'
              : 'Ideas & reminders'}
          </small>
        </button>
      </section>

      <section className="thoughts-toolbar">
        <div className="thoughts-tabs">
          <button
            type="button"
            className={
              activeSection === 'questions'
                ? 'thoughts-tab thoughts-tab--active'
                : 'thoughts-tab'
            }
            onClick={() =>
              setActiveSection('questions')
            }
          >
            Questions
          </button>

          <button
            type="button"
            className={
              activeSection === 'notes'
                ? 'thoughts-tab thoughts-tab--active'
                : 'thoughts-tab'
            }
            onClick={() =>
              setActiveSection('notes')
            }
          >
            Notes
          </button>
        </div>

        <label className="thoughts-search">
          <Search size={16} />

          <input
            type="search"
            placeholder={
              activeSection === 'questions'
                ? 'Search questions...'
                : 'Search notes...'
            }
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </label>
      </section>

      {loading ? (
        <div className="thoughts-loading">
          <LoaderCircle
            size={26}
            className="spinner"
          />
          <p>Loading your thoughts...</p>
        </div>
      ) : activeSection === 'questions' ? (
        <section className="thoughts-content">
          <div className="thoughts-section-heading">
            <div>
              <p className="page-eyebrow">
                Talk It Out
              </p>

              <h2>Questions for Us</h2>

              <p>
                Keep track of things you want to
                discuss together before baby.
              </p>
            </div>

            <button
              type="button"
              className="button button-secondary"
              onClick={openAddQuestion}
            >
              <Plus size={16} />
              Add Question
            </button>
          </div>

          {filteredQuestions.length === 0 ? (
            <div className="thoughts-empty">
              <div className="thoughts-empty-icon">
                <HelpCircle size={26} />
              </div>

              <h3>
                {search
                  ? 'No questions found'
                  : 'Nothing to talk about yet'}
              </h3>

              <p>
                {search
                  ? 'Try a different search.'
                  : 'Add questions as they come up so you can work through them together.'}
              </p>
            </div>
          ) : (
            <div className="questions-list">
              {filteredQuestions.map(
                (question) => (
                  <article
                    key={question.id}
                    className="question-card"
                  >
                    <div className="question-card-main">
                      <div className="question-card-top">
                        <span
                          className={`question-status question-status--${question.status
                            ?.toLowerCase()
                            .replace(
                              /\s+/g,
                              '-'
                            )}`}
                        >
                          {question.status}
                        </span>

                        {question.createdAt && (
                          <span className="thoughts-date">
                            {formatDate(
                              question.createdAt
                            )}
                          </span>
                        )}
                      </div>

                      <h3>
                        {question.question}
                      </h3>

                      {question.answer && (
                        <div className="question-answer">
                          <span>Your thoughts</span>
                          <p>
                            {question.answer}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="question-card-actions">
                      <select
                        value={
                          question.status ||
                          'Unanswered'
                        }
                        onChange={(event) =>
                          updateQuestionStatus(
                            question,
                            event.target.value
                          )
                        }
                        aria-label={`Status for ${question.question}`}
                      >
                        {questionStatuses.map(
                          (status) => (
                            <option
                              key={status}
                              value={status}
                            >
                              {status}
                            </option>
                          )
                        )}
                      </select>

                      <button
                        type="button"
                        className="icon-button"
                        onClick={() =>
                          openEditQuestion(
                            question
                          )
                        }
                        aria-label="Edit question"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        className="icon-button icon-button-danger"
                        onClick={() =>
                          deleteQuestion(
                            question.id
                          )
                        }
                        aria-label="Delete question"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </section>
      ) : (
        <section className="thoughts-content">
          <div className="thoughts-section-heading">
            <div>
              <p className="page-eyebrow">
                Keep Track
              </p>

              <h2>Notes</h2>

              <p>
                Random thoughts, ideas, decisions,
                reminders, and anything else worth
                saving.
              </p>
            </div>

            <button
              type="button"
              className="button button-secondary"
              onClick={openAddNote}
            >
              <Plus size={16} />
              Add Note
            </button>
          </div>

          {filteredNotes.length === 0 ? (
            <div className="thoughts-empty">
              <div className="thoughts-empty-icon thoughts-empty-icon--lavender">
                <FileText size={26} />
              </div>

              <h3>
                {search
                  ? 'No notes found'
                  : 'No notes yet'}
              </h3>

              <p>
                {search
                  ? 'Try a different search.'
                  : 'Use notes for the little things that do not belong anywhere else.'}
              </p>
            </div>
          ) : (
            <div className="notes-grid">
              {filteredNotes.map((note) => (
                <article
                  key={note.id}
                  className="note-card"
                >
                  <div className="note-card-header">
                    <div className="note-card-icon">
                      <FileText size={17} />
                    </div>

                    <div className="note-card-actions">
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() =>
                          openEditNote(note)
                        }
                        aria-label="Edit note"
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        type="button"
                        className="icon-button icon-button-danger"
                        onClick={() =>
                          deleteNote(note.id)
                        }
                        aria-label="Delete note"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <h3>
                    {note.title ||
                      'Untitled Note'}
                  </h3>

                  {note.content && (
                    <p>{note.content}</p>
                  )}

                  {note.createdAt && (
                    <span className="thoughts-date">
                      {formatDate(
                        note.updatedAt ||
                          note.createdAt
                      )}
                    </span>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {showQuestionModal && (
        <div
          className="thoughts-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              setShowQuestionModal(false);
              resetQuestionForm();
            }
          }}
        >
          <div className="thoughts-modal">
            <div className="thoughts-modal-header">
              <div>
                <p className="page-eyebrow">
                  Questions for Us
                </p>

                <h2>
                  {editingQuestionId
                    ? 'Edit Question'
                    : 'New Question'}
                </h2>
              </div>

              <button
                type="button"
                className="icon-button"
                onClick={() => {
                  setShowQuestionModal(false);
                  resetQuestionForm();
                }}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form
              className="thoughts-form"
              onSubmit={handleQuestionSubmit}
            >
              <label>
                Question
                <textarea
                  value={
                    questionForm.question
                  }
                  onChange={(event) =>
                    setQuestionForm(
                      (current) => ({
                        ...current,
                        question:
                          event.target.value,
                      })
                    )
                  }
                  placeholder="What do we want to talk about?"
                  rows={4}
                  autoFocus
                />
              </label>

              <label>
                Status
                <select
                  value={questionForm.status}
                  onChange={(event) =>
                    setQuestionForm(
                      (current) => ({
                        ...current,
                        status:
                          event.target.value,
                      })
                    )
                  }
                >
                  {questionStatuses.map(
                    (status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label>
                Our thoughts
                <textarea
                  value={
                    questionForm.answer
                  }
                  onChange={(event) =>
                    setQuestionForm(
                      (current) => ({
                        ...current,
                        answer:
                          event.target.value,
                      })
                    )
                  }
                  placeholder="Add what you decide, or leave this blank for now."
                  rows={5}
                />
              </label>

              <div className="thoughts-modal-actions">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => {
                    setShowQuestionModal(false);
                    resetQuestionForm();
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="button button-primary"
                  disabled={
                    saving ||
                    !questionForm.question.trim()
                  }
                >
                  {saving ? (
                    <LoaderCircle
                      size={16}
                      className="spinner"
                    />
                  ) : (
                    <Check size={16} />
                  )}
                  {editingQuestionId
                    ? 'Save Changes'
                    : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showNoteModal && (
        <div
          className="thoughts-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              setShowNoteModal(false);
              resetNoteForm();
            }
          }}
        >
          <div className="thoughts-modal">
            <div className="thoughts-modal-header">
              <div>
                <p className="page-eyebrow">
                  Notes
                </p>

                <h2>
                  {editingNoteId
                    ? 'Edit Note'
                    : 'New Note'}
                </h2>
              </div>

              <button
                type="button"
                className="icon-button"
                onClick={() => {
                  setShowNoteModal(false);
                  resetNoteForm();
                }}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form
              className="thoughts-form"
              onSubmit={handleNoteSubmit}
            >
              <label>
                Title
                <input
                  type="text"
                  value={noteForm.title}
                  onChange={(event) =>
                    setNoteForm(
                      (current) => ({
                        ...current,
                        title:
                          event.target.value,
                      })
                    )
                  }
                  placeholder="Give this note a title"
                  autoFocus
                />
              </label>

              <label>
                Note
                <textarea
                  value={noteForm.content}
                  onChange={(event) =>
                    setNoteForm(
                      (current) => ({
                        ...current,
                        content:
                          event.target.value,
                      })
                    )
                  }
                  placeholder="Write whatever is on your mind..."
                  rows={10}
                />
              </label>

              <div className="thoughts-modal-actions">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => {
                    setShowNoteModal(false);
                    resetNoteForm();
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="button button-primary"
                  disabled={
                    saving ||
                    (!noteForm.title.trim() &&
                      !noteForm.content.trim())
                  }
                >
                  {saving ? (
                    <LoaderCircle
                      size={16}
                      className="spinner"
                    />
                  ) : (
                    <Check size={16} />
                  )}
                  {editingNoteId
                    ? 'Save Changes'
                    : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default Questions;