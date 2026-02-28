
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, PlayCircle, MessageSquare } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function LessonPage() {
  const { courseId, lessonId } = useParams();

  const handleComplete = () => {
    toast({ title: 'Lesson Completed!', description: 'Your progress has been saved.' });
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r border-border bg-card flex flex-col hidden lg:flex">
        <div className="p-4 border-b border-border">
          <Link to={`/academy/course/${courseId}`} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2">
            <ChevronLeft className="w-4 h-4" /> Back to Course
          </Link>
          <h2 className="font-bold line-clamp-2">Advanced React Patterns</h2>
          <div className="w-full bg-muted rounded-full h-1.5 mt-3">
            <div className="bg-primary h-1.5 rounded-full" style={{ width: `25%` }}></div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {/* Mock Module */}
          <div className="font-semibold text-sm mb-2 text-muted-foreground uppercase tracking-wider">Module 1</div>
          <div className="flex items-center gap-3 p-3 bg-primary/10 text-primary rounded-lg cursor-pointer">
            <PlayCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">1. Introduction to Patterns</span>
          </div>
          <div className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg cursor-pointer text-muted-foreground">
            <PlayCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">2. Higher Order Components</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="bg-black aspect-video w-full flex items-center justify-center">
          <p className="text-white/50 flex items-center gap-2"><PlayCircle /> Video Player Placeholder</p>
        </div>
        
        <div className="p-6 md:p-8 max-w-4xl mx-auto w-full space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
            <h1 className="text-2xl md:text-3xl font-bold">1. Introduction to Patterns</h1>
            <div className="flex gap-3">
              <button onClick={() => toast({ title: 'Previous Lesson', description: 'Navigating...' })} className="px-4 py-2 border border-border rounded-lg font-medium hover:bg-muted">Prev</button>
              <button onClick={handleComplete} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 flex items-center gap-2">
                Mark Complete <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Lesson Materials</h3>
            <div className="bg-muted/30 p-4 rounded-lg text-sm text-muted-foreground border border-border">
              <p>Download the starter repository and follow along.</p>
              <button className="mt-3 text-primary font-medium hover:underline">Download Source Code.zip</button>
            </div>
          </div>

          <div className="pt-8 border-t border-border">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><MessageSquare className="w-5 h-5" /> Discussion</h3>
            <div className="bg-card border border-border rounded-lg p-4">
              <textarea placeholder="Ask a question or share a thought..." className="w-full bg-background border border-border rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary focus:outline-none min-h-[100px] mb-3"></textarea>
              <div className="flex justify-end">
                <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90" onClick={() => toast({ title: 'Comment Posted', description: 'Your comment has been added.' })}>Post Comment</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
