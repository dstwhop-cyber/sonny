
import React, { useState } from 'react';
import { authService } from '../../services/authService';
import { ViewType } from '../../types';

interface RegisterProps {
  onViewChange: (view: ViewType) => void;
}

const Register: React.FC<RegisterProps> = ({ onViewChange }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    // Corrected to await the async signup call
    const result = await authService.signup(email, password);
    if (result.success) {
      onViewChange(ViewType.DASHBOARD);
    } else {
      setError(result.error || 'Signup failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-xl space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center space-y-2">
          <div className="text-5xl mb-4">✨</div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Create Account</h1>
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

          {error && <p className="text-red-500 text-xs font-bold text-center italic">{error}</p>}

          <button 
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-2xl uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
          >
            Create Profile
          </button>
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
