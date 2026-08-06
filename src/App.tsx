import React, { useState, useEffect } from 'react';
import { User, Event, Project, Announcement, Opportunity, Resource } from './types';
import { api, removeStoredToken } from './api';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AuthView } from './components/AuthView';
import { DashboardView } from './components/DashboardView';
import { ProfileView } from './components/ProfileView';
import { EventsView } from './components/EventsView';
import { ProjectsView } from './components/ProjectsView';
import { OpportunitiesView } from './components/OpportunitiesView';
import { ResourcesView } from './components/ResourcesView';
import { MembersView } from './components/MembersView';
import { AnnouncementsView } from './components/AnnouncementsView';
import { AdminView } from './components/AdminView';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const DARK_MODE_KEY = 'iet_dark_mode';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(DARK_MODE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Data state from Express backend
  const [events, setEvents] = useState<Event[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Notification panel (persisted list, separate from ephemeral toasts)
  const [notifications, setNotifications] = useState<{ id: string; message: string; type: 'info' | 'warning' | 'success'; read: boolean; timestamp: string }[]>([]);

  const pushNotification = (message: string, type: 'info' | 'warning' | 'success' = 'info') => {
    setNotifications(prev => [
      { id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, message, type, read: false, timestamp: new Date().toISOString() },
      ...prev,
    ].slice(0, 50));
  };

  const markNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      try {
        localStorage.setItem(DARK_MODE_KEY, String(next));
      } catch {
        // storage unavailable, dark mode just won't persist
      }
      return next;
    });
  };

  // Global search: matches across every entity type, not just the active tab's list
  const searchResults = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const results: { id: string; tab: string; category: string; title: string; subtitle: string }[] = [];

    events.forEach(e => {
      if (e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || e.category.toLowerCase().includes(q) || e.location.toLowerCase().includes(q) || e.tags.some(t => t.toLowerCase().includes(q))) {
        results.push({ id: e.id, tab: 'events', category: 'Event', title: e.title, subtitle: e.category });
      }
    });
    projects.forEach(p => {
      if (p.title.toLowerCase().includes(q) || p.tagline.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.domain.toLowerCase().includes(q) || p.authorName.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q))) {
        results.push({ id: p.id, tab: 'projects', category: 'Project', title: p.title, subtitle: p.domain });
      }
    });
    opportunities.forEach(o => {
      if (o.title.toLowerCase().includes(q) || o.companyOrOrg.toLowerCase().includes(q) || o.description.toLowerCase().includes(q) || o.type.toLowerCase().includes(q) || o.tags.some(t => t.toLowerCase().includes(q))) {
        results.push({ id: o.id, tab: 'opportunities', category: 'Opportunity', title: o.title, subtitle: o.companyOrOrg });
      }
    });
    resources.forEach(r => {
      if (r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.authorOrProvider.toLowerCase().includes(q) || r.category.toLowerCase().includes(q) || r.type.toLowerCase().includes(q) || r.tags.some(t => t.toLowerCase().includes(q))) {
        results.push({ id: r.id, tab: 'resources', category: 'Resource', title: r.title, subtitle: r.category });
      }
    });
    members.forEach(m => {
      if (m.username.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.institution.toLowerCase().includes(q) || m.city.toLowerCase().includes(q) || (m.skills && m.skills.some(s => s.toLowerCase().includes(q)))) {
        results.push({ id: m.id, tab: 'members', category: 'Member', title: m.username, subtitle: m.institution });
      }
    });
    announcements.forEach(a => {
      if (a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q) || a.category.toLowerCase().includes(q)) {
        results.push({ id: a.id, tab: 'announcements', category: 'Announcement', title: a.title, subtitle: a.category });
      }
    });

    return results.slice(0, 20);
  }, [searchQuery, events, projects, opportunities, resources, members, announcements]);

  const handleSelectSearchResult = (tab: string) => {
    setActiveTab(tab);
  };

  // Fetch initial data
  const loadAppData = async () => {
    try {
      const [summary, memRes] = await Promise.all([
        api.getDashboardSummary(),
        api.getMembers()
      ]);

      setEvents(summary.events);
      setProjects(summary.projects);
      setAnnouncements(summary.announcements);
      setOpportunities(summary.opportunities);
      setResources(summary.resources);

      if (memRes.success) setMembers(memRes.members);
    } catch (err) {
      console.error('Failed to load portal data from backend', err);
    }
  };


  // Check auth on boot
  useEffect(() => {
    const initAuth = async () => {
      try {
        const meRes = await api.getMe();
        if (meRes.success && meRes.user) {
          setCurrentUser(meRes.user);
        }
      } catch (err) {
        console.warn('No active auth session', err);
      } finally {
        setAuthChecking(false);
      }
    };

    initAuth();
    loadAppData();
  }, []);

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
    showToast(`Welcome to IET CONNECT, ${user.username}!`);
    loadAppData();
  };

  const handleLogout = () => {
    removeStoredToken();
    setCurrentUser(null);
    setActiveTab('auth');
    showToast('Signed out successfully.');
  };

  // Event Registration Handler
  const handleRegisterEvent = async (eventId: string) => {
    if (!currentUser) {
      setActiveTab('auth');
      showToast('Please sign in to register for events.', 'error');
      return;
    }

    const event = events.find(e => e.id === eventId);
    if (event?.registeredUserIds.includes(currentUser.id)) {
      pushNotification(`You're already registered for "${event.title}".`, 'warning');
      showToast('You are already registered for this event.', 'error');
      return;
    }

    try {
      const res = await api.registerEvent(eventId);
      if (res.success && res.event) {
        setEvents(events.map(e => e.id === eventId ? res.event! : e));
        pushNotification(`Registered for "${res.event.title}".`, 'success');
        showToast('Registered for the event!', 'success');
      } else {
        showToast(res.message || 'Action failed', 'error');
      }
    } catch {
      showToast('Error communicating with the server. Please try again.', 'error');
    }
  };

  // Like Project Handler
  const handleLikeProject = async (projectId: string) => {
    if (!currentUser) {
      setActiveTab('auth');
      showToast('Please sign in to star projects.', 'error');
      return;
    }

    try {
      const res = await api.toggleLikeProject(projectId);
      if (res.success && res.project) {
        setProjects(projects.map(p => p.id === projectId ? res.project! : p));
        showToast(res.liked ? 'Starred!' : 'Star removed.', 'success');
      }
    } catch {
      showToast('Error liking project. Please try again.', 'error');
    }
  };

  // Submit Project Handler
  const handleSubmitProject = async (projectData: Partial<Project>): Promise<boolean> => {
    try {
      const res = await api.submitProject(projectData);
      if (res.success && res.project) {
        setProjects([res.project, ...projects]);
        showToast('Project submitted successfully!', 'success');
        return true;
      } else {
        showToast(res.message || 'Submission failed', 'error');
        return false;
      }
    } catch {
      showToast('Error submitting project. Please try again.', 'error');
      return false;
    }
  };

  const handleUpdateProject = async (projectId: string, projectData: Partial<Project>): Promise<boolean> => {
    try {
      const res = await api.updateProject(projectId, projectData);
      if (res.success && res.project) {
        setProjects(projects.map(p => p.id === projectId ? res.project! : p));
        showToast('Project updated successfully!', 'success');
        return true;
      } else {
        showToast(res.message || 'Failed to update project', 'error');
        return false;
      }
    } catch {
      showToast('Error updating project. Please try again.', 'error');
      return false;
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const res = await api.deleteProject(projectId);
      if (res.success) {
        setProjects(projects.filter(p => p.id !== projectId));
        showToast('Project deleted.', 'success');
      } else {
        showToast(res.message || 'Failed to delete project', 'error');
      }
    } catch {
      showToast('Error deleting project. Please try again.', 'error');
    }
  };

  // Create Event Handler
  const handleCreateEvent = async (eventData: Partial<Event>): Promise<boolean> => {
    try {
      const res = await api.createEvent(eventData);
      if (res.success && res.event) {
        setEvents([res.event, ...events]);
        showToast('Event hosted successfully!', 'success');
        return true;
      } else {
        showToast(res.message || 'Failed to create event', 'error');
        return false;
      }
    } catch {
      showToast('Server error creating event. Please try again.', 'error');
      return false;
    }
  };

  const handleUpdateEvent = async (eventId: string, eventData: Partial<Event>): Promise<boolean> => {
    try {
      const res = await api.updateEvent(eventId, eventData);
      if (res.success && res.event) {
        setEvents(events.map(e => e.id === eventId ? res.event! : e));
        showToast('Event updated successfully!', 'success');
        return true;
      } else {
        showToast(res.message || 'Failed to update event', 'error');
        return false;
      }
    } catch {
      showToast('Server error updating event. Please try again.', 'error');
      return false;
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const res = await api.deleteEvent(eventId);
      if (res.success) {
        setEvents(events.filter(e => e.id !== eventId));
        showToast('Event deleted.', 'success');
      } else {
        showToast(res.message || 'Failed to delete event', 'error');
      }
    } catch {
      showToast('Server error deleting event. Please try again.', 'error');
    }
  };

  // Create Opportunity Handler
  const handleCreateOpportunity = async (oppData: Partial<Opportunity>): Promise<boolean> => {
    try {
      const res = await api.createOpportunity(oppData);
      if (res.success && res.opportunity) {
        setOpportunities([res.opportunity, ...opportunities]);
        showToast('Opportunity posted successfully!', 'success');
        return true;
      } else {
        showToast(res.message || 'Failed to post opportunity', 'error');
        return false;
      }
    } catch {
      showToast('Server error posting opportunity. Please try again.', 'error');
      return false;
    }
  };

  const handleUpdateOpportunity = async (oppId: string, oppData: Partial<Opportunity>): Promise<boolean> => {
    try {
      const res = await api.updateOpportunity(oppId, oppData);
      if (res.success && res.opportunity) {
        setOpportunities(opportunities.map(o => o.id === oppId ? res.opportunity! : o));
        showToast('Opportunity updated successfully!', 'success');
        return true;
      } else {
        showToast(res.message || 'Failed to update opportunity', 'error');
        return false;
      }
    } catch {
      showToast('Server error updating opportunity. Please try again.', 'error');
      return false;
    }
  };

  const handleDeleteOpportunity = async (oppId: string) => {
    try {
      const res = await api.deleteOpportunity(oppId);
      if (res.success) {
        setOpportunities(opportunities.filter(o => o.id !== oppId));
        showToast('Opportunity deleted.', 'success');
      } else {
        showToast(res.message || 'Failed to delete opportunity', 'error');
      }
    } catch {
      showToast('Server error deleting opportunity. Please try again.', 'error');
    }
  };

  // Create Resource Handler
  const handleCreateResource = async (resData: Partial<Resource>): Promise<boolean> => {
    try {
      const res = await api.createResource(resData);
      if (res.success && res.resource) {
        setResources([res.resource, ...resources]);
        showToast('Resource shared with the community!', 'success');
        return true;
      } else {
        showToast(res.message || 'Failed to share resource', 'error');
        return false;
      }
    } catch {
      showToast('Server error sharing resource. Please try again.', 'error');
      return false;
    }
  };

  const handleUpdateResource = async (resId: string, resData: Partial<Resource>): Promise<boolean> => {
    try {
      const res = await api.updateResource(resId, resData);
      if (res.success && res.resource) {
        setResources(resources.map(r => r.id === resId ? res.resource! : r));
        showToast('Resource updated successfully!', 'success');
        return true;
      } else {
        showToast(res.message || 'Failed to update resource', 'error');
        return false;
      }
    } catch {
      showToast('Server error updating resource. Please try again.', 'error');
      return false;
    }
  };

  const handleDeleteResource = async (resId: string) => {
    try {
      const res = await api.deleteResource(resId);
      if (res.success) {
        setResources(resources.filter(r => r.id !== resId));
        showToast('Resource deleted.', 'success');
      } else {
        showToast(res.message || 'Failed to delete resource', 'error');
      }
    } catch {
      showToast('Server error deleting resource. Please try again.', 'error');
    }
  };

  // Announcement Handlers (admin only, enforced server-side)
  const handleCreateAnnouncement = async (annData: Partial<Announcement>): Promise<boolean> => {
    try {
      const res = await api.createAnnouncement(annData);
      if (res.success && res.announcement) {
        setAnnouncements([res.announcement, ...announcements]);
        showToast('Announcement posted!', 'success');
        return true;
      } else {
        showToast(res.message || 'Failed to post announcement', 'error');
        return false;
      }
    } catch {
      showToast('Server error posting announcement. Please try again.', 'error');
      return false;
    }
  };

  const handleUpdateAnnouncement = async (annId: string, annData: Partial<Announcement>): Promise<boolean> => {
    try {
      const res = await api.updateAnnouncement(annId, annData);
      if (res.success && res.announcement) {
        setAnnouncements(announcements.map(a => a.id === annId ? res.announcement! : a));
        showToast('Announcement updated!', 'success');
        return true;
      } else {
        showToast(res.message || 'Failed to update announcement', 'error');
        return false;
      }
    } catch {
      showToast('Server error updating announcement. Please try again.', 'error');
      return false;
    }
  };

  const handleDeleteAnnouncement = async (annId: string) => {
    try {
      const res = await api.deleteAnnouncement(annId);
      if (res.success) {
        setAnnouncements(announcements.filter(a => a.id !== annId));
        showToast('Announcement deleted.', 'success');
      } else {
        showToast(res.message || 'Failed to delete announcement', 'error');
      }
    } catch {
      showToast('Server error deleting announcement. Please try again.', 'error');
    }
  };


  // Update Profile Handler
  const handleUpdateProfile = async (profileData: Partial<User>): Promise<boolean> => {
    try {
      const res = await api.updateProfile(profileData);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        showToast('Profile saved successfully!', 'success');
        loadAppData();
        return true;
      } else {
        showToast(res.message || 'Profile update failed', 'error');
        return false;
      }
    } catch {
      showToast('Error updating profile. Please try again.', 'error');
      return false;
    }
  };

  if (authChecking) {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <div className="min-h-[100dvh] bg-[#050505] flex flex-col items-center justify-center text-white p-4">
          <Loader2 className="w-7 h-7 text-[#9b51e0] animate-spin mb-3" strokeWidth={1.5} />
          <p className="text-sm font-medium tracking-wide font-display">Connecting to IET Portal Backend...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="relative min-h-[100dvh] bg-[#f8f7f9] dark:bg-[#050505] flex flex-col text-slate-900 dark:text-slate-100 font-sans overflow-x-hidden transition-colors">
        <div className="mesh-bg" aria-hidden="true" />
        <div className="grain-overlay" aria-hidden="true" />

        {/* Navbar */}
        <Navbar
          user={currentUser}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResults={searchResults}
          onSelectSearchResult={handleSelectSearchResult}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          notifications={notifications}
          onOpenNotifications={markNotificationsRead}
        />

        {/* Main Body */}
        <div className="flex flex-1 relative">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            user={currentUser}
            onLogout={handleLogout}
          />

          {/* Content Pane */}
          <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
            {activeTab === 'auth' && (
              <AuthView onAuthSuccess={handleAuthSuccess} />
            )}

            {activeTab === 'dashboard' && (
              currentUser ? (
                <DashboardView
                  user={currentUser}
                  events={events}
                  projects={projects}
                  announcements={announcements}
                  setActiveTab={setActiveTab}
                  onRegisterEvent={handleRegisterEvent}
                  onLikeProject={handleLikeProject}
                />
              ) : (
                <AuthView onAuthSuccess={handleAuthSuccess} />
              )
            )}

            {activeTab === 'events' && (
              <EventsView
                events={events}
                user={currentUser}
                onRegisterEvent={handleRegisterEvent}
                onCreateEvent={handleCreateEvent}
                onUpdateEvent={handleUpdateEvent}
                onDeleteEvent={handleDeleteEvent}
                searchQuery={searchQuery}
              />
            )}

            {activeTab === 'projects' && (
              <ProjectsView
                projects={projects}
                user={currentUser}
                onLikeProject={handleLikeProject}
                onSubmitProject={handleSubmitProject}
                onUpdateProject={handleUpdateProject}
                onDeleteProject={handleDeleteProject}
                searchQuery={searchQuery}
              />
            )}

            {activeTab === 'opportunities' && (
              <OpportunitiesView
                opportunities={opportunities}
                user={currentUser}
                onCreateOpportunity={handleCreateOpportunity}
                onUpdateOpportunity={handleUpdateOpportunity}
                onDeleteOpportunity={handleDeleteOpportunity}
                searchQuery={searchQuery}
              />
            )}

            {activeTab === 'resources' && (
              <ResourcesView
                resources={resources}
                user={currentUser}
                onCreateResource={handleCreateResource}
                onUpdateResource={handleUpdateResource}
                onDeleteResource={handleDeleteResource}
                searchQuery={searchQuery}
              />
            )}

            {activeTab === 'members' && (

              <MembersView
                members={members}
                searchQuery={searchQuery}
                user={currentUser}
              />
            )}

            {activeTab === 'announcements' && (
              <AnnouncementsView
                announcements={announcements}
                user={currentUser}
                onCreateAnnouncement={handleCreateAnnouncement}
                onUpdateAnnouncement={handleUpdateAnnouncement}
                onDeleteAnnouncement={handleDeleteAnnouncement}
                searchQuery={searchQuery}
              />
            )}

            {activeTab === 'admin' && (
              currentUser?.role === 'admin' ? (
                <AdminView />
              ) : (
                <DashboardView
                  user={currentUser!}
                  events={events}
                  projects={projects}
                  announcements={announcements}
                  setActiveTab={setActiveTab}
                  onRegisterEvent={handleRegisterEvent}
                  onLikeProject={handleLikeProject}
                />
              )
            )}

            {activeTab === 'profile' && (
              currentUser ? (
                <ProfileView
                  user={currentUser}
                  onUpdateProfile={handleUpdateProfile}
                />
              ) : (
                <AuthView onAuthSuccess={handleAuthSuccess} />
              )
            )}
          </main>
        </div>

        {/* Footer Section */}
        <footer className="mt-auto border-t border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] backdrop-blur-md py-6 px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 relative z-20">
          <p>© 2026 IET Student Chapter. All rights reserved.</p>
          <div className="flex items-center gap-6 mt-4 sm:mt-0">
            <a href="#" className="hover:text-[#622569] dark:hover:text-purple-300 transition-colors">Terms & Conditions</a>
            <a href="#" className="hover:text-[#622569] dark:hover:text-purple-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#622569] dark:hover:text-purple-300 transition-colors">Code of Conduct</a>
          </div>
        </footer>

        {/* Toast Notification Popup */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 glass-shell animate-slideUp">
            <div className="glass-core !bg-[#111114] px-4 py-3 flex items-center gap-3 text-white">
              {toast.type === 'success' ? (
                <CheckCircle className="w-4.5 h-4.5 text-emerald-400 shrink-0" strokeWidth={1.5} />
              ) : (
                <AlertCircle className="w-4.5 h-4.5 text-rose-400 shrink-0" strokeWidth={1.5} />
              )}
              <span className="text-xs font-medium">{toast.message}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
