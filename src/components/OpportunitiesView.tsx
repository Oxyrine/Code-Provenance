import React, { useState } from 'react';
import { Opportunity, User } from '../types';
import { MapPin, DollarSign, PlusCircle, X } from 'lucide-react';
import { Reveal } from './Reveal';

interface OpportunitiesViewProps {
  opportunities: Opportunity[];
  user: User | null;
  onCreateOpportunity: (oppData: Partial<Opportunity>) => Promise<boolean>;
  searchQuery: string;
}

export const OpportunitiesView: React.FC<OpportunitiesViewProps> = ({
  opportunities,
  user,
  onCreateOpportunity,
  searchQuery,
}) => {
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedTimeline, setSelectedTimeline] = useState<'all' | 'present' | 'past' | 'future'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeOppModal, setActiveOppModal] = useState<Opportunity | null>(null);

  const [newOppData, setNewOppData] = useState({
    title: '',
    companyOrOrg: '',
    type: 'Internship' as Opportunity['type'],
    location: 'Remote',
    stipendOrSalary: '',
    deadline: '',
    description: '',
    applyUrl: '',
    requirementsStr: '',
    tagsStr: '',
    logoUrl: '',
    bannerUrl: '',
    status: 'Open' as 'Open' | 'Closed' | 'Upcoming',
    timeline: 'present' as 'past' | 'present' | 'future',
  });

  const types = ['All', 'Internship', 'Scholarship', 'Research Grant', 'Mentorship', 'Career Fair'];
  const timelines: { id: 'all' | 'present' | 'past' | 'future'; label: string }[] = [
    { id: 'all', label: 'All Opportunities' },
    { id: 'present', label: 'Open Now' },
    { id: 'future', label: 'Upcoming' },
    { id: 'past', label: 'Past & Archived' },
  ];

  const filteredOpps = opportunities.filter((opp) => {
    const matchesType = selectedType === 'All' || opp.type === selectedType;
    const oppTime = opp.timeline || (opp.status === 'Closed' ? 'past' : opp.status === 'Upcoming' ? 'future' : 'present');
    const matchesTimeline = selectedTimeline === 'all' || oppTime === selectedTimeline;
    const matchesSearch =
      !searchQuery ||
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.companyOrOrg.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesTimeline && matchesSearch;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOppData.title || !newOppData.companyOrOrg || !newOppData.description || !newOppData.applyUrl) return;

    const requirements = newOppData.requirementsStr
      ? newOppData.requirementsStr.split('\n').map(s => s.trim()).filter(Boolean)
      : ['Active IET student member', 'Enrolled in STEM / Engineering degree'];

    const tags = newOppData.tagsStr
      ? newOppData.tagsStr.split(',').map(s => s.trim()).filter(Boolean)
      : ['IET', newOppData.type];

    const ok = await onCreateOpportunity({
      ...newOppData,
      requirements,
      tags,
    });

    if (ok) {
      setShowCreateModal(false);
      setNewOppData({
        title: '', companyOrOrg: '', type: 'Internship', location: 'Remote', stipendOrSalary: '',
        deadline: '', description: '', applyUrl: '', requirementsStr: '', tagsStr: '',
        logoUrl: '', bannerUrl: '', status: 'Open', timeline: 'present',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Reveal>
        <div className="glass-shell">
          <div className="glass-core p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="eyebrow bg-[#622569]/10 dark:bg-purple-400/10 text-[#622569] dark:text-purple-300">Career Board</span>
              <h1 className="text-2xl font-display font-semibold text-slate-900 dark:text-white mt-2">Career & Academic Opportunities</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Internships, research fellowships, and grants for chapter members</p>
            </div>

            {user && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="cta-pill bg-[#622569] hover:bg-[#7a2f83] text-white group"
              >
                <span>Post Opportunity</span>
                <span className="cta-icon bg-white/15">
                  <PlusCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
                </span>
              </button>
            )}
          </div>
        </div>
      </Reveal>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-black/[0.03] dark:bg-white/[0.05] p-1 rounded-full">
          {timelines.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTimeline(t.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                selectedTimeline === t.id
                  ? 'bg-[#622569] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                selectedType === t
                  ? 'bg-purple-100 dark:bg-purple-500/10 text-[#622569] dark:text-purple-300'
                  : 'bg-black/[0.03] dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 hover:bg-black/[0.06] dark:hover:bg-white/[0.08]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Opportunities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredOpps.map((opp, i) => {
          const oppTime = opp.timeline || (opp.status === 'Closed' ? 'past' : opp.status === 'Upcoming' ? 'future' : 'present');

          return (
            <Reveal key={opp.id} delay={(i % 6) * 60}>
              <div className="glass-shell h-full">
                <div className="glass-core overflow-hidden flex flex-col justify-between h-full">
                  <div>
                    <div className="h-32 relative overflow-hidden bg-slate-900 rounded-t-[calc(2rem-0.375rem)]">
                      <img
                        src={opp.bannerUrl || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80'}
                        alt={opp.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="bg-white/90 backdrop-blur-md text-[#622569] text-[10px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                          {opp.type}
                        </span>
                      </div>

                      <div className="absolute bottom-3 left-3 text-white text-xs font-semibold">
                        {opp.companyOrOrg}
                      </div>
                    </div>

                    <div className="p-5 space-y-2">
                      <h3
                        onClick={() => setActiveOppModal(opp)}
                        className="font-display font-semibold text-slate-900 dark:text-white text-base hover:text-[#622569] dark:hover:text-purple-300 cursor-pointer line-clamp-1"
                      >
                        {opp.title}
                      </h3>

                      <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" strokeWidth={1.5} />
                          <span>{opp.location}</span>
                        </div>
                        {opp.stipendOrSalary && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-3.5 h-3.5 text-purple-600 shrink-0" strokeWidth={1.5} />
                            <span>{opp.stipendOrSalary}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0 flex items-center justify-between gap-3 mt-2">
                    <button
                      onClick={() => setActiveOppModal(opp)}
                      className="px-3.5 py-2 rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.07] dark:hover:bg-white/[0.09] text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
                    >
                      View Details
                    </button>

                    {oppTime === 'present' ? (
                      <a
                        href={opp.applyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 rounded-full bg-[#622569] hover:bg-[#7a2f83] text-white text-xs font-semibold transition-colors"
                      >
                        Apply Now
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400 dark:text-slate-500 italic">Unavailable</span>
                    )}
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      {filteredOpps.length === 0 && (
        <div className="glass-shell">
          <div className="glass-core p-8 text-center">
            <p className="font-semibold text-slate-500 dark:text-slate-400 text-sm">No opportunities match your filters.</p>
          </div>
        </div>
      )}

      {/* OPPORTUNITY DETAILS MODAL */}
      {activeOppModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-shell max-w-xl w-full">
            <div className="glass-core p-6 sm:p-8 space-y-5 relative max-h-[85vh] overflow-y-auto animate-scaleUp">
              <button
                onClick={() => setActiveOppModal(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-black/[0.04] dark:bg-white/[0.06] rounded-full"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>

              <div>
                <span className="eyebrow bg-purple-100 dark:bg-purple-500/10 text-[#622569] dark:text-purple-300">
                  {activeOppModal.type}
                </span>
                <h2 className="text-xl font-display font-semibold text-slate-900 dark:text-white mt-2">{activeOppModal.title}</h2>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{activeOppModal.companyOrOrg}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-black/[0.02] dark:bg-white/[0.03] p-4 rounded-2xl text-xs">
                <div>
                  <p className="text-slate-400 dark:text-slate-500 font-semibold uppercase">Location</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{activeOppModal.location}</p>
                </div>
                <div>
                  <p className="text-slate-400 dark:text-slate-500 font-semibold uppercase">Stipend / Support</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{activeOppModal.stipendOrSalary || 'Competitive'}</p>
                </div>
                <div>
                  <p className="text-slate-400 dark:text-slate-500 font-semibold uppercase">Deadline</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{activeOppModal.deadline}</p>
                </div>
                <div>
                  <p className="text-slate-400 dark:text-slate-500 font-semibold uppercase">Status</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{activeOppModal.status || 'Open'}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-1">Description</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{activeOppModal.description}</p>
              </div>

              {activeOppModal.requirements && activeOppModal.requirements.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-1">Eligibility & Requirements</h4>
                  <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                    {activeOppModal.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-[#622569] dark:text-purple-300">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/10">
                <button
                  onClick={() => setActiveOppModal(null)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.07] dark:hover:bg-white/[0.09]"
                >
                  Close
                </button>

                {(activeOppModal.timeline === 'present' || activeOppModal.status === 'Open') && (
                  <a
                    href={activeOppModal.applyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2 rounded-full text-xs font-semibold text-white bg-[#622569] hover:bg-[#7a2f83] shadow"
                  >
                    Apply Now
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE OPPORTUNITY MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-shell max-w-lg w-full">
            <div className="glass-core p-6 sm:p-8 space-y-4 relative max-h-[85vh] overflow-y-auto animate-scaleUp">
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-black/[0.04] dark:bg-white/[0.06] rounded-full"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>

              <h2 className="text-lg font-display font-semibold text-slate-900 dark:text-white">Post an Opportunity</h2>

              <form onSubmit={handleCreateSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Opportunity Title *</label>
                  <input
                    type="text"
                    required
                    value={newOppData.title}
                    onChange={(e) => setNewOppData({ ...newOppData, title: e.target.value })}
                    placeholder="e.g. Embedded Firmware Engineering Intern"
                    className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.05] rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:bg-black/[0.06] dark:focus:bg-white/[0.08]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Organization / Sponsor *</label>
                  <input
                    type="text"
                    required
                    value={newOppData.companyOrOrg}
                    onChange={(e) => setNewOppData({ ...newOppData, companyOrOrg: e.target.value })}
                    placeholder="e.g. Siemens Tech Labs"
                    className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.05] rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Type</label>
                  <select
                    value={newOppData.type}
                    onChange={(e) => setNewOppData({ ...newOppData, type: e.target.value as Opportunity['type'] })}
                    className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.05] rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none"
                  >
                    <option value="Internship">Internship</option>
                    <option value="Scholarship">Scholarship</option>
                    <option value="Research Grant">Research Grant</option>
                    <option value="Mentorship">Mentorship</option>
                    <option value="Career Fair">Career Fair</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={newOppData.location}
                    onChange={(e) => setNewOppData({ ...newOppData, location: e.target.value })}
                    className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.05] rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Stipend / Award</label>
                  <input
                    type="text"
                    value={newOppData.stipendOrSalary}
                    onChange={(e) => setNewOppData({ ...newOppData, stipendOrSalary: e.target.value })}
                    className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.05] rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Deadline</label>
                  <input
                    type="date"
                    value={newOppData.deadline}
                    onChange={(e) => setNewOppData({ ...newOppData, deadline: e.target.value })}
                    className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.05] rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Timeline</label>
                  <select
                    value={newOppData.timeline}
                    onChange={(e) => setNewOppData({ ...newOppData, timeline: e.target.value as 'past' | 'present' | 'future' })}
                    className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.05] rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none"
                  >
                    <option value="present">Open Now</option>
                    <option value="future">Upcoming</option>
                    <option value="past">Past</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Apply URL *</label>
                  <input
                    type="url"
                    required
                    value={newOppData.applyUrl}
                    onChange={(e) => setNewOppData({ ...newOppData, applyUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.05] rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={newOppData.description}
                    onChange={(e) => setNewOppData({ ...newOppData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.05] rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Requirements (one per line)</label>
                  <textarea
                    rows={2}
                    value={newOppData.requirementsStr}
                    onChange={(e) => setNewOppData({ ...newOppData, requirementsStr: e.target.value })}
                    className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.05] rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>

                <div className="col-span-2 pt-2 flex justify-end gap-3 border-t border-black/5 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-black/[0.04] dark:bg-white/[0.06] rounded-full hover:bg-black/[0.07] dark:hover:bg-white/[0.09]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-semibold text-white bg-[#622569] hover:bg-[#7a2f83] rounded-full shadow"
                  >
                    Publish Opportunity
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
