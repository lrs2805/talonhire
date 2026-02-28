
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function QuizPage() {
  const { courseId, quizId } = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);

  // Mock quiz data
  const questions = [
    {
      id: 1,
      question: "What is the primary purpose of a Higher Order Component (HOC) in React?",
      options: [
        "To fetch data from an API",
        "To style components using CSS",
        "To reuse component logic across multiple components",
        "To manage global state"
      ],
      correct: 2
    }
  ];

  const handleNext = () => {
    if (selected === null) {
      toast({ title: 'Wait!', description: 'Please select an answer.', variant: 'destructive' });
      return;
    }
    setShowResult(true);
  };

  const handleFinish = () => {
    toast({ title: 'Quiz Completed!', description: 'You scored 100%.' });
  };

  if (showResult) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl text-center space-y-6">
        <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto" />
        <h1 className="text-3xl font-bold">Quiz Passed!</h1>
        <p className="text-muted-foreground text-lg">You scored 100%. Great job mastering these concepts.</p>
        <div className="pt-6">
          <Link to={`/academy/course/${courseId}`} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors">
            Continue Course <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  const q = questions[currentStep];

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-8 flex justify-between items-center text-sm text-muted-foreground font-medium">
        <span>Question {currentStep + 1} of {questions.length}</span>
        <span>Module 1 Quiz</span>
      </div>

      <div className="bg-card border border-border rounded-xl p-8 shadow-sm space-y-8">
        <h2 className="text-2xl font-bold leading-relaxed">{q.question}</h2>
        
        <div className="space-y-3">
          {q.options.map((opt, idx) => (
            <label 
              key={idx} 
              className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${selected === idx ? 'border-primary bg-primary/5 text-primary font-medium' : 'border-border hover:bg-muted/50 text-foreground'}`}
            >
              <input 
                type="radio" 
                name="answer" 
                checked={selected === idx}
                onChange={() => setSelected(idx)}
                className="w-5 h-5 text-primary border-border focus:ring-primary"
              />
              {opt}
            </label>
          ))}
        </div>

        <div className="pt-6 border-t border-border flex justify-end">
          <button 
            onClick={handleNext}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            Submit Answer <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
