import { useState, useRef } from 'react';
import MultiProfileSelect from './MultiProfileSelect';
import { TIMEZONES } from '../utils/timezones';
import dayjs from '../utils/dayjs';

const emptyForm = {
  profileIds: [],
  timezone: 'America/New_York',
  startDate: '',
  startTime: '09:00',
  endDate: '',
  endTime: '09:00',
};

export default function EventForm({ initial, onSubmit, submitLabel, onCancel }) {
  const [form, setForm] = useState(initial || emptyForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Ref guard: React state updates are async, so a rapid second click can slip
  // through before `submitting` re-renders. The ref flips synchronously and
  // guarantees only one submission is ever in flight -> exactly one entry.
  const inFlight = useRef(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validate() {
    if (form.profileIds.length === 0) return 'Select at least one profile';
    if (!form.startDate || !form.endDate) return 'Pick start and end dates';
    // Instant client-side check so the user gets feedback without a round-trip.
    const start = dayjs.tz(`${form.startDate}T${form.startTime}`, form.timezone);
    const end = dayjs.tz(`${form.endDate}T${form.endTime}`, form.timezone);
    if (!start.isValid() || !end.isValid()) return 'Enter a valid start and end date/time';
    if (end.isBefore(start)) return 'End date/time cannot be before start date/time';
    return '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (inFlight.current) return; // ignore double / rapid clicks

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    inFlight.current = true;
    setSubmitting(true);
    setError('');
    try {
      await onSubmit({
        profiles: form.profileIds,
        timezone: form.timezone,
        startAt: `${form.startDate}T${form.startTime}`,
        endAt: `${form.endDate}T${form.endTime}`,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  }

  return (
    <form className="event-form" onSubmit={handleSubmit}>
      <label>Profiles</label>
      <MultiProfileSelect selected={form.profileIds} onChange={(v) => update('profileIds', v)} />

      <label>Timezone</label>
      <select value={form.timezone} onChange={(e) => update('timezone', e.target.value)} disabled={submitting}>
        {TIMEZONES.map((tz) => (
          <option key={tz.value} value={tz.value}>
            {tz.label}
          </option>
        ))}
      </select>

      <label>Start Date &amp; Time</label>
      <div className="datetime-row">
        <input type="date" value={form.startDate} onChange={(e) => update('startDate', e.target.value)} disabled={submitting} />
        <input type="time" value={form.startTime} onChange={(e) => update('startTime', e.target.value)} disabled={submitting} />
      </div>

      <label>End Date &amp; Time</label>
      <div className="datetime-row">
        <input type="date" value={form.endDate} onChange={(e) => update('endDate', e.target.value)} disabled={submitting} />
        <input type="time" value={form.endTime} onChange={(e) => update('endTime', e.target.value)} disabled={submitting} />
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn-primary" disabled={submitting} aria-busy={submitting}>
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
