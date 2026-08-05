import React, { useState } from 'react';
import { Announcement, User } from '../types';
import { Megaphone, Pin, Calendar, UserCheck, PlusCircle, X, Pencil, Trash2 } from 'lucide-react';
import { Reveal } from './Reveal';

interface AnnouncementsViewProps {
  announcements: Announcement[];
  user: User | null;
  onCreateAnnouncement: (annData: Partial<Announcement>) => Promise<boolean>;
  onUpdateAnnouncement: (annId: string, annData: Partial<Announcement>) => Promise<boolean>;
  onDeleteAnnouncement: (annId: string) => void;
  searchQuery: string;
}

const emptyAnnForm = {
  title: '',
  content: '',
  category: 'General' as Announcement['category'],
  pinned: false,
};

export const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({
  announcements,
  user,
  onCreateAnnouncement,
  onUpdateAnnouncement,
  onDeleteAnnouncement,
  searchQuery,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState(emptyAnnForm);

  const isAdmin = user?.role === 'admin';

  const filteredAnnouncements = announcements.filter((ann) => {
    if (!searchQuery) return true;
    return (
      ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ann.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ann.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const openCreateModal = () => {
    setEditingAnn(null);
    setFormData(emptyAnnForm);
    setShowModal(true);
  };

  const openEditModal = (ann: Announcement) => {
    setEditingAnn(ann);
    setFormData({ title: ann.title, content: ann.content, category: ann.category, pinned: ann.pinned });
    setShowModal(true);
  };

  const handleDelete = (ann: Announcement) => {
    if (window.confirm(`Delete "${ann.title}"? This cannot be undone.`)) {
      onDeleteAnnouncement(ann.id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;
    const ok = editingAnn
      ? await onUpdateAnnouncement(editingAnn.id, formData)
      : await onCreateAnnouncement(formData);
    if (ok) {
      setShowModal(false);
      setEditingAnn(null);
      setFormData(emptyAnnForm);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Reveal>
        <div className="glass-shell">
          <div className="glass-core p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
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

            {isAdmin && (
              <button
                onClick={openCreateModal}
                className="cta-pill bg-[#622569] hover:bg-[#7a2f83] text-white group shrink-0"
              >
                <span>Post Announcement</span>
                <span className="cta-icon bg-white/15">
                  <PlusCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
                </span>
              </button>
            )}
          </div>
        </div>
      </Reveal>

      <div className="space-y-4">
        {filteredAnnouncements.map((ann, i) => (
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

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-xs">
                      <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>{ann.date}</span>
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEditModal(ann)} className="p-1.5 text-slate-400 hover:text-[#622569] dark:hover:text-purple-300 rounded-full hover:bg-black/[0.04] dark:hover:bg-white/[0.06]" title="Edit announcement">
                          <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                        <button onClick={() => handleDelete(ann)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/40" title="Delete announcement">
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                      </div>
                    )}
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

        {filteredAnnouncements.length === 0 && (
          <div className="glass-shell">
            <div className="glass-core p-8 text-center">
              <p className="font-semibold text-slate-500 dark:text-slate-400 text-sm">No announcements match your search.</p>
            </div>
          </div>
        )}
      </div>

      {/* CREATE / EDIT ANNOUNCEMENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-shell max-w-lg w-full">
            <div className="glass-core p-6 sm:p-8 space-y-4 relative max-h-[85vh] overflow-y-auto animate-scaleUp">
              <button
                onClick={() => { setShowModal(false); setEditingAnn(null); }}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-black/[0.04] dark:bg-white/[0.06] rounded-full"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>

              <h2 className="text-lg font-display font-semibold text-slate-900 dark:text-white">
                {editingAnn ? 'Edit Announcement' : 'Post an Announcement'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Registration Open for Annual Paper Contest"
                    className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.05] rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:bg-black/[0.06] dark:focus:bg-white/[0.08]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Announcement['category'] })}
                    className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.05] rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none"
                  >
                    <option value="Important">Important</option>
                    <option value="Event Alert">Event Alert</option>
                    <option value="Achievement">Achievement</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Content *</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Write the full announcement text..."
                    className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.05] rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.pinned}
                    onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
                    className="rounded"
                  />
                  Pin to top
                </label>

                <div className="pt-2 flex justify-end gap-3 border-t border-black/5 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setEditingAnn(null); }}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-black/[0.04] dark:bg-white/[0.06] rounded-full hover:bg-black/[0.07] dark:hover:bg-white/[0.09]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-semibold text-white bg-[#622569] hover:bg-[#7a2f83] rounded-full shadow"
                  >
                    {editingAnn ? 'Save Changes' : 'Post Announcement'}
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
