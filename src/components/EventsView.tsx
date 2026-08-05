import React, { useState } from 'react';
import { Event, User } from '../types';
import { Calendar, Clock, MapPin, Users, CheckCircle2, PlusCircle, Video, Link, X, Pencil, Trash2 } from 'lucide-react';
import { Reveal } from './Reveal';

interface EventsViewProps {
  events: Event[];
  user: User | null;
  onRegisterEvent: (eventId: string) => void;
  onCreateEvent: (eventData: Partial<Event>) => Promise<boolean>;
  onUpdateEvent: (eventId: string, eventData: Partial<Event>) => Promise<boolean>;
  onDeleteEvent: (eventId: string) => void;
  searchQuery: string;
}

const emptyEventForm = {
  title: '',
  description: '',
  category: 'Workshop' as Event['category'],
  date: '',
  time: '10:00 AM - 01:00 PM',
  location: '',
  isVirtual: false,
  virtualLink: '',
  speaker: '',
  speakerRole: '',
  maxCapacity: 100,
};

export const EventsView: React.FC<EventsViewProps> = ({
  events,
  user,
  onRegisterEvent,
  onCreateEvent,
  onUpdateEvent,
  onDeleteEvent,
  searchQuery,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTimeline, setSelectedTimeline] = useState<'all' | 'future' | 'present' | 'past'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [activeEventModal, setActiveEventModal] = useState<Event | null>(null);

  const [newEventData, setNewEventData] = useState(emptyEventForm);

  const categories = ['All', 'Hackathon', 'Workshop', 'Webinar', 'Guest Lecture', 'Conference'];
  const timelines: { id: 'all' | 'future' | 'present' | 'past'; label: string }[] = [
    { id: 'all', label: 'All Timeline' },
    { id: 'future', label: 'Upcoming' },
    { id: 'present', label: 'Ongoing Now' },
    { id: 'past', label: 'Completed' },
  ];

  const filteredEvents = events.filter((evt) => {
    const matchesCat = selectedCategory === 'All' || evt.category === selectedCategory;
    const evtTime = evt.timeline || (evt.status === 'completed' ? 'past' : evt.status === 'ongoing' ? 'present' : 'future');
    const matchesTimeline = selectedTimeline === 'all' || evtTime === selectedTimeline;
    const matchesSearch =
      !searchQuery ||
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesTimeline && matchesSearch;
  });

  const canModify = (evt: Event) => !!user && (user.id === evt.createdBy || user.role === 'admin');

  const openCreateModal = () => {
    setEditingEvent(null);
    setNewEventData(emptyEventForm);
    setShowCreateModal(true);
  };

  const openEditModal = (evt: Event) => {
    setEditingEvent(evt);
    setNewEventData({
      title: evt.title,
      description: evt.description,
      category: evt.category,
      date: evt.date,
      time: evt.time,
      location: evt.location,
      isVirtual: evt.isVirtual,
      virtualLink: evt.virtualLink || '',
      speaker: evt.speaker || '',
      speakerRole: evt.speakerRole || '',
      maxCapacity: evt.maxCapacity,
    });
    setShowCreateModal(true);
  };

  const handleDelete = (evt: Event) => {
    if (window.confirm(`Delete "${evt.title}"? This cannot be undone.`)) {
      onDeleteEvent(evt.id);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventData.title || !newEventData.date) return;
    const ok = editingEvent
      ? await onUpdateEvent(editingEvent.id, newEventData)
      : await onCreateEvent(newEventData);
    if (ok) {
      setShowCreateModal(false);
      setEditingEvent(null);
      setNewEventData(emptyEventForm);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Reveal>
        <div className="glass-shell">
          <div className="glass-core p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="eyebrow bg-[#622569]/10 dark:bg-purple-400/10 text-[#622569] dark:text-purple-300">Chapter Calendar</span>
              <h1 className="text-2xl font-display font-semibold text-slate-900 dark:text-white mt-2">Events & Workshops</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Participate in technical symposiums, hackathons, and webinars</p>
            </div>

            {user && (
              <button
                onClick={openCreateModal}
                className="cta-pill bg-[#622569] hover:bg-[#7a2f83] text-white group"
              >
                <span>Host Event</span>
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

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEvents.map((evt, i) => {
          const isReg = user ? evt.registeredUserIds.includes(user.id) : false;
          const evtTime = evt.timeline || (evt.status === 'completed' ? 'past' : evt.status === 'ongoing' ? 'present' : 'future');

          return (
            <Reveal key={evt.id} delay={(i % 6) * 60}>
              <div className="glass-shell h-full">
                <div className="glass-core overflow-hidden flex flex-col justify-between h-full">
                  <div>
                    {/* Banner */}
                    <div className="h-40 relative overflow-hidden bg-slate-900 rounded-t-[calc(2rem-0.375rem)]">
                      <img
                        src={evt.bannerUrl}
                        alt={evt.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="bg-white/90 backdrop-blur-md text-[#622569] text-[10px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                          {evt.category}
                        </span>
                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-md ${
                          evtTime === 'present'
                            ? 'bg-amber-500 text-slate-900'
                            : evtTime === 'past'
                            ? 'bg-slate-700/90 text-slate-200'
                            : 'bg-[#622569]/90 text-white'
                        }`}>
                          {evtTime === 'present' ? 'Ongoing' : evtTime === 'past' ? 'Past' : 'Upcoming'}
                        </span>
                      </div>

                      {evt.isVirtual && (
                        <span className="absolute top-3 right-3 bg-blue-600/90 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 backdrop-blur-md">
                          <Video className="w-3 h-3" strokeWidth={1.5} /> Online
                        </span>
                      )}

                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <p className="text-[11px] text-purple-200 font-medium flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-purple-300" strokeWidth={1.5} />
                          {evt.date} • {evt.time}
                        </p>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          onClick={() => setActiveEventModal(evt)}
                          className="font-display font-semibold text-slate-900 dark:text-white text-base leading-snug hover:text-[#622569] dark:hover:text-purple-300 cursor-pointer line-clamp-2"
                        >
                          {evt.title}
                        </h3>
                        {canModify(evt) && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button onClick={() => openEditModal(evt)} className="p-1.5 text-slate-400 hover:text-[#622569] dark:hover:text-purple-300 rounded-full hover:bg-black/[0.04] dark:hover:bg-white/[0.06]" title="Edit event">
                              <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} />
                            </button>
                            <button onClick={() => handleDelete(evt)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/40" title="Delete event">
                              <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                            </button>
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {evt.description}
                      </p>

                      <div className="space-y-1.5 pt-2 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" strokeWidth={1.5} />
                          <span className="truncate">{evt.location}</span>
                        </div>

                        {evt.speaker && (
                          <div className="flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 text-purple-600 shrink-0" strokeWidth={1.5} />
                            <span className="truncate">Speaker: <strong>{evt.speaker}</strong></span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer / CTA */}
                  <div className="p-5 pt-0 flex items-center justify-between gap-3 mt-2">
                    <div className="text-[11px] text-slate-400 dark:text-slate-500">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{evt.registeredUserIds.length}</span> / {evt.maxCapacity} Seats
                    </div>

                    <button
                      onClick={() => onRegisterEvent(evt.id)}
                      className={`py-2 px-4 rounded-full text-xs font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex items-center gap-1.5 ${
                        isReg
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                          : 'bg-[#622569] hover:bg-[#7a2f83] text-white shadow-sm'
                      }`}
                    >
                      {isReg ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                          <span>Registered</span>
                        </>
                      ) : (
                        <span>Register</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      {/* EVENT DETAILS MODAL */}
      {activeEventModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-shell max-w-xl w-full">
            <div className="glass-core p-6 sm:p-8 space-y-6 relative max-h-[85vh] overflow-y-auto animate-scaleUp">
              <button
                onClick={() => setActiveEventModal(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-black/[0.04] dark:bg-white/[0.06] rounded-full"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>

              <div className="space-y-2">
                <span className="eyebrow bg-purple-100 dark:bg-purple-500/10 text-[#622569] dark:text-purple-300">
                  {activeEventModal.category}
                </span>
                <h2 className="text-xl font-display font-semibold text-slate-900 dark:text-white">{activeEventModal.title}</h2>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{activeEventModal.description}</p>

              <div className="bg-black/[0.02] dark:bg-white/[0.03] p-4 rounded-2xl space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <p>📍 <strong>Location:</strong> {activeEventModal.location}</p>
                <p>📅 <strong>Date & Time:</strong> {activeEventModal.date} ({activeEventModal.time})</p>
                {activeEventModal.speaker && (
                  <p>🗣️ <strong>Key Speaker:</strong> {activeEventModal.speaker} ({activeEventModal.speakerRole})</p>
                )}
                {activeEventModal.isVirtual && activeEventModal.virtualLink && (
                  <p className="flex items-center gap-1 text-purple-700 dark:text-purple-300">
                    <Link className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <strong>Link:</strong> <a href={activeEventModal.virtualLink} target="_blank" rel="noreferrer" className="underline">{activeEventModal.virtualLink}</a>
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/10">
                <button
                  onClick={() => setActiveEventModal(null)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.07] dark:hover:bg-white/[0.09]"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    onRegisterEvent(activeEventModal.id);
                    setActiveEventModal(null);
                  }}
                  className="px-5 py-2 rounded-full text-xs font-semibold text-white bg-[#622569] hover:bg-[#7a2f83] shadow"
                >
                  Toggle Registration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT EVENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-shell max-w-lg w-full">
            <div className="glass-core p-6 sm:p-8 space-y-4 relative max-h-[85vh] overflow-y-auto animate-scaleUp">
              <button
                onClick={() => { setShowCreateModal(false); setEditingEvent(null); }}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-black/[0.04] dark:bg-white/[0.06] rounded-full"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>

              <h2 className="text-lg font-display font-semibold text-slate-900 dark:text-white">
                {editingEvent ? 'Edit Chapter Event' : 'Publish Chapter Event'}
              </h2>

              <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Event Title *</label>
                  <input
                    type="text"
                    required
                    value={newEventData.title}
                    onChange={(e) => setNewEventData({ ...newEventData, title: e.target.value })}
                    placeholder="e.g. AI & Robotics Symposium 2026"
                    className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.05] rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:bg-black/[0.06] dark:focus:bg-white/[0.08]"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={newEventData.description}
                    onChange={(e) => setNewEventData({ ...newEventData, description: e.target.value })}
                    placeholder="Details about workshop objectives, prerequisites..."
                    className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.05] rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:bg-black/[0.06] dark:focus:bg-white/[0.08]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={newEventData.category}
                    onChange={(e) => setNewEventData({ ...newEventData, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.05] rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none"
                  >
                    <option value="Workshop">Workshop</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Webinar">Webinar</option>
                    <option value="Guest Lecture">Guest Lecture</option>
                    <option value="Conference">Conference</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={newEventData.date}
                    onChange={(e) => setNewEventData({ ...newEventData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.05] rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Time</label>
                  <input
                    type="text"
                    value={newEventData.time}
                    onChange={(e) => setNewEventData({ ...newEventData, time: e.target.value })}
                    className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.05] rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Capacity</label>
                  <input
                    type="number"
                    value={newEventData.maxCapacity}
                    onChange={(e) => setNewEventData({ ...newEventData, maxCapacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.05] rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Location / Venue</label>
                  <input
                    type="text"
                    value={newEventData.location}
                    onChange={(e) => setNewEventData({ ...newEventData, location: e.target.value })}
                    placeholder="Auditorium B / Tech Lab"
                    className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.05] rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>

                <div className="col-span-2 pt-2 flex justify-end gap-3 border-t border-black/5 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => { setShowCreateModal(false); setEditingEvent(null); }}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-black/[0.04] dark:bg-white/[0.06] rounded-full hover:bg-black/[0.07] dark:hover:bg-white/[0.09]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-semibold text-white bg-[#622569] hover:bg-[#7a2f83] rounded-full shadow"
                  >
                    {editingEvent ? 'Save Changes' : 'Publish Event'}
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
