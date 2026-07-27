import dayjs from '../utils/dayjs';
import EventForm from './EventForm';
import { useAppStore } from '../store/useAppStore';
import { useEscapeKey } from '../utils/useEscapeKey';

export default function EditEventModal({ event, onClose }) {
  const updateEvent = useAppStore((s) => s.updateEvent);

  useEscapeKey(onClose);

  const initial = {
    profileIds: event.profiles.map((p) => p._id),
    timezone: event.timezone,
    startDate: dayjs(event.startAt).tz(event.timezone).format('YYYY-MM-DD'),
    startTime: dayjs(event.startAt).tz(event.timezone).format('HH:mm'),
    endDate: dayjs(event.endAt).tz(event.timezone).format('YYYY-MM-DD'),
    endTime: dayjs(event.endAt).tz(event.timezone).format('HH:mm'),
  };

  async function handleSubmit(payload) {
    await updateEvent(event._id, payload);
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Event</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>
        <EventForm initial={initial} submitLabel="Update Event" onCancel={onClose} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
