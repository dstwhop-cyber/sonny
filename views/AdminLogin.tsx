
import React, { useState } from 'react';
import { adminService } from '../services/adminService';

interface AdminLoginProps {
  onSuccess: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminService.login(email, password, secret)) {
      onSuccess();
    } else {
      setError('Invalid owner credentials or unauthorized secret.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-10 shadow-2xl space-y-8">
        <div className="text-center space-y-2">
          <div className="text-5xl mb-4">🔐</div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Owner Access</h1>
          <p className="text-slate-500 text-sm font-medium">Authentication required to access management console.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Owner Email</label>
            <input 
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Owner Password</label>
            <input 
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Owner Secret Key</label>
            <input 
              type="password" value={secret} onChange={e => setSecret(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
              placeholder="••••••••••••"
              required
            />
          </div>

          {error && <p className="text-red-500 text-xs font-bold text-center italic">{error}</p>}

          <button 
            type="submit"
            className="w-full py-4 bg-white text-slate-900 font-black rounded-xl uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-xl"
          >
            Authorize Panel
          </button>
        </form>

        <button 
          onClick={() => window.location.hash = ''}
          className="w-full text-center text-slate-600 text-xs font-bold hover:text-white transition-colors"
        >
          Return to Application
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;
