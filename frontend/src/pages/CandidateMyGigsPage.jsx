
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import GigCard from '@/components/GigCard';
import { PlusCircle } from 'lucide-react';

export default function CandidateMyGigsPage() {
  const { user } = useAuth();
  const [gigs, setGigs] = useState([]);

  useEffect(() => {
    if (user) {
      supabase.from('gigs').select('*').eq('candidate_id', user.id).then(({ data }) => setGigs(data || []));
    }
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Gigs</h1>
          <p className="text-muted-foreground">Manage your freelance offerings.</p>
        </div>
        <Link to="/marketplace/create-gig" className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90">
          <PlusCircle className="w-5 h-5" />
          Create New Gig
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <p className="text-muted-foreground text-sm uppercase tracking-wider mb-2">Total Earnings</p>
          <p className="text-3xl font-bold text-green-500">$1,250</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <p className="text-muted-foreground text-sm uppercase tracking-wider mb-2">Active Gigs</p>
          <p className="text-3xl font-bold">{gigs.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <p className="text-muted-foreground text-sm uppercase tracking-wider mb-2">Average Rating</p>
          <p className="text-3xl font-bold text-yellow-500">4.9</p>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-6">Your Listings</h2>
      {gigs.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-lg">
          <p className="text-muted-foreground mb-4">You haven't created any gigs yet.</p>
          <Link to="/marketplace/create-gig" className="text-primary hover:underline font-medium">Create your first gig</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gigs.map(gig => (
            <div key={gig.id} className="relative">
              <GigCard gig={gig} />
              <div className="absolute top-2 right-2 bg-background/90 backdrop-blur text-xs px-2 py-1 rounded shadow">
                Status: {gig.status}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
