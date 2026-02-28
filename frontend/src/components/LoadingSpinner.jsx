
import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
      <p className="text-muted-foreground font-medium animate-pulse">Loading experience...</p>
    </div>
  );
}
