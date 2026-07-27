import { useEffect, useRef } from 'react';

export function useClickOutside(onOutside) {
  const ref = useRef(null);

  useEffect(() => {
    function handlePointerDown(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        onOutside();
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') onOutside();
    }
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onOutside]);

  return ref;
}
