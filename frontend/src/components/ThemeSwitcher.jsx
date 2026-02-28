
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Palette } from 'lucide-react';

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { id: 'light', name: 'Light' },
    { id: 'dark', name: 'Dark' },
    { id: 'neon', name: 'Neon' },
    { id: 'minimal', name: 'Minimal' }
  ];

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 p-2 rounded hover:bg-muted transition-colors">
        <Palette className="w-4 h-4" />
      </button>
      <div className="absolute right-0 top-full mt-2 w-32 bg-card border border-border rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 py-1">
        {themes.map(t => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={`block w-full text-left px-4 py-2 text-sm hover:bg-muted ${theme === t.id ? 'text-primary font-bold bg-primary/10' : ''}`}
          >
            {t.name}
          </button>
        ))}
        <button onClick={() => window.location.href = '/settings/appearance'} className="block w-full text-left px-4 py-2 text-sm hover:bg-muted border-t border-border mt-1 pt-2">
          Custom...
        </button>
      </div>
    </div>
  );
}
