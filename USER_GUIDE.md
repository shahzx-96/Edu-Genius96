# EduGenius AI - Comprehensive Student User Guide

> **Tagline:** Your Personal AI Teacher in Your Pocket.

Welcome to **EduGenius AI**! This guide walks you through every feature of the app to maximize your academic performance and study productivity.

---

## ⚠️ Important AI Accuracy Disclaimer
> **Notice:** EduGenius AI uses advanced Google Gemini foundation models to generate academic explanations, step-by-step mathematical solutions, and exam answers. While exceptionally accurate for standard university and school syllabi, artificial intelligence models may occasionally introduce minor mathematical approximations or typographical errors. **Always verify critical derivations and formulas against your prescribed university textbook before writing examinations.**

---

## 1. Getting Started & Profile Setup
1. **Sign In or Sign Up:**
   - Log in using your email and password or use **Sign in with Google**.
   - Fill in your **Full Name**, **Course** (e.g., *B.Tech Computer Science*), **Semester**, and **Preferred Language**.
2. **Language Selection:**
   - Choose between **English**, **Hindi (हिन्दी)**, **Kannada (ಕನ್ನಡ)**, and **Hinglish** (colloquial Hindi written in English script).
   - This preference instantly customizes all AI responses across Chatbot, Notes, Quizzes, and Exam Answers.

---

## 2. Feature Walkthrough

### 💬 2.1 AI Study Chatbot
- **Ask Any Question:** Type questions regarding engineering (electronics, mechanical, software), mathematics, physics, or general subjects.
- **LaTeX Math Formulas:** Equations appear clearly formatted using standard mathematical symbols.
- **Rewriting Answers:**
  - Click **"Simpler"** if you want an intuitive analogy-based explanation.
  - Click **"More detailed"** if you need an in-depth, rigorous proof or derivation.
- **Bookmark to Saved:** Click the bookmark icon to save any response directly to your personal notes.

### 📸 2.2 Photo Question Solver
- **Capture or Pick Image:** Snap a photo of a textbook question, handwritten derivation, or circuit diagram, or pick an image from your gallery (JPEG/PNG up to 5 MB).
- **Edit & Verify OCR:** The app transcribes the question. You can review and edit the text to fix any smudge or camera glare before solving.
- **Step-by-Step Derivation:** The AI analyzes the problem and outputs numbered, step-by-step working steps with final boxed answers.

### 📝 2.3 AI Notes Generator
- **Upload Syllabus or Textbook:** Paste text or upload a PDF chapter (up to 10 MB, 100 pages).
- **Choose Note Length:**
  - **Short (~150 words):** Quick high-yield revision flashcards.
  - **Medium (~400 words):** Comprehensive summary with key formulas.
  - **Detailed (~900 words):** Complete lecture notes with in-depth analysis.
- **Export to PDF:** Click **"Export PDF"** to generate and download a beautifully styled PDF document directly onto your device.

### 🏆 2.4 Exam Answer Generator
- **Choose Question Format:**
  - **2-Mark:** Crisp definition and 2–3 key bullet points (~60 words).
  - **5-Mark:** Definition, 4–5 important points, practical example, and conclusion (~200 words).
  - **10-Mark:** Formal definition, detailed subheadings, diagram block description, and analytical conclusion (~500 words).
- **Copy & Save:** One-click copy to clipboard with mandatory textbook disclaimer attached.

### ❓ 2.5 AI Quiz Generator
- **Interactive Quizzes:** Select your subject, enter a topic, and pick **5, 10, or 20 questions**.
- **Objective 4-Option Format:** Test your mastery under simulated exam conditions.
- **Instant Explanations:** Receive immediate feedback showing why each option is correct or incorrect.
- **Retries:** Click "Retry" to re-take the quiz with freshly generated questions.

### 📄 2.6 PDF Study Assistant
- **Document-Grounded Study:** Upload any textbook chapter or syllabus document.
- **4 Modes Available:**
  1. *Chapter Summary:* High-level overview and themes.
  2. *Document Q&A:* Ask specific questions. **Guaranteed zero hallucination:** If the answer is not in the uploaded file, the assistant will explicitly state: *"This information is not present in the uploaded document."*
  3. *Revision Notes:* Bulleted memory anchors and formulas.
  4. *Practice Questions:* 5–10 challenging practice questions derived strictly from the text.

### 📅 2.7 Smart Study Planner
- **Track Exams:** Add your subjects, upcoming exam dates, and priority levels (**High**, **Medium**, **Low**).
- **AI Daily Schedule:** The planner automatically schedules daily revision tasks based on remaining days and priority.
- **Study Reminders:** Toggle reminder alarms on tasks (with Android `POST_NOTIFICATIONS` permission).
- **Mastery Tracker:** Check off completed tasks to see your overall progress bar rise toward 100%.

### 🔖 2.8 Saved Content Manager
- Organize all your bookmarked notes, solutions, and answers by **Subject folders**.
- Search instantly across titles and full body text.
- Rename items or delete obsolete revisions with offline caching.

### ⚡ 2.9 Offline Caching (IndexedDB & Hive Engine)
- **Automatic Caching:** Every study material you generate (Short/Medium/Detailed notes, 2/5/10-mark exam answers, photo derivations, and PDF summaries) is automatically persisted in your local **IndexedDB** (`EduGeniusOfflineDB`).
- **No Internet Required:** When your internet disconnects (or when traveling, during power cuts, or in no-network library basements), an **"Offline Study Mode Active"** banner appears.
- **View All Cached Content:** Go to the **Saved** tab and click the **"IndexedDB Cache"** sub-tab. You can search, filter by subject or note type, and open full KaTeX LaTeX formulas and diagrams completely offline.
- **Cache Management:** Visit **Settings** to check your total cached materials count, estimated storage footprint (~KB), and test offline mode with the simulator toggle or clear cache if needed.

---

## 3. Keyboard Shortcuts & Tips
- Press **Enter** in the chat bar to quickly submit questions.
- Click the **Online / Offline** button in the header toolbar to test how the app functions without active connectivity.
- Switch between **Light** and **Dark** themes in Settings for comfortable late-night study sessions.
- In Demo Mode, explore the pre-loaded academic samples to experience all 7 tools without an API key!

