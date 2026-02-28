
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { Star, Clock, Briefcase, MessageSquare } from 'lucide-react';

export default function GigDetailPage() {
  const { gigId } = useParams();
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGig = async () => {
      const { data } = await supabase.from('gigs').select('*').eq('id', gigId).single();
      if (data) setGig(data);
      setLoading(false);
    };
    fetchGig();
  }, [gigId]);

  if (loading) return <div className="container mx-auto p-8 animate-pulse">Loading...</div>;
  if (!gig) return <div className="container mx-auto p-8">Gig not found.</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-4">{gig.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground border-b border-border pb-4">
              <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500 fill-current" /> 4.9 (120 reviews)</span>
              <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {gig.category || 'Development'}</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {gig.estimated_duration || '2 weeks'}</span>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">About This Gig</h2>
            <div className="prose prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
              {gig.description || 'No description provided.'}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">Skills & Expertise</h2>
            <div className="flex flex-wrap gap-2">
              {(gig.skills || ['React', 'Node.js', 'Tailwind']).map(skill => (
                <span key={skill} className="px-3 py-1 bg-muted rounded-full text-sm">{skill}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
            <h3 className="text-2xl font-bold mb-2">${gig.price} <span className="text-base font-normal text-muted-foreground">/{gig.unit || 'project'}</span></h3>
            <p className="text-sm text-muted-foreground mb-6">Standard package including full source code and 2 revisions.</p>
            
            <Link to={`/marketplace/checkout/${gig.id}`} className="block w-full bg-primary text-primary-foreground text-center py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors mb-3">
              Hire Now
            </Link>
            
            <button className="w-full flex items-center justify-center gap-2 bg-muted text-foreground py-3 rounded-lg font-medium hover:bg-muted/80 transition-colors">
              <MessageSquare className="w-4 h-4" />
              Contact Candidate
            </button>
            
            <div className="mt-6 pt-6 border-t border-border flex items-center gap-4">
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${gig.candidate_id || 'dev'}`} alt="Avatar" className="w-12 h-12 rounded-full bg-muted" />
               <div>
                 <p className="font-bold">Alex Developer</p>
                 <p className="text-xs text-muted-foreground">Level 2 Seller • Online</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
