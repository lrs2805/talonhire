
import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from '@/hooks/use-toast';

export default function ThemeCustomizer() {
  const { theme, setTheme, customColors, setCustomColors } = useTheme();
  
  const defaultColors = {
    'primary': '189 100% 50%',
    'secondary': '152 100% 50%',
    'background': '231 59% 10%',
    'card': '231 40% 12%',
    'foreground': '210 40% 98%'
  };

  const [colors, setColors] = useState(customColors || defaultColors);

  const handleColorChange = (key, value) => {
    const newColors = { ...colors, [key]: value };
    setColors(newColors);
    
    // Live preview
    if (theme === 'custom') {
      document.documentElement.style.setProperty(`--${key}`, value);
    }
  };

  const handleSave = () => {
    setTheme('custom');
    setCustomColors(colors);
    toast({ title: 'Theme Saved', description: 'Your custom theme has been applied.' });
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Appearance Settings</h1>
      <p className="text-muted-foreground mb-8">Customize the look and feel of your workspace.</p>

      <div className="bg-card border border-border p-6 rounded-xl space-y-6">
        <h3 className="text-lg font-bold border-b border-border pb-2">Custom Colors</h3>
        <p className="text-sm text-muted-foreground mb-4">Provide HSL values (e.g., 200 50% 50%) for custom styling.</p>
        
        {Object.entries(colors).map(([key, value]) => (
          <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <label className="capitalize font-medium text-sm w-32">{key}</label>
            <div className="flex-1 flex items-center gap-4">
              <input 
                type="text" 
                value={value} 
                onChange={(e) => handleColorChange(key, e.target.value)}
                className="flex-1 bg-background border border-border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
              />
              <div className="w-8 h-8 rounded border border-border shadow-inner" style={{ backgroundColor: `hsl(${value})` }}></div>
            </div>
          </div>
        ))}

        <div className="pt-6 mt-6 border-t border-border flex justify-end gap-4">
          <button 
            onClick={() => setTheme('dark')} 
            className="px-4 py-2 border border-border rounded text-sm font-medium hover:bg-muted"
          >
            Reset to Default
          </button>
          <button 
            onClick={handleSave} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-bold hover:bg-primary/90"
          >
            Apply Custom Theme
          </button>
        </div>
      </div>
      
      <div className="mt-12 p-6 border border-border rounded-xl">
         <h3 className="text-lg font-bold mb-4">Preview</h3>
         <div className="flex gap-4">
            <div className="bg-primary text-primary-foreground px-4 py-2 rounded">Primary Button</div>
            <div className="bg-secondary text-secondary-foreground px-4 py-2 rounded">Secondary Button</div>
         </div>
      </div>
    </div>
  );
}
