
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/hooks/use-toast';

export default function GigCheckoutPage() {
  const { gigId } = useParams();
  const navigate = useNavigate();
  const [gig, setGig] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    supabase.from('gigs').select('*').eq('id', gigId).single().then(({ data }) => setGig(data));
  }, [gigId]);

  if (!gig) return <div className="p-8 text-center">Loading order details...</div>;

  const commission = gig.price * 0.15;
  const total = parseFloat(gig.price) + commission;

  const handlePayment = async () => {
    setProcessing(true);
    // Mock processing delay
    setTimeout(async () => {
      await supabase.from('gig_orders').insert({
        gig_id: gig.id,
        amount: gig.price,
        commission: commission,
        total: total,
        status: 'pending_payment'
      });
      toast({ title: 'Order Placed!', description: 'Redirecting to payment gateway...' });
      setProcessing(false);
      navigate('/marketplace');
    }, 1500);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <div className="bg-card border border-border rounded-lg p-6 space-y-6 shadow-xl">
        <h1 className="text-2xl font-bold text-center border-b border-border pb-4">Checkout</h1>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Gig</p>
            <p className="font-medium">{gig.title}</p>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${gig.price}</span>
          </div>
          <div className="flex justify-between text-sm border-b border-border pb-4">
            <span className="text-muted-foreground">Service Fee (15%)</span>
            <span>${commission.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-2">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <button 
          onClick={handlePayment} 
          disabled={processing}
          className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 mt-4"
        >
          {processing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
        </button>
      </div>
    </div>
  );
}
