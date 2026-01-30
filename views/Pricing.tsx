
import React, { useEffect, useState, useRef } from 'react';
import { usageService } from '../services/usageService';
import { paymentService } from '../services/paymentService';
import { ViewType } from '../types';

const Pricing: React.FC = () => {
  const user = usageService.getCurrentUser();

  useEffect(() => {
    // Initialize Paddle if the script is loaded
    const win = window as any;
    if (win.Paddle) {
      win.Paddle.Environment.set('sandbox');
      win.Paddle.Setup({ vendor: 12345 });
    }
  }, []);

  const handlePaddleUpgrade = (plan: 'pro' | 'agency', interval: 'month' | 'year') => {
    if (!user) {
      alert("Please log in to upgrade.");
      window.dispatchEvent(new CustomEvent('changeView', { detail: ViewType.LOGIN }));
      return;
    }

    const win = window as any;
    if (win.Paddle && win.Paddle.Checkout) {
      win.Paddle.Checkout.open({
        product: interval === 'month' ? 54321 : 99999,
        email: user.email,
        successCallback: (data: any) => {
          // Both monthly and yearly grant 'pro' status in our internal logic
          paymentService.handlePaddleWebhook(user.id, 'subscription.created', 'pro', data.checkout.id);
          alert(`Welcome to Creator Pro ${interval === 'year' ? 'Yearly' : 'Monthly'}! Your features are now active.`);
          window.dispatchEvent(new CustomEvent('changeView', { detail: ViewType.CAPTION_GEN }));
        },
        closeCallback: () => {
          console.log("Checkout closed");
        }
      });
    } else {
      const confirmDemo = confirm(`Card Payment (Paddle) SDK not detected. Simulate success for Pro ${interval.toUpperCase()}?`);
      if (confirmDemo) {
        paymentService.handlePaddleWebhook(user.id, 'subscription.created', 'pro', `SUB_DEMO_${Date.now()}`);
        alert(`Demo mode: Creator Pro ${interval.toUpperCase()} activated for ${user.email}`);
        window.dispatchEvent(new CustomEvent('changeView', { detail: ViewType.CAPTION_GEN }));
      }
    }
  };

  const PayPalButtonContainer: React.FC<{ plan: 'pro' | 'agency', interval: 'month' | 'year' }> = ({ plan, interval }) => {
    const btnRef = useRef<HTMLDivElement>(null);
    const [sdkStatus, setSdkStatus] = useState<'loading' | 'ready' | 'error'>('loading');

    useEffect(() => {
      let retryCount = 0;
      const maxRetries = 10;

      const initPaypal = () => {
        const win = window as any;
        if (win.paypal && btnRef.current) {
          setSdkStatus('ready');
          btnRef.current.innerHTML = ''; // Clear previous instances
          win.paypal.Buttons({
            style: {
              layout: 'horizontal',
              color: interval === 'year' ? 'blue' : 'gold',
              shape: 'pill',
              label: 'paypal',
              height: 45
            },
            createOrder: (data: any, actions: any) => {
              // Monthly: $5.00 | Yearly: $51.00 (15% off $60)
              const price = interval === 'month' ? '5.00' : '51.00';
              return actions.order.create({
                purchase_units: [{
                  description: `Creator Pro ${interval === 'year' ? 'Yearly' : 'Monthly'} Subscription`,
                  amount: {
                    currency_code: 'USD',
                    value: price
                  }
                }]
              });
            },
            onApprove: (data: any, actions: any) => {
              return actions.order.capture().then(() => {
                paymentService.handlePaddleWebhook(user!.id, 'subscription.created', 'pro', data.orderID);
                alert(`PayPal Payment Successful! Welcome to Creator Pro ${interval.toUpperCase()}.`);
                window.dispatchEvent(new CustomEvent('changeView', { detail: ViewType.CAPTION_GEN }));
              });
            },
            onError: (err: any) => {
              console.error('PayPal Buttons Error', err);
              setSdkStatus('error');
            }
          }).render(btnRef.current);
        } else if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(initPaypal, 1000);
        } else {
          setSdkStatus('error');
        }
      };

      initPaypal();
    }, [interval]);

    if (sdkStatus === 'loading') {
      return <div className="w-full text-center py-4 text-xs font-bold text-slate-400 animate-pulse">Initializing PayPal...</div>;
    }

    if (sdkStatus === 'error') {
      return (
        <button 
          onClick={() => {
            if (confirm(`PayPal SDK failed to load. Use manual bypass for Pro ${interval.toUpperCase()}?`)) {
              paymentService.handlePaddleWebhook(user!.id, 'subscription.created', 'pro', 'MOCK_PAYPAL_ID');
              window.dispatchEvent(new CustomEvent('changeView', { detail: ViewType.CAPTION_GEN }));
            }
          }}
          className="w-full mt-4 py-2 border-2 border-dashed border-amber-400 text-amber-600 dark:text-amber-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
        >
          Manual Activation
        </button>
      );
    }

    return <div ref={btnRef} className="w-full mt-4"></div>;
  };

  return (
    <div className="py-20 px-8 max-w-6xl mx-auto space-y-16 animate-in fade-in duration-500">
       <div className="text-center space-y-4">
          <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">Simple, Professional Pricing</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xl max-w-2xl mx-auto font-medium">Choose the billing cycle that fits your workflow. Save big with yearly access.</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Creator Pro Monthly Card */}
          <div className="p-10 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl space-y-8 relative overflow-hidden transition-all hover:scale-[1.01]">
             <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Pro Monthly</h3>
                <div className="flex items-baseline space-x-2">
                   <span className="text-5xl font-black text-slate-900 dark:text-white">$5</span>
                   <span className="text-slate-500 font-bold">/ month</span>
                </div>
             </div>
             <ul className="space-y-4">
                {['Unlimited Viral Captions', '4K Image Generation', 'Native Voice Synthesis', 'Deep Reasoning Models', 'Cancel Anytime'].map((f, i) => (
                   <li key={i} className="flex items-center space-x-3 text-slate-600 dark:text-slate-300 font-bold">
                      <span className="text-blue-500 text-xl">✓</span>
                      <span>{f}</span>
                   </li>
                ))}
             </ul>
             
             <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button 
                  onClick={() => handlePaddleUpgrade('pro', 'month')} 
                  className="w-full py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-black shadow-xl hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center space-x-2"
                >
                  <span>Get Monthly</span>
                </button>
                
                <div className="flex flex-col items-center">
                   {user ? (
                     <PayPalButtonContainer plan="pro" interval="month" />
                   ) : (
                     <button onClick={() => window.dispatchEvent(new CustomEvent('changeView', { detail: ViewType.LOGIN }))} className="text-xs font-bold text-blue-500 underline mt-4">Login to use PayPal</button>
                   )}
                </div>
             </div>
          </div>

          {/* Creator Pro Yearly Card */}
          <div className="p-10 bg-white dark:bg-slate-900 rounded-[3rem] border-4 border-blue-600 shadow-2xl space-y-8 relative overflow-hidden transition-all hover:scale-[1.01]">
             <div className="absolute top-0 right-0 bg-blue-600 text-white px-6 py-2 rounded-bl-3xl font-black uppercase text-[10px] tracking-widest flex flex-col items-center">
                <span>Best Value</span>
                <span className="text-[12px]">Save 15%</span>
             </div>
             <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Pro Yearly</h3>
                <div className="flex items-baseline space-x-2">
                   <span className="text-5xl font-black text-slate-900 dark:text-white">$51</span>
                   <span className="text-slate-500 font-bold">/ year</span>
                </div>
                <p className="text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest">Equivalent to $4.25/mo</p>
             </div>
             <ul className="space-y-4 flex-1">
                {['EVERYTHING in Monthly', 'Full Year of Uninterrupted Access', 'Priority API Access', 'Exclusive Early Access to Veo 2', 'Priority Human Support'].map((f, i) => (
                   <li key={i} className="flex items-center space-x-3 text-slate-600 dark:text-slate-300 font-bold">
                      <span className="text-blue-600 text-xl">✓</span>
                      <span>{f}</span>
                   </li>
                ))}
             </ul>
             
             <div className="space-y-4 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                <button 
                  onClick={() => handlePaddleUpgrade('pro', 'year')} 
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Get Yearly (Save $9)
                </button>
                
                <div className="flex flex-col items-center">
                   {user ? (
                     <PayPalButtonContainer plan="pro" interval="year" />
                   ) : (
                     <button onClick={() => window.dispatchEvent(new CustomEvent('changeView', { detail: ViewType.LOGIN }))} className="text-xs font-bold text-slate-500 underline mt-4">Login to use PayPal</button>
                   )}
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

export default Pricing;
