import React, { useState } from 'react';
import { Resource, User } from '../types';
import { PlusCircle, X, Pencil, Trash2 } from 'lucide-react';
import { Reveal } from './Reveal';

interface ResourcesViewProps {
  resources: Resource[];
  user: User | null;
  onCreateResource: (resData: Partial<Resource>) => Promise<boolean>;
  onUpdateResource: (resId: string, resData: Partial<Resource>) => Promise<boolean>;
  onDeleteResource: (resId: string) => void;
  searchQuery: string;
}

const emptyResourceForm = {
  title: '',
  description: '',
  category: 'Engineering & Tech' as Resource['category'],
  type: 'E-Book' as Resource['type'],
  authorOrProvider: '',
  url: '',
  thumbnailUrl: '',
  level: 'All Levels' as Resource['level'],
  tagsStr: '',
  timeline: 'present' as 'past' | 'present' | 'future',
};

export const ResourcesView: React.FC<ResourcesViewProps> = ({
  resources,
  user,
  onCreateResource,
  onUpdateResource,
  onDeleteResource,
  searchQuery,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTimeline, setSelectedTimeline] = useState<'all' | 'present' | 'past' | 'future'>('all');
  const [showShareModal, setShowShareModal] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [activeResModal, setActiveResModal] = useState<Resource | null>(null);

  const [newResData, setNewResData] = useState(emptyResourceForm);

  const categories = ['All', 'Engineering & Tech', 'Academic & Research', 'Career & Skill', 'IET Standards', 'Project Templates'];
  const timelines: { id: 'all' | 'present' | 'past' | 'future'; label: string }[] = [
    { id: 'all', label: 'All Resources' },
    { id: 'present', label: 'Current Library' },
    { id: 'past', label: 'Historical & Classics' },
    { id: 'future', label: 'Upcoming Guides' },
  ];

  const filteredResources = resources.filter((res) => {
    const matchesCat = selectedCategory === 'All' || res.category === selectedCategory;
    const resTime = res.timeline || 'present';
    const matchesTimeline = selectedTimeline === 'all' || resTime === selectedTimeline;
    const matchesSearch =
      !searchQuery ||
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.authorOrProvider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesTimeline && matchesSearch;
  });

  const canModify = (res: Resource) => !!user && (user.id === res.createdBy || user.role === 'admin');

  const openCreateModal = () => {
    setEditingResource(null);
    setNewResData(emptyResourceForm);
    setShowShareModal(true);
  };

  const openEditModal = (res: Resource) => {
    setEditingResource(res);
    setNewResData({
      title: res.title,
      description: res.description,
      category: res.category,
      type: res.type,
      authorOrProvider: res.authorOrProvider,
      url: res.url,
      thumbnailUrl: res.thumbnailUrl,
      level: res.level,
      tagsStr: res.tags.join(', '),
      timeline: res.timeline || 'present',
    });
    setShowShareModal(true);
  };

  const handleDelete = (res: Resource) => {
    if (window.confirm(`Delete "${res.title}"? This cannot be undone.`)) {
      onDeleteResource(res.id);
    }
  };

  const handleShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResData.title || !newResData.description || !newResData.url) return;

    const tags = newResData.tagsStr
      ? newResData.tagsStr.split(',').map(s => s.trim()).filter(Boolean)
      : [newResData.category, newResData.type];

    const payload = {
      ...newResData,
      authorOrProvider: newResData.authorOrProvider || (user ? user.username : 'IET Member'),
      tags,
    };

    const ok = editingResource
      ? await onUpdateResource(editingResource.id, payload)
      : await onCreateResource(payload);

    if (ok) {
      setShowShareModal(false);
      setEditingResource(null);
      setNewResData(emptyResourceForm);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Reveal>
        <div className="glass-shell">
          <div className="glass-core p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="eyebrow bg-[#622569]/10 dark:bg-purple-400/10 text-[#622569] dark:text-purple-300">Learning Hub</span>
              <h1 className="text-2xl font-display font-semibold text-slate-900 dark:text-white mt-2">Engineering & Academic Resources</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">E-books, courses, and toolkits shared by the chapter community</p>
            </div>

            {user && (
              <button
                onClick={openCreateModal}
                className="cta-pill bg-[#622569] hover:bg-[#7a2f83] text-white group"
              >
                <span>Share Resource</span>
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
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                selectedCategory === cat
                  ? 'bg-purple-100 dark:bg-purple-500/10 text-[#622569] dark:text-purple-300'
                  : 'bg-black/[0.03] dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 hover:bg-black/[0.06] dark:hover:bg-white/[0.08]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredResources.map((res, i) => {
          const resTime = res.timeline || 'present';

          return (
            <Reveal key={res.id} delay={(i % 6) * 60}>
              <div className="glass-shell h-full">
                <div className="glass-core overflow-hidden flex flex-col justify-between h-full">
                  <div>
                    <div className="h-32 relative overflow-hidden bg-slate-900 rounded-t-[calc(2rem-0.375rem)]">
                      <img
                        src={res.thumbnailUrl || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop&q=80'}
                        alt={res.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                      <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-[#622569] text-[10px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                        {res.type}
                      </span>

                      {canModify(res) ? (
                        <div className="absolute top-3 right-3 flex items-center gap-1.5">
                          <button onClick={() => openEditModal(res)} className="w-7 h-7 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md" title="Edit resource">
                            <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} />
                          </button>
                          <button onClick={() => handleDelete(res)} className="w-7 h-7 flex items-center justify-center rounded-full bg-black/40 text-rose-200 hover:bg-rose-900/80 backdrop-blur-md" title="Delete resource">
                            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                          </button>
                        </div>
                      ) : (
                        <span className="absolute top-3 right-3 bg-slate-900/80 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                          {res.level}
                        </span>
                      )}
                    </div>

                    <div className="p-5 space-y-1.5">
                      <h3
                        onClick={() => setActiveResModal(res)}
                        className="font-display font-semibold text-slate-900 dark:text-white text-base hover:text-[#622569] dark:hover:text-purple-300 cursor-pointer line-clamp-1"
                      >
                        {res.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">By {res.authorOrProvider}</p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 flex items-center justify-between gap-3 mt-2">
                    <button
                      onClick={() => setActiveResModal(res)}
                      className="px-3.5 py-2 rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.07] dark:hover:bg-white/[0.09] text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
                    >
                      View Details
                    </button>

                    <a
                      href={res.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 rounded-full bg-[#622569] hover:bg-[#7a2f83] text-white text-xs font-semibold transition-colors"
                    >
                      Access Now
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      {filteredResources.length === 0 && (
        <div className="glass-shell">
          <div className="glass-core p-8 text-center">
            <p className="font-semibold text-slate-500 dark:text-slate-400 text-sm">No resources match your filters.</p>
          </div>
        </div>
      )}

      {/* RESOURCE DETAILS MODAL */}
      {activeResModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-shell max-w-xl w-full">
            <div className="glass-core p-6 sm:p-8 space-y-5 relative max-h-[85vh] overflow-y-auto animate-scaleUp">
              <button
                onClick={() => setActiveResModal(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-black/[0.04] dark:bg-white/[0.06] rounded-full"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>

              <div>
                <span className="eyebrow bg-purple-100 dark:bg-purple-500/10 text-[#622569] dark:text-purple-300">
                  {activeResModal.category}
                </span>
                <h2 className="text-xl font-display font-semibold text-slate-900 dark:text-white mt-2">{activeResModal.title}</h2>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">By {activeResModal.authorOrProvider}</p>
              </div>

              <div className="h-40 rounded-2xl overflow-hidden relative">
                <img src={activeResModal.thumbnailUrl} alt={activeResModal.title} className="w-full h-full object-cover" />
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-1">Overview</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{activeResModal.description}</p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/10">
                <button
                  onClick={() => setActiveResModal(null)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.07] dark:hover:bg-white/[0.09]"
                >
                  Close
                </button>

                <a
                  href={activeResModal.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2 rounded-full text-xs font-semibold text-white bg-[#622569] hover:bg-[#7a2f83] shadow"
                >
                  Access Resource Now
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SHARE / EDIT RESOURCE MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-shell max-w-lg w-full">
            <div className="glass-core p-6 sm:p-8 space-y-4 relative max-h-[85vh] overflow-y-auto animate-scaleUp">
              <button
                onClick={() => { setShowShareModal(false); setEditingResource(null); }}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-black/[0.04] dark:bg-white/[0.06] rounded-full"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>

              <h2 className="text-lg font-display font-semibold text-slate-900 dark:text-white">
                {editingResource ? 'Edit Learning Resource' : 'Share a Learning Resource'}
              </h2>

              <form onSubmit={handleShareSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Resource Title *</label>
                  <input
                    type="text"
                    required
                    value={newResData.title}
                    onChange={(e) => setNewResData({ ...newResData, title: e.target.value })}
                    placeholder="e.g. Modern Power Electronics"
                    className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.05] rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:bg-black/[0.06] dark:focus:bg-white/[0.08]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={newResData.category}
                    onChange={(e) => setNewResData({ ...newResData, category: e.target.value as Resource['category'] })}
                    className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.05] rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none"
                  >
                    <option value="Engineering & Tech">Engineering & Tech</option>
                    <option value="Academic & Research">Academic & Research</option>
                    <option value="Career & Skill">Career & Skill</option>
                    <option value="IET Standards">IET Standards</option>
                    <option value="Project Templates">Project Templates</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Resource Type</label>
                  <select
                    value={newResData.type}
                    onChange={(e) => setNewResData({ ...newResData, type: e.target.value as Resource['type'] })}
                    className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.05] rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none"
                  >
                    <option value="E-Book">E-Book</option>
                    <option value="Video Course">Video Course</option>
                    <option value="Research Paper">Research Paper</option>
                    <option value="Template">Template</option>
                    <option value="Kit">Kit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Author / Provider</label>
                  <input
                    type="text"
                    value={newResData.authorOrProvider}
                    onChange={(e) => setNewResData({ ...newResData, authorOrProvider: e.target.value })}
                    className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.05] rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Level</label>
                  <select
                    value={newResData.level}
                    onChange={(e) => setNewResData({ ...newResData, level: e.target.value as Resource['level'] })}
                    className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.05] rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none"
                  >
                    <option value="All Levels">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced / Research">Advanced / Research</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Resource Link *</label>
                  <input
                    type="url"
                    required
                    value={newResData.url}
                    onChange={(e) => setNewResData({ ...newResData, url: e.target.value })}
                    className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.05] rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={newResData.description}
                    onChange={(e) => setNewResData({ ...newResData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.05] rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>

                <div className="col-span-2 pt-2 flex justify-end gap-3 border-t border-black/5 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => { setShowShareModal(false); setEditingResource(null); }}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-black/[0.04] dark:bg-white/[0.06] rounded-full hover:bg-black/[0.07] dark:hover:bg-white/[0.09]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-semibold text-white bg-[#622569] hover:bg-[#7a2f83] rounded-full shadow"
                  >
                    {editingResource ? 'Save Changes' : 'Publish Resource'}
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
