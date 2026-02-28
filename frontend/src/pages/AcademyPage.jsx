
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import CourseCard from '@/components/CourseCard';
import CourseFilters from '@/components/CourseFilters';
import CourseSearch from '@/components/CourseSearch';
import { GraduationCap } from 'lucide-react';

export default function AcademyPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async (searchQuery = '') => {
    setLoading(true);
    let query = supabase.from('courses').select('*').eq('status', 'published');
    
    if (searchQuery) {
      query = query.ilike('title', `%${searchQuery}%`);
    }

    const { data, error } = await query;
    if (!error && data) {
      setCourses(data);
    } else {
      // Fallback mock data if table empty/error
      setCourses([
        { id: '1', title: 'Advanced React Patterns', price: 49.99, level: 'Advanced', category: 'Development' },
        { id: '2', title: 'UI/UX Fundamentals', price: 0, level: 'Beginner', category: 'Design' },
      ]);
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <GraduationCap className="w-10 h-10 text-primary" />
            Academy
          </h1>
          <p className="text-muted-foreground text-lg">Upskill and advance your career with expert-led courses.</p>
        </div>
        <CourseSearch onSearch={fetchCourses} />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-64 shrink-0">
          <CourseFilters onFilterChange={() => fetchCourses()} />
        </aside>

        <main className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-72 bg-card rounded-xl animate-pulse border border-border"></div>
              ))}
            </div>
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {courses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-card rounded-xl border border-border shadow-sm">
              <GraduationCap className="w-16 h-16 mx-auto text-muted-foreground opacity-50 mb-4" />
              <h3 className="text-xl font-bold mb-2">No courses found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your search or filters.</p>
              <button onClick={() => fetchCourses()} className="text-primary hover:underline font-medium">Clear all filters</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
