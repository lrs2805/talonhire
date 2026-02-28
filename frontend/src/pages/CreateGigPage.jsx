
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export default function CreateGigPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', category: 'Development', price: '', unit: 'project', estimated_duration: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.from('gigs').insert({
      ...formData,
      candidate_id: user?.id,
      skills: ['React', 'JavaScript'], // Mock skills
      experience_level: 'Intermediate'
    });

    setLoading(false);
    if (error) {
       toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
       toast({ title: 'Success', description: 'Gig created successfully!' });
       navigate('/candidate/my-gigs');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Create a New Gig</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border p-6 rounded-lg">
        <div>
          <label className="block text-sm font-medium mb-2">Gig Title</label>
          <input required type="text" className="w-full bg-background border border-border rounded p-3 text-foreground" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="I will build a React application..." />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea required rows="5" className="w-full bg-background border border-border rounded p-3 text-foreground" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Describe your service in detail..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Price ($)</label>
            <input required type="number" className="w-full bg-background border border-border rounded p-3 text-foreground" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Unit</label>
            <select className="w-full bg-background border border-border rounded p-3 text-foreground" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}>
              <option value="project">Per Project</option>
              <option value="hour">Per Hour</option>
            </select>
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:bg-primary/90 disabled:opacity-50">
          {loading ? 'Creating...' : 'Publish Gig'}
        </button>
      </form>
    </div>
  );
}
