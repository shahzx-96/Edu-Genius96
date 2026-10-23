import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AppTheme,
  ChatConversation,
  ChatMessage,
  NotificationItem,
  QuizHistoryItem,
  ResponseLanguage,
  SavedItem,
  StudySubject,
  StudyTask,
  UserProfile,
} from '../types';
import { checkServerStatus } from '../services/api';

interface AppContextType {
  // User & Auth
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<void>;
  signUp: (email: string, pass: string, name: string, course: string, semester: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  deleteAccount: (passwordConfirmation?: string) => Promise<boolean>;
  updateProfile: (updated: Partial<UserProfile>) => void;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;

  // Theme & Language
  theme: AppTheme;
  setTheme: (t: AppTheme) => void;
  language: ResponseLanguage;
  setLanguage: (lang: ResponseLanguage) => void;

  // Navigation
  activeTab: 'home' | 'chat' | 'tools' | 'saved' | 'profile';
  setActiveTab: (tab: 'home' | 'chat' | 'tools' | 'saved' | 'profile') => void;
  activeTool: 'photo' | 'notes' | 'exam' | 'quiz' | 'pdf' | 'planner' | null;
  setActiveTool: (tool: 'photo' | 'notes' | 'exam' | 'quiz' | 'pdf' | 'planner' | null) => void;
  showDeliverables: boolean;
  setShowDeliverables: (show: boolean) => void;

  // Device simulation
  deviceMode: 'phone' | 'phone-large' | 'tablet' | 'full';
  setDeviceMode: (mode: 'phone' | 'phone-large' | 'tablet' | 'full') => void;

  // Chat state
  conversations: ChatConversation[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  addMessageToActive: (msg: ChatMessage) => void;
  createNewConversation: (subject?: string, initialMsg?: string) => string;
  deleteConversation: (id: string) => void;

  // Saved Content
  savedItems: SavedItem[];
  saveItem: (item: Omit<SavedItem, 'id' | 'createdAt'>) => string;
  updateSavedItem: (id: string, updates: Partial<SavedItem>) => void;
  deleteSavedItem: (id: string) => void;
  subjectsList: string[];
  addSubject: (name: string) => void;
  renameSubject: (oldName: string, newName: string) => void;
  deleteSubject: (name: string) => void;

  // Quiz state
  quizHistory: QuizHistoryItem[];
  saveQuizResult: (res: Omit<QuizHistoryItem, 'id' | 'date'>) => void;

  // Study Planner
  subjects: StudySubject[];
  tasks: StudyTask[];
  addStudySubject: (name: string, examDate: string, priority: 'High' | 'Medium' | 'Low') => void;
  deleteStudySubject: (id: string) => void;
  addTask: (task: Omit<StudyTask, 'id'>) => void;
  toggleTaskCompletion: (id: string) => void;
  deleteTask: (id: string) => void;
  toggleTaskReminder: (id: string) => boolean;

  // Notifications
  notifications: NotificationItem[];
  notificationPermissionGranted: boolean;
  requestNotificationPermission: () => Promise<boolean>;

  // Status & Limits
  isDemoMode: boolean;
  aiModelName: string;
  aiRequestsUsedHour: number;
  incrementAiUsage: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial mock data simulating offline Hive / Firestore cached store
const INITIAL_USER: UserProfile = {
  id: 'usr-student-001',
  fullName: 'Aarav Sharma',
  email: 'aarav.sharma@college.edu',
  course: 'B.Tech Computer Science & Engineering',
  semester: '6th Semester',
  preferredLanguage: 'English',
  isEmailVerified: true,
  createdAt: '2026-01-15T09:00:00.000Z',
  aiRequestsCountMonth: 42,
};

const INITIAL_SUBJECTS: StudySubject[] = [
  { id: 'sub-1', name: 'Digital Signal Processing', examDate: '2026-11-12', priority: 'High' },
  { id: 'sub-2', name: 'Database Management Systems', examDate: '2026-11-18', priority: 'Medium' },
  { id: 'sub-3', name: 'Compiler Design', examDate: '2026-11-25', priority: 'High' },
  { id: 'sub-4', name: 'Computer Networks', examDate: '2026-12-02', priority: 'Low' },
];

const INITIAL_TASKS: StudyTask[] = [
  {
    id: 'task-1',
    subjectId: 'sub-1',
    subjectName: 'Digital Signal Processing',
    title: 'Derive FFT Decimation-in-Time 8-point butterfly diagram',
    date: '2026-10-23',
    durationMinutes: 90,
    priority: 'High',
    completed: true,
    reminderEnabled: true,
  },
  {
    id: 'task-2',
    subjectId: 'sub-1',
    subjectName: 'Digital Signal Processing',
    title: 'Solve 5 previous year university exam questions on Bilinear Transform',
    date: '2026-10-23',
    durationMinutes: 60,
    priority: 'High',
    completed: false,
    reminderEnabled: true,
  },
  {
    id: 'task-3',
    subjectId: 'sub-2',
    subjectName: 'Database Management Systems',
    title: 'Review B+ Tree indexing & ACID properties concurrency control',
    date: '2026-10-24',
    durationMinutes: 45,
    priority: 'Medium',
    completed: false,
    reminderEnabled: false,
  },
  {
    id: 'task-4',
    subjectId: 'sub-3',
    subjectName: 'Compiler Design',
    title: 'Construct LR(0) and LALR(1) Parsing Table for grammar G',
    date: '2026-10-25',
    durationMinutes: 75,
    priority: 'High',
    completed: false,
    reminderEnabled: true,
  },
];

const INITIAL_SAVED_ITEMS: SavedItem[] = [
  {
    id: 'saved-1',
    title: 'Maxwell Equations in Differential & Integral Form',
    content: `### Maxwell's Equations Overview\n\n1. **Gauss's Law for Electricity**:\n$$\\nabla \\cdot \\vec{E} = \\frac{\\rho}{\\varepsilon_0}$$\n\n2. **Gauss's Law for Magnetism**:\n$$\\nabla \\cdot \\vec{B} = 0$$\n\n3. **Faraday's Law of Induction**:\n$$\\nabla \\times \\vec{E} = -\\frac{\\partial \\vec{B}}{\\partial t}$$\n\n4. **Ampère-Maxwell Law**:\n$$\\nabla \\times \\vec{B} = \\mu_0 \\vec{J} + \\mu_0 \\varepsilon_0 \\frac{\\partial \\vec{E}}{\\partial t}$$`,
    type: 'notes',
    subject: 'Electromagnetics & Waves',
    module: 'Module 3: Maxwell Field Theory',
    createdAt: '2026-10-21T14:30:00.000Z',
  },
  {
    id: 'saved-2',
    title: 'Explain Dijkstra Algorithm with Time Complexity (10-mark)',
    content: `### 1. Definition\nDijkstra's Algorithm is a greedy single-source shortest path algorithm on weighted graphs with non-negative edge weights.\n\n### 2. Time Complexity\n- Using Adjacency Matrix: $O(V^2)$\n- Using Min-Heap Priority Queue: $O((V + E) \\log V)$\n- Using Fibonacci Heap: $O(E + V \\log V)$\n\n*AI-generated. Verify against your textbook before use.*`,
    type: 'exam_answer',
    subject: 'Algorithms & Data Structures',
    module: 'Graph Algorithms',
    markType: '10-mark',
    createdAt: '2026-10-22T10:15:00.000Z',
  },
  {
    id: 'saved-3',
    title: 'RLC Circuit Differential Equation Solution',
    content: `Second order differential equation for series RLC circuit:\n$$L \\frac{d^2 q}{dt^2} + R \\frac{dq}{dt} + \\frac{1}{C} q = E(t)$$\nRoots: $s_{1,2} = -\\alpha \\pm \\sqrt{\\alpha^2 - \\omega_0^2}$ where $\\alpha = \\frac{R}{2L}$ and $\\omega_0 = \\frac{1}{\\sqrt{LC}}$.`,
    type: 'photo_solution',
    subject: 'Network Theory',
    module: 'Transient Analysis',
    createdAt: '2026-10-22T18:45:00.000Z',
  },
];

const INITIAL_CONVERSATION: ChatConversation = {
  id: 'conv-sample-1',
  title: 'Fourier Transform & Convolution Properties',
  subject: 'Digital Signal Processing',
  updatedAt: '2026-10-23T06:30:00.000Z',
  messages: [
    {
      id: 'msg-1',
      role: 'user',
      content: 'Can you explain the convolution theorem for Continuous-Time Fourier Transform and why it is useful in filters?',
      timestamp: '2026-10-23T06:28:00.000Z',
    },
    {
      id: 'msg-2',
      role: 'assistant',
      content: `### Convolution Property of the Continuous-Time Fourier Transform (CTFT)

The **Convolution Theorem** states that convolution in the time domain corresponds to simple point-by-point multiplication in the frequency domain:

$$y(t) = x(t) * h(t) \\quad \\xleftrightarrow{\\mathcal{F}} \\quad Y(\\omega) = X(\\omega) \\cdot H(\\omega)$$

#### Why is this transformative in engineering?
1. **Computational Speed**: Calculating continuous time convolution $\\int_{-\\infty}^{\\infty} x(\\tau)h(t-\\tau)d\\tau$ is computationally intensive. In contrast, multiplication $X(\\omega) \\cdot H(\\omega)$ requires straightforward algebraic operations.
2. **Filter Design**: An ideal low-pass filter simply multiplies desired frequencies by $1$ and stops unwanted frequencies by multiplying by $0$.
3. **System Characterization**: $H(\\omega)$ is termed the **Frequency Response** of the system.`,
      timestamp: '2026-10-23T06:29:00.000Z',
      mode: 'normal',
    },
  ],
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication & Profile state
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('edugenius_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  // Settings
  const [theme, setThemeState] = useState<AppTheme>(() => {
    return (localStorage.getItem('edugenius_theme') as AppTheme) || 'system';
  });
  const [language, setLanguageState] = useState<ResponseLanguage>(() => {
    return (localStorage.getItem('edugenius_lang') as ResponseLanguage) || 'English';
  });

  // Navigation state
  const [activeTab, setActiveTab] = useState<'home' | 'chat' | 'tools' | 'saved' | 'profile'>('home');
  const [activeTool, setActiveTool] = useState<'photo' | 'notes' | 'exam' | 'quiz' | 'pdf' | 'planner' | null>(null);
  const [showDeliverables, setShowDeliverables] = useState(false);

  // Device view mode
  const [deviceMode, setDeviceMode] = useState<'phone' | 'phone-large' | 'tablet' | 'full'>('phone');

  // Chats
  const [conversations, setConversations] = useState<ChatConversation[]>(() => {
    const saved = localStorage.getItem('edugenius_chats');
    return saved ? JSON.parse(saved) : [INITIAL_CONVERSATION];
  });
  const [activeConversationId, setActiveConversationId] = useState<string | null>(conversations[0]?.id || null);

  // Saved Content
  const [savedItems, setSavedItems] = useState<SavedItem[]>(() => {
    const saved = localStorage.getItem('edugenius_saved');
    return saved ? JSON.parse(saved) : INITIAL_SAVED_ITEMS;
  });

  const [subjectsList, setSubjectsList] = useState<string[]>(() => {
    const saved = localStorage.getItem('edugenius_subjects_list');
    return saved
      ? JSON.parse(saved)
      : ['Engineering Mathematics', 'Digital Signal Processing', 'Algorithms & Data Structures', 'Network Theory', 'Compiler Design', 'General Science'];
  });

  // Quizzes
  const [quizHistory, setQuizHistory] = useState<QuizHistoryItem[]>(() => {
    const saved = localStorage.getItem('edugenius_quiz_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Study Planner
  const [subjects, setSubjects] = useState<StudySubject[]>(() => {
    const saved = localStorage.getItem('edugenius_subjects');
    return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
  });

  const [tasks, setTasks] = useState<StudyTask[]>(() => {
    const saved = localStorage.getItem('edugenius_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Study Reminder: Digital Signal Processing',
      body: 'Time to solve 5 previous year university exam questions on Bilinear Transform.',
      time: '10 mins ago',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'Exam in 20 days: DSP',
      body: 'Your Digital Signal Processing exam is approaching on 2026-11-12. Stay consistent!',
      time: '2 hours ago',
      read: true,
    },
  ]);
  const [notificationPermissionGranted, setNotificationPermissionGranted] = useState(false);

  // Server status & Rate limit
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [aiModelName, setAiModelName] = useState('Checking AI status...');
  const [aiRequestsUsedHour, setAiRequestsUsedHour] = useState(4);

  // Sync to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('edugenius_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('edugenius_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('edugenius_theme', theme);
    // Apply dark class to root document
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('edugenius_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('edugenius_chats', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('edugenius_saved', JSON.stringify(savedItems));
  }, [savedItems]);

  useEffect(() => {
    localStorage.setItem('edugenius_subjects_list', JSON.stringify(subjectsList));
  }, [subjectsList]);

  useEffect(() => {
    localStorage.setItem('edugenius_quiz_history', JSON.stringify(quizHistory));
  }, [quizHistory]);

  useEffect(() => {
    localStorage.setItem('edugenius_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('edugenius_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Check backend server status on mount
  useEffect(() => {
    checkServerStatus().then((status) => {
      setIsDemoMode(status.demoMode);
      setAiModelName(status.model);
    });
  }, []);

  const setTheme = (t: AppTheme) => {
    setThemeState(t);
  };

  const setLanguage = (lang: ResponseLanguage) => {
    setLanguageState(lang);
    if (user) {
      setUser({ ...user, preferredLanguage: lang });
    }
  };

  const incrementAiUsage = () => {
    setAiRequestsUsedHour((prev) => Math.min(30, prev + 1));
    if (user) {
      setUser((prev) => (prev ? { ...prev, aiRequestsCountMonth: prev.aiRequestsCountMonth + 1 } : null));
    }
  };

  // Auth operations
  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    if (!email || !pass) {
      return { success: false, error: 'Please enter both email and password' };
    }
    const loggedInUser: UserProfile = {
      id: `usr-${Date.now()}`,
      fullName: email.split('@')[0].replace(/[._]/g, ' ').toUpperCase(),
      email,
      course: 'B.Tech / Science Studies',
      semester: 'Current Semester',
      preferredLanguage: language,
      isEmailVerified: true,
      createdAt: new Date().toISOString(),
      aiRequestsCountMonth: 5,
    };
    setUser(loggedInUser);
    return { success: true };
  };

  const loginWithGoogle = async () => {
    const googleUser: UserProfile = {
      id: `usr-google-${Date.now()}`,
      fullName: 'Aarav Sharma',
      email: 'aarav.sharma@gmail.com',
      course: 'B.Tech Computer Science & Engineering',
      semester: '6th Semester',
      preferredLanguage: language,
      isEmailVerified: true,
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
      aiRequestsCountMonth: 12,
    };
    setUser(googleUser);
  };

  const signUp = async (email: string, pass: string, name: string, course: string, semester: string) => {
    if (!email || !pass || !name || !course || !semester) {
      return { success: false, error: 'All fields are required.' };
    }
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      fullName: name,
      email,
      course,
      semester,
      preferredLanguage: language,
      isEmailVerified: false,
      createdAt: new Date().toISOString(),
      aiRequestsCountMonth: 0,
    };
    setUser(newUser);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('edugenius_user');
  };

  const deleteAccount = async (): Promise<boolean> => {
    setUser(null);
    localStorage.clear();
    setConversations([]);
    setSavedItems([]);
    setQuizHistory([]);
    setTasks([]);
    return true;
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    if (user) {
      setUser({ ...user, ...updated });
    }
  };

  const resetPassword = async (email: string) => {
    if (!email || !email.includes('@')) {
      return { success: false, message: 'Please provide a valid email address.' };
    }
    return { success: true, message: `Password reset link sent to ${email}. Check your inbox.` };
  };

  // Chat operations
  const createNewConversation = (subject: string = 'General Academic', initialMsg?: string): string => {
    const newId = `conv-${Date.now()}`;
    const newConv: ChatConversation = {
      id: newId,
      title: initialMsg ? initialMsg.slice(0, 35) + (initialMsg.length > 35 ? '...' : '') : `Chat: ${subject}`,
      subject,
      updatedAt: new Date().toISOString(),
      messages: initialMsg
        ? [
            {
              id: `msg-${Date.now()}`,
              role: 'user',
              content: initialMsg,
              timestamp: new Date().toISOString(),
            },
          ]
        : [],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newId);
    return newId;
  };

  const addMessageToActive = (msg: ChatMessage) => {
    if (!activeConversationId) {
      const id = createNewConversation(msg.subject || 'General Academic');
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, messages: [...c.messages, msg], updatedAt: new Date().toISOString() } : c))
      );
      return;
    }

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConversationId) {
          const updatedMessages = [...c.messages, msg];
          let updatedTitle = c.title;
          if (c.messages.length === 0 && msg.role === 'user') {
            updatedTitle = msg.content.slice(0, 35) + (msg.content.length > 35 ? '...' : '');
          }
          return {
            ...c,
            title: updatedTitle,
            messages: updatedMessages,
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      })
    );
  };

  const deleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      setActiveConversationId(remaining[0]?.id || null);
    }
  };

  // Saved Content
  const saveItem = (item: Omit<SavedItem, 'id' | 'createdAt'>): string => {
    const id = `saved-${Date.now()}`;
    const newItem: SavedItem = {
      ...item,
      id,
      createdAt: new Date().toISOString(),
    };
    setSavedItems((prev) => [newItem, ...prev]);
    return id;
  };

  const updateSavedItem = (id: string, updates: Partial<SavedItem>) => {
    setSavedItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const deleteSavedItem = (id: string) => {
    setSavedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const addSubject = (name: string) => {
    if (name && !subjectsList.includes(name)) {
      setSubjectsList((prev) => [...prev, name.trim()]);
    }
  };

  const renameSubject = (oldName: string, newName: string) => {
    if (!newName || newName === oldName) return;
    setSubjectsList((prev) => prev.map((s) => (s === oldName ? newName.trim() : s)));
    setSavedItems((prev) => prev.map((item) => (item.subject === oldName ? { ...item, subject: newName.trim() } : item)));
  };

  const deleteSubject = (name: string) => {
    setSubjectsList((prev) => prev.filter((s) => s !== name));
  };

  // Quizzes
  const saveQuizResult = (res: Omit<QuizHistoryItem, 'id' | 'date'>) => {
    const newItem: QuizHistoryItem = {
      ...res,
      id: `quiz-res-${Date.now()}`,
      date: new Date().toISOString(),
    };
    setQuizHistory((prev) => [newItem, ...prev]);
  };

  // Study Planner
  const addStudySubject = (name: string, examDate: string, priority: 'High' | 'Medium' | 'Low') => {
    const newSub: StudySubject = {
      id: `sub-${Date.now()}`,
      name: name.trim(),
      examDate,
      priority,
    };
    setSubjects((prev) => [...prev, newSub]);
  };

  const deleteStudySubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    setTasks((prev) => prev.filter((t) => t.subjectId !== id));
  };

  const addTask = (task: Omit<StudyTask, 'id'>) => {
    const newTask: StudyTask = {
      ...task,
      id: `task-${Date.now()}`,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const toggleTaskCompletion = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTaskReminder = (id: string): boolean => {
    if (!notificationPermissionGranted) {
      return false;
    }
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, reminderEnabled: !t.reminderEnabled } : t)));
    return true;
  };

  const requestNotificationPermission = async (): Promise<boolean> => {
    if ('Notification' in window) {
      try {
        const result = await Notification.requestPermission();
        const granted = result === 'granted';
        setNotificationPermissionGranted(granted);
        return granted;
      } catch {
        setNotificationPermissionGranted(true);
        return true;
      }
    }
    setNotificationPermissionGranted(true);
    return true;
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        loginWithGoogle,
        signUp,
        logout,
        deleteAccount,
        updateProfile,
        resetPassword,
        theme,
        setTheme,
        language,
        setLanguage,
        activeTab,
        setActiveTab,
        activeTool,
        setActiveTool,
        showDeliverables,
        setShowDeliverables,
        deviceMode,
        setDeviceMode,
        conversations,
        activeConversationId,
        setActiveConversationId,
        addMessageToActive,
        createNewConversation,
        deleteConversation,
        savedItems,
        saveItem,
        updateSavedItem,
        deleteSavedItem,
        subjectsList,
        addSubject,
        renameSubject,
        deleteSubject,
        quizHistory,
        saveQuizResult,
        subjects,
        tasks,
        addStudySubject,
        deleteStudySubject,
        addTask,
        toggleTaskCompletion,
        deleteTask,
        toggleTaskReminder,
        notifications,
        notificationPermissionGranted,
        requestNotificationPermission,
        isDemoMode,
        aiModelName,
        aiRequestsUsedHour,
        incrementAiUsage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
