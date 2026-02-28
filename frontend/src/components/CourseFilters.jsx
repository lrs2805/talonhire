
import React from 'react';

export default function CourseFilters({ onFilterChange }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-6 shadow-sm sticky top-24">
      <h3 className="font-bold text-lg border-b border-border pb-2">Filters</h3>
      
      <div className="space-y-3">
        <label className="text-sm font-semibold text-foreground">Category</label>
        <select 
          onChange={(e) => onFilterChange({ category: e.target.value })}
          className="w-full bg-background border border-border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all"
        >
          <option value="">All Categories</option>
          <option value="development">Development</option>
          <option value="design">Design</option>
          <option value="business">Business</option>
        </select>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-semibold text-foreground">Level</label>
        <div className="space-y-2">
          {['Beginner', 'Intermediate', 'Advanced'].map(level => (
            <label key={level} className="flex items-center gap-2 text-sm cursor-pointer group">
              <input type="checkbox" className="rounded border-border text-primary focus:ring-primary w-4 h-4" />
              <span className="group-hover:text-primary transition-colors">{level}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-semibold text-foreground">Price</label>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer group">
            <input type="radio" name="price" className="border-border text-primary focus:ring-primary w-4 h-4" />
            <span className="group-hover:text-primary transition-colors">Paid</span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer group">
            <input type="radio" name="price" className="border-border text-primary focus:ring-primary w-4 h-4" />
            <span className="group-hover:text-primary transition-colors">Free</span>
          </label>
        </div>
      </div>
    </div>
  );
}
