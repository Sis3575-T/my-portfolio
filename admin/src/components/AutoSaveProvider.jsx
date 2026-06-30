import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

const AutoSaveContext = createContext(null);

export function useAutoSave() {
  const ctx = useContext(AutoSaveContext);
  if (!ctx) throw new Error('useAutoSave must be used within AutoSaveProvider');
  return ctx;
}

export function AutoSaveProvider({ children, onSave, debounceMs = 3000 }) {
  const [status, setStatus] = useState('saved');
  const [lastSaved, setLastSaved] = useState(null);
  const timerRef = useRef(null);
  const dataRef = useRef(null);

  const markDirty = useCallback((data) => {
    dataRef.current = data;
    setStatus('unsaved');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setStatus('saving');
      try {
        await onSave(dataRef.current);
        setStatus('saved');
        setLastSaved(new Date());
      } catch {
        setStatus('error');
      }
    }, debounceMs);
  }, [onSave, debounceMs]);

  const saveNow = useCallback(async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (dataRef.current) {
      setStatus('saving');
      try {
        await onSave(dataRef.current);
        setStatus('saved');
        setLastSaved(new Date());
      } catch {
        setStatus('error');
      }
    }
  }, [onSave]);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  return (
    <AutoSaveContext.Provider value={{ status, lastSaved, markDirty, saveNow }}>
      {children}
    </AutoSaveContext.Provider>
  );
}
