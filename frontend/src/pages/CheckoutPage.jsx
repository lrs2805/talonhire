
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '@/components/Card';
import { loadStripe } from '@stripe/stripe-js';

// Mock stripe load
const stripePromise = loadStripe('pk_test_mock');

export default function CheckoutPage() {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const [method, setMethod] = useState('stripe');
  const [loading, setLoading] = useState(false);

  const contract = {
    company: "Tech Corp",
    candidate: "Alex Smith",
    jobTitle: "Senior Frontend Engineer",
    salary: "$120,000/yr",
    feeAmount: "$12,000"
  };

  const handleCheckout = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      navigate('/payment/success');
    }, 1500);
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-3xl space-y-8">
      <h1 className="text-3xl font-bold">Checkout</h1>
      
      <Card className="space-y-4">
        <h2 className="text-xl font-semibold">Order Summary</h2>
        <div className="flex justify-between border-b border-border pb-2">
          <span className="text-muted-foreground">Placement Fee for {contract.candidate}</span>
          <span className="font-bold">{contract.feeAmount}</span>
        </div>
        
        <div className="pt-4 space-y-4">
          <h3 className="font-medium">Select Payment Method</h3>
          <div className="flex gap-4">
            {['stripe', 'pix', 'wise'].map(m => (
              <label key={m} className={`flex-1 border rounded p-4 cursor-pointer text-center capitalize transition-colors ${method === m ? 'border-primary bg-primary/10' : 'border-border'}`}>
                <input type="radio" name="method" value={m} checked={method === m} onChange={() => setMethod(m)} className="hidden" />
                {m}
              </label>
            ))}
          </div>
        </div>

        <button 
          onClick={handleCheckout} 
          disabled={loading}
          className="w-full mt-6 bg-primary text-primary-foreground py-3 rounded font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? 'Processing...' : `Pay ${contract.feeAmount}`}
        </button>
      </Card>
    </div>
  );
}
