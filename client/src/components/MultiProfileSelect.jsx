import { useState, useMemo, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useClickOutside } from '../utils/useClickOutside';

export default function MultiProfileSelect({ selected, onChange }) {
  const profiles = useAppStore((s) => s.profiles);
  const addProfile = useAppStore((s) => s.addProfile);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  const close = useCallback(() => setOpen(false), []);
  const containerRef = useClickOutside(close);

  const filtered = useMemo(
    () => profiles.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
    [profiles, search]
  );

  function toggle(id) {
    if (selected.includes(id)) onChange(selected.filter((s) => s !== id));
    else onChange([...selected, id]);
  }

  async function handleAdd() {
    if (!newName.trim() || adding) return; // guard against double-add
    setAdding(true);
    setAddError('');
    try {
      const profile = await addProfile(newName.trim());
      onChange([...selected, profile._id]);
      setNewName('');
    } catch (err) {
      setAddError(err.message);
    } finally {
      setAdding(false);
    }
  }

  const label =
    selected.length === 0
      ? 'Select profiles...'
      : selected.length === 1
      ? profiles.find((p) => p._id === selected[0])?.name
      : `${selected.length} profiles selected`;

  return (
    <div className="dropdown-wrap full" ref={containerRef}>
      <button type="button" className="dropdown-trigger full" onClick={() => setOpen((o) => !o)}>
        {label} <span>&#x25BE;</span>
      </button>
      {open && (
        <div className="dropdown-panel full">
          <input
            className="dropdown-search"
            placeholder="Search profiles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <ul className="dropdown-list">
            {filtered.map((p) => (
              <li key={p._id} className={selected.includes(p._id) ? 'active' : ''} onClick={() => toggle(p._id)}>
                {selected.includes(p._id) ? '✓ ' : ''}
                {p.name}
              </li>
            ))}
          </ul>
          <div className="dropdown-add">
            <input
              placeholder="Add Profile"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              disabled={adding}
            />
            <button type="button" onClick={handleAdd} disabled={adding || !newName.trim()}>
              {adding ? '…' : '+ Add'}
            </button>
          </div>
          {addError && <p className="form-error dropdown-error">{addError}</p>}
        </div>
      )}
    </div>
  );
}
