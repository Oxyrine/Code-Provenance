import React from 'react';
import { Announcement } from '../types';
import { Megaphone, Pin, Calendar, UserCheck } from 'lucide-react';

interface AnnouncementsViewProps {
  announcements: Announcement[];
}

export const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({ announcements }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="p-3 bg-purple-50 dark:bg-purple-500/10 text-[#622569] dark:text-purple-300 rounded-2xl shrink-0">
          <Megaphone className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-['Poppins']">
            Chapter Notices & Announcements
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Official circulars, competition alerts, and chapter management news
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {announcements.map((ann) => (
          <div
            key={ann.id}
            className={`bg-white dark:bg-slate-900 rounded-3xl border shadow-sm p-6 sm:p-8 space-y-4 relative transition-all ${
              ann.pinned ? 'border-purple-300 dark:border-purple-800 ring-1 ring-purple-100 dark:ring-purple-900/40' : 'border-slate-200/80 dark:border-slate-800'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  ann.category === 'Important' ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300' : 'bg-purple-50 dark:bg-purple-500/10 text-[#622569] dark:text-purple-300'
                }`}>
                  {ann.category}
                </span>
                {ann.pinned && (
                  <span className="text-[10px] font-bold bg-[#622569] text-white px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Pin className="w-3 h-3" /> Pinned
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-xs">
                <Calendar className="w-3.5 h-3.5" />
                <span>{ann.date}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-['Poppins']">{ann.title}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {ann.content}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Issued by <strong>{ann.authorName}</strong> ({ann.authorRole})</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
