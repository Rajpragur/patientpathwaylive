import React from 'react';
import { MessageLoading } from './message-loading';

// Fullscreen overlay loader for page transitions
export function PageLoader({ loading }: { loading: boolean }) {
  if (!loading) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md transition-opacity">
      <div className="drop-shadow-2xl">
        <MessageLoading />
      </div>
    </div>
  );
} 