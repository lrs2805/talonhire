
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '@/components/Card';
import { XCircle } from 'lucide-react';

export default function PaymentFailed() {
  const navigate = useNavigate();
  return (
    <div className="container mx-auto p-4 md:p-8 flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full text-center space-y-6 py-12">
        <XCircle className="w-16 h-16 text-red-500 mx-auto" />
        <h1 className="text-3xl font-bold">Payment Failed</h1>
        <p className="text-muted-foreground">
          Unfortunately, your payment could not be processed at this time. Please try again.
        </p>
        <div className="flex justify-center gap-4">
          <button onClick={() => navigate(-1)} className="bg-primary text-primary-foreground px-6 py-2 rounded font-bold hover:bg-primary/90">
            Try Again
          </button>
          <Link to="/company/dashboard" className="px-6 py-2 border border-border rounded font-bold hover:bg-muted">
            Dashboard
          </Link>
        </div>
      </Card>
    </div>
  );
}
