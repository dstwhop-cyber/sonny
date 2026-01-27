
import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { userRegistryService } from '../services/userRegistryService';
import { UserProfile, SystemLog, GlobalConfig } from '../types';

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [config, setConfig] = useState<GlobalConfig>(adminService.getConfig());

  useEffect(() => {
    setUsers(userRegistryService.getUsers());
    setLogs(userRegistryService.getLogs());
  }, []);

  const toggleFeature = (feature: keyof GlobalConfig['featuresEnabled']) => {
    const newConfig = { ...config };
    newConfig.featuresEnabled[feature] = !newConfig.featuresEnabled[feature];
    adminService.updateConfig(newConfig);
    setConfig(newConfig);
  };

  const overridePlan = (userId: string, plan: UserProfile['plan']) => {
    userRegistryService.updateUserStatus(userId, { plan });
    setUsers(userRegistryService.getUsers());
  };

  const toggleBan = (userId: string, isBanned: boolean) => {
    userRegistryService.updateUserStatus(userId, { isBanned: !isBanned });
    setUsers(userRegistryService.getUsers());
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Owner Console</h2>
          <p className="text-slate-500 font-medium tracking-tight uppercase text-xs">Full System Oversight & Control</p>
        </div>
        <button 
          onClick={() => { adminService.logout(); window.location.hash = ''; }}
          className="px-6 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-black text-xs uppercase"
        >
          Terminate Session
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Global Controls */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">System Killswitches</h3>
          <div className="space-y-3">
            {(Object.keys(config.featuresEnabled) as Array<keyof GlobalConfig['featuresEnabled']>).map(f => (
              <div key={f} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <span className="text-xs font-bold uppercase tracking-tight text-slate-600 dark:text-slate-300">
                  {f === 'text' ? 'Gemini Text (Chat)' : f === 'media' ? 'Veo Media (Video/Img)' : 'TTS Voice'}
                </span>
                <button 
                  onClick={() => toggleFeature(f)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${config.featuresEnabled[f] ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
                >
                  {config.featuresEnabled[f] ? 'Active' : 'Disabled'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* User Stats */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">User Registry ({users.length})</h3>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-4">User</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Usage</th>
                  <th className="px-8 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map(u => (
                  <tr key={u.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${u.isBanned ? 'opacity-40' : ''}`}>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold dark:text-white">{u.email}</span>
                        <span className="text-[10px] text-slate-500">{u.id} • Joined {u.createdAt}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <select 
                        value={u.plan} 
                        onChange={(e) => overridePlan(u.id, e.target.value as any)}
                        className="bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase px-2 py-1 rounded-md outline-none"
                      >
                        <option value="free">Free</option>
                        <option value="pro">Pro</option>
                        <option value="agency">Agency</option>
                      </select>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-[10px] font-mono text-slate-500">
                        TX:{u.usage.textCount} | MD:{u.usage.proCount}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <button 
                        onClick={() => toggleBan(u.id, u.isBanned)}
                        className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded border transition-all ${u.isBanned ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500'}`}
                      >
                        {u.isBanned ? 'Pardon' : 'Terminate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-[2.5rem] p-10 border border-slate-800 shadow-xl space-y-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">System Audit Logs</h3>
        <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-hide pr-2">
          {logs.map((log, i) => (
            <div key={i} className="flex items-start space-x-4 p-4 bg-slate-800/30 rounded-2xl border border-slate-800/50">
              <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${log.level === 'error' ? 'bg-red-500 text-white' : log.level === 'warning' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'}`}>
                {log.level}
              </span>
              <div className="flex-1 space-y-1">
                <p className="text-xs text-slate-300 font-medium leading-relaxed">{log.message}</p>
                {log.userId && <p className="text-[9px] text-slate-600 font-mono">Actor ID: {log.userId}</p>}
              </div>
              <span className="text-[10px] text-slate-600 font-mono italic">{log.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
