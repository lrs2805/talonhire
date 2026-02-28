
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

export default function CourseSearch({ onSearch }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) onSearch(query);
    }, 400);
    return () => clearTimeout(timer);
  }, [query, onSearch]);

  return (
    <div className="relative w-full max-w-xl">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
      <input 
        type="text" 
        placeholder="Search for courses, skills, or instructors..." 
        className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl shadow-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  );
}
