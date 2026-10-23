import React, { useState } from 'react';
import { Mail, Lock, User, GraduationCap, Calendar, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { login, loginWithGoogle, signUp, resetPassword } = useApp();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [course, setCourse] = useState('B.Tech Computer Science');
  const [semester, setSemester] = useState('6th Semester');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (res.success) {
          onClose();
        } else {
          setErrorMsg(res.error || 'Failed to log in');
        }
      } else if (mode === 'signup') {
        const res = await signUp(email, password, fullName, course, semester);
        if (res.success) {
          setSuccessMsg('Account created successfully! Please verify your email.');
          setTimeout(() => onClose(), 1200);
        } else {
          setErrorMsg(res.error || 'Failed to sign up');
        }
      } else if (mode === 'forgot') {
        const res = await resetPassword(email);
        if (res.success) {
          setSuccessMsg(res.message);
        } else {
          setErrorMsg(res.message);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (e: any) {
      setErrorMsg('Google sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-purple-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Student Account' : 'Reset Password'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {mode === 'login'
              ? 'Log in to continue your AI-powered learning journey'
              : mode === 'signup'
              ? 'Join EduGenius AI to access personalized study tools'
              : 'Enter your registered email for password recovery instructions'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Course</label>
                  <input
                    type="text"
                    required
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    placeholder="e.g. B.Tech / Science"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Semester</label>
                  <input
                    type="text"
                    required
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    placeholder="e.g. 6th Sem"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@college.edu"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-sm shadow-md shadow-purple-500/20 active:scale-[0.98] transition-all disabled:opacity-50 mt-2"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
          </button>
        </form>

        {/* Google sign-in */}
        {mode !== 'forgot' && (
          <div className="mt-4">
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              <span className="flex-shrink mx-3 text-slate-400 text-[11px] uppercase tracking-wider">Or continue with</span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            </div>

            <button
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium text-xs text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2.5 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>
          </div>
        )}

        {/* Footer switch */}
        <div className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button onClick={() => setMode('signup')} className="text-purple-600 dark:text-purple-400 font-semibold hover:underline">
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already registered?{' '}
              <button onClick={() => setMode('login')} className="text-purple-600 dark:text-purple-400 font-semibold hover:underline">
                Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
