import React from 'react';
import { LayoutDashboard, Calendar, FolderGit2, Users, User, Megaphone, LogOut, Award, Briefcase, BookOpen } from 'lucide-react';
import { User as UserType } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserType | null;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  user,
  onLogout,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'events', label: 'Events & Workshops', icon: Calendar },
    { id: 'projects', label: 'Member Projects', icon: FolderGit2 },
    { id: 'opportunities', label: 'Opportunities', icon: Briefcase },
    { id: 'resources', label: 'Learning Resources', icon: BookOpen },
    { id: 'members', label: 'Member Directory', icon: Users },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  return (
    <aside className="hidden md:block w-72 shrink-0 pl-3 lg:pl-8 py-4">
      <div className="sticky top-24 glass-shell">
        <div className="glass-core !bg-gradient-to-b !from-[#622569] !to-[#4a1b50] text-white flex flex-col justify-between max-h-[calc(100dvh-7rem)]">
          <div className="p-4 space-y-6 overflow-y-auto">
            {/* Chapter Info Badge */}
            <div className="bg-white/10 rounded-2xl p-3.5 border border-white/10">
              <div className="flex items-center gap-2 text-purple-200 text-xs font-medium mb-1">
                <Award className="w-3.5 h-3.5 text-amber-300" strokeWidth={1.5} />
                <span>IET Student Chapter</span>
              </div>
              <p className="text-sm font-semibold text-white truncate">
                {user ? user.institution : 'Connect & Collaborate'}
              </p>
              {user && (
                <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-xs text-purple-200">
                  <span>Points: <strong className="text-white font-bold">{user.points || 100}</strong></span>
                  <span className="eyebrow bg-white/15 text-white normal-case tracking-normal capitalize">{user.role}</span>
                </div>
              )}
            </div>

            {/* Navigation Items */}
            <nav className="space-y-1">
              <p className="px-3 text-[10px] font-semibold text-purple-200/60 uppercase tracking-[0.15em] mb-2">Main Navigation</p>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] text-left ${
                      isActive
                        ? 'bg-white text-[#622569] font-semibold shadow-md shadow-black/10'
                        : 'text-purple-100 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#622569]' : 'text-purple-200'}`} strokeWidth={1.5} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Footer / Logout */}
          <div className="p-4 border-t border-white/10">
            {user ? (
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-rose-500/20 text-rose-200 hover:text-rose-100 border border-white/10 text-xs font-semibold transition-all"
              >
                <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Sign Out Account</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('auth')}
                className="w-full py-2.5 rounded-xl bg-white text-[#622569] font-bold text-xs hover:bg-purple-50 transition-colors shadow"
              >
                Sign In to Portal
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
