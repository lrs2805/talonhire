
import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-card border border-border p-4 rounded-lg shadow-xl z-50 flex items-center gap-4 max-w-sm animate-in fade-in slide-in-from-bottom-5">
      <div>
        <p className="font-bold text-sm">Install TalonHire App</p>
        <p className="text-xs text-muted-foreground">Get faster access and offline support.</p>
      </div>
      <button onClick={handleInstallClick} className="bg-primary text-primary-foreground p-2 rounded-full hover:bg-primary/90">
        <Download className="w-4 h-4" />
      </button>
    </div>
  );
}
