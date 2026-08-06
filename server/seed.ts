import { db } from './db.js';
import { users, projects } from './schema.js';
import crypto from 'crypto';

function hashSeedPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

async function seed() {
  console.log('Clearing old data...');
  await db.delete(projects);
  await db.delete(users);
  
  console.log('Seeding users...');
  await db.insert(users).values([
    {
      id: 'usr_demo',
      username: 'Venkat NS',
      email: 'venkatns2008@gmail.com',
      passwordHash: hashSeedPassword('password123'),
      phone: '+91 98765 43210',
      gender: 'Male',
      dob: '2004-05-15',
      city: 'Chennai',
      institution: 'IET Student Chapter - SRM Institute of Science and Technology',
      role: 'admin',
      bio: 'Full Stack Engineer & Tech Enthusiast passionate about building impactful community platforms and AI systems.',
      skills: ['React', 'TypeScript', 'Node.js', 'Python', 'Tailwind CSS', 'Docker'],
      interests: ['AI Research', 'Open Source', 'Embedded Systems', 'IoT'],
      githubUrl: 'https://github.com',
      linkedinUrl: 'https://linkedin.com',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      points: 450,
      joinedAt: '2025-01-10'
    },
    {
      id: 'usr_sarah',
      username: 'Sarah Chen',
      email: 'sarah.chen@iet.org',
      passwordHash: hashSeedPassword('password123'),
      phone: '+91 91234 56789',
      gender: 'Female',
      dob: '2003-09-21',
      city: 'Bangalore',
      institution: 'IET Student Chapter - RV College of Engineering',
      role: 'member',
      bio: 'Final year CS student interested in deep learning and autonomous systems.',
      skills: ['Python', 'PyTorch', 'C++', 'ROS'],
      interests: ['Robotics', 'Machine Learning', 'Computer Vision'],
      githubUrl: 'https://github.com',
      linkedinUrl: 'https://linkedin.com',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      points: 210,
      joinedAt: '2025-08-22'
    }
  ]);
  
  console.log('Seeding projects...');
  await db.insert(projects).values([
    {
      id: 'proj_present_1',
      title: 'Neuromorphic Audio Processing Chip Firmware',
      tagline: 'Ultra-low power acoustic anomaly detection for industrial pipeline monitoring.',
      description: 'Currently building custom firmware for spiking neural network hardware to detect early stress fractures and leaks in high-pressure conduits with sub-milliwatt power consumption.',
      domain: 'IoT & Embedded',
      authorId: 'usr_sarah',
      authorName: 'Sarah Chen',
      authorInstitution: 'RV College of Engineering',
      teamMembers: ['Sarah Chen', 'Rohan Varma', 'Dr. S. K. Bose'],
      githubUrl: 'https://github.com/iet-projects/neuromorphic-audio-firmware',
      demoUrl: 'https://neuromorphic-audio.example.com',
      likes: 52,
      likedByUserIds: ['usr_demo'],
      tags: ['Embedded', 'Neuromorphic', 'EdgeAI', 'Active Build'],
      createdAt: '2026-07-15',
      imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
      status: 'Active',
      timeline: 'present',
      achievements: 'Selected for IET R&D Innovation Showcase 2026'
    }
  ]);
  
  console.log('Seeding complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
