import { useState } from 'react';
import EventForm from './EventForm';
import { useAppStore } from '../store/useAppStore';

export default function CreateEventPanel() {
  const createEvent = useAppStore((s) => s.createEvent);
  const [resetKey, setResetKey] = useState(0);

  async function handleSubmit(payload) {
    await createEvent(payload);
    setResetKey((k) => k + 1);
  }

  return (
    <div className="panel">
      <h2>Create Event</h2>
      <EventForm key={resetKey} submitLabel="+ Create Event" onSubmit={handleSubmit} />
    </div>
  );
}
