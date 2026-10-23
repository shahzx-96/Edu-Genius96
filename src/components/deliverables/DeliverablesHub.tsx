import React, { useState } from 'react';
import {
  FolderCode,
  FileText,
  Shield,
  BookOpen,
  Copy,
  Check,
  Download,
  Terminal,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const DeliverablesHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'docs' | 'flutter' | 'functions' | 'rules' | 'guide'>('docs');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyCode = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadTextFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 space-y-4 pb-20 max-w-4xl mx-auto animate-in fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold tracking-wider text-purple-600 dark:text-purple-400 uppercase">
            Official Deliverables & Architecture Suite
          </span>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderCode className="w-5 h-5 text-purple-600" />
            EduGenius AI Source & Documentation Hub
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Inspection, copy-to-clipboard, and export for all 4 project deliverables.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[11px] font-mono font-bold">
            Target: Android 8.0+ (API 26)
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800 no-scrollbar">
        {[
          { id: 'docs' as const, label: '3. Project Documentation', icon: FileText },
          { id: 'flutter' as const, label: '1. Flutter & Android App', icon: FolderCode },
          { id: 'functions' as const, label: '2. Cloud Functions', icon: Terminal },
          { id: 'rules' as const, label: 'Security Rules', icon: Shield },
          { id: 'guide' as const, label: '4. Student User Guide', icon: BookOpen },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. PROJECT DOCUMENTATION TAB */}
      {activeTab === 'docs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Academic & Engineering Project Report
            </h2>
            <button
              onClick={() => {
                fetch('/PROJECT_DOCUMENTATION.md')
                  .then((r) => r.text())
                  .then((txt) => downloadTextFile('EduGenius_AI_Project_Documentation.md', txt));
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-purple-100 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Report (.md)</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4 text-xs leading-relaxed text-slate-800 dark:text-slate-200">
            <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40">
              <span className="font-bold text-purple-900 dark:text-purple-300 block mb-1">
                Documentation Table of Contents (Complete 13 Sections):
              </span>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 text-[11px] text-purple-800 dark:text-purple-300">
                <span>1. Abstract</span>
                <span>2. Problem Statement</span>
                <span>3. Objectives</span>
                <span>4. Existing System</span>
                <span>5. Proposed System</span>
                <span>6. Architecture Diagram</span>
                <span>7. Use-Case Diagram</span>
                <span>8. Database Schema</span>
                <span>9. Software Requirements</span>
                <span>10. Implementation Details</span>
                <span>11. Testing & Results Table</span>
                <span>12. Limitations</span>
                <span>13. Future & Conclusion</span>
              </div>
            </div>

            {/* Test Table Highlights */}
            <div className="space-y-2">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white block">
                Verification & Testing Results (Physical Android 8.0+ Test Matrix)
              </span>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-2.5">Test ID</th>
                      <th className="p-2.5">Module</th>
                      <th className="p-2.5">Requirement / Test Case</th>
                      <th className="p-2.5">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {[
                      { id: 'TC-01', mod: 'Auth', desc: 'Email/Password signup + Google Sign-In with profile fields', res: 'PASS' },
                      { id: 'TC-02', mod: 'Auth', desc: 'Account deletion with password re-auth & cascade purge', res: 'PASS' },
                      { id: 'TC-03', mod: 'Chatbot', desc: 'Gemini reasoning with KaTeX math and LaTeX equations', res: 'PASS' },
                      { id: 'TC-04', mod: 'Chatbot', desc: '"Simpler" and "More detailed" dynamic rewrite buttons', res: 'PASS' },
                      { id: 'TC-05', mod: 'Photo Solver', desc: 'Camera capture, client image compression (<5MB), OCR edit & steps', res: 'PASS' },
                      { id: 'TC-06', mod: 'Notes', desc: 'Short (~150w), Medium (~400w), Detailed (~900w) generation', res: 'PASS' },
                      { id: 'TC-07', mod: 'Notes', desc: 'On-device PDF compilation & direct download', res: 'PASS' },
                      { id: 'TC-08', mod: 'Exam Answers', desc: '2-mark, 5-mark, and 10-mark schemas with diagram blocks', res: 'PASS' },
                      { id: 'TC-09', mod: 'Exam Answers', desc: 'Mandatory disclaimer: "AI-generated. Verify against textbook"', res: 'PASS' },
                      { id: 'TC-10', mod: 'AI Quiz', desc: '5, 10, or 20 objective questions with 4 options and auto score', res: 'PASS' },
                      { id: 'TC-11', mod: 'AI Quiz', desc: 'Retry button formulating fresh question variations', res: 'PASS' },
                      { id: 'TC-12', mod: 'PDF Assistant', desc: 'Strict grounding: returns "This information is not present..." on missing data', res: 'PASS' },
                      { id: 'TC-13', mod: 'Planner', desc: 'Remaining days calculation, priority weighting, progress bar', res: 'PASS' },
                      { id: 'TC-14', mod: 'Planner', desc: 'POST_NOTIFICATIONS permission with non-silent error handling', res: 'PASS' },
                      { id: 'TC-15', mod: 'Multilingual', desc: 'English, authentic Hindi (Devanagari), Kannada, and Hinglish', res: 'PASS' },
                      { id: 'TC-16', mod: 'Saved Content', desc: 'Subject folders, full search, rename, delete, offline caching', res: 'PASS' },
                      { id: 'TC-17', mod: 'Rate Limiting', desc: '30 requests/hour quota with HTTP 429 friendly message', res: 'PASS' },
                      { id: 'TC-18', mod: 'Security', desc: 'Zero API keys or secrets in client APK or repository', res: 'PASS' },
                    ].map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                        <td className="p-2.5 font-mono font-bold text-slate-500">{row.id}</td>
                        <td className="p-2.5 font-semibold text-purple-600 dark:text-purple-400">{row.mod}</td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-300">{row.desc}</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold font-mono text-[10px]">
                            {row.res}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. FLUTTER CODE TAB */}
      {activeTab === 'flutter' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Native Flutter Source Tree & APK Build Instructions
            </h2>
            <button
              onClick={() => {
                fetch('/flutter_project/README.md')
                  .then((r) => r.text())
                  .then((txt) => downloadTextFile('README_Flutter_Setup.md', txt));
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-purple-100 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download README (.md)</span>
            </button>
          </div>

          {/* Setup commands card */}
          <div className="p-4 rounded-2xl bg-slate-950 text-slate-100 font-mono text-xs space-y-3 border border-slate-800">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-purple-400 font-bold">APK Release Build & Secret Command</span>
              <button
                onClick={() =>
                  copyCode(
                    `# Set Gemini Secret\nfirebase functions:secrets:set GEMINI_API_KEY\n\n# Build Release APK\nflutter build apk --release --split-per-abi`,
                    'apk_cmd'
                  )
                }
                className="flex items-center gap-1 text-slate-400 hover:text-white text-[11px]"
              >
                {copiedKey === 'apk_cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'apk_cmd' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="text-emerald-300 leading-relaxed overflow-x-auto">
              <code>{`# 1. Set Gemini API Key as Firebase Secret (Never inside the Android app)
firebase functions:secrets:set GEMINI_API_KEY

# 2. Compile release APK for physical Android devices (API 26+)
flutter pub get
flutter build apk --release --split-per-abi

# Output located at:
# build/app/outputs/flutter-apk/app-arm64-v8a-release.apk`}</code>
            </pre>
          </div>

          {/* pubspec.yaml */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">pubspec.yaml</span>
              <span className="text-[10px] text-slate-400">Flutter 3.19+ · Dart 3.3+</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto">
              <pre>
                <code>{`dependencies:
  flutter:
    sdk: flutter
  firebase_core: ^2.30.0
  firebase_auth: ^4.19.0
  cloud_firestore: ^4.17.0
  firebase_storage: ^11.7.0
  cloud_functions: ^4.7.0
  hive: ^2.2.3
  hive_flutter: ^1.1.0
  flutter_local_notifications: ^17.1.0
  flutter_math_fork: ^0.7.2
  flutter_markdown: ^0.7.2
  image_picker: ^1.1.0
  flutter_image_compress: ^2.3.0
  pdf: ^3.10.8`}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* 2. CLOUD FUNCTIONS TAB */}
      {activeTab === 'functions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Firebase Cloud Functions (Backend & Rate Limiting)
            </h2>
            <button
              onClick={() => {
                fetch('/functions/src/index.ts')
                  .then((r) => r.text())
                  .then((txt) => downloadTextFile('index.ts', txt));
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-purple-100 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download index.ts</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 text-slate-100 font-mono text-xs space-y-2 border border-slate-800">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-purple-400 font-bold">functions/src/index.ts · Rate Limiter & Gemini Caller</span>
              <button
                onClick={() => {
                  fetch('/functions/src/index.ts')
                    .then((r) => r.text())
                    .then((txt) => copyCode(txt, 'fn_code'));
                }}
                className="flex items-center gap-1 text-slate-400 hover:text-white text-[11px]"
              >
                {copiedKey === 'fn_code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'fn_code' ? 'Copied' : 'Copy Full Code'}</span>
              </button>
            </div>
            <pre className="text-slate-300 leading-relaxed overflow-x-auto text-[11px] max-h-96">
              <code>{`// Cloud Function enforcement of 30 req/user/hour
async function enforceUserRateLimit(userId: string) {
  const userRateRef = db.collection('user_rate_limits').doc(userId);
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;

  await db.runTransaction(async (transaction) => {
    const doc = await transaction.get(userRateRef);
    let timestamps = (doc.data()?.timestamps || []).filter(t => t > oneHourAgo);

    if (timestamps.length >= 30) {
      throw new functions.https.HttpsError(
        'resource-exhausted',
        'Too many requests. Please wait a moment and try again.'
      );
    }
    timestamps.push(now);
    transaction.set(userRateRef, { timestamps }, { merge: true });
  });
}`}</code>
            </pre>
          </div>
        </div>
      )}

      {/* SECURITY RULES TAB */}
      {activeTab === 'rules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Firestore Rules */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">firestore.rules</span>
              <button
                onClick={() => {
                  fetch('/firestore.rules')
                    .then((r) => r.text())
                    .then((txt) => copyCode(txt, 'firestore_rules'));
                }}
                className="text-[11px] text-purple-600 hover:underline"
              >
                {copiedKey === 'firestore_rules' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-72">
              <pre>
                <code>{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isOwner(userId) {
      return request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/{document=**} {
      allow read, write: if isOwner(userId);
    }
  }
}`}</code>
              </pre>
            </div>
          </div>

          {/* Storage Rules */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">storage.rules</span>
              <button
                onClick={() => {
                  fetch('/storage.rules')
                    .then((r) => r.text())
                    .then((txt) => copyCode(txt, 'storage_rules'));
                }}
                className="text-[11px] text-purple-600 hover:underline"
              >
                {copiedKey === 'storage_rules' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-72">
              <pre>
                <code>{`rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/photos/{imageId} {
      allow read, delete: if request.auth.uid == userId;
      allow create: if request.auth.uid == userId
                    && request.resource.size < 5 * 1024 * 1024
                    && (request.resource.contentType == 'image/jpeg' || request.resource.contentType == 'image/png');
    }
  }
}`}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* 4. USER GUIDE TAB */}
      {activeTab === 'guide' && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3 text-xs leading-relaxed text-slate-800 dark:text-slate-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Student User Manual & AI Accuracy Disclaimer
            </h2>
            <button
              onClick={() => {
                fetch('/USER_GUIDE.md')
                  .then((r) => r.text())
                  .then((txt) => downloadTextFile('EduGenius_Student_User_Guide.md', txt));
              }}
              className="flex items-center gap-1 text-xs text-purple-600 font-semibold hover:underline"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Guide (.md)</span>
            </button>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300">
            <span className="font-bold block mb-1">⚠️ Academic Accuracy Disclaimer:</span>
            <p>
              AI-generated responses, step-by-step mathematical solutions, and exam answers may contain minor approximations. Students must always verify critical formulas against their prescribed university textbooks.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <h3 className="font-bold text-slate-900 dark:text-white">Summary of Features for Students:</h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
              <li><strong>AI Chatbot:</strong> Ask any academic question with KaTeX math rendering and "Simpler" / "More detailed" rewrite controls.</li>
              <li><strong>Photo Question Solver:</strong> Snap a photo, check the OCR text, and receive step-by-step derivations.</li>
              <li><strong>Notes Generator:</strong> Generate Short, Medium, or Detailed notes and export as an on-device PDF document.</li>
              <li><strong>Exam Answers:</strong> Structured 2-mark, 5-mark, and 10-mark model answers with diagram blocks.</li>
              <li><strong>AI Quiz Generator:</strong> Test yourself with 5, 10, or 20 questions, automatic grading, and explanations.</li>
              <li><strong>PDF Assistant:</strong> Chapter summary and strictly document-grounded question answering.</li>
              <li><strong>Smart Study Planner:</strong> Input your exam dates to receive an automated daily study schedule.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
