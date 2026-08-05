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

    try {
      const res = await api.registerEvent(eventId);
      if (res.success && res.event) {
        setEvents(events.map(e => e.id === eventId ? res.event! : e));
        showToast(res.registered ? 'Registered for the event!' : 'Unregistered from the event.', 'success');
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
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
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
                searchQuery={searchQuery}
              />
            )}

            {activeTab === 'projects' && (
              <ProjectsView
                projects={projects}
                user={currentUser}
                onLikeProject={handleLikeProject}
                onSubmitProject={handleSubmitProject}
                searchQuery={searchQuery}
              />
            )}

            {activeTab === 'opportunities' && (
              <OpportunitiesView
                opportunities={opportunities}
                user={currentUser}
                onCreateOpportunity={handleCreateOpportunity}
                searchQuery={searchQuery}
              />
            )}

            {activeTab === 'resources' && (
              <ResourcesView
                resources={resources}
                user={currentUser}
                onCreateResource={handleCreateResource}
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
              />
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
