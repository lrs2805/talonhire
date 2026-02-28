
import React from 'react';
import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function GigCard({ gig }) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 group flex flex-col h-full">
      <div className="p-4 flex-1">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${gig.candidate_id || 'default'}`} alt="Candidate avatar" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-semibold text-sm">Candidate Name</p>
            <div className="flex items-center text-yellow-500 text-xs">
              <Star className="w-3 h-3 fill-current" />
              <span className="ml-1 text-muted-foreground">{gig.rating || '4.5'}</span>
            </div>
          </div>
        </div>
        <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {gig.title}
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
          {gig.description}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {(gig.skills || []).slice(0, 3).map(skill => (
            <span key={skill} className="px-2 py-1 bg-muted text-xs rounded-full text-muted-foreground">
              {skill}
            </span>
          ))}
        </div>
      </div>
      <div className="p-4 border-t border-border flex items-center justify-between mt-auto">
        <div>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Starting at</span>
          <p className="font-bold text-lg">${gig.price} <span className="text-sm font-normal text-muted-foreground">/{gig.unit || 'hr'}</span></p>
        </div>
        <Link to={`/marketplace/gig/${gig.id}`} className="px-4 py-2 bg-primary/10 text-primary font-medium rounded hover:bg-primary hover:text-primary-foreground transition-colors text-sm">
          View Details
        </Link>
      </div>
    </div>
  );
}
