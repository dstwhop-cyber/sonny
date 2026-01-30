
import React, { useState } from 'react';
import { authService } from '../../services/authService';
import { ViewType } from '../../types';

interface LoginProps {
  onViewChange: (view: ViewType) => void;
}

const Login: React.FC<LoginProps> = ({ onViewChange }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setResendSuccess(false);

    const result = await authService.login(email, password);
    if (result.success) {
      onViewChange(ViewType.DASHBOARD);
    } else {
      setError(result.error || 'Login failed.');
    }
    setIsLoading(false);
  };

  const handleResendEmail = async () => {
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }
    setResending(true);
    const result = await authService.resendConfirmation(email);
    if (result.success) {
      setResendSuccess(true);
      setError('');
    } else {
      setError(result.error || "Failed to resend email.");
    }
    setResending(false);
  };

  const isEmailUnconfirmed = error.toLowerCase().includes('not confirmed') || error.toLowerCase().includes('email_not_confirmed');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-xl space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center space-y-2">
          <img src="/logo.png" alt="Sonny" className="h-16 w-auto mx-auto mb-6 drop-shadow-[0_0_20px_rgba(59,130,246,0.2)]" />
          <h1 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Welcome Back</h1>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">Sign in to your Creator Pro account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
            <input 
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="name@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
            <input 
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 rounded-2xl text-center space-y-3">
              <p className="text-red-600 dark:text-red-400 text-xs font-bold leading-relaxed">{error}</p>
              {isEmailUnconfirmed && (
                <button 
                  type="button"
                  onClick={handleResendEmail}
                  disabled={resending}
                  className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 underline decoration-dotted underline-offset-4 hover:text-blue-500 disabled:opacity-50"
                >
                  {resending ? 'Sending...' : 'Resend Confirmation Link'}
                </button>
              )}
            </div>
          )}

          {resendSuccess && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/40 rounded-2xl text-center">
              <p className="text-green-600 dark:text-green-400 text-xs font-bold">Confirmation email sent! Check your inbox.</p>
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50"
          >
            {isLoading ? 'Verifying...' : 'Authenticate'}
          </button>
        </form>

        <div className="pt-4 text-center">
          <p className="text-slate-500 text-xs font-medium">
            Don't have an account? {' '}
            <button onClick={() => onViewChange(ViewType.REGISTER)} className="text-blue-600 font-bold hover:underline">Sign up free</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
