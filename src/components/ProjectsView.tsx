import React, { useState } from 'react';
import { Project, User } from '../types';
import { Github, ExternalLink, Star, PlusCircle, Sparkles, X, Pencil, Trash2 } from 'lucide-react';
import { Reveal } from './Reveal';

interface ProjectsViewProps {
  projects: Project[];
  user: User | null;
  onLikeProject: (projectId: string) => void;
  onSubmitProject: (projectData: Partial<Project>) => Promise<boolean>;
  onUpdateProject: (projectId: string, projectData: Partial<Project>) => Promise<boolean>;
  onDeleteProject: (projectId: string) => void;
  searchQuery: string;
}

const emptyProjectForm = {
  title: '',
  tagline: '',
  description: '',
  domain: 'AI / ML' as Project['domain'],
  githubUrl: '',
  demoUrl: '',
  teamMembersStr: '',
  imageUrl: '',
};

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  user,
  onLikeProject,
  onSubmitProject,
  onUpdateProject,
  onDeleteProject,
  searchQuery,
}) => {
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [selectedTimeline, setSelectedTimeline] = useState<'all' | 'present' | 'past' | 'future'>('all');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [newProjData, setNewProjData] = useState(emptyProjectForm);

  const domains = ['All', 'AI / ML', 'Web Development', 'IoT & Embedded', 'Robotics', 'Cybersecurity', 'Mobile App'];
  const timelines: { id: 'all' | 'present' | 'past' | 'future'; label: string }[] = [
    { id: 'all', label: 'All Projects' },
    { id: 'present', label: 'Ongoing Builds' },
    { id: 'past', label: 'Completed & Awarded' },
    { id: 'future', label: 'Research Proposals' },
  ];

  const filteredProjects = projects.filter((proj) => {
    const matchesDomain = selectedDomain === 'All' || proj.domain === selectedDomain;
    const projTime = proj.timeline || (proj.status === 'Completed' ? 'past' : proj.status === 'Research' ? 'future' : 'present');
    const matchesTimeline = selectedTimeline === 'all' || projTime === selectedTimeline;
    const matchesSearch =
      !searchQuery ||
      proj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDomain && matchesTimeline && matchesSearch;
  });

  const canModify = (proj: Project) => !!user && (user.id === proj.authorId || user.role === 'admin');

  const openCreateModal = () => {
    setEditingProject(null);
    setNewProjData(emptyProjectForm);
    setShowSubmitModal(true);
  };

  const openEditModal = (proj: Project) => {
    setEditingProject(proj);
    setNewProjData({
      title: proj.title,
      tagline: proj.tagline,
      description: proj.description,
      domain: proj.domain,
      githubUrl: proj.githubUrl,
      demoUrl: proj.demoUrl || '',
      teamMembersStr: proj.teamMembers.join(', '),
      imageUrl: proj.imageUrl || '',
    });
    setShowSubmitModal(true);
  };

  const handleDelete = (proj: Project) => {
    if (window.confirm(`Delete "${proj.title}"? This cannot be undone.`)) {
      onDeleteProject(proj.id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjData.title || !newProjData.description || !newProjData.githubUrl) return;

    const team = newProjData.teamMembersStr
      ? newProjData.teamMembersStr.split(',').map(s => s.trim())
      : [user ? user.username : 'Author'];

    const ok = editingProject
      ? await onUpdateProject(editingProject.id, { ...newProjData, teamMembers: team })
      : await onSubmitProject({ ...newProjData, teamMembers: team });

    if (ok) {
      setShowSubmitModal(false);
      setEditingProject(null);
      setNewProjData(emptyProjectForm);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Reveal>
        <div className="glass-shell">
          <div className="glass-core p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="eyebrow bg-[#622569]/10 dark:bg-purple-400/10 text-[#622569] dark:text-purple-300">Community Builds</span>
              <h1 className="text-2xl font-display font-semibold text-slate-900 dark:text-white mt-2">Member Innovation Showcase</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Explore and appreciate engineering builds by IET CONNECT chapter members</p>
            </div>

            {user && (
              <button
                onClick={openCreateModal}
                className="cta-pill bg-[#622569] hover:bg-[#7a2f83] text-white group"
              >
                <span>Submit Project</span>
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
          {domains.map((dom) => (
            <button
              key={dom}
              onClick={() => setSelectedDomain(dom)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                selectedDomain === dom
                  ? 'bg-purple-100 dark:bg-purple-500/10 text-[#622569] dark:text-purple-300'
                  : 'bg-black/[0.03] dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 hover:bg-black/[0.06] dark:hover:bg-white/[0.08]'
              }`}
            >
              {dom}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredProjects.map((proj, i) => {
          const isLiked = user ? proj.likedByUserIds.includes(user.id) : false;
          const projTime = proj.timeline || (proj.status === 'Completed' ? 'past' : proj.status === 'Research' ? 'future' : 'present');

          return (
            <Reveal key={proj.id} delay={(i % 6) * 60}>
              <div className="glass-shell h-full">
                <div className="glass-core overflow-hidden flex flex-col justify-between h-full">
                  <div>
                    <div className="h-48 relative overflow-hidden bg-slate-900 rounded-t-[calc(2rem-0.375rem)]">
                      <img
                        src={proj.imageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80'}
                        alt={proj.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="bg-white/90 backdrop-blur-md text-[#622569] text-[10px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                          {proj.domain}
                        </span>
                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-md ${
                          projTime === 'present'
                            ? 'bg-amber-500 text-slate-900'
                            : projTime === 'past'
                            ? 'bg-emerald-600/90 text-white'
                            : 'bg-purple-600/90 text-white'
                        }`}>
                          {projTime === 'present' ? 'Active Build' : projTime === 'past' ? 'Completed & Awarded' : 'Research Proposal'}
                        </span>
                      </div>

                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        {canModify(proj) && (
                          <>
                            <button onClick={() => openEditModal(proj)} className="w-7 h-7 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md" title="Edit project">
                              <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} />
                            </button>
                            <button onClick={() => handleDelete(proj)} className="w-7 h-7 flex items-center justify-center rounded-full bg-black/40 text-rose-200 hover:bg-rose-900/80 backdrop-blur-md" title="Delete project">
                              <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => onLikeProject(proj.id)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex items-center gap-1.5 backdrop-blur-md ${
                            isLiked
                              ? 'bg-amber-400 text-slate-950 shadow-md'
                              : 'bg-black/40 text-white hover:bg-black/60'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${isLiked ? 'fill-slate-950' : ''}`} strokeWidth={1.5} />
                          <span>{proj.likes}</span>
                        </button>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <p className="text-[11px] text-purple-200 font-medium">By {proj.authorName} ({proj.authorInstitution})</p>
                      </div>
                    </div>

                    <div className="p-6 space-y-3">
                      <h3 className="font-display font-semibold text-slate-900 dark:text-white text-lg">{proj.title}</h3>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 italic">{proj.tagline}</p>

                      {proj.achievements && (
                        <div className="bg-amber-50 dark:bg-amber-500/10 rounded-xl p-2.5 flex items-center gap-2 text-amber-900 dark:text-amber-300 text-[11px] font-semibold">
                          <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" strokeWidth={1.5} />
                          <span>{proj.achievements}</span>
                        </div>
                      )}

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">{proj.description}</p>

                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {proj.tags.map((t) => (
                          <span key={t} className="text-[10px] font-semibold bg-black/[0.04] dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded-full">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0 flex items-center justify-between gap-3 mt-4">
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.07] dark:hover:bg-white/[0.09] text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center gap-2"
                    >
                      <Github className="w-4 h-4" strokeWidth={1.5} />
                      <span>Repository</span>
                    </a>

                    {proj.demoUrl && (
                      <a
                        href={proj.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 rounded-full bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-100 dark:hover:bg-purple-500/20 text-[#622569] dark:text-purple-300 text-xs font-semibold transition-colors flex items-center gap-2"
                      >
                        <span>Live Demo</span>
                        <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      {/* SUBMIT / EDIT PROJECT MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-shell max-w-lg w-full">
            <div className="glass-core p-6 sm:p-8 space-y-4 relative max-h-[85vh] overflow-y-auto animate-scaleUp">
              <button
                onClick={() => { setShowSubmitModal(false); setEditingProject(null); }}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-black/[0.04] dark:bg-white/[0.06] rounded-full"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>

              <h2 className="text-lg font-display font-semibold text-slate-900 dark:text-white">
                {editingProject ? 'Edit Project Showcase' : 'Submit Member Project Showcase'}
              </h2>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Project Title *</label>
                  <input
                    type="text"
                    required
                    value={newProjData.title}
                    onChange={(e) => setNewProjData({ ...newProjData, title: e.target.value })}
                    placeholder="e.g. Smart Solar Grid Monitor"
                    className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.05] rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:bg-black/[0.06] dark:focus:bg-white/[0.08]"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Short Tagline</label>
                  <input
                    type="text"
                    value={newProjData.tagline}
                    onChange={(e) => setNewProjData({ ...newProjData, tagline: e.target.value })}
                    placeholder="e.g. Real-time IoT solar efficiency dashboard"
                    className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.05] rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:bg-black/[0.06] dark:focus:bg-white/[0.08]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Domain & Field</label>
                  <select
                    value={newProjData.domain}
                    onChange={(e) => setNewProjData({ ...newProjData, domain: e.target.value as any })}
                    className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.05] rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none"
                  >
                    <option value="AI / ML">AI / ML</option>
                    <option value="Web Development">Web Development</option>
                    <option value="IoT & Embedded">IoT & Embedded</option>
                    <option value="Robotics">Robotics</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="Mobile App">Mobile App</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">GitHub Repository Link *</label>
                  <input
                    type="url"
                    required
                    value={newProjData.githubUrl}
                    onChange={(e) => setNewProjData({ ...newProjData, githubUrl: e.target.value })}
                    placeholder="https://github.com/username/repository"
                    className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.05] rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={newProjData.description}
                    onChange={(e) => setNewProjData({ ...newProjData, description: e.target.value })}
                    placeholder="Explain architecture, technology stack, problem solved..."
                    className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.05] rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Live Demo Link (Optional)</label>
                  <input
                    type="url"
                    value={newProjData.demoUrl}
                    onChange={(e) => setNewProjData({ ...newProjData, demoUrl: e.target.value })}
                    placeholder="https://my-app.example.com"
                    className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.05] rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Team Members (Comma separated)</label>
                  <input
                    type="text"
                    value={newProjData.teamMembersStr}
                    onChange={(e) => setNewProjData({ ...newProjData, teamMembersStr: e.target.value })}
                    placeholder="John, Sarah, Priya"
                    className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.05] rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>

                <div className="col-span-2 pt-2 flex justify-end gap-3 border-t border-black/5 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => { setShowSubmitModal(false); setEditingProject(null); }}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-black/[0.04] dark:bg-white/[0.06] rounded-full hover:bg-black/[0.07] dark:hover:bg-white/[0.09]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-semibold text-white bg-[#622569] hover:bg-[#7a2f83] rounded-full shadow"
                  >
                    {editingProject ? 'Save Changes' : 'Submit Project'}
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
