import React from 'react';
import { Announcement } from '../types';
import { Megaphone, Pin, Calendar, UserCheck } from 'lucide-react';
import { Reveal } from './Reveal';

interface AnnouncementsViewProps {
  announcements: Announcement[];
}

export const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({ announcements }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Reveal>
        <div className="glass-shell">
          <div className="glass-core p-6 sm:p-7 flex items-center gap-4">
            <div className="w-11 h-11 flex items-center justify-center bg-[#622569]/10 dark:bg-purple-500/10 text-[#622569] dark:text-purple-300 rounded-2xl shrink-0">
              <Megaphone className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <span className="eyebrow bg-[#622569]/10 dark:bg-purple-400/10 text-[#622569] dark:text-purple-300">Official Notices</span>
              <h1 className="text-2xl font-display font-semibold text-slate-900 dark:text-white mt-2">
                Chapter Notices & Announcements
              </h1>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="space-y-4">
        {announcements.map((ann, i) => (
          <Reveal key={ann.id} delay={i * 60}>
            <div className="glass-shell">
              <div className="glass-core p-6 sm:p-8 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 dark:border-white/10 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`eyebrow ${
                      ann.category === 'Important' ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300' : 'bg-purple-50 dark:bg-purple-500/10 text-[#622569] dark:text-purple-300'
                    }`}>
                      {ann.category}
                    </span>
                    {ann.pinned && (
                      <span className="eyebrow bg-[#622569] text-white normal-case tracking-normal">
                        <Pin className="w-3 h-3 mr-1" strokeWidth={1.5} /> Pinned
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-xs">
                    <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>{ann.date}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-lg font-display font-semibold text-slate-900 dark:text-white">{ann.title}</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {ann.content}
                  </p>
                </div>

                <div className="pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
                    <span>Issued by <strong>{ann.authorName}</strong> ({ann.authorRole})</span>
                  </span>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
};
