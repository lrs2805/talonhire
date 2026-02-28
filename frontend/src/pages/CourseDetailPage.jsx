
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { PlayCircle, Clock, Award, CheckCircle2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    // Mock fetch for demonstration
    setTimeout(() => {
      setCourse({
        id: courseId,
        title: 'Advanced React Patterns & Performance',
        description: 'Master React performance optimization, custom hooks, and scalable architecture patterns used by top tech companies.',
        price: 99.00,
        instructor_name: 'Sarah Drasner',
        level: 'Advanced',
        modules: [
          { id: 'm1', title: 'Getting Started', lessons: [{ id: 'l1', title: 'Introduction' }] }
        ]
      });
      setLoading(false);
    }, 500);
  }, [courseId]);

  const handleEnroll = async () => {
    if (!user) {
      toast({ title: 'Authentication Required', description: 'Please login to enroll.', variant: 'destructive' });
      navigate('/auth/login');
      return;
    }
    setEnrolling(true);
    try {
      // Mock enrollment logic
      await supabase.from('course_enrollments').insert({
        course_id: course.id,
        user_id: user.id,
        status: 'active'
      });
      toast({ title: 'Success!', description: 'You have enrolled successfully.' });
      navigate(`/candidate/my-courses`);
    } catch (err) {
      toast({ title: 'Enrollment Failed', description: err.message, variant: 'destructive' });
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <div className="container p-8 text-center animate-pulse">Loading course details...</div>;
  if (!course) return <div className="container p-8 text-center text-red-500">Course not found.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="aspect-video bg-black rounded-xl overflow-hidden relative group cursor-pointer flex items-center justify-center">
             <PlayCircle className="w-20 h-20 text-white/80 group-hover:scale-110 transition-transform z-10" />
             <div className="absolute inset-0 bg-black/40"></div>
             {/* Mock thumbnail */}
             <img src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80" alt="Course Cover" className="absolute inset-0 w-full h-full object-cover opacity-60" />
          </div>
          
          <div>
            <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
            <p className="text-muted-foreground text-lg mb-6">{course.description}</p>
            
            <h2 className="text-xl font-bold mb-4">Course Content</h2>
            <div className="border border-border rounded-xl overflow-hidden">
              {course.modules.map((mod, i) => (
                <div key={mod.id} className="border-b border-border last:border-0">
                  <div className="bg-muted/50 p-4 font-semibold flex justify-between">
                    <span>Module {i + 1}: {mod.title}</span>
                  </div>
                  <div className="p-0">
                    {mod.lessons.map((lesson, j) => (
                      <div key={lesson.id} className="flex items-center gap-3 p-4 hover:bg-muted/30 border-t border-border first:border-0">
                        <PlayCircle className="w-5 h-5 text-muted-foreground" />
                        <span className="text-sm font-medium">{lesson.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-card border border-border rounded-xl p-6 shadow-lg sticky top-24 space-y-6">
            <div className="text-3xl font-bold">${course.price}</div>
            
            <button 
              onClick={handleEnroll}
              disabled={enrolling}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold text-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {enrolling ? 'Processing...' : 'Enroll Now'}
            </button>
            
            <div className="space-y-3 text-sm text-muted-foreground pt-4 border-t border-border">
              <div className="flex items-center gap-3"><Clock className="w-5 h-5" /> 10 hours on-demand video</div>
              <div className="flex items-center gap-3"><Award className="w-5 h-5" /> Certificate of completion</div>
              <div className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5" /> Full lifetime access</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
