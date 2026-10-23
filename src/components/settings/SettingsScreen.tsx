import React, { useState } from 'react';
import {
  User,
  Moon,
  Sun,
  Laptop,
  Languages,
  Shield,
  BarChart2,
  LogOut,
  Trash2,
  Check,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppTheme, ResponseLanguage } from '../../types';

export const SettingsScreen: React.FC = () => {
  const {
    user,
    updateProfile,
    theme,
    setTheme,
    language,
    setLanguage,
    logout,
    deleteAccount,
    aiRequestsUsedHour,
  } = useApp();

  // Profile edit states
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [course, setCourse] = useState(user?.course || '');
  const [semester, setSemester] = useState(user?.semester || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Privacy policy modal
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Delete account confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationPass, setDeleteConfirmationPass] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      fullName: fullName.trim(),
      course: course.trim(),
      semester: semester.trim(),
    });
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleDeleteAccountConfirm = async () => {
    if (!deleteConfirmationPass) {
      setDeleteError('Please enter your password to confirm permanent deletion.');
      return;
    }
    await deleteAccount(deleteConfirmationPass);
    setShowDeleteModal(false);
  };

  return (
    <div className="p-4 space-y-4 pb-20 max-w-2xl mx-auto animate-in fade-in">
      {/* Title */}
      <div>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          Settings & Student Profile
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage your personal details, preferred AI response language, theme appearance, and privacy controls.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>Profile changes saved successfully.</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Student Information
          </span>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs text-purple-600 dark:text-purple-400 font-semibold hover:underline"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Course
                </label>
                <input
                  type="text"
                  required
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Semester
                </label>
                <input
                  type="text"
                  required
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-xs"
            >
              Save Changes
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white flex items-center justify-center font-extrabold text-base shadow-sm">
              {user?.fullName?.slice(0, 2).toUpperCase() || 'ST'}
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">{user?.fullName || 'Guest Student'}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email || 'No email attached'}</p>
              <div className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-0.5">
                {user?.course} · {user?.semester}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preferred AI Response Language (Requirement 9) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2.5">
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Preferred Response Language
          </span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          The selected language applies to Chatbot, Notes, Exam Answers, Quizzes, and PDF Assistant. Interface labels support English & Hindi.
        </p>

        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'English' as ResponseLanguage, label: 'English', desc: 'Standard Academic English' },
            { id: 'Hindi' as ResponseLanguage, label: 'हिन्दी (Hindi)', desc: 'देवनागरी लिपि में पूर्ण उत्तर' },
            { id: 'Kannada' as ResponseLanguage, label: 'ಕನ್ನಡ (Kannada)', desc: 'ಕನ್ನಡ ಲಿಪಿಯಲ್ಲಿ ಶೈಕ್ಷಣಿಕ ಉತ್ತರಗಳು' },
            { id: 'Hinglish' as ResponseLanguage, label: 'Hinglish', desc: 'Hindi in Roman letters + English' },
          ].map((lang) => (
            <button
              key={lang.id}
              onClick={() => setLanguage(lang.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                language === lang.id
                  ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-purple-300'
              }`}
            >
              <div className="text-xs font-bold">{lang.label}</div>
              <div className="text-[10px] opacity-80 mt-0.5">{lang.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Theme Appearance (Light, Dark, System) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2.5">
        <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
          Theme & Display
        </span>

        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'light' as AppTheme, label: 'Light', icon: Sun },
            { id: 'dark' as AppTheme, label: 'Dark', icon: Moon },
            { id: 'system' as AppTheme, label: 'System', icon: Laptop },
          ].map((th) => {
            const Icon = th.icon;
            return (
              <button
                key={th.id}
                onClick={() => setTheme(th.id)}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  theme === th.id
                    ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-purple-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{th.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* AI Usage Information (Requirement 12) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            AI Quota & Usage
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase">Requests This Hour</span>
            <div className="text-base font-extrabold font-mono text-purple-600 dark:text-purple-400 mt-1">
              {aiRequestsUsedHour} / 30
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Cloud Functions hourly limit</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase">Total Requests (Month)</span>
            <div className="text-base font-extrabold font-mono text-slate-800 dark:text-slate-200 mt-1">
              {user?.aiRequestsCountMonth || 42}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Active semester cycle</p>
          </div>
        </div>

        {/* AI Accuracy Disclaimer */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 text-xs flex items-start gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <p className="leading-relaxed">
            <strong>AI Accuracy Notice:</strong> AI-generated explanations, notes, and solutions may occasionally contain inaccuracies or approximations. Always verify critical engineering and examination proofs against standard university textbooks.
          </p>
        </div>
      </div>

      {/* Privacy Policy & Data Storage */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Privacy & Data Policy
            </span>
          </div>
          <button
            onClick={() => setShowPrivacyModal(true)}
            className="text-xs text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1 hover:underline"
          >
            <span>View Policy</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Only minimal required data is collected: name, course, semester, and language preference. Cloud Firestore security rules enforce strict per-user ownership. Uploaded photos and PDFs are deleted when the document or account is deleted.
        </p>
      </div>

      {/* Account Actions: Logout & Delete Account */}
      <div className="space-y-2 pt-2">
        <button
          onClick={logout}
          className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out & Clear Local Cache</span>
        </button>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="w-full py-2.5 px-4 rounded-xl border border-rose-300 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete Student Account Permanently</span>
        </button>
      </div>

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 max-h-[80vh] flex flex-col">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">EduGenius AI Privacy Policy</h2>
            <div className="flex-1 overflow-y-auto space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed pr-1">
              <p>
                <strong>1. Data Minimization Principle:</strong> EduGenius AI collects solely your name, enrolled academic course, semester level, and response language. We do not collect location, contacts, or device telemetry.
              </p>
              <p>
                <strong>2. Storage & Security Rules:</strong> All personal study records, chat transcripts, saved notes, and planner tasks are protected by Firestore security rules ensuring <code className="font-mono text-purple-600">request.auth.uid == userId</code>.
              </p>
              <p>
                <strong>3. Image & PDF Deletion:</strong> Uploaded textbook photos and PDF chapters are processed ephemerally on the backend via Firebase Cloud Functions and deleted when items or accounts are deleted.
              </p>
              <p>
                <strong>4. Account Deletion:</strong> Deleting your account triggers complete cascade deletion across Firebase Auth, Firestore collections, and Storage buckets.
              </p>
            </div>
            <button
              onClick={() => setShowPrivacyModal(false)}
              className="mt-4 w-full py-2 bg-purple-600 text-white rounded-xl text-xs font-semibold"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* Delete Account Re-auth Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-rose-300 dark:border-rose-900/60 p-5 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Delete Account & Data?</h3>
              <p className="text-xs text-slate-500 mt-1">
                This action is irreversible. All your Firestore documents, saved notes, quizzes, and planner tasks will be permanently removed.
              </p>
            </div>

            {deleteError && <p className="text-[11px] text-rose-500 text-center">{deleteError}</p>}

            <div>
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Enter password to re-authenticate:
              </label>
              <input
                type="password"
                value={deleteConfirmationPass}
                onChange={(e) => setDeleteConfirmationPass(e.target.value)}
                placeholder="Your password"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccountConfirm}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
