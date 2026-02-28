
import React from 'react';

export default function GigFilters({ onApply, onReset }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-6">
      <div>
        <h3 className="font-bold mb-3">Category</h3>
        <select className="w-full bg-background border border-border rounded p-2 text-sm">
          <option>All Categories</option>
          <option>Development</option>
          <option>Design</option>
          <option>Marketing</option>
        </select>
      </div>

      <div>
        <h3 className="font-bold mb-3">Price Range</h3>
        <input type="range" min="0" max="1000" className="w-full" />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>$0</span>
          <span>$1000+</span>
        </div>
      </div>

      <div>
        <h3 className="font-bold mb-3">Experience Level</h3>
        <div className="space-y-2">
          {['Entry', 'Intermediate', 'Expert'].map(level => (
            <label key={level} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" className="rounded border-border text-primary focus:ring-primary" />
              {level}
            </label>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-border flex gap-2">
        <button onClick={onApply} className="flex-1 bg-primary text-primary-foreground py-2 rounded text-sm font-medium hover:bg-primary/90">Apply</button>
        <button onClick={onReset} className="flex-1 bg-muted text-muted-foreground py-2 rounded text-sm font-medium hover:bg-muted/80">Reset</button>
      </div>
    </div>
  );
}
