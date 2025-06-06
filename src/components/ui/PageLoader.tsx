import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageLoading } from './message-loading';

// Fullscreen overlay loader for page transitions
export function PageLoader() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLoading(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    // Show loader for at least 1.2 seconds
    timeoutRef.current = setTimeout(() => setLoading(false), 1200);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [location]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md transition-opacity">
      <div className="drop-shadow-2xl">
        <MessageLoading />
      </div>
    </div>
  );
} 