import React from 'react';
import { User, Event, Project, Announcement } from '../types';
import { Calendar, FolderGit2, Award, ArrowUpRight, Megaphone, CheckCircle2, Sparkles, Clock, Briefcase, BookOpen, Phone, MapPinIcon } from 'lucide-react';

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

  return (
    <div className="space-y-10 animate-fadeIn max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#622569] to-[#9b51e0] p-8 text-white shadow-lg">
        <h1 className="text-2xl font-bold font-['Poppins']">Welcome back, {user.username}!</h1>
        <p className="text-purple-100 text-sm mt-2 max-w-xl">
          You are connected as an active member of <strong>{user.institution}</strong>.
        </p>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => setActiveTab('events')}
            className="px-3 py-2.5 bg-white/15 hover:bg-white/25 text-white font-semibold text-xs rounded-xl flex items-center gap-2 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            <span>Explore Events</span>
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className="px-3 py-2.5 bg-white/15 hover:bg-white/25 text-white font-semibold text-xs rounded-xl flex items-center gap-2 transition-colors"
          >
            <FolderGit2 className="w-4 h-4" />
            <span>Member Projects</span>
          </button>
          <button
            onClick={() => setActiveTab('opportunities')}
            className="px-3 py-2.5 bg-white/15 hover:bg-white/25 text-white font-semibold text-xs rounded-xl flex items-center gap-2 transition-colors"
          >
            <Briefcase className="w-4 h-4" />
            <span>Opportunities</span>
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className="px-3 py-2.5 bg-white/15 hover:bg-white/25 text-white font-semibold text-xs rounded-xl flex items-center gap-2 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            <span>Learning Hub</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Registered Events</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{registeredEvents.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Projects Published</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{userProjects.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Chapter Points</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{user.points || 100}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Membership Role</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 capitalize">{user.role}</p>
        </div>
      </div>

      {/* Grid Section: Announcements & Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Cols: Upcoming Events & Projects */}
        <div className="lg:col-span-2 space-y-8">

          {/* Upcoming Events Box */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Poppins']">
                Upcoming Chapter Events
              </h3>
              <button
                onClick={() => setActiveTab('events')}
                className="text-xs font-bold text-[#622569] dark:text-purple-300 hover:underline flex items-center gap-1"
              >
                <span>View All ({events.length})</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {upcomingEvents.map((evt) => {
                const isReg = evt.registeredUserIds.includes(user.id);
                return (
                  <div key={evt.id} className="rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/60 flex flex-col justify-between">
                    <div>
                      <div className="h-24 relative overflow-hidden bg-slate-900">
                        <img src={evt.bannerUrl} alt={evt.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <span className="absolute bottom-2 right-2 bg-[#622569] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {evt.category}
                        </span>
                      </div>
                      <div className="p-3 space-y-1">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{evt.title}</h4>
                        <span className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                          <Clock className="w-3 h-3 text-purple-500 shrink-0" />
                          <span>{evt.date} • {evt.time}</span>
                        </span>
                      </div>
                    </div>

                    <div className="p-3 pt-0">
                      <button
                        onClick={() => onRegisterEvent(evt.id)}
                        className={`w-full py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                          isReg
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-[#622569] hover:bg-[#9b51e0] text-white'
                        }`}
                      >
                        {isReg ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
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

          {/* Featured Projects Box */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Poppins']">
                Member Innovation Showcase
              </h3>
              <button
                onClick={() => setActiveTab('projects')}
                className="text-xs font-bold text-[#622569] dark:text-purple-300 hover:underline flex items-center gap-1"
              >
                <span>View All ({projects.length})</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {featuredProjects.map((proj) => {
                const isLiked = proj.likedByUserIds.includes(user.id);
                return (
                  <div key={proj.id} className="p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/60 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                          {proj.domain}
                        </span>
                        <button
                          onClick={() => onLikeProject(proj.id)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 transition-all ${
                            isLiked
                              ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <span>★ {proj.likes}</span>
                        </button>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{proj.title}</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">{proj.tagline}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                      <span>By <strong className="text-slate-700 dark:text-slate-300 font-medium">{proj.authorName}</strong></span>
                      <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="text-[#622569] dark:text-purple-300 font-bold hover:underline">
                        Repository
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Col: Announcements & Quick Member Profile Summary */}
        <div className="space-y-6">

          {/* Chapter Announcements Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="p-1.5 bg-[#622569]/10 dark:bg-purple-500/10 text-[#622569] dark:text-purple-300 rounded-lg">
                <Megaphone className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase">Official Notices</h3>
            </div>

            <div className="space-y-2">
              {announcements.slice(0, 2).map((ann) => (
                <div key={ann.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="bg-[#622569]/10 dark:bg-purple-500/10 text-[#622569] dark:text-purple-300 font-bold px-2 py-0.5 rounded-full">
                      {ann.category}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500">{ann.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{ann.title}</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Member Card */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                alt={user.username}
                className="w-10 h-10 rounded-xl object-cover bg-slate-100"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate">{user.username}</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{user.email}</p>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <p className="flex items-center gap-1.5">
                <MapPinIcon className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <span className="truncate"><strong>City:</strong> {user.city || 'Not specified'}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <span className="truncate"><strong>Phone:</strong> {user.phone || 'Not specified'}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <span className="truncate"><strong>Chapter:</strong> {user.institution}</span>
              </p>
            </div>

            <button
              onClick={() => setActiveTab('profile')}
              className="w-full py-2.5 bg-[#622569] hover:bg-[#9b51e0] text-white font-bold text-xs rounded-xl transition-all"
            >
              Manage Full Profile
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
