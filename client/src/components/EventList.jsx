import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { formatInZone } from '../utils/dayjs';
import { TIMEZONES } from '../utils/timezones';
import { PersonIcon, CalendarIcon, ClockIcon } from './icons';
import EditEventModal from './EditEventModal';
import LogsModal from './LogsModal';

const MAX_PROFILE_ICONS = 3;

export default function EventList() {
  const events = useAppStore((s) => s.events);
  const viewTimezone = useAppStore((s) => s.viewTimezone);
  const setViewTimezone = useAppStore((s) => s.setViewTimezone);
  const currentProfileId = useAppStore((s) => s.currentProfileId);
  const refreshing = useAppStore((s) => s.refreshing);

  const [editingEvent, setEditingEvent] = useState(null);
  const [logsEventId, setLogsEventId] = useState(null);

  const visibleEvents = currentProfileId
    ? events.filter((ev) => ev.profiles.some((p) => p._id === currentProfileId))
    : events;

  return (
    <div className="panel panel-events">
      <h2>
        Events {refreshing && <span className="spinner spinner-sm" aria-label="Refreshing" />}
      </h2>
      <label>View in Timezone</label>
      <select value={viewTimezone} onChange={(e) => setViewTimezone(e.target.value)}>
        {TIMEZONES.map((tz) => (
          <option key={tz.value} value={tz.value}>
            {tz.label}
          </option>
        ))}
      </select>

      {visibleEvents.length === 0 ? (
        <p className="empty-state">No events found</p>
      ) : (
        <ul className="event-cards">
          {visibleEvents.map((ev) => {
            const shownProfiles = ev.profiles.slice(0, MAX_PROFILE_ICONS);
            const extraCount = ev.profiles.length - shownProfiles.length;

            return (
              <li key={ev._id} className="event-card">
                <div className="event-profiles">
                  <span className="profile-icon-stack">
                    {shownProfiles.map((p) => (
                      <span className="profile-icon" key={p._id} title={p.name}>
                        <PersonIcon />
                      </span>
                    ))}
                    {extraCount > 0 && <span className="profile-icon profile-icon-extra">+{extraCount}</span>}
                  </span>
                  {ev.profiles.map((p) => p.name).join(', ')}
                </div>

                <div className="event-row">
                  <CalendarIcon className="event-icon" />
                  <span className="event-label">Start:</span> {formatInZone(ev.startAt, viewTimezone, 'MMM D, YYYY')}
                  <ClockIcon className="event-icon event-icon-inline" />
                  {formatInZone(ev.startAt, viewTimezone, 'h:mm A')}
                </div>
                <div className="event-row">
                  <CalendarIcon className="event-icon" />
                  <span className="event-label">End:</span> {formatInZone(ev.endAt, viewTimezone, 'MMM D, YYYY')}
                  <ClockIcon className="event-icon event-icon-inline" />
                  {formatInZone(ev.endAt, viewTimezone, 'h:mm A')}
                </div>

                <div className="event-divider" />

                <div className="event-meta">
                  Created: {formatInZone(ev.createdAt, viewTimezone, 'MMM D, YYYY [at] h:mm A')}
                  <br />
                  Updated: {formatInZone(ev.updatedAt, viewTimezone, 'MMM D, YYYY [at] h:mm A')}
                </div>

                <div className="event-divider" />

                <div className="event-actions">
                  <button className="btn-half" onClick={() => setEditingEvent(ev)}>
                    Edit
                  </button>
                  <button className="btn-half" onClick={() => setLogsEventId(ev._id)}>
                    View Logs
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {editingEvent && <EditEventModal event={editingEvent} onClose={() => setEditingEvent(null)} />}
      {logsEventId && (
        <LogsModal eventId={logsEventId} timezone={viewTimezone} onClose={() => setLogsEventId(null)} />
      )}
    </div>
  );
}
