
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, DollarSign } from 'lucide-react';

export default function InstructorMyCoursesPage() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    // Mock fetch
    setCourses([
      { id: '1', title: 'Fullstack Next.js', status: 'published', students: 120, revenue: 1199.00 }
    ]);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
          <p className="text-muted-foreground">Manage your courses and view analytics.</p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90">
          Create New Course
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg"><BookOpen className="w-6 h-6" /></div>
          <div><p className="text-2xl font-bold">{courses.length}</p><p className="text-muted-foreground text-sm">Total Courses</p></div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-4">
          <div className="p-3 bg-green-500/10 text-green-500 rounded-lg"><Users className="w-6 h-6" /></div>
          <div><p className="text-2xl font-bold">120</p><p className="text-muted-foreground text-sm">Total Students</p></div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-4">
          <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-lg"><DollarSign className="w-6 h-6" /></div>
          <div><p className="text-2xl font-bold">$1,199</p><p className="text-muted-foreground text-sm">Total Revenue</p></div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-sm">
              <th className="p-4 font-semibold text-muted-foreground">Course Title</th>
              <th className="p-4 font-semibold text-muted-foreground">Status</th>
              <th className="p-4 font-semibold text-muted-foreground">Students</th>
              <th className="p-4 font-semibold text-muted-foreground">Revenue</th>
              <th className="p-4 font-semibold text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map(c => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                <td className="p-4 font-medium">{c.title}</td>
                <td className="p-4"><span className="px-2 py-1 bg-green-500/10 text-green-500 text-xs rounded-full uppercase font-bold">{c.status}</span></td>
                <td className="p-4">{c.students}</td>
                <td className="p-4">${c.revenue}</td>
                <td className="p-4 text-right space-x-3">
                  <button className="text-sm text-primary hover:underline">Edit</button>
                  <button className="text-sm text-muted-foreground hover:underline">Analytics</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
