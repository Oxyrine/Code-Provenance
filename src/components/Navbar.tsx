import React, { useState } from 'react';
import { User } from '../types';
import { ShieldCheck, LogOut, Search, X, Bell, Sparkles, User as UserIcon, Moon, Sun, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

interface NotificationItem {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  read: boolean;
  timestamp: string;
}

interface NavbarProps {
  user: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  notifications: NotificationItem[];
  onOpenNotifications: () => void;
}

const baseMobileNavItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'events', label: 'Events & Workshops' },
  { id: 'projects', label: 'Member Projects' },
  { id: 'opportunities', label: 'Opportunities' },
  { id: 'resources', label: 'Learning Resources' },
  { id: 'members', label: 'Member Directory' },
  { id: 'announcements', label: 'Announcements' },
];

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  searchQuery,
  setSearchQuery,
  darkMode,
  onToggleDarkMode,
  notifications,
  onOpenNotifications,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleNotifications = () => {
    setNotifOpen(prev => {
      const next = !prev;
      if (next) onOpenNotifications();
      return next;
    });
  };

  const mobileNavItems = user?.role === 'admin'
    ? [...baseMobileNavItems, { id: 'admin', label: 'Admin Panel' }]
    : baseMobileNavItems;

  const handleNavClick = (tabId: string) => {
    if (tabId === 'profile' && !user) {
      setActiveTab('auth');
    } else {
      setActiveTab(tabId);
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-4 z-30 mx-3 sm:mx-6 lg:mx-8">
        <div className="glass-shell">
          <div className="glass-core px-3 sm:px-5 py-2.5 flex items-center justify-between gap-4">
            {/* Brand & Mobile Title */}
            <div className="flex items-center gap-3">
              {/* Hamburger morph */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="relative w-9 h-9 -ml-1 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-full hover:bg-black/5 dark:hover:bg-white/10 md:hidden transition-colors"
                id="mobile-hamburger-btn"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                <span
                  className={`absolute block w-4 h-[1.5px] bg-current rounded-full transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                    mobileMenuOpen ? 'rotate-45 translate-y-0' : '-translate-y-[3px]'
                  }`}
                />
                <span
                  className={`absolute block w-4 h-[1.5px] bg-current rounded-full transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                    mobileMenuOpen ? '-rotate-45 translate-y-0' : 'translate-y-[3px]'
                  }`}
                />
              </button>

              <div
                onClick={() => handleNavClick('dashboard')}
                className="cursor-pointer flex items-center gap-2.5 group"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#622569] to-[#9b51e0] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
                  <Sparkles className="w-4 h-4 text-purple-200" strokeWidth={1.5} />
                </div>
                <div className="hidden sm:block">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-semibold text-[15px] text-[#622569] dark:text-purple-300 tracking-tight">IET CONNECT</span>
                    <span className="eyebrow bg-[#622569]/10 dark:bg-purple-400/10 text-[#622569] dark:text-purple-300">Portal</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Global Search Bar */}
            <div className="hidden md:flex items-center flex-1 max-w-sm relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 pointer-events-none" strokeWidth={1.5} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search members, projects, events..."
                className="w-full bg-black/[0.03] dark:bg-white/[0.05] text-slate-900 dark:text-slate-100 text-xs pl-9 pr-4 py-2 rounded-full outline-none transition-all focus:bg-black/[0.05] dark:focus:bg-white/[0.08]"
              />
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setMobileSearchOpen((v) => !v)}
                className="w-9 h-9 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-[#622569] dark:hover:text-purple-300 rounded-full hover:bg-black/5 dark:hover:bg-white/10 md:hidden transition-colors"
                aria-label={mobileSearchOpen ? 'Close search' : 'Open search'}
                title="Search"
              >
                {mobileSearchOpen ? <X className="w-4 h-4" strokeWidth={1.5} /> : <Search className="w-4 h-4" strokeWidth={1.5} />}
              </button>

              <button
                onClick={onToggleDarkMode}
                className="w-9 h-9 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-[#622569] dark:hover:text-purple-300 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? <Sun className="w-4 h-4" strokeWidth={1.5} /> : <Moon className="w-4 h-4" strokeWidth={1.5} />}
              </button>

              {user ? (
                <>
                  <div className="relative">
                    <button
                      onClick={toggleNotifications}
                      className="relative w-9 h-9 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-[#622569] dark:hover:text-purple-300 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                      title="Notifications"
                    >
                      <Bell className="w-4 h-4" strokeWidth={1.5} />
                      {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                      )}
                    </button>

                    {notifOpen && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
                        <div className="absolute right-0 top-12 z-40 w-80 glass-shell">
                          <div className="glass-core p-3 max-h-96 overflow-y-auto">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 px-2 pb-2">Notifications</p>
                            {notifications.length === 0 ? (
                              <p className="text-xs text-slate-400 dark:text-slate-500 italic px-2 py-3">No notifications yet.</p>
                            ) : (
                              <div className="space-y-1">
                                {notifications.map((n) => {
                                  const Icon = n.type === 'warning' ? AlertTriangle : n.type === 'success' ? CheckCircle2 : Info;
                                  const iconColor = n.type === 'warning' ? 'text-amber-500' : n.type === 'success' ? 'text-emerald-500' : 'text-purple-500';
                                  return (
                                    <div key={n.id} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03]">
                                      <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${iconColor}`} strokeWidth={1.5} />
                                      <div className="min-w-0">
                                        <p className="text-xs text-slate-700 dark:text-slate-200">{n.message}</p>
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => handleNavClick('profile')}
                    className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-left group"
                  >
                    <img
                      src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                      alt={user.username}
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="hidden sm:block">
                      <div className="flex items-center gap-1">
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-tight">{user.username}</p>
                        {user.role === 'lead' && (
                          <ShieldCheck className="w-3 h-3 text-[#622569] dark:text-purple-300" strokeWidth={1.5} />
                        )}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={onLogout}
                    className="w-9 h-9 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-rose-600 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleNavClick('auth')}
                  className="cta-pill group bg-[#622569] hover:bg-[#7a2f83] text-white"
                >
                  <span className="flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
                    Sign In
                  </span>
                  <span className="cta-icon bg-white/15">
                    <Sparkles className="w-3 h-3" strokeWidth={1.5} />
                  </span>
                </button>
              )}
            </div>
          </div>

          {mobileSearchOpen && (
            <div className="md:hidden px-3 sm:px-5 pb-3 pt-1">
              <div className="flex items-center relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 pointer-events-none" strokeWidth={1.5} />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search members, projects, events..."
                  className="w-full bg-black/[0.03] dark:bg-white/[0.05] text-slate-900 dark:text-slate-100 text-xs pl-9 pr-4 py-2.5 rounded-full outline-none transition-all focus:bg-black/[0.05] dark:focus:bg-white/[0.08]"
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto backdrop-blur-2xl bg-white/80 dark:bg-black/80' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div className="h-full flex flex-col justify-between p-8 pt-28" onClick={(e) => e.stopPropagation()}>
          <nav className="space-y-1">
            {mobileNavItems.map((item, i) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                style={{ transitionDelay: mobileMenuOpen ? `${100 + i * 60}ms` : '0ms' }}
                className={`block w-full text-left px-2 py-3 text-2xl font-display font-medium transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                } ${
                  activeTab === item.id
                    ? 'text-[#622569] dark:text-purple-300'
                    : 'text-slate-800 dark:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div
            style={{ transitionDelay: mobileMenuOpen ? '520ms' : '0ms' }}
            className={`transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            {user ? (
              <button
                onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                className="cta-pill bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300"
              >
                <span>Log Out</span>
                <span className="cta-icon bg-rose-100 dark:bg-rose-900/40">
                  <LogOut className="w-3 h-3" strokeWidth={1.5} />
                </span>
              </button>
            ) : (
              <button
                onClick={() => handleNavClick('auth')}
                className="cta-pill bg-[#622569] text-white"
              >
                <span>Access Portal</span>
                <span className="cta-icon bg-white/15">
                  <UserIcon className="w-3 h-3" strokeWidth={1.5} />
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
