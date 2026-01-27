
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const result = authService.login(email, password);
    if (result.success) {
      onViewChange(ViewType.DASHBOARD);
    } else {
      setError(result.error || 'Login failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-xl space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center space-y-2">
          <div className="text-5xl mb-4">🚀</div>
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

          {error && <p className="text-red-500 text-xs font-bold text-center italic">{error}</p>}

          <button 
            type="submit"
            className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
          >
            Authenticate
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
