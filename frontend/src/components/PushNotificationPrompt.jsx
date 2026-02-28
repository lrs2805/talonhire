
import React, { useState, useEffect } from 'react';
import { BellRing } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export default function PushNotificationPrompt() {
  const { user } = useAuth();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (user && 'Notification' in window && Notification.permission === 'default') {
      const timer = setTimeout(() => setShowPrompt(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const subscribeToPush = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        // Mock VAPID key for environment compatibility
        const publicVapidKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'; 
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: publicVapidKey
        });

        await supabase.from('user_push_subscriptions').insert({
          user_id: user.id,
          endpoint: subscription.endpoint,
          p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')))),
          auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth'))))
        });
        
        toast({ title: "Notifications Enabled", description: "You will now receive updates." });
      }
    } catch (error) {
      console.error('Error subscribing to push:', error);
    } finally {
      setShowPrompt(false);
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed top-20 right-4 bg-card border border-border p-4 rounded-lg shadow-xl z-50 flex items-start gap-4 max-w-sm animate-in fade-in slide-in-from-right-5">
      <div className="bg-primary/10 p-2 rounded-full text-primary shrink-0">
        <BellRing className="w-5 h-5" />
      </div>
      <div>
        <p className="font-bold text-sm mb-1">Enable Notifications</p>
        <p className="text-xs text-muted-foreground mb-3">Get instantly notified about new matches, messages, and course updates.</p>
        <div className="flex gap-2">
          <button onClick={subscribeToPush} className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded font-medium">Enable</button>
          <button onClick={() => setShowPrompt(false)} className="text-xs bg-muted text-muted-foreground px-3 py-1.5 rounded font-medium">Maybe Later</button>
        </div>
      </div>
    </div>
  );
}
