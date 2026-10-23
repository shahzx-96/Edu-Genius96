export type ResponseLanguage = 'English' | 'Hindi' | 'Kannada' | 'Hinglish';
export type AppTheme = 'light' | 'dark' | 'system';
export type PriorityLevel = 'High' | 'Medium' | 'Low';
export type MarkType = '2-mark' | '5-mark' | '10-mark';
export type NoteLength = 'Short' | 'Medium' | 'Detailed';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  course: string;
  semester: string;
  preferredLanguage: ResponseLanguage;
  photoUrl?: string;
  isEmailVerified: boolean;
  createdAt: string;
  aiRequestsCountMonth: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  mode?: 'normal' | 'simpler' | 'detailed';
  language?: ResponseLanguage;
  subject?: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  subject: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface SavedItem {
  id: string;
  title: string;
  content: string;
  type: 'chat' | 'notes' | 'exam_answer' | 'photo_solution' | 'pdf_summary';
  subject: string;
  module?: string;
  createdAt: string;
  markType?: MarkType;
  tags?: string[];
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizHistoryItem {
  id: string;
  subject: string;
  topic: string;
  questionCount: number;
  score: number;
  percentage: number;
  date: string;
  questions: QuizQuestion[];
  userAnswers: number[];
}

export interface StudySubject {
  id: string;
  name: string;
  examDate: string; // YYYY-MM-DD
  priority: PriorityLevel;
}

export interface StudyTask {
  id: string;
  subjectId: string;
  subjectName: string;
  title: string;
  date: string; // YYYY-MM-DD
  durationMinutes: number;
  priority: PriorityLevel;
  completed: boolean;
  reminderEnabled?: boolean;
}

export interface StudyPlan {
  summary: string;
  weeklyTarget: string;
  tasks: StudyTask[];
  generatedAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
}
