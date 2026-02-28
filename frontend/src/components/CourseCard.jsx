
import React from 'react';
import { Star, Clock, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CourseCard({ course }) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col h-full group">
      <div className="aspect-video bg-muted relative overflow-hidden">
        {course.thumbnail_url ? (
          <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
            <BookOpen className="w-12 h-12 opacity-50" />
          </div>
        )}
        <div className="absolute top-2 right-2 bg-background/90 backdrop-blur text-xs px-2 py-1 rounded-full font-medium shadow">
          {course.level || 'All Levels'}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">{course.category || 'Development'}</span>
          <div className="flex items-center text-yellow-500 text-xs font-medium">
            <Star className="w-3 h-3 fill-current mr-1" />
            {course.rating || '4.8'}
          </div>
        </div>
        <h3 className="font-bold text-lg mb-1 line-clamp-2">{course.title}</h3>
        <p className="text-sm text-muted-foreground mb-4">by {course.instructor_name || 'Expert Instructor'}</p>
        
        <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
          <span className="font-bold text-lg text-foreground">
            {course.price > 0 ? `$${course.price}` : 'Free'}
          </span>
          <Link 
            to={`/academy/course/${course.id}`} 
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            View Course
          </Link>
        </div>
      </div>
    </div>
  );
}
