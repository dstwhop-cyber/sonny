
import React, { useEffect, useState, useRef } from 'react';
import { usageService } from '../services/usageService';
import { paymentService } from '../services/paymentService';

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

  const handlePaddleUpgrade = (plan: 'pro' | 'agency') => {
    if (!user) {
      alert("Please log in to upgrade.");
      window.dispatchEvent(new CustomEvent('changeView', { detail: 'login' }));
      return;
    }

    const win = window as any;
    if (win.Paddle && win.Paddle.Checkout) {
      win.Paddle.Checkout.open({
        product: plan === 'pro' ? 54321 : 67890,
        email: user.email,
        successCallback: (data: any) => {
          paymentService.handlePaddleWebhook(user.id, 'subscription.created', plan, data.checkout.id);
          alert(`Welcome to ${plan.toUpperCase()}! Your features are now active.`);
          window.dispatchEvent(new CustomEvent('changeView', { detail: 'dashboard' }));
        },
        closeCallback: () => {
          console.log("Checkout closed");
        }
      });
    } else {
      const confirmDemo = confirm(`Card Payment (Paddle) SDK not detected. Simulate success for ${plan.toUpperCase()}?`);
      if (confirmDemo) {
        paymentService.handlePaddleWebhook(user.id, 'subscription.created', plan, `SUB_DEMO_${Date.now()}`);
        alert(`Demo mode: ${plan.toUpperCase()} activated for ${user.email}`);
        window.dispatchEvent(new CustomEvent('changeView', { detail: 'dashboard' }));
      }
    }
  };

  const PayPalButtonContainer: React.FC<{ plan: 'pro' | 'agency' }> = ({ plan }) => {
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
              color: 'gold',
              shape: 'pill',
              label: 'paypal',
              height: 45
            },
            createOrder: (data: any, actions: any) => {
              // Pro plan is $5.00, Agency plan is now $25.00
              return actions.order.create({
                purchase_units: [{
                  description: `${plan.toUpperCase()} Plan Subscription`,
                  amount: {
                    currency_code: 'USD',
                    value: plan === 'pro' ? '5.00' : '25.00'
                  }
                }]
              });
            },
            onApprove: (data: any, actions: any) => {
              return actions.order.capture().then(() => {
                paymentService.handlePaddleWebhook(user!.id, 'subscription.created', plan, data.orderID);
                alert(`PayPal Payment Successful! Welcome to ${plan.toUpperCase()}.`);
                window.dispatchEvent(new CustomEvent('changeView', { detail: 'dashboard' }));
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
    }, [plan]);

    if (sdkStatus === 'loading') {
      return <div className="w-full text-center py-4 text-xs font-bold text-slate-400 animate-pulse">Initializing PayPal Securely...</div>;
    }

    if (sdkStatus === 'error') {
      return (
        <button 
          onClick={() => {
            if (confirm(`PayPal SDK failed to load. Use manual sandbox bypass for ${plan.toUpperCase()}?`)) {
              paymentService.handlePaddleWebhook(user!.id, 'subscription.created', plan, 'MOCK_PAYPAL_ID');
              window.dispatchEvent(new CustomEvent('changeView', { detail: 'dashboard' }));
            }
          }}
          className="w-full mt-4 py-2 border-2 border-dashed border-amber-400 text-amber-600 dark:text-amber-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
        >
          Manual PayPal Activation
        </button>
      );
    }

    return <div ref={btnRef} className="w-full mt-4"></div>;
  };

  return (
    <div className="py-20 px-8 max-w-6xl mx-auto space-y-16 animate-in fade-in duration-500">
       <div className="text-center space-y-4">
          <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">Supercharge Your Growth</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xl max-w-2xl mx-auto font-medium">Unlock unlimited access to the world's most advanced AI content engines.</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Creator Pro Card */}
          <div className="p-10 bg-white dark:bg-slate-900 rounded-[3rem] border-4 border-blue-600 shadow-2xl space-y-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 bg-blue-600 text-white px-6 py-2 rounded-bl-3xl font-black uppercase text-[10px] tracking-widest">Best Value</div>
             <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Creator Pro</h3>
                <div className="flex items-baseline space-x-2">
                   <span className="text-5xl font-black text-slate-900 dark:text-white">$5</span>
                   <span className="text-slate-500 font-bold">/ month</span>
                </div>
             </div>
             <ul className="space-y-4">
                {['Unlimited Viral Captions', '4K Image Generation', 'Native Voice Synthesis', 'Deep Reasoning Models', 'Priority Support'].map((f, i) => (
                   <li key={i} className="flex items-center space-x-3 text-slate-600 dark:text-slate-300 font-bold">
                      <span className="text-blue-500 text-xl">✓</span>
                      <span>{f}</span>
                   </li>
                ))}
             </ul>
             
             <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button 
                  onClick={() => handlePaddleUpgrade('pro')} 
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-2"
                >
                  <span>Pay with Card</span>
                </button>
                
                <div className="flex flex-col items-center">
                   <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2">Secure Alternative</p>
                   {user ? (
                     <PayPalButtonContainer plan="pro" />
                   ) : (
                     <button onClick={() => window.dispatchEvent(new CustomEvent('changeView', { detail: 'login' }))} className="text-xs font-bold text-blue-500 underline">Login to use PayPal</button>
                   )}
                </div>
             </div>
          </div>

          {/* Agency Elite Card */}
          <div className="p-10 bg-slate-50 dark:bg-slate-800/50 rounded-[3rem] border border-slate-200 dark:border-slate-800 space-y-8 transition-colors flex flex-col">
             <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-700 dark:text-slate-200 uppercase tracking-tighter">Agency Elite</h3>
                <div className="flex items-baseline space-x-2">
                   {/* Updated: Reduced monthly payment to $25 */}
                   <span className="text-5xl font-black text-slate-800 dark:text-white">$25</span>
                   <span className="text-slate-500 font-bold">/ month</span>
                </div>
             </div>
             <ul className="space-y-4 flex-1">
                {['5 Team Member Seats', 'Priority API Access', 'Custom Branding Presets', 'Dedicated Account Manager', '24/7 Priority Support'].map((f, i) => (
                   <li key={i} className="flex items-center space-x-3 text-slate-500 dark:text-slate-400 font-bold">
                      <span className="text-slate-400 text-xl">✓</span>
                      <span>{f}</span>
                   </li>
                ))}
             </ul>
             
             <div className="space-y-4 mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
                <button 
                  onClick={() => handlePaddleUpgrade('agency')} 
                  className="w-full py-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-black shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Pay with Card
                </button>
                
                <div className="flex flex-col items-center">
                   <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2">Secure Alternative</p>
                   {user ? (
                     <PayPalButtonContainer plan="agency" />
                   ) : (
                     <button onClick={() => window.dispatchEvent(new CustomEvent('changeView', { detail: 'login' }))} className="text-xs font-bold text-slate-500 underline">Login to use PayPal</button>
                   )}
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

export default Pricing;
