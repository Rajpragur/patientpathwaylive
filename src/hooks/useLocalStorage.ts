import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // Prefix all quiz storage keys
  const storageKey = `quiz_session_${key}`;

  // Get stored value with error handling
  const getStoredValue = (): T => {
    try {
      const item = window.localStorage.getItem(storageKey);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${storageKey}":`, error);
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState<T>(getStoredValue);

  // Update stored value with error handling
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(storageKey, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${storageKey}":`, error);
    }
  };

  // Sync state across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.warn(`Error parsing storage value for ${storageKey}:`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [storageKey]);

  return [storedValue, setValue];
}