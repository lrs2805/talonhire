
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useUserTypeColor } from '@/hooks/useUserTypeColor';
import VideoUploader from '@/components/VideoUploader';
import Card from '@/components/Card';

export default function CandidateInterviewPage() {
  const { jobId } = useParams();
  const { textClass } = useUserTypeColor();
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    // Mock fetching questions
    setQuestions([
      "Can you describe your experience with React and Node.js?",
      "How do you handle performance optimization in a frontend application?",
      "Why are you interested in joining our company?"
    ]);
  }, [jobId]);

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 max-w-4xl">
      <h1 className={`text-3xl font-bold ${textClass}`}>Video Interview</h1>
      
      <Card>
        <h2 className={`text-xl font-bold mb-4 ${textClass}`}>Interview Questions</h2>
        <ul className="space-y-4 list-decimal list-inside text-muted-foreground">
          {questions.map((q, idx) => (
            <li key={idx} className="p-2 bg-input/50 rounded">{q}</li>
          ))}
        </ul>
      </Card>

      <div className="space-y-4">
        <h2 className={`text-xl font-bold ${textClass}`}>Record & Upload Your Answers</h2>
        <p className="text-muted-foreground">Please record a single video answering all the questions above, and upload it here.</p>
        <VideoUploader jobId={jobId} onUploadComplete={(path) => alert(`Uploaded to ${path}`)} />
      </div>
    </div>
  );
}
