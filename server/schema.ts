import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(),
  username: varchar('username', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  phone: varchar('phone', { length: 50 }).notNull(),
  gender: varchar('gender', { length: 50 }).notNull(),
  dob: varchar('dob', { length: 50 }).notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  institution: varchar('institution', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(), // 'member' | 'lead' | 'admin'
  bio: text('bio'),
  skills: text('skills').array(),
  interests: text('interests').array(),
  githubUrl: varchar('github_url', { length: 255 }),
  linkedinUrl: varchar('linkedin_url', { length: 255 }),
  avatarUrl: text('avatar_url'),
  points: integer('points').default(0),
  joinedAt: varchar('joined_at', { length: 100 }).notNull()
});

export const events = pgTable('events', {
  id: varchar('id', { length: 255 }).primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  date: varchar('date', { length: 50 }).notNull(),
  time: varchar('time', { length: 50 }).notNull(),
  location: varchar('location', { length: 255 }).notNull(),
  isVirtual: boolean('is_virtual').notNull(),
  virtualLink: varchar('virtual_link', { length: 255 }),
  speaker: varchar('speaker', { length: 255 }),
  speakerRole: varchar('speaker_role', { length: 255 }),
  organizer: varchar('organizer', { length: 255 }).notNull(),
  bannerUrl: text('banner_url').notNull(),
  maxCapacity: integer('max_capacity').notNull(),
  registeredUserIds: text('registered_user_ids').array().notNull(),
  tags: text('tags').array().notNull(),
  status: varchar('status', { length: 50 }).notNull(),
  timeline: varchar('timeline', { length: 50 }),
  recordingUrl: varchar('recording_url', { length: 255 }),
  galleryUrls: text('gallery_urls').array(),
  createdBy: varchar('created_by', { length: 255 })
});

export const projects = pgTable('projects', {
  id: varchar('id', { length: 255 }).primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  tagline: varchar('tagline', { length: 255 }).notNull(),
  description: text('description').notNull(),
  domain: varchar('domain', { length: 100 }).notNull(),
  authorId: varchar('author_id', { length: 255 }).notNull(),
  authorName: varchar('author_name', { length: 255 }).notNull(),
  authorInstitution: varchar('author_institution', { length: 255 }).notNull(),
  teamMembers: text('team_members').array().notNull(),
  githubUrl: varchar('github_url', { length: 255 }).notNull(),
  demoUrl: varchar('demo_url', { length: 255 }),
  likes: integer('likes').notNull().default(0),
  likedByUserIds: text('liked_by_user_ids').array().notNull(),
  tags: text('tags').array().notNull(),
  createdAt: varchar('created_at', { length: 50 }).notNull(),
  imageUrl: text('image_url'),
  status: varchar('status', { length: 50 }),
  timeline: varchar('timeline', { length: 50 }),
  achievements: text('achievements')
});

export const opportunities = pgTable('opportunities', {
  id: varchar('id', { length: 255 }).primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  companyOrOrg: varchar('company_or_org', { length: 255 }).notNull(),
  type: varchar('type', { length: 100 }).notNull(),
  location: varchar('location', { length: 255 }).notNull(),
  stipendOrSalary: varchar('stipend_or_salary', { length: 100 }),
  deadline: varchar('deadline', { length: 50 }).notNull(),
  description: text('description').notNull(),
  applyUrl: varchar('apply_url', { length: 255 }).notNull(),
  requirements: text('requirements').array().notNull(),
  tags: text('tags').array().notNull(),
  postedDate: varchar('posted_date', { length: 50 }).notNull(),
  logoUrl: text('logo_url'),
  bannerUrl: text('banner_url'),
  status: varchar('status', { length: 50 }).notNull(),
  timeline: varchar('timeline', { length: 50 }),
  createdBy: varchar('created_by', { length: 255 })
});

export const resources = pgTable('resources', {
  id: varchar('id', { length: 255 }).primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  type: varchar('type', { length: 100 }).notNull(),
  authorOrProvider: varchar('author_or_provider', { length: 255 }).notNull(),
  url: text('url').notNull(),
  thumbnailUrl: text('thumbnail_url').notNull(),
  tags: text('tags').array().notNull(),
  level: varchar('level', { length: 50 }).notNull(),
  featured: boolean('featured'),
  timeline: varchar('timeline', { length: 50 }),
  publishedYear: varchar('published_year', { length: 20 }),
  createdBy: varchar('created_by', { length: 255 })
});

export const announcements = pgTable('announcements', {
  id: varchar('id', { length: 255 }).primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  authorName: varchar('author_name', { length: 255 }).notNull(),
  authorRole: varchar('author_role', { length: 100 }).notNull(),
  date: varchar('date', { length: 50 }).notNull(),
  pinned: boolean('pinned').notNull().default(false),
  createdBy: varchar('created_by', { length: 255 })
});

export const activityLogs = pgTable('activity_logs', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  username: varchar('username', { length: 255 }).notNull(),
  action: varchar('action', { length: 255 }).notNull(),
  detail: text('detail').notNull(),
  timestamp: varchar('timestamp', { length: 50 }).notNull()
});

export const sessions = pgTable('sessions', {
  token: varchar('token', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull()
});
