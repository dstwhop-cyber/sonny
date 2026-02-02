
import React, { useState } from 'react';
import { authService } from '../../services/authService';
import { ViewType } from '../../types';

interface RegisterProps {
  onViewChange: (view: ViewType) => void;
}

const SonnyLogoLarge = () => (
  <svg viewBox="0 0 100 100" className="h-20 w-20 mx-auto mb-6" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logoGradReg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#6366f1" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="30" fill="url(#logoGradReg)" />
    <text 
      x="50%" 
      y="68%" 
      textAnchor="middle" 
      fill="white" 
      fontSize="54" 
      fontWeight="900" 
      fontFamily="Inter, sans-serif"
      style={{ letterSpacing: '-0.05em' }}
    >
      S
    </text>
    <circle cx="78" cy="22" r="5" fill="#fbbf24" className="animate-ping" />
  </svg>
);

const Register: React.FC<RegisterProps> = ({ onViewChange }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    
    setIsLoading(true);
    const result = await authService.signup(email, password);
    if (result.success) {
      setIsSuccess(true);
    } else {
      setError(result.error || 'Signup failed.');
    }
    setIsLoading(false);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-xl space-y-8 text-center animate-in fade-in zoom-in-95 duration-500">
          <SonnyLogoLarge />
          <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Check your email</h2>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            We've sent a verification link to <span className="text-blue-600 font-bold">{email}</span>. 
            Please click it to activate your account.
          </p>
          <div className="pt-6 space-y-4">
            <button 
              onClick={() => onViewChange(ViewType.LOGIN)}
              className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
            >
              Back to Login
            </button>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
              Don't see it? Check your spam folder.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-xl space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center space-y-2">
          <SonnyLogoLarge />
          <h1 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">Create Account</h1>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">Start your viral content journey</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
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
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Secure Password</label>
            <input 
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Min. 8 characters"
              required
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 rounded-2xl">
              <p className="text-red-500 text-xs font-bold text-center italic">{error}</p>
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-2xl uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50"
          >
            {isLoading ? 'Creating Account...' : 'Create Profile'}
          </button>
          
          <p className="text-[10px] text-slate-400 text-center font-medium leading-relaxed px-4">
            By clicking Create Profile, you agree to our{' '}
            <button type="button" onClick={() => onViewChange(ViewType.TERMS)} className="text-blue-500 font-bold hover:underline">Terms of Service</button>
            {' '}and{' '}
            <button type="button" onClick={() => onViewChange(ViewType.PRIVACY)} className="text-blue-500 font-bold hover:underline">Privacy Policy</button>.
          </p>
        </form>

        <div className="pt-4 text-center">
          <p className="text-slate-500 text-xs font-medium">
            Already have an account? {' '}
            <button onClick={() => onViewChange(ViewType.LOGIN)} className="text-blue-600 font-bold hover:underline">Log in</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
