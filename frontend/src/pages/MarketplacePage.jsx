
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import GigCard from '@/components/GigCard';
import GigFilters from '@/components/GigFilters';
import GigSearch from '@/components/GigSearch';

export default function MarketplacePage() {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGigs();
  }, []);

  const fetchGigs = async (searchQuery = '') => {
    setLoading(true);
    let query = supabase.from('gigs').select('*').eq('status', 'active');
    
    if (searchQuery) {
      query = query.ilike('title', `%${searchQuery}%`);
    }

    const { data, error } = await query;
    if (!error && data) {
      setGigs(data);
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Talent Marketplace</h1>
        <p className="text-muted-foreground">Discover top freelance talent for your next project.</p>
      </div>

      <GigSearch onSearch={fetchGigs} />

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <GigFilters onApply={() => fetchGigs()} onReset={() => fetchGigs()} />
        </aside>

        <main className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-64 bg-card rounded-lg animate-pulse border border-border"></div>
              ))}
            </div>
          ) : gigs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gigs.map(gig => (
                <GigCard key={gig.id} gig={gig} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-card rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">No gigs found matching your criteria.</p>
              <button onClick={() => fetchGigs()} className="text-primary hover:underline">Clear filters</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
