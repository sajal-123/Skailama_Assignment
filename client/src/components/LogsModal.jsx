import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import { formatInZone } from '../utils/dayjs';
import { useEscapeKey } from '../utils/useEscapeKey';
import { ClockIcon } from './icons';

function describeLog(log) {
  const fieldLabels = {
    profiles: 'Profiles',
    timezone: 'Timezone',
    startAt: 'Start date/time',
    endAt: 'End date/time',
  };
  if (log.field === 'profiles') {
    const count = log.newValue ? log.newValue.split(',').length : 0;
    return `Profiles changed to ${count} profile(s)`;
  }
  return `${fieldLabels[log.field] || log.field} updated`;
}

export default function LogsModal({ eventId, timezone, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEscapeKey(onClose);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    api
      .getEventLogs(eventId)
      .then(setLogs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [eventId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Event Update History</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>
        {loading ? (
          <p className="muted">
            <span className="spinner spinner-sm" aria-hidden="true" /> Loading…
          </p>
        ) : error ? (
          <div>
            <p className="form-error">{error}</p>
            <button type="button" className="btn-secondary" onClick={load}>
              Retry
            </button>
          </div>
        ) : logs.length === 0 ? (
          <p className="muted">No update history yet</p>
        ) : (
          <ul className="log-list">
            {logs
              .slice()
              .reverse()
              .map((log, i) => (
                <li key={i} className="log-item">
                  <div className="log-time">
                    <ClockIcon className="event-icon" />
                    {formatInZone(log.changedAt, timezone, 'MMM D, YYYY [at] h:mm A')}
                  </div>
                  <div className="log-desc">{describeLog(log)}</div>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}
