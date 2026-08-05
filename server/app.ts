import express from 'express';
import crypto from 'crypto';
import { initDb, saveDb } from './store.js';
import { User, Event, Project, Opportunity, Resource, Announcement, ActivityEntry } from '../src/types.js';

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
}

export function createApp() {
  const app = express();

  app.use(express.json());

  let db = initDb();
  const persist = () => saveDb(db);

  // ponytail: in-memory session map and activity log, both reset on restart / serverless cold
  // start. Fine for a demo; move to a real DB + persisted sessions for production use.
  const sessions = new Map<string, string>(); // token -> userId
  const activityLog: ActivityEntry[] = [];

  function issueToken(userId: string): string {
    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, userId);
    return token;
  }

  function requireAuth(req: express.Request, res: express.Response): string | null {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
    const userId = token ? sessions.get(token) : undefined;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return null;
    }
    return userId;
  }

  // Auth + admin role check combined; sends its own error responses.
  function requireAdmin(req: express.Request, res: express.Response): string | null {
    const userId = requireAuth(req, res);
    if (!userId) return null;
    const user = db.users.find(u => u.id === userId);
    if (!user || user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Admin access required.' });
      return null;
    }
    return userId;
  }

  function isOwnerOrAdmin(userId: string, ownerId: string | undefined): boolean {
    if (ownerId === userId) return true;
    const user = db.users.find(u => u.id === userId);
    return user?.role === 'admin';
  }

  function logActivity(userId: string, action: string, detail: string) {
    const user = db.users.find(u => u.id === userId);
    activityLog.unshift({
      id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      userId,
      username: user?.username || 'Unknown',
      action,
      detail,
      timestamp: new Date().toISOString(),
    });
    if (activityLog.length > 200) activityLog.length = 200;
  }

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', app: 'IET CONNECT API', time: new Date().toISOString() });
  });

  // Auth: Register
  app.post('/api/auth/register', (req, res) => {
    try {
      const { username, email, password, phone, gender, dob, city, institution } = req.body;

      if (!email || !password || !username) {
        return res.status(400).json({ success: false, message: 'Username, Email and Password are required.' });
      }

      const normalizedEmail = String(email).toLowerCase().trim();
      const existingUser = db.users.find(u => u.email.toLowerCase() === normalizedEmail);

      if (existingUser) {
        return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
      }

      const newUser: User & { passwordHash: string } = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        username: String(username).trim(),
        email: normalizedEmail,
        passwordHash: hashPassword(String(password)),
        phone: String(phone || ''),
        gender: String(gender || 'Other'),
        dob: String(dob || ''),
        city: String(city || ''),
        institution: String(institution || 'IET Student Chapter'),
        role: 'member',
        bio: 'New IET CONNECT Member excited to learn and contribute.',
        skills: ['Engineering', 'Problem Solving'],
        interests: ['Technology', 'Networking'],
        avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
        points: 50,
        joinedAt: new Date().toISOString().split('T')[0]
      };

      db.users.push(newUser);
      persist();

      const { passwordHash, ...safeUser } = newUser;
      const token = issueToken(newUser.id);
      logActivity(newUser.id, 'Registered', 'Created a new account');

      res.status(201).json({
        success: true,
        user: safeUser,
        token,
        message: 'Account created successfully! Welcome to IET CONNECT.'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Server error during registration.' });
    }
  });

  // Auth: Login
  app.post('/api/auth/login', (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
      }

      const normalizedEmail = String(email).toLowerCase().trim();
      const user = db.users.find(u => u.email.toLowerCase() === normalizedEmail);

      if (!user || !verifyPassword(String(password), user.passwordHash)) {
        return res.status(401).json({ success: false, message: 'Invalid credentials. Please check your email and password.' });
      }

      const { passwordHash, ...safeUser } = user;
      const token = issueToken(user.id);
      logActivity(user.id, 'Logged In', '');

      res.json({
        success: true,
        user: safeUser,
        token,
        message: 'Welcome back to IET CONNECT!'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Server error during login.' });
    }
  });

  // Auth: Get Current User profile
  app.get('/api/auth/me', (req, res) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    const user = db.users.find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const { passwordHash, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  });

  // Update Profile
  app.put('/api/users/profile', (req, res) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    const userIndex = db.users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const {
      username, phone, gender, dob, city, institution, bio, skills, interests, githubUrl, linkedinUrl, avatarUrl
    } = req.body;

    const existingUser = db.users[userIndex];
    const updatedUser = {
      ...existingUser,
      username: username ?? existingUser.username,
      phone: phone ?? existingUser.phone,
      gender: gender ?? existingUser.gender,
      dob: dob ?? existingUser.dob,
      city: city ?? existingUser.city,
      institution: institution ?? existingUser.institution,
      bio: bio ?? existingUser.bio,
      skills: Array.isArray(skills) ? skills : existingUser.skills,
      interests: Array.isArray(interests) ? interests : existingUser.interests,
      githubUrl: githubUrl ?? existingUser.githubUrl,
      linkedinUrl: linkedinUrl ?? existingUser.linkedinUrl,
      avatarUrl: avatarUrl ?? existingUser.avatarUrl
    };

    db.users[userIndex] = updatedUser;
    persist();
    logActivity(userId, 'Updated Profile', '');

    const { passwordHash, ...safeUser } = updatedUser;
    res.json({ success: true, user: safeUser, message: 'Profile updated successfully!' });
  });

  // Get Members Directory
  app.get('/api/members', (_req, res) => {
    const safeMembers = db.users.map(({ passwordHash, ...member }) => member);
    res.json({ success: true, members: safeMembers });
  });

  // --- ADMIN ROUTES ---
  app.get('/api/admin/users', (req, res) => {
    if (!requireAdmin(req, res)) return;
    const safeUsers = db.users.map(({ passwordHash, ...u }) => u);
    res.json({ success: true, users: safeUsers });
  });

  app.put('/api/admin/users/:id/role', (req, res) => {
    const adminId = requireAdmin(req, res);
    if (!adminId) return;

    const { id } = req.params;
    const { role } = req.body;
    if (!['member', 'lead', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }

    const target = db.users.find(u => u.id === id);
    if (!target) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    target.role = role;
    persist();
    logActivity(adminId, 'Changed User Role', `${target.username} → ${role}`);

    const { passwordHash, ...safeTarget } = target;
    res.json({ success: true, user: safeTarget, message: 'Role updated successfully!' });
  });

  app.get('/api/admin/activity', (req, res) => {
    if (!requireAdmin(req, res)) return;
    res.json({ success: true, activity: activityLog });
  });

  // --- EVENTS API ---
  app.get('/api/events', (_req, res) => {
    res.json({ success: true, events: db.events });
  });

  app.post('/api/events', (req, res) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    const { title, description, category, date, time, location, isVirtual, virtualLink, speaker, speakerRole, organizer, bannerUrl, maxCapacity, tags } = req.body;

    if (!title || !description || !date) {
      return res.status(400).json({ success: false, message: 'Title, description and date are required.' });
    }

    const newEvent: Event = {
      id: `evt_${Date.now()}`,
      title,
      description,
      category: category || 'Workshop',
      date,
      time: time || '10:00 AM - 12:00 PM',
      location: location || 'TBA',
      isVirtual: Boolean(isVirtual),
      virtualLink,
      speaker,
      speakerRole,
      organizer: organizer || 'IET Chapter',
      bannerUrl: bannerUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
      maxCapacity: Number(maxCapacity) || 100,
      registeredUserIds: [],
      tags: Array.isArray(tags) ? tags : ['IET', 'Event'],
      status: 'upcoming',
      createdBy: userId,
    };

    db.events.unshift(newEvent);
    persist();
    logActivity(userId, 'Created Event', newEvent.title);

    res.status(201).json({ success: true, event: newEvent, message: 'Event created successfully!' });
  });

  app.put('/api/events/:id', (req, res) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    const { id } = req.params;
    const event = db.events.find(e => e.id === id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }
    if (!isOwnerOrAdmin(userId, event.createdBy)) {
      return res.status(403).json({ success: false, message: 'You can only edit events you created.' });
    }

    const { title, description, category, date, time, location, isVirtual, virtualLink, speaker, speakerRole, organizer, bannerUrl, maxCapacity, tags } = req.body;

    Object.assign(event, {
      title: title ?? event.title,
      description: description ?? event.description,
      category: category ?? event.category,
      date: date ?? event.date,
      time: time ?? event.time,
      location: location ?? event.location,
      isVirtual: isVirtual !== undefined ? Boolean(isVirtual) : event.isVirtual,
      virtualLink: virtualLink ?? event.virtualLink,
      speaker: speaker ?? event.speaker,
      speakerRole: speakerRole ?? event.speakerRole,
      organizer: organizer ?? event.organizer,
      bannerUrl: bannerUrl ?? event.bannerUrl,
      maxCapacity: maxCapacity !== undefined ? Number(maxCapacity) : event.maxCapacity,
      tags: Array.isArray(tags) ? tags : event.tags,
    });

    persist();
    logActivity(userId, 'Updated Event', event.title);
    res.json({ success: true, event, message: 'Event updated successfully!' });
  });

  app.delete('/api/events/:id', (req, res) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    const { id } = req.params;
    const idx = db.events.findIndex(e => e.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }
    if (!isOwnerOrAdmin(userId, db.events[idx].createdBy)) {
      return res.status(403).json({ success: false, message: 'You can only delete events you created.' });
    }

    const [removed] = db.events.splice(idx, 1);
    persist();
    logActivity(userId, 'Deleted Event', removed.title);
    res.json({ success: true, message: 'Event deleted successfully!' });
  });

  // Toggle Event Registration
  app.post('/api/events/:id/register', (req, res) => {
    const { id } = req.params;
    const userId = requireAuth(req, res);
    if (!userId) return;

    const event = db.events.find(e => e.id === id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const registeredIndex = event.registeredUserIds.indexOf(userId);
    let isRegistered = false;

    if (registeredIndex === -1) {
      if (event.registeredUserIds.length >= event.maxCapacity) {
        return res.status(400).json({ success: false, message: 'Event is at full capacity.' });
      }
      event.registeredUserIds.push(userId);
      isRegistered = true;
    } else {
      event.registeredUserIds.splice(registeredIndex, 1);
      isRegistered = false;
    }

    persist();
    logActivity(userId, isRegistered ? 'Registered for Event' : 'Unregistered from Event', event.title);

    res.json({
      success: true,
      registered: isRegistered,
      event,
      message: isRegistered ? 'Successfully registered for event!' : 'Unregistered from event.'
    });
  });

  // --- PROJECTS API ---
  app.get('/api/projects', (_req, res) => {
    res.json({ success: true, projects: db.projects });
  });

  app.post('/api/projects', (req, res) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    const user = db.users.find(u => u.id === userId);

    const { title, tagline, description, domain, teamMembers, githubUrl, demoUrl, tags, imageUrl } = req.body;

    if (!title || !description || !githubUrl) {
      return res.status(400).json({ success: false, message: 'Title, description and GitHub repository URL are required.' });
    }

    const newProject: Project = {
      id: `proj_${Date.now()}`,
      title,
      tagline: tagline || title,
      description,
      domain: domain || 'Web Development',
      authorId: userId,
      authorName: user ? user.username : 'IET Member',
      authorInstitution: user ? user.institution : 'IET Chapter',
      teamMembers: Array.isArray(teamMembers) ? teamMembers : [user ? user.username : 'Author'],
      githubUrl,
      demoUrl,
      likes: 1,
      likedByUserIds: [userId],
      tags: Array.isArray(tags) ? tags : ['IET', domain || 'Tech'],
      createdAt: new Date().toISOString().split('T')[0],
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80'
    };

    db.projects.unshift(newProject);
    persist();
    logActivity(userId, 'Submitted Project', newProject.title);

    res.status(201).json({ success: true, project: newProject, message: 'Project submitted successfully!' });
  });

  app.put('/api/projects/:id', (req, res) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    const { id } = req.params;
    const project = db.projects.find(p => p.id === id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }
    if (!isOwnerOrAdmin(userId, project.authorId)) {
      return res.status(403).json({ success: false, message: 'You can only edit projects you submitted.' });
    }

    const { title, tagline, description, domain, teamMembers, githubUrl, demoUrl, tags, imageUrl } = req.body;

    Object.assign(project, {
      title: title ?? project.title,
      tagline: tagline ?? project.tagline,
      description: description ?? project.description,
      domain: domain ?? project.domain,
      teamMembers: Array.isArray(teamMembers) ? teamMembers : project.teamMembers,
      githubUrl: githubUrl ?? project.githubUrl,
      demoUrl: demoUrl ?? project.demoUrl,
      tags: Array.isArray(tags) ? tags : project.tags,
      imageUrl: imageUrl ?? project.imageUrl,
    });

    persist();
    logActivity(userId, 'Updated Project', project.title);
    res.json({ success: true, project, message: 'Project updated successfully!' });
  });

  app.delete('/api/projects/:id', (req, res) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    const { id } = req.params;
    const idx = db.projects.findIndex(p => p.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }
    if (!isOwnerOrAdmin(userId, db.projects[idx].authorId)) {
      return res.status(403).json({ success: false, message: 'You can only delete projects you submitted.' });
    }

    const [removed] = db.projects.splice(idx, 1);
    persist();
    logActivity(userId, 'Deleted Project', removed.title);
    res.json({ success: true, message: 'Project deleted successfully!' });
  });

  // Toggle Project Like
  app.post('/api/projects/:id/like', (req, res) => {
    const { id } = req.params;
    const userId = requireAuth(req, res);
    if (!userId) return;

    const project = db.projects.find(p => p.id === id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const likedIndex = project.likedByUserIds.indexOf(userId);
    let liked = false;

    if (likedIndex === -1) {
      project.likedByUserIds.push(userId);
      project.likes += 1;
      liked = true;
    } else {
      project.likedByUserIds.splice(likedIndex, 1);
      project.likes = Math.max(0, project.likes - 1);
      liked = false;
    }

    persist();
    logActivity(userId, liked ? 'Liked Project' : 'Unliked Project', project.title);

    res.json({ success: true, liked, likesCount: project.likes, project });
  });

  // --- ANNOUNCEMENTS API ---
  app.get('/api/announcements', (_req, res) => {
    res.json({ success: true, announcements: db.announcements });
  });

  app.post('/api/announcements', (req, res) => {
    const adminId = requireAdmin(req, res);
    if (!adminId) return;

    const { title, content, category, pinned } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required.' });
    }

    const admin = db.users.find(u => u.id === adminId);
    const newAnn: Announcement = {
      id: `ann_${Date.now()}`,
      title,
      content,
      category: category || 'General',
      authorName: admin?.username || 'Chapter Admin',
      authorRole: 'Chapter Management',
      date: new Date().toISOString().split('T')[0],
      pinned: Boolean(pinned),
      createdBy: adminId,
    };

    db.announcements.unshift(newAnn);
    persist();
    logActivity(adminId, 'Posted Announcement', newAnn.title);

    res.status(201).json({ success: true, announcement: newAnn, message: 'Announcement posted successfully!' });
  });

  app.put('/api/announcements/:id', (req, res) => {
    const adminId = requireAdmin(req, res);
    if (!adminId) return;

    const { id } = req.params;
    const ann = db.announcements.find(a => a.id === id);
    if (!ann) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }

    const { title, content, category, pinned } = req.body;
    Object.assign(ann, {
      title: title ?? ann.title,
      content: content ?? ann.content,
      category: category ?? ann.category,
      pinned: pinned !== undefined ? Boolean(pinned) : ann.pinned,
    });

    persist();
    logActivity(adminId, 'Updated Announcement', ann.title);
    res.json({ success: true, announcement: ann, message: 'Announcement updated successfully!' });
  });

  app.delete('/api/announcements/:id', (req, res) => {
    const adminId = requireAdmin(req, res);
    if (!adminId) return;

    const { id } = req.params;
    const idx = db.announcements.findIndex(a => a.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }

    const [removed] = db.announcements.splice(idx, 1);
    persist();
    logActivity(adminId, 'Deleted Announcement', removed.title);
    res.json({ success: true, message: 'Announcement deleted successfully!' });
  });

  // --- OPPORTUNITIES API ---
  app.get('/api/opportunities', (_req, res) => {
    res.json({ success: true, opportunities: db.opportunities || [] });
  });

  app.post('/api/opportunities', (req, res) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    const { title, companyOrOrg, type, location, stipendOrSalary, deadline, description, applyUrl, requirements, tags, logoUrl, bannerUrl, status, timeline } = req.body;

    if (!title || !companyOrOrg || !description || !applyUrl) {
      return res.status(400).json({ success: false, message: 'Title, Organization, Description, and Apply URL are required.' });
    }

    const newOpportunity: Opportunity = {
      id: `opp_${Date.now()}`,
      title,
      companyOrOrg,
      type: type || 'Internship',
      location: location || 'Remote',
      stipendOrSalary: stipendOrSalary || 'Stipend / Competitive',
      deadline: deadline || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      description,
      applyUrl,
      requirements: Array.isArray(requirements) ? requirements : ['Active student / chapter member'],
      tags: Array.isArray(tags) ? tags : ['IET', 'Opportunity'],
      postedDate: new Date().toISOString().split('T')[0],
      logoUrl: logoUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&auto=format&fit=crop&q=80',
      bannerUrl: bannerUrl || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
      status: status || 'Open',
      timeline: timeline || 'present',
      createdBy: userId,
    };

    if (!db.opportunities) db.opportunities = [];
    db.opportunities.unshift(newOpportunity);
    persist();
    logActivity(userId, 'Posted Opportunity', newOpportunity.title);

    res.status(201).json({ success: true, opportunity: newOpportunity, message: 'Opportunity posted successfully!' });
  });

  app.put('/api/opportunities/:id', (req, res) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    const { id } = req.params;
    const opp = db.opportunities.find(o => o.id === id);
    if (!opp) {
      return res.status(404).json({ success: false, message: 'Opportunity not found.' });
    }
    if (!isOwnerOrAdmin(userId, opp.createdBy)) {
      return res.status(403).json({ success: false, message: 'You can only edit opportunities you posted.' });
    }

    const { title, companyOrOrg, type, location, stipendOrSalary, deadline, description, applyUrl, requirements, tags, logoUrl, bannerUrl, status, timeline } = req.body;

    Object.assign(opp, {
      title: title ?? opp.title,
      companyOrOrg: companyOrOrg ?? opp.companyOrOrg,
      type: type ?? opp.type,
      location: location ?? opp.location,
      stipendOrSalary: stipendOrSalary ?? opp.stipendOrSalary,
      deadline: deadline ?? opp.deadline,
      description: description ?? opp.description,
      applyUrl: applyUrl ?? opp.applyUrl,
      requirements: Array.isArray(requirements) ? requirements : opp.requirements,
      tags: Array.isArray(tags) ? tags : opp.tags,
      logoUrl: logoUrl ?? opp.logoUrl,
      bannerUrl: bannerUrl ?? opp.bannerUrl,
      status: status ?? opp.status,
      timeline: timeline ?? opp.timeline,
    });

    persist();
    logActivity(userId, 'Updated Opportunity', opp.title);
    res.json({ success: true, opportunity: opp, message: 'Opportunity updated successfully!' });
  });

  app.delete('/api/opportunities/:id', (req, res) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    const { id } = req.params;
    const idx = db.opportunities.findIndex(o => o.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Opportunity not found.' });
    }
    if (!isOwnerOrAdmin(userId, db.opportunities[idx].createdBy)) {
      return res.status(403).json({ success: false, message: 'You can only delete opportunities you posted.' });
    }

    const [removed] = db.opportunities.splice(idx, 1);
    persist();
    logActivity(userId, 'Deleted Opportunity', removed.title);
    res.json({ success: true, message: 'Opportunity deleted successfully!' });
  });

  // --- RESOURCES API ---
  app.get('/api/resources', (_req, res) => {
    res.json({ success: true, resources: db.resources || [] });
  });

  app.post('/api/resources', (req, res) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    const { title, description, category, type, authorOrProvider, url, thumbnailUrl, tags, level, featured, timeline } = req.body;

    if (!title || !description || !url) {
      return res.status(400).json({ success: false, message: 'Title, description and resource URL are required.' });
    }

    const newResource: Resource = {
      id: `res_${Date.now()}`,
      title,
      description,
      category: category || 'Engineering & Tech',
      type: type || 'E-Book',
      authorOrProvider: authorOrProvider || 'IET Community',
      url,
      thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop&q=80',
      tags: Array.isArray(tags) ? tags : ['Engineering', 'IET'],
      level: level || 'All Levels',
      featured: Boolean(featured),
      timeline: timeline || 'present',
      publishedYear: String(new Date().getFullYear()),
      createdBy: userId,
    };

    if (!db.resources) db.resources = [];
    db.resources.unshift(newResource);
    persist();
    logActivity(userId, 'Shared Resource', newResource.title);

    res.status(201).json({ success: true, resource: newResource, message: 'Resource shared with community!' });
  });

  app.put('/api/resources/:id', (req, res) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    const { id } = req.params;
    const resource = db.resources.find(r => r.id === id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }
    if (!isOwnerOrAdmin(userId, resource.createdBy)) {
      return res.status(403).json({ success: false, message: 'You can only edit resources you shared.' });
    }

    const { title, description, category, type, authorOrProvider, url, thumbnailUrl, tags, level, featured, timeline } = req.body;

    Object.assign(resource, {
      title: title ?? resource.title,
      description: description ?? resource.description,
      category: category ?? resource.category,
      type: type ?? resource.type,
      authorOrProvider: authorOrProvider ?? resource.authorOrProvider,
      url: url ?? resource.url,
      thumbnailUrl: thumbnailUrl ?? resource.thumbnailUrl,
      tags: Array.isArray(tags) ? tags : resource.tags,
      level: level ?? resource.level,
      featured: featured !== undefined ? Boolean(featured) : resource.featured,
      timeline: timeline ?? resource.timeline,
    });

    persist();
    logActivity(userId, 'Updated Resource', resource.title);
    res.json({ success: true, resource, message: 'Resource updated successfully!' });
  });

  app.delete('/api/resources/:id', (req, res) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    const { id } = req.params;
    const idx = db.resources.findIndex(r => r.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }
    if (!isOwnerOrAdmin(userId, db.resources[idx].createdBy)) {
      return res.status(403).json({ success: false, message: 'You can only delete resources you shared.' });
    }

    const [removed] = db.resources.splice(idx, 1);
    persist();
    logActivity(userId, 'Deleted Resource', removed.title);
    res.json({ success: true, message: 'Resource deleted successfully!' });
  });

  return app;
}
