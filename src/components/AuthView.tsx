import React, { useState } from 'react';
import { api } from '../api';
import { User } from '../types';
import { COUNTRY_CODES, isValidLocalNumber } from '../phone';
import { UserCheck, Lock, Mail, Phone, Calendar, MapPin, Building, User as UserIcon, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

interface AuthViewProps {
  onAuthSuccess: (user: User) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register state
  const [regData, setRegData] = useState({
    username: '',
    email: '',
    password: '',
    countryCode: '+91',
    localNumber: '',
    gender: 'Male',
    dob: '',
    city: '',
    institution: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setErrorMsg('Please enter both Email Address and Password.');
      return;
    }
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await api.login(loginEmail, loginPassword);
      if (res.success && res.user) {
        onAuthSuccess(res.user);
      } else {
        setErrorMsg(res.message || 'Invalid email or password.');
      }
    } catch (err: any) {
      setErrorMsg('Failed to connect to backend server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regData.username || !regData.email || !regData.password) {
      setErrorMsg('Username, Email and Password are required.');
      return;
    }
    if (regData.localNumber && !isValidLocalNumber(regData.countryCode, regData.localNumber)) {
      setErrorMsg('Please enter a valid phone number for the selected country.');
      return;
    }
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await api.register({
        username: regData.username,
        email: regData.email,
        password: regData.password,
        phone: regData.localNumber ? `${regData.countryCode} ${regData.localNumber}` : '',
        gender: regData.gender,
        dob: regData.dob,
        city: regData.city,
        institution: regData.institution,
      });
      if (res.success && res.user) {
        onAuthSuccess(res.user);
      } else {
        setErrorMsg(res.message || 'Registration failed.');
      }
    } catch (err: any) {
      setErrorMsg('Error creating account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Demo account quick login
  const handleQuickDemoLogin = async (email: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.login(email, 'password123');
      if (res.success && res.user) {
        onAuthSuccess(res.user);
      } else {
        setErrorMsg('Demo account login error.');
      }
    } catch {
      setErrorMsg('Failed to sign in with demo account.');
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = "w-full pl-9 pr-3 py-2.5 bg-black/[0.03] dark:bg-white/[0.05] border-0 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:bg-black/[0.06] dark:focus:bg-white/[0.08] outline-none transition-colors";
  const fieldClassLg = "w-full pl-10 pr-4 py-2.5 bg-black/[0.03] dark:bg-white/[0.05] border-0 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:bg-black/[0.06] dark:focus:bg-white/[0.08] outline-none transition-colors";

  return (
    <div className="min-h-[calc(100dvh-8rem)] py-8 px-2 flex items-center justify-center">
      <div className="w-full max-w-xl glass-shell">
        <div className="glass-core overflow-hidden">

          {/* Auth Header */}
          <div className="bg-gradient-to-br from-[#622569] to-[#9b51e0] p-10 text-white text-center relative overflow-hidden rounded-t-[calc(2rem-0.375rem)]">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -left-10 -top-10 w-40 h-40 bg-emerald-300/10 rounded-full blur-2xl pointer-events-none" />

            <span className="eyebrow bg-white/15 text-purple-100 relative z-10">Member Portal</span>
            <div className="w-11 h-11 mx-auto my-4 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-md relative z-10">
              <Sparkles className="w-5 h-5 text-purple-100" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-display font-semibold tracking-tight relative z-10">IET CONNECT</h2>
            <p className="text-xs text-purple-100/80 mt-1.5 relative z-10">Empowering Engineers & Technology Innovators Worldwide</p>

            {/* Toggle Pills */}
            <div className="mt-7 inline-flex bg-black/20 p-1 rounded-full relative z-10">
              <button
                onClick={() => { setIsLoginView(true); setErrorMsg(null); }}
                className={`px-6 py-2 rounded-full text-xs font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  isLoginView ? 'bg-white text-[#622569] shadow-md' : 'text-purple-100 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setIsLoginView(false); setErrorMsg(null); }}
                className={`px-6 py-2 rounded-full text-xs font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  !isLoginView ? 'bg-white text-[#622569] shadow-md' : 'text-purple-100 hover:text-white'
                }`}
              >
                Register
              </button>
            </div>
          </div>

          {/* Form Container */}
          <div className="p-8">
            {errorMsg && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" strokeWidth={1.5} />
                <span>{errorMsg}</span>
              </div>
            )}

            {isLoginView ? (
              /* LOGIN FORM */
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" strokeWidth={1.5} />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="email@example.com"
                      className={fieldClassLg}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" strokeWidth={1.5} />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className={fieldClassLg}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="cta-pill w-full justify-center bg-[#622569] hover:bg-[#7a2f83] text-white group mt-2"
                >
                  <span>{loading ? 'Authenticating...' : 'Access Portal'}</span>
                  {!loading && (
                    <span className="cta-icon bg-white/15">
                      <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </span>
                  )}
                </button>

                {/* Demo Accounts Box */}
                <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/10 text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-3">Quick Demo Login (Pre-configured Users)</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin('venkatns2008@gmail.com')}
                      className="py-2.5 px-3 bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-100 dark:hover:bg-purple-500/20 text-[#622569] dark:text-purple-300 text-xs font-medium rounded-xl transition-colors"
                    >
                      Login as Chapter Lead
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin('sarah.chen@iet.org')}
                      className="py-2.5 px-3 bg-black/[0.03] dark:bg-white/[0.05] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 text-xs font-medium rounded-xl transition-colors"
                    >
                      Login as Student Member
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* REGISTRATION FORM */
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Username *</label>
                    <div className="relative">
                      <UserIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" strokeWidth={1.5} />
                      <input
                        type="text"
                        required
                        value={regData.username}
                        onChange={(e) => setRegData({ ...regData, username: e.target.value })}
                        placeholder="John Doe"
                        className={fieldClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email *</label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" strokeWidth={1.5} />
                      <input
                        type="email"
                        required
                        value={regData.email}
                        onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                        placeholder="john@example.com"
                        className={fieldClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Password *</label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" strokeWidth={1.5} />
                      <input
                        type="password"
                        required
                        value={regData.password}
                        onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                        placeholder="••••••••"
                        className={fieldClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                    <div className="flex gap-1.5">
                      <select
                        value={regData.countryCode}
                        onChange={(e) => setRegData({ ...regData, countryCode: e.target.value })}
                        className="w-24 shrink-0 px-1.5 py-2.5 bg-black/[0.03] dark:bg-white/[0.05] border-0 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>{c.code} {c.country}</option>
                        ))}
                      </select>
                      <div className="relative flex-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" strokeWidth={1.5} />
                        <input
                          type="tel"
                          value={regData.localNumber}
                          onChange={(e) => setRegData({ ...regData, localNumber: e.target.value.replace(/[^\d]/g, '') })}
                          placeholder="98765 43210"
                          className={fieldClass}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                    <select
                      value={regData.gender}
                      onChange={(e) => setRegData({ ...regData, gender: e.target.value })}
                      className="w-full px-3 py-2.5 bg-black/[0.03] dark:bg-white/[0.05] border-0 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date of Birth</label>
                    <div className="relative">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" strokeWidth={1.5} />
                      <input
                        type="date"
                        value={regData.dob}
                        onChange={(e) => setRegData({ ...regData, dob: e.target.value })}
                        className={fieldClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">City</label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" strokeWidth={1.5} />
                      <input
                        type="text"
                        value={regData.city}
                        onChange={(e) => setRegData({ ...regData, city: e.target.value })}
                        placeholder="Chennai"
                        className={fieldClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Institution / Campus</label>
                    <div className="relative">
                      <Building className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" strokeWidth={1.5} />
                      <input
                        type="text"
                        value={regData.institution}
                        onChange={(e) => setRegData({ ...regData, institution: e.target.value })}
                        placeholder="SRM / RVCE / Anna Univ"
                        className={fieldClass}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="cta-pill w-full justify-center bg-[#622569] hover:bg-[#7a2f83] text-white group mt-4"
                >
                  <span>{loading ? 'Creating Member Record...' : 'Register Account'}</span>
                  {!loading && (
                    <span className="cta-icon bg-white/15">
                      <UserCheck className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
