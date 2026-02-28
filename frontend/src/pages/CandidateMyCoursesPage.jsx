
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { BookOpen, Award, Clock } from 'lucide-react';

export default function CandidateMyCoursesPage() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    // Mock fetch
    setEnrollments([
      { id: '1', course: { id: 'c1', title: 'Advanced React Patterns', thumbnail_url: null }, progress: 45 },
    ]);
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Learning</h1>
          <p className="text-muted-foreground">Track your progress and access your courses.</p>
        </div>
        <Link to="/academy" className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-medium hover:bg-primary hover:text-primary-foreground transition-colors">
          Explore Courses
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg"><BookOpen className="w-6 h-6" /></div>
          <div><p className="text-2xl font-bold">{enrollments.length}</p><p className="text-muted-foreground text-sm">Active Courses</p></div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-4">
          <div className="p-3 bg-green-500/10 text-green-500 rounded-lg"><Award className="w-6 h-6" /></div>
          <div><p className="text-2xl font-bold">0</p><p className="text-muted-foreground text-sm">Certificates Earned</p></div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-lg"><Clock className="w-6 h-6" /></div>
          <div><p className="text-2xl font-bold">12h</p><p className="text-muted-foreground text-sm">Learning Time</p></div>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-6">In Progress</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrollments.map(enr => (
          <div key={enr.id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-40 bg-muted flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-muted-foreground opacity-50" />
            </div>
            <div className="p-4">
              <h3 className="font-bold mb-4 line-clamp-1">{enr.course.title}</h3>
              <div className="w-full bg-muted rounded-full h-2.5 mb-2">
                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${enr.progress}%` }}></div>
              </div>
              <p className="text-xs text-muted-foreground mb-4">{enr.progress}% Complete</p>
              <Link 
                to={`/academy/course/${enr.course.id}/lesson/start`}
                className="block w-full text-center bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Continue Learning
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
