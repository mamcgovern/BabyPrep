import { useEffect, useMemo, useState } from 'react';
import {
  appointmentStatuses,
  appointmentTypes,
  useAppointments,
} from '../context/AppointmentContext';
import { useNames } from '../context/NameContext';

const emptyForm = {
  title: '',
  type: 'Healthcare',
  date: '',
  time: '',
  location: '',
  cost: '',
  link: '',
  notes: '',
  status: 'Upcoming',
};

function formatDate(date) {
  if (!date) {
    return 'Date not set';
  }

  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(time) {
  if (!time) {
    return '';
  }

  const [hours, minutes] = time.split(':');
  const date = new Date();

  date.setHours(Number(hours), Number(minutes), 0, 0);

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function isUpcoming(appointment) {
  const today = new Date().toISOString().split('T')[0];

  return (
    appointment.status === 'Upcoming' &&
    (!appointment.date || appointment.date >= today)
  );
}

function AppointmentModal({
  isOpen,
  editingItem,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setForm(
      editingItem
        ? {
          title: editingItem.title || '',
          type: editingItem.type || 'Healthcare',
          date: editingItem.date || '',
          time: editingItem.time || '',
          location: editingItem.location || '',
          cost:
            editingItem.cost == null ? '' : editingItem.cost,
          link: editingItem.link || '',
          notes: editingItem.notes || '',
          status: editingItem.status || 'Upcoming',
        }
        : emptyForm
    );
  }, [isOpen, editingItem]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      return;
    }

    setSaving(true);

    try {
      await onSave(form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="appointment-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">
              {editingItem ? 'EDIT APPOINTMENT' : 'NEW APPOINTMENT'}
            </p>
            <h2>
              {editingItem
                ? 'Update appointment'
                : 'Add an appointment'}
            </h2>
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

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="form-field form-field-wide">
              <span>Name</span>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Pediatrician tour"
                autoFocus
                required
              />
            </label>

            <label className="form-field">
              <span>Type</span>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
              >
                {appointmentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Status</span>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                {appointmentStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Date</span>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
              />
            </label>

            <label className="form-field">
              <span>Time</span>
              <input
                type="time"
                name="time"
                value={form.time}
                onChange={handleChange}
              />
            </label>

            <label className="form-field form-field-wide">
              <span>Location</span>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Clinic, hospital, or address"
              />
            </label>

            <label className="form-field">
              <span>Cost</span>
              <div className="input-with-prefix">
                <span>$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="cost"
                  value={form.cost}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
            </label>

            <label className="form-field">
              <span>Registration / Info Link</span>
              <input
                type="url"
                name="link"
                value={form.link}
                onChange={handleChange}
                placeholder="https://..."
              />
            </label>

            <label className="form-field form-field-wide">
              <span>Notes</span>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows="4"
                placeholder="Questions to ask, what to bring, follow-up details..."
              />
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
              disabled={saving}
            >
              {saving
                ? 'Saving...'
                : editingItem
                  ? 'Save Changes'
                  : 'Add Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AppointmentCard({ appointment, onEdit, onDelete }) {
  const handleDelete = () => {
    if (
      window.confirm(
        `Delete "${appointment.title}"?`
      )
    ) {
      onDelete(appointment.id);
    }
  };

  return (
    <article className="appointment-card">
      <div className="appointment-date">
        <span>
          {appointment.date
            ? new Date(
              `${appointment.date}T12:00:00`
            ).toLocaleDateString('en-US', {
              month: 'short',
            })
            : 'TBD'}
        </span>
        <strong>
          {appointment.date
            ? new Date(
              `${appointment.date}T12:00:00`
            ).getDate()
            : '—'}
        </strong>
      </div>

      <div className="appointment-main">
        <div className="appointment-card-top">
          <div>
            <span className="appointment-type">
              {appointment.type}
            </span>
            <h3>{appointment.title}</h3>
          </div>

          <span
            className={`appointment-status status-${appointment.status
              .toLowerCase()
              .replaceAll(' ', '-')}`}
          >
            {appointment.status}
          </span>
        </div>

        <div className="appointment-details">
          {appointment.time && (
            <span>◷ {formatTime(appointment.time)}</span>
          )}

          {appointment.location && (
            <span>⌖ {appointment.location}</span>
          )}

          {appointment.cost != null && (
            <span>
              ${Number(appointment.cost).toFixed(2)}
            </span>
          )}
        </div>

        {appointment.notes && (
          <p className="appointment-notes">
            {appointment.notes}
          </p>
        )}

        <div className="appointment-actions">
          {appointment.link && (
            <a
              href={appointment.link}
              target="_blank"
              rel="noreferrer"
              className="text-button"
            >
              Open link ↗
            </a>
          )}

          <button
            type="button"
            className="text-button"
            onClick={() => onEdit(appointment)}
          >
            Edit
          </button>

          <button
            type="button"
            className="text-button danger"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

export default function Appointments() {
  const {
    items,
    stats,
    loading,
    error,
    addAppointment,
    updateAppointment,
    deleteAppointment,
  } = useAppointments();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showPast, setShowPast] = useState(false);

  const upcoming = useMemo(
    () => items.filter(isUpcoming),
    [items]
  );

  const past = useMemo(
    () =>
      items.filter(
        (item) => !isUpcoming(item)
      ).reverse(),
    [items]
  );

  const openAdd = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const saveAppointment = async (form) => {
    if (editingItem) {
      await updateAppointment(editingItem.id, form);
    } else {
      await addAppointment(form);
    }
  };

  const { babyNamePlaceholder } = useNames();

  return (
    <div className="page appointments-page">
      <div className="page-header appointments-header">
        <div>
          <p className="eyebrow">STAY ON TOP OF THINGS</p>
          <h1>Appointments</h1>
          <p className="page-description">
            Keep track of appointments, questions, and things to discuss for {babyNamePlaceholder}.
          </p>
        </div>

        <button
          type="button"
          className="button button-primary"
          onClick={openAdd}
        >
          + Add Appointment
        </button>
      </div>

      <div className="appointment-stats">
        <div className="appointment-stat">
          <span className="stat-accent pink" />
          <div>
            <strong>{stats.upcoming}</strong>
            <span>Upcoming</span>
          </div>
          <p>On the calendar</p>
        </div>

        <div className="appointment-stat">
          <span className="stat-accent blue" />
          <div>
            <strong>{stats.thisMonth}</strong>
            <span>This month</span>
          </div>
          <p>Coming up soon</p>
        </div>

        <div className="appointment-stat">
          <span className="stat-accent lavender" />
          <div>
            <strong>{stats.classes}</strong>
            <span>Classes</span>
          </div>
          <p>Learning together</p>
        </div>

        <div className="appointment-stat">
          <span className="stat-accent cream" />
          <div>
            <strong>{stats.tours}</strong>
            <span>Tours</span>
          </div>
          <p>Places to visit</p>
        </div>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      {loading ? (
        <div className="empty-state">
          <div className="empty-state-icon">◌</div>
          <h2>Loading appointments...</h2>
        </div>
      ) : (
        <>
          <section className="appointment-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">WHAT'S NEXT</p>
                <h2>Upcoming</h2>
              </div>

              <span className="section-count">
                {upcoming.length}
              </span>
            </div>

            {upcoming.length > 0 ? (
              <div className="appointment-list">
                {upcoming.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onEdit={openEdit}
                    onDelete={deleteAppointment}
                  />
                ))}
              </div>
            ) : (
              <div className="appointment-empty">
                <div className="appointment-empty-icon">
                  ♡
                </div>
                <div>
                  <h3>Nothing on the calendar yet</h3>
                  <p>
                    Add your first appointment, class, or
                    tour to start keeping track.
                  </p>
                </div>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={openAdd}
                >
                  Add one
                </button>
              </div>
            )}
          </section>

          {past.length > 0 && (
            <section className="appointment-section past-section">
              <button
                type="button"
                className="past-toggle"
                onClick={() => setShowPast((current) => !current)}
              >
                <span>
                  <span className="eyebrow">HISTORY</span>
                  <strong>Past appointments</strong>
                </span>
                <span>{showPast ? '⌃' : '⌄'}</span>
              </button>

              {showPast && (
                <div className="appointment-list past-list">
                  {past.map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onEdit={openEdit}
                      onDelete={deleteAppointment}
                    />
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}

      <AppointmentModal
        isOpen={modalOpen}
        editingItem={editingItem}
        onClose={closeModal}
        onSave={saveAppointment}
      />
    </div>
  );
}