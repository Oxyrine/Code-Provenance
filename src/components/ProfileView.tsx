import React, { useState } from 'react';
import { User } from '../types';
import { COUNTRY_CODES, isValidLocalNumber, parsePhone } from '../phone';
import { Mail, Phone, MapPin, Building, Calendar, Edit3, Github, Linkedin, ShieldCheck, Sparkles, X } from 'lucide-react';

interface ProfileViewProps {
  user: User;
  onUpdateProfile: (updatedData: Partial<User>) => Promise<boolean>;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState('');

  const initialPhone = parsePhone(user.phone || '');

  const [formData, setFormData] = useState({
    username: user.username,
    countryCode: initialPhone.countryCode,
    localNumber: initialPhone.localNumber,
    gender: user.gender || 'Male',
    dob: user.dob || '',
    city: user.city || '',
    institution: user.institution || '',
    bio: user.bio || '',
    githubUrl: user.githubUrl || '',
    linkedinUrl: user.linkedinUrl || '',
    avatarUrl: user.avatarUrl || '',
    skills: user.skills || [],
    interests: user.interests || [],
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.localNumber && !isValidLocalNumber(formData.countryCode, formData.localNumber)) {
      setErrorMsg('Please enter a valid phone number for the selected country.');
      return;
    }
    setErrorMsg(null);
    setSaving(true);
    const { countryCode, localNumber, ...rest } = formData;
    const success = await onUpdateProfile({
      ...rest,
      phone: localNumber ? `${countryCode} ${localNumber}` : '',
    });
    setSaving(false);
    if (success) {
      setIsEditing(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skillToRemove) });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">

        {/* Cover Banner */}
        <div className="h-44 bg-gradient-to-r from-purple-900 via-pink-600 to-yellow-400 relative">
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-[#622569] px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>MEMBER RECORD VERIFIED</span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="p-8 relative pt-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 -mt-20 mb-6">
            <div className="flex items-end gap-6">
              <img
                src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                alt={user.username}
                className="w-32 h-32 rounded-3xl object-cover border-4 border-white dark:border-slate-900 shadow-md bg-white shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="pb-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-['Poppins'] tracking-tight">{user.username}</h1>
                  {user.role === 'lead' && (
                    <span className="bg-purple-100 dark:bg-purple-500/10 text-[#622569] dark:text-purple-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" /> Chapter Lead
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{user.institution}</p>
              </div>
            </div>

            <button
              onClick={() => { setIsEditing(!isEditing); setErrorMsg(null); }}
              className="px-4 py-2.5 rounded-xl bg-[#622569] hover:bg-[#9b51e0] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              <Edit3 className="w-4 h-4" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
            </button>
          </div>

          {/* EDIT FORM or READ-ONLY VIEW */}
          {isEditing ? (
            <form
              onSubmit={handleSave}
              className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <h3 className="col-span-full text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Update Profile Information
              </h3>

              {errorMsg && (
                <div className="col-span-full p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[#9b51e0]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                <div className="flex gap-1.5">
                  <select
                    value={formData.countryCode}
                    onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                    className="w-24 shrink-0 px-1.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[#9b51e0]"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>{c.code} {c.country}</option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    value={formData.localNumber}
                    onChange={(e) => setFormData({ ...formData, localNumber: e.target.value.replace(/[^\d]/g, '') })}
                    placeholder="98765 43210"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[#9b51e0]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[#9b51e0]"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[#9b51e0]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[#9b51e0]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Institution</label>
                <input
                  type="text"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[#9b51e0]"
                />
              </div>

              <div className="col-span-full">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Bio / Statement</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[#9b51e0]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">GitHub URL</label>
                <input
                  type="url"
                  value={formData.githubUrl}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[#9b51e0]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">LinkedIn URL</label>
                <input
                  type="url"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[#9b51e0]"
                />
              </div>

              <div className="col-span-full">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Avatar Image Link</label>
                <input
                  type="url"
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[#9b51e0]"
                />
              </div>

              {/* Skills Tag Management */}
              <div className="col-span-full">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Skills</label>
                <div className="flex gap-1.5 mb-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="e.g. Python, React, IoT"
                    className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[#9b51e0]"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-3 py-2 bg-[#622569] hover:bg-[#9b51e0] text-white text-xs font-bold rounded-xl"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((s) => (
                    <span key={s} className="px-3 py-1 bg-purple-100 dark:bg-purple-500/10 text-[#622569] dark:text-purple-300 text-xs font-semibold rounded-lg flex items-center gap-1.5">
                      {s}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => removeSkill(s)} />
                    </span>
                  ))}
                </div>
              </div>

              <div className="col-span-full pt-2 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-700 mt-2">
                <button
                  type="button"
                  onClick={() => { setIsEditing(false); setErrorMsg(null); }}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-[#622569] hover:bg-[#9b51e0] rounded-xl shadow-sm"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            /* READ ONLY VIEW */
            <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              {/* Bio Statement */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">About Member</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  {user.bio || 'No bio provided yet.'}
                </p>
              </div>

              {/* Data Grid matching original prompt structure */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-medium">
                    <Mail className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>Email Address</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.email}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-medium">
                    <Phone className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>Phone Number</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.phone || 'N/A'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>Date of Birth & Gender</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.dob || 'N/A'} • {user.gender || 'N/A'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>City</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.city || 'N/A'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1 md:col-span-2">
                  <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-medium">
                    <Building className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>Institution</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.institution}</p>
                </div>
              </div>

              {/* Skills & Interests */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Technical Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {user.skills && user.skills.length > 0 ? (
                    user.skills.map((s) => (
                      <span key={s} className="px-3 py-1 bg-purple-100 dark:bg-purple-500/10 text-[#622569] dark:text-purple-300 text-xs font-semibold rounded-lg">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 dark:text-slate-500 italic">No skills listed yet</span>
                  )}
                </div>
              </div>

              {/* Social Connections */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-4">
                {user.githubUrl && (
                  <a
                    href={user.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-[#622569] dark:hover:text-purple-300"
                  >
                    <Github className="w-4 h-4" />
                    <span>GitHub Profile</span>
                  </a>
                )}
                {user.linkedinUrl && (
                  <a
                    href={user.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-[#622569] dark:hover:text-purple-300"
                  >
                    <Linkedin className="w-4 h-4 text-blue-600" />
                    <span>LinkedIn Profile</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
