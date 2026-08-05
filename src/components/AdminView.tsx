import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { User, ActivityEntry } from '../types';
import { ShieldCheck, Activity, Users as UsersIcon, Loader2 } from 'lucide-react';
import { Reveal } from './Reveal';

export const AdminView: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [usersRes, activityRes] = await Promise.all([
      api.getAdminUsers(),
      api.getAdminActivity(),
    ]);
    if (usersRes.success && usersRes.users) setUsers(usersRes.users);
    if (activityRes.success && activityRes.activity) setActivity(activityRes.activity);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleRoleChange = async (userId: string, role: 'member' | 'lead' | 'admin') => {
    setSavingUserId(userId);
    const res = await api.updateUserRole(userId, role);
    if (res.success && res.user) {
      setUsers(users.map(u => u.id === userId ? { ...u, role } : u));
    }
    setSavingUserId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 text-[#622569] dark:text-purple-300 animate-spin" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Reveal>
        <div className="glass-shell">
          <div className="glass-core p-6 sm:p-7">
            <span className="eyebrow bg-[#622569]/10 dark:bg-purple-400/10 text-[#622569] dark:text-purple-300">Restricted Area</span>
            <h1 className="text-2xl font-display font-semibold text-slate-900 dark:text-white mt-2">Admin Panel</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage member roles and review recent chapter activity</p>
          </div>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* User Management */}
        <Reveal delay={60} className="lg:col-span-3">
          <div className="glass-shell h-full">
            <div className="glass-core p-6 h-full">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 flex items-center justify-center bg-[#622569]/10 dark:bg-purple-500/10 text-[#622569] dark:text-purple-300 rounded-xl">
                  <UsersIcon className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <h3 className="text-sm font-display font-semibold text-slate-900 dark:text-white">Members ({users.length})</h3>
              </div>

              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03]">
                    <img
                      src={u.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                      alt={u.username}
                      className="w-9 h-9 rounded-xl object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{u.username}</p>
                        {u.role === 'admin' && <ShieldCheck className="w-3 h-3 text-[#622569] dark:text-purple-300 shrink-0" strokeWidth={1.5} />}
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{u.email}</p>
                    </div>
                    <select
                      value={u.role}
                      disabled={savingUserId === u.id}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as 'member' | 'lead' | 'admin')}
                      className="text-[10px] font-semibold px-2 py-1.5 rounded-full bg-white dark:bg-slate-800 outline-none shrink-0 capitalize disabled:opacity-50"
                    >
                      <option value="member">Member</option>
                      <option value="lead">Lead</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {/* Activity Feed */}
        <Reveal delay={120} className="lg:col-span-2">
          <div className="glass-shell h-full">
            <div className="glass-core p-6 h-full">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 flex items-center justify-center bg-[#622569]/10 dark:bg-purple-500/10 text-[#622569] dark:text-purple-300 rounded-xl">
                  <Activity className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <h3 className="text-sm font-display font-semibold text-slate-900 dark:text-white">Recent Activity</h3>
              </div>

              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {activity.length === 0 && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic">No activity recorded yet.</p>
                )}
                {activity.map((entry) => (
                  <div key={entry.id} className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">{entry.username}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
                        {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                      {entry.action}{entry.detail ? ` — ${entry.detail}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
};
