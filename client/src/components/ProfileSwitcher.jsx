import { useState, useMemo, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useClickOutside } from '../utils/useClickOutside';

export default function ProfileSwitcher() {
  const profiles = useAppStore((s) => s.profiles);
  const currentProfileId = useAppStore((s) => s.currentProfileId);
  const setCurrentProfileId = useAppStore((s) => s.setCurrentProfileId);
  const addProfile = useAppStore((s) => s.addProfile);

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  const close = useCallback(() => setOpen(false), []);
  const containerRef = useClickOutside(close);

  const current = profiles.find((p) => p._id === currentProfileId);
  const filtered = useMemo(
    () => profiles.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
    [profiles, search]
  );

  async function handleAdd() {
    if (!newName.trim() || adding) return; // guard against double-add
    setAdding(true);
    setAddError('');
    try {
      const profile = await addProfile(newName.trim());
      setCurrentProfileId(profile._id);
      setNewName('');
    } catch (err) {
      setAddError(err.message);
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="dropdown-wrap" ref={containerRef}>
      <button className="dropdown-trigger" onClick={() => setOpen((o) => !o)}>
        {current ? current.name : 'Select current profile...'} <span>&#x25BE;</span>
      </button>
      {open && (
        <div className="dropdown-panel">
          <input
            className="dropdown-search"
            placeholder="Search current profile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <ul className="dropdown-list">
            {filtered.map((p) => (
              <li
                key={p._id}
                className={p._id === currentProfileId ? 'active' : ''}
                onClick={() => {
                  setCurrentProfileId(p._id);
                  setOpen(false);
                }}
              >
                {p._id === currentProfileId ? '✓ ' : ''}
                {p.name}
              </li>
            ))}
          </ul>
          <div className="dropdown-add">
            <input
              placeholder="New profile name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              disabled={adding}
            />
            <button type="button" onClick={handleAdd} disabled={adding || !newName.trim()}>
              {adding ? '…' : 'Add'}
            </button>
          </div>
          {addError && <p className="form-error dropdown-error">{addError}</p>}
        </div>
      )}
    </div>
  );
}
