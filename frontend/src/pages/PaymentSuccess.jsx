
import React from 'react';
import { Link } from 'react-router-dom';
import Card from '@/components/Card';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccess() {
  return (
    <div className="container mx-auto p-4 md:p-8 flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full text-center space-y-6 py-12">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
        <h1 className="text-3xl font-bold">Payment Successful!</h1>
        <p className="text-muted-foreground">
          Your payment has been processed. The contract has been sent to all parties for signature via DocuSign.
        </p>
        <Link to="/company/dashboard" className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded font-bold hover:bg-primary/90">
          Return to Dashboard
        </Link>
      </Card>
    </div>
  );
}
