import { useEffect } from 'react';
import ProfileSwitcher from './components/ProfileSwitcher';
import CreateEventPanel from './components/CreateEventPanel';
import EventList from './components/EventList';
import { useAppStore } from './store/useAppStore';
import './App.css';

function App() {
  const init = useAppStore((s) => s.init);
  const error = useAppStore((s) => s.error);
  const loading = useAppStore((s) => s.loading);
  const initialized = useAppStore((s) => s.initialized);
  const clearError = useAppStore((s) => s.clearError);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Event Management</h1>
          <p>Create and manage events across multiple timezones</p>
        </div>
        <ProfileSwitcher />
      </header>

      {error && (
        <div className="banner-error">
          <span>{error}</span>
          <div className="banner-actions">
            <button className="banner-btn" onClick={() => init()} disabled={loading}>
              {loading ? 'Retrying…' : 'Retry'}
            </button>
            <button className="banner-btn banner-btn-ghost" onClick={clearError} aria-label="Dismiss">
              ✕
            </button>
          </div>
        </div>
      )}

      {!initialized && loading ? (
        <div className="app-loading">
          <span className="spinner" aria-hidden="true" />
          <span>Loading…</span>
        </div>
      ) : (
        <main className="app-grid">
          <CreateEventPanel />
          <EventList />
        </main>
      )}
    </div>
  );
}

export default App;
