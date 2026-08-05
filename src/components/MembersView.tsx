import React, { useState } from 'react';
import { User } from '../types';
import { MapPin, Mail, Github, Linkedin, ShieldCheck } from 'lucide-react';
import { Reveal } from './Reveal';

interface MembersViewProps {
  members: User[];
  searchQuery: string;
  user: User | null;
}

export const MembersView: React.FC<MembersViewProps> = ({ members, searchQuery }) => {
  const [selectedCity, setSelectedCity] = useState<string>('All');

  const cities = ['All', ...Array.from(new Set(members.map(m => m.city).filter(Boolean)))];

  const filteredMembers = members.filter((m) => {
    const matchesCity = selectedCity === 'All' || m.city === selectedCity;
    const matchesSearch =
      !searchQuery ||
      m.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.skills && m.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCity && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Reveal>
        <div className="glass-shell">
          <div className="glass-core p-6 sm:p-7">
            <span className="eyebrow bg-[#622569]/10 dark:bg-purple-400/10 text-[#622569] dark:text-purple-300">Chapter Registry</span>
            <h1 className="text-2xl font-display font-semibold text-slate-900 dark:text-white mt-2">Member Directory</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Connect with student engineers, researchers, and chapter leads</p>
          </div>
        </div>
      </Reveal>

      {/* City Filters */}
      {cities.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                selectedCity === city
                  ? 'bg-purple-100 dark:bg-purple-500/10 text-[#622569] dark:text-purple-300'
                  : 'bg-black/[0.03] dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 hover:bg-black/[0.06] dark:hover:bg-white/[0.08]'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      )}

      {/* Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMembers.map((member, i) => (
          <Reveal key={member.id} delay={(i % 9) * 50}>
            <div className="glass-shell h-full">
              <div className="glass-core p-5 flex flex-col justify-between h-full">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <img
                      src={member.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                      alt={member.username}
                      className="w-12 h-12 rounded-2xl object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />

                    {member.role === 'lead' && (
                      <span className="eyebrow bg-purple-100 dark:bg-purple-500/10 text-[#622569] dark:text-purple-300 normal-case tracking-normal">
                        <ShieldCheck className="w-3 h-3 mr-1" strokeWidth={1.5} /> Lead
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-display font-semibold text-slate-900 dark:text-white text-sm">{member.username}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{member.institution}</p>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-black/5 dark:border-white/10">
                    <p className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-purple-600 shrink-0" strokeWidth={1.5} />
                      <span className="truncate">{member.email}</span>
                    </p>
                    {member.city && (
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" strokeWidth={1.5} />
                        <span>{member.city}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Links / Points Footer */}
                <div className="pt-3 mt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Points: <strong className="text-slate-800 dark:text-slate-200">{member.points || 50}</strong></span>

                  <div className="flex items-center gap-2">
                    {member.githubUrl && (
                      <a
                        href={member.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        <Github className="w-4 h-4" strokeWidth={1.5} />
                      </a>
                    )}
                    {member.linkedinUrl && (
                      <a
                        href={member.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        <Linkedin className="w-4 h-4" strokeWidth={1.5} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="glass-shell">
          <div className="glass-core p-8 text-center">
            <p className="font-semibold text-slate-500 dark:text-slate-400 text-sm">No members match your filters.</p>
          </div>
        </div>
      )}
    </div>
  );
};
