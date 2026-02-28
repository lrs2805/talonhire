
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

export default function GigSearch({ onSearch }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) onSearch(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query, onSearch]);

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Search gigs, skills, or categories..." 
          className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <select className="bg-card border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary text-foreground">
        <option value="newest">Sort by: Newest</option>
        <option value="popular">Sort by: Popular</option>
        <option value="rating">Sort by: Best Rating</option>
      </select>
    </div>
  );
}
