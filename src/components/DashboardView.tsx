import React from 'react';
import { User, Event, Project, Announcement } from '../types';
import { Calendar, FolderGit2, Award, ArrowUpRight, Megaphone, CheckCircle2, Sparkles, Clock, Briefcase, BookOpen, Phone, MapPinIcon } from 'lucide-react';
import { Reveal } from './Reveal';

interface DashboardViewProps {
  user: User;
  events: Event[];
  projects: Project[];
  announcements: Announcement[];
  setActiveTab: (tab: string) => void;
  onRegisterEvent: (eventId: string) => void;
  onLikeProject: (projectId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  events,
  projects,
  announcements,
  setActiveTab,
  onRegisterEvent,
  onLikeProject,
}) => {
  const registeredEvents = events.filter(e => e.registeredUserIds.includes(user.id));
  const userProjects = projects.filter(p => p.authorId === user.id);
  const upcomingEvents = events.slice(0, 3);
  const featuredProjects = projects.slice(0, 2);

  const stats = [
    { label: 'Registered Events', value: registeredEvents.length },
    { label: 'Projects Published', value: userProjects.length },
    { label: 'Chapter Points', value: user.points || 100 },
    { label: 'Membership Role', value: user.role, capitalize: true },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <Reveal>
        <div className="glass-shell">
          <div className="glass-core !bg-gradient-to-br !from-[#622569] !to-[#9b51e0] p-8 sm:p-10 text-white">
            <span className="eyebrow bg-white/15 text-purple-100">Chapter Portal</span>
            <h1 className="text-3xl sm:text-4xl font-display font-semibold mt-4 tracking-tight">Welcome back, {user.username}</h1>
            <p className="text-purple-100/80 text-sm mt-2 max-w-xl">
              You are connected as an active member of <strong className="text-white font-medium">{user.institution}</strong>.
            </p>

            <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                onClick={() => setActiveTab('events')}
                className="px-3 py-3 bg-white/10 hover:bg-white/20 text-white font-medium text-xs rounded-2xl flex items-center gap-2 transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
              >
                <Calendar className="w-4 h-4" strokeWidth={1.5} />
                <span>Explore Events</span>
              </button>
              <button
                onClick={() => setActiveTab('projects')}
                className="px-3 py-3 bg-white/10 hover:bg-white/20 text-white font-medium text-xs rounded-2xl flex items-center gap-2 transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
              >
                <FolderGit2 className="w-4 h-4" strokeWidth={1.5} />
                <span>Member Projects</span>
              </button>
              <button
                onClick={() => setActiveTab('opportunities')}
                className="px-3 py-3 bg-white/10 hover:bg-white/20 text-white font-medium text-xs rounded-2xl flex items-center gap-2 transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
              >
                <Briefcase className="w-4 h-4" strokeWidth={1.5} />
                <span>Opportunities</span>
              </button>
              <button
                onClick={() => setActiveTab('resources')}
                className="px-3 py-3 bg-white/10 hover:bg-white/20 text-white font-medium text-xs rounded-2xl flex items-center gap-2 transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
              >
                <BookOpen className="w-4 h-4" strokeWidth={1.5} />
                <span>Learning Hub</span>
              </button>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Stats Bento */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 80}>
            <div className="glass-shell">
              <div className="glass-core p-5">
                <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">{stat.label}</p>
                <p className={`text-2xl font-display font-semibold text-slate-900 dark:text-white mt-1.5 ${stat.capitalize ? 'capitalize' : ''}`}>{stat.value}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Grid Section: Events & Quick Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Upcoming Events Box */}
        <Reveal className="lg:col-span-8">
          <div className="glass-shell h-full">
            <div className="glass-core p-6 space-y-4 h-full">
              <div className="flex items-center justify-between">
                <div>
                  <span className="eyebrow bg-[#622569]/10 dark:bg-purple-400/10 text-[#622569] dark:text-purple-300">Live</span>
                  <h3 className="text-base font-display font-semibold text-slate-900 dark:text-white mt-2">
                    Upcoming Chapter Events
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('events')}
                  className="text-xs font-semibold text-[#622569] dark:text-purple-300 hover:underline flex items-center gap-1 shrink-0"
                >
                  <span>View All ({events.length})</span>
                  <ArrowUpRight className="w-3 h-3" strokeWidth={1.5} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {upcomingEvents.map((evt) => {
                  const isReg = evt.registeredUserIds.includes(user.id);
                  return (
                    <div key={evt.id} className="rounded-2xl overflow-hidden bg-black/[0.02] dark:bg-white/[0.03] flex flex-col justify-between">
                      <div>
                        <div className="h-24 relative overflow-hidden bg-slate-900">
                          <img src={evt.bannerUrl} alt={evt.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <span className="absolute bottom-2 right-2 bg-[#622569] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                            {evt.category}
                          </span>
                        </div>
                        <div className="p-3 space-y-1">
                          <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate">{evt.title}</h4>
                          <span className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                            <Clock className="w-3 h-3 text-purple-500 shrink-0" strokeWidth={1.5} />
                            <span>{evt.date} • {evt.time}</span>
                          </span>
                        </div>
                      </div>

                      <div className="p-3 pt-0">
                        <button
                          onClick={() => onRegisterEvent(evt.id)}
                          className={`w-full py-2 px-2 rounded-xl text-[11px] font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex items-center justify-center gap-1 ${
                            isReg
                              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                              : 'bg-[#622569] hover:bg-[#7a2f83] text-white'
                          }`}
                        >
                          {isReg ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" strokeWidth={1.5} />
                              <span>Registered</span>
                            </>
                          ) : (
                            <span>Register</span>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Reveal>

        {/* Quick Member Card */}
        <Reveal delay={100} className="lg:col-span-4">
          <div className="glass-shell h-full">
            <div className="glass-core p-6 space-y-5 h-full">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                  alt={user.username}
                  className="w-11 h-11 rounded-2xl object-cover bg-slate-100"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm truncate">{user.username}</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{user.email}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 bg-black/[0.02] dark:bg-white/[0.03] p-4 rounded-2xl">
                <p className="flex items-center gap-2">
                  <MapPinIcon className="w-3.5 h-3.5 text-purple-500 shrink-0" strokeWidth={1.5} />
                  <span className="truncate"><strong>City:</strong> {user.city || 'Not specified'}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-purple-500 shrink-0" strokeWidth={1.5} />
                  <span className="truncate"><strong>Phone:</strong> {user.phone || 'Not specified'}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-purple-500 shrink-0" strokeWidth={1.5} />
                  <span className="truncate"><strong>Chapter:</strong> {user.institution}</span>
                </p>
              </div>

              <button
                onClick={() => setActiveTab('profile')}
                className="cta-pill w-full justify-center bg-[#622569] hover:bg-[#7a2f83] text-white group"
              >
                <span>Manage Full Profile</span>
                <span className="cta-icon bg-white/15">
                  <ArrowUpRight className="w-3 h-3" strokeWidth={1.5} />
                </span>
              </button>
            </div>
          </div>
        </Reveal>

        {/* Featured Projects Box */}
        <Reveal delay={160} className="lg:col-span-7">
          <div className="glass-shell h-full">
            <div className="glass-core p-6 space-y-4 h-full">
              <div className="flex items-center justify-between">
                <div>
                  <span className="eyebrow bg-amber-500/10 text-amber-700 dark:text-amber-400">Showcase</span>
                  <h3 className="text-base font-display font-semibold text-slate-900 dark:text-white mt-2">
                    Member Innovation Showcase
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('projects')}
                  className="text-xs font-semibold text-[#622569] dark:text-purple-300 hover:underline flex items-center gap-1 shrink-0"
                >
                  <span>View All ({projects.length})</span>
                  <ArrowUpRight className="w-3 h-3" strokeWidth={1.5} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {featuredProjects.map((proj) => {
                  const isLiked = proj.likedByUserIds.includes(user.id);
                  return (
                    <div key={proj.id} className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-black/[0.04] dark:bg-white/[0.06] px-2 py-0.5 rounded-full">
                            {proj.domain}
                          </span>
                          <button
                            onClick={() => onLikeProject(proj.id)}
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                              isLiked
                                ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300'
                                : 'bg-black/[0.04] dark:bg-white/[0.06] text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            <span>★ {proj.likes}</span>
                          </button>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate">{proj.title}</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">{proj.tagline}</p>
                      </div>

                      <div className="pt-2 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                        <span>By <strong className="text-slate-700 dark:text-slate-300 font-medium">{proj.authorName}</strong></span>
                        <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="text-[#622569] dark:text-purple-300 font-semibold hover:underline">
                          Repository
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Reveal>

        {/* Chapter Announcements Card */}
        <Reveal delay={220} className="lg:col-span-5">
          <div className="glass-shell h-full">
            <div className="glass-core p-6 space-y-3 h-full">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 flex items-center justify-center bg-[#622569]/10 dark:bg-purple-500/10 text-[#622569] dark:text-purple-300 rounded-xl">
                  <Megaphone className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <div>
                  <span className="eyebrow bg-[#622569]/10 dark:bg-purple-400/10 text-[#622569] dark:text-purple-300">Notices</span>
                </div>
              </div>

              <div className="space-y-2">
                {announcements.slice(0, 2).map((ann) => (
                  <div key={ann.id} className="p-3 bg-black/[0.02] dark:bg-white/[0.03] rounded-2xl space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="bg-[#622569]/10 dark:bg-purple-500/10 text-[#622569] dark:text-purple-300 font-semibold px-2 py-0.5 rounded-full">
                        {ann.category}
                      </span>
                      <span className="text-slate-400 dark:text-slate-500">{ann.date}</span>
                    </div>
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate">{ann.title}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">{ann.content}</p>
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
