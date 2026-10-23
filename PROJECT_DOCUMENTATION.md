# EduGenius AI - Comprehensive Academic & Engineering Project Documentation

**Project Title:** EduGenius AI: An Intelligent Multi-Modal Mobile Academic Assistant and Examination Preparation System  
**Tagline:** Your Personal AI Teacher in Your Pocket.  
**Target Platform:** Native Android (Flutter & Dart, API 26+)  
**Cloud Backend:** Firebase Cloud Functions, Cloud Firestore, Firebase Storage, Google Gemini API  

---

## 1. Abstract
In higher education and competitive examinations, students continually encounter hurdles in conceptual clarity, mathematical problem derivation, exam answer synthesis, and self-directed revision planning. Conventional e-learning platforms remain passive content repositories lacking personalized, real-time dialogue and context-aware pedagogical guidance. **EduGenius AI** introduces an intelligent, native Android mobile application designed to function as an on-demand personal academic tutor. Powered by Google Gemini's multimodal foundation models and integrated with Firebase Cloud Functions and Cloud Firestore, EduGenius AI provides conversational subject tutoring with LaTeX mathematical typesetting, instant photo-based optical problem solving, length-calibrated revision notes synthesis with on-device PDF compilation, university marking scheme-aligned answer drafting (2-mark, 5-mark, and 10-mark), adaptive objective quizzes with instant explanations, strictly grounded document Q&A, and priority-weighted study calendar scheduling with notification reminders. By preserving a zero-leakage security posture—where all foundation model credentials remain server-side secrets—EduGenius AI democratizes high-tier academic mentoring for students across diverse socio-economic backgrounds and languages.

---

## 2. Problem Statement
Contemporary higher education and competitive examination preparation face systemic challenges:
1. **Inequitable Mentorship Access:** Access to experienced subject tutors is constrained by geographical, financial, and institutional barriers.
2. **Textbook-to-Exam Disconnect:** Students frequently struggle to translate conceptual understanding into the rigorous, marks-calibrated formats mandated by university evaluation schemes (e.g., distinguishing between 2-mark definitions and 10-mark architectural proofs).
3. **Multimodal Friction:** Mathematical formulas, engineering circuit diagrams, and handwritten derivations cannot be easily parsed by traditional keyword search engines.
4. **Information Hallucination & Academic Trust:** Unconstrained language models often generate spurious claims when querying lengthy academic literature; students require strict document fidelity.
5. **Inefficient Study Schedules:** Without algorithmic prioritization, students fail to balance examination proximity with subject difficulty.

---

## 3. Objectives
- Develop a native Android mobile application using Flutter and Dart that targets Android 8.0 (API 26) through Android 14 (API 34).
- Implement a zero-trust server-side architecture using Firebase Cloud Functions, ensuring the Google Gemini API key is never exposed to the client bundle.
- Deliver step-by-step LaTeX formula rendering for complex engineering mathematics, physics, and coding equations.
- Provide a camera-driven photo solver that compresses image payloads, transcribes handwritten/textbook questions via vision OCR, allows student verification, and renders rigorous mathematical derivations.
- Build an academic notes generator supporting Short (~150 words), Medium (~400 words), and Detailed (~900 words) lengths, with native on-device PDF generation.
- Formulate university-standard exam answers calibrated to 2-mark, 5-mark, and 10-mark question formats, accompanied by mandatory textbook verification disclaimers.
- Implement adaptive AI quizzes (5, 10, or 20 questions) with instant scoring, explanatory reviews, and retry variation.
- Enforce strict document grounding in a PDF Study Assistant, returning an explicit non-presence notice if queries fall outside the document scope.
- Provide multilingual support across English, Hindi (Devanagari script), Kannada, and Hinglish.

---

## 4. Existing System vs. Proposed System

| Dimension | Existing Systems (Quizlet, Chegg, ChatGPT Web) | Proposed System (EduGenius AI) |
| :--- | :--- | :--- |
| **Mobile Architecture** | Often responsive web apps in WebViews with high latency | Native Flutter compiled ARM64/ARMv7 APK with smooth 60fps animations (<300ms transitions) |
| **Exam Scheme Alignment**| Generic conversational output without mark calibration | Explicit 2-mark, 5-mark, and 10-mark schemas with diagram representations |
| **Math & LaTeX Rendering** | Raw markdown or broken unicode symbols | KaTeX / flutter_math_fork inline and display math formula typesetting |
| **Document Grounding** | Prone to broad web hallucinations | Strict closed-domain grounding; explicit non-presence fallback notice |
| **Local Offline Cache** | Requires continuous high-bandwidth connectivity | Dual-tier caching with Hive/Isar and Cloud Firestore offline persistence |
| **Multilingual Breadth** | Usually English only or poor transliterations | English, authentic Hindi (Devanagari), Kannada, and Hinglish |

---

## 5. System Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                           CLIENT TIER (Native Android)                           |
|  +-----------------------------------------------------------------------------+  |
|  | Flutter Presentation Layer (Material 3: Blue, White, Purple Palette)        |  |
|  | - Splash Screen (2s)   - Bottom Nav (5 Tabs)   - KaTeX / flutter_math_fork  |  |
|  | - Camera & Image Picker with Client Compression (<5MB)                      |  |
|  | - On-Device PDF Generator (pdf package)        - Local Notifications (POST) |  |
|  +-----------------------------------------------------------------------------+  |
|  | State & Local Cache: Provider / Hive Local Box (Offline Persistence)       |  |
|  +-----------------------------------------------------------------------------+  |
+------------------------------------------+----------------------------------------+
                                           | HTTPS / Firebase Auth JWT Token
                                           v
+-----------------------------------------------------------------------------------+
|                        SECURITY & MIDDLEWARE GATEWAY TIER                        |
|  - Firebase Authentication (Email/Password with Verification & Google Sign-In)   |
|  - Cloud Firestore Security Rules (Strict request.auth.uid == userId validation) |
|  - Firebase Storage Security Rules (MIME and Size constraints: <5MB / <10MB)     |
+------------------------------------------+----------------------------------------+
                                           | Authenticated Callable RPC
                                           v
+-----------------------------------------------------------------------------------+
|                       BACKEND TIER (Firebase Cloud Functions)                     |
|  +-----------------------------------------------------------------------------+  |
|  | Node.js / TypeScript Serverless Runtime (Node 18 LTS)                        |  |
|  | - Input Validation (Max 2,000 characters, schema validation)               |  |
|  | - User Rate Limiter (Max 30 requests/user/hour via Firestore transactions) |  |
|  | - PDF Text Extractor (pdf-parse)                                            |  |
|  | - Firebase Secret Manager (Encrypted GEMINI_API_KEY)                         |  |
|  +-----------------------------------------------------------------------------+  |
+------------------------------------------+----------------------------------------+
                                           | Encrypted TLS 1.3 Request
                                           v
+-----------------------------------------------------------------------------------+
|                              FOUNDATION MODEL AI TIER                             |
|  - Google Gemini API (@google/genai SDK): gemini-3.8-flash (Text & Vision OCR)   |
|  - Academic Prompts with LaTeX Formulations & Multilingual Directives             |
+-----------------------------------------------------------------------------------+
```

---

## 6. Use-Case Diagram

```
                              +---------------------------------------+
                              |              EduGenius AI             |
                              +---------------------------------------+
                                  |
    +-----------------------------+-----------------------------+
    |                             |                             |
    v                             v                             v
[Student / User]             [Student / User]              [Student / User]
    |                             |                             |
    +---> Sign Up / Sign In       +---> Solve Photo Problem     +---> Create Study Plan
    |     (Email / Google)        |     (OCR & LaTeX Steps)     |     (Exam Dates & Priorities)
    |                             |                             |
    +---> Ask AI Chatbot          +---> Generate Notes          +---> Manage Saved Content
    |     (Simpler/Detailed)      |     (Short/Med/Detailed)    |     (Folder Organization)
    |                             |                             |
    +---> Generate Exam Answer    +---> Take Academic Quiz      +---> Export Notes to PDF
          (2, 5, 10 Marks)              (5, 10, 20 Questions)         (Local Device Download)
```

---

## 7. Database Schema (Cloud Firestore)

### Collection: `users/{userId}`
```json
{
  "fullName": "String",
  "email": "String",
  "course": "String",
  "semester": "String",
  "preferredLanguage": "String (English | Hindi | Kannada | Hinglish)",
  "createdAt": "Timestamp",
  "aiRequestsCountMonth": "Number"
}
```

### Sub-Collection: `users/{userId}/conversations/{convId}`
```json
{
  "title": "String",
  "subject": "String",
  "updatedAt": "Timestamp",
  "messages": [
    {
      "id": "String",
      "role": "String (user | assistant)",
      "content": "String",
      "timestamp": "Timestamp",
      "mode": "String (normal | simpler | detailed)"
    }
  ]
}
```

### Sub-Collection: `users/{userId}/saved_content/{itemId}`
```json
{
  "title": "String",
  "content": "String",
  "type": "String (notes | exam_answer | photo_solution | chat | pdf_summary)",
  "subject": "String",
  "module": "String",
  "markType": "String (optional: 2-mark | 5-mark | 10-mark)",
  "createdAt": "Timestamp"
}
```

### Sub-Collection: `users/{userId}/quiz_history/{quizId}`
```json
{
  "subject": "String",
  "topic": "String",
  "questionCount": "Number",
  "score": "Number",
  "percentage": "Number",
  "date": "Timestamp"
}
```

### Sub-Collection: `users/{userId}/study_tasks/{taskId}`
```json
{
  "subjectId": "String",
  "subjectName": "String",
  "title": "String",
  "date": "String (YYYY-MM-DD)",
  "durationMinutes": "Number",
  "priority": "String (High | Medium | Low)",
  "completed": "Boolean",
  "reminderEnabled": "Boolean"
}
```

---

## 8. Software Requirements & Specifications
- **Operating System:** Android 8.0 (API Level 26) through Android 14 (API Level 34)
- **Minimum RAM:** 2 GB (Mid-range hardware optimized)
- **Required Device Permissions:**
  - `android.permission.INTERNET`: Backend data communications
  - `android.permission.CAMERA`: Capturing problems for Photo Solver
  - `android.permission.READ_MEDIA_IMAGES` / `READ_EXTERNAL_STORAGE`: Gallery access
  - `android.permission.POST_NOTIFICATIONS`: Android 13+ Study reminder alarms
- **Network Protocol:** TLS 1.3 over HTTPS with gRPC / JSON payloads
- **Cloud Run / Hosting:** Node.js Express server with Vite middleware

---

## 9. Implementation Details

1. **Authentication Flow:** Implemented dual-mode authentication via Firebase Auth. Google Sign-In delegates OAuth tokens via the Google Play Services credential provider. Email verification is enforced before full profile synchronization. Account deletion cascades through Auth and Firestore, deleting all linked storage objects with a mandatory password re-authentication modal.
2. **AI Study Chatbot:** Uses Gemini 3.8 Flash configured with a specialized academic system instruction. The client provides instant feedback with a three-dot bounce typing indicator and supports "Simpler" and "More detailed" rewrite triggers.
3. **Photo Solver OCR & Vision Pipeline:** High-resolution camera captures are downsampled on-device to under 1200px width/height and compressed to JPEG quality 0.82 to satisfy the 5MB ceiling. Gemini Vision transcribes text and formulas into LaTeX.
4. **On-Device PDF Generation:** Notes generated across Short, Medium, and Detailed modes can be instantly formatted into A4 PDF documents with custom header branding, word-wrapped paragraphs, page number pagination, and timestamped watermarks.
5. **Rate Limiting & Server Hardening:** Cloud Functions enforce a strict quota of 30 requests per user per hour via atomic Firestore transactions, returning a graceful HTTP 429 response when limits are approached.

---

## 10. Testing and Results (Verification Table)

Each module was systematically verified against functional requirements and physical Android hardware specifications:

| Test ID | Module / Feature | Test Case Description | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Authentication | Sign up with email/password and verify profile fields | User registered with Name, Course, Semester; verification required | **PASS** |
| **TC-02** | Authentication | Account deletion with re-authentication | Clears local cache, deletes Firestore documents & auth credentials | **PASS** |
| **TC-03** | AI Chatbot | General academic query with LaTeX math equations | Renders headings, bullet points, and KaTeX equations ($...$ & $$...$$) | **PASS** |
| **TC-04** | AI Chatbot | "Simpler" & "More detailed" buttons | Rewrites previous query with tailored pedagogical depth | **PASS** |
| **TC-05** | Photo Solver | Upload photo of mathematical problem (>5MB) | Compresses image client-side, extracts text for user edit, solves in steps | **PASS** |
| **TC-06** | Notes Generator | Generate Short, Medium, and Detailed notes | Word count targets (~150, ~400, ~900 words) strictly adhered to | **PASS** |
| **TC-07** | Notes Generator | Export notes as PDF on device | Generates branded A4 PDF file and initiates local device download | **PASS** |
| **TC-08** | Exam Answers | 2-mark, 5-mark, 10-mark schemas | Formats according to university criteria with diagram descriptions | **PASS** |
| **TC-09** | Exam Answers | Textbook verification disclaimer | Prominently displays: "AI-generated. Verify against your textbook before use." | **PASS** |
| **TC-10** | AI Quiz | 5, 10, or 20 objective questions generation | Exactly 4 options per question, 1 correct index, auto score & explanations | **PASS** |
| **TC-11** | AI Quiz | Quiz retry functionality | "Retry" triggers a fresh quiz session with newly formulated questions | **PASS** |
| **TC-12** | PDF Assistant | Document Q&A with out-of-document query | Strictly returns: "This information is not present in the uploaded document." | **PASS** |
| **TC-13** | Study Planner | Schedule generation & task toggle | Computes remaining days, subject priorities, and updates progress % | **PASS** |
| **TC-14** | Study Planner | Notification reminder permission | Requests POST_NOTIFICATIONS; shows clear message on denial without crashing | **PASS** |
| **TC-15** | Multilingual | Language switch (Hindi, Kannada, Hinglish) | Generates AI responses in selected script/transliteration accurately | **PASS** |
| **TC-16** | Saved Content | Subject creation, rename, delete, search | Persists across app reboots; full search matches title & body text | **PASS** |
| **TC-17** | Rate Limiter | Exceeding 30 requests/hour | Returns: "Too many requests. Please wait a moment and try again." | **PASS** |
| **TC-18** | Security | Verify API key isolation | Zero API keys or secrets stored in mobile client bundle or Git repo | **PASS** |

---

## 11. Limitations
- **Scanned Image PDFs:** PDFs without an optical text layer require preliminary OCR conversion before notes synthesis can be executed.
- **Network Dependency:** Real-time AI generation requires active internet connectivity (though cached notes, saved content, and offline planner tasks remain accessible via local Hive storage).
- **Subjective Exam Grading:** The system synthesizes model answers but does not yet auto-grade long-form essay submissions handwritten by students.

---

## 12. Future Enhancements
- Integration of voice-driven multimodal question input via Gemini Live API.
- Offline lightweight SLM (Small Language Model) inference for basic definitions without internet.
- Peer-to-peer collaborative study group rooms with shared whiteboard synchronization.
- University LMS (Canvas / Moodle) syllabus integration via LTI standards.

---

## 13. Conclusion
EduGenius AI establishes a comprehensive, secure, and production-grade mobile learning platform engineered specifically for the demands of school, college engineering, and competitive examination candidates. By combining high-fidelity LaTeX typesetting, multimodal vision OCR, exam mark schemas, strictly grounded document analysis, and native Android touch ergonomics, EduGenius AI bridges the critical gap between raw foundation model capabilities and practical academic success.
