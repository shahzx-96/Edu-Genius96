import { MarkType, NoteLength, QuizQuestion, ResponseLanguage, StudyPlan, StudySubject } from '../types';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  isDemo?: boolean;
}

export async function checkServerStatus(): Promise<{ demoMode: boolean; model: string }> {
  try {
    const res = await fetch('/api/status');
    if (!res.ok) throw new Error('Status check failed');
    const data = await res.json();
    return { demoMode: !!data.demoMode, model: data.model || 'gemini-3.8-flash' };
  } catch (e) {
    return { demoMode: true, model: 'Mock Gemini Engine (Demo Mode)' };
  }
}

export async function askChatbot(params: {
  message: string;
  history?: any[];
  language: ResponseLanguage;
  mode?: 'normal' | 'simpler' | 'detailed';
  subject?: string;
  userId?: string;
}): Promise<{ response: string; isDemo: boolean; error?: string }> {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': params.userId || 'anonymous',
      },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Server error occurred');
    }
    return { response: data.response, isDemo: !!data.isDemo };
  } catch (error: any) {
    return {
      response: '',
      isDemo: true,
      error: error.message || 'Network failure. Please retry.',
    };
  }
}

export async function solvePhotoQuestion(params: {
  imageBase64?: string;
  mimeType?: string;
  correctedQuestion?: string;
  language: ResponseLanguage;
  userId?: string;
}): Promise<{ extractedQuestion: string; solution: string; isDemo: boolean; error?: string }> {
  try {
    const res = await fetch('/api/solve-photo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': params.userId || 'anonymous',
      },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to solve photo problem');
    }
    return {
      extractedQuestion: data.extractedQuestion,
      solution: data.solution,
      isDemo: !!data.isDemo,
    };
  } catch (error: any) {
    return {
      extractedQuestion: '',
      solution: '',
      isDemo: true,
      error: error.message || 'Failed to analyze problem image.',
    };
  }
}

export async function generateNotes(params: {
  subject: string;
  module: string;
  textContent: string;
  length: NoteLength;
  language: ResponseLanguage;
  userId?: string;
}): Promise<{ notes: string; wordCount?: number; isDemo: boolean; error?: string }> {
  try {
    const res = await fetch('/api/generate-notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': params.userId || 'anonymous',
      },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to generate study notes');
    }
    return { notes: data.notes, wordCount: data.wordCount, isDemo: !!data.isDemo };
  } catch (error: any) {
    return {
      notes: '',
      isDemo: true,
      error: error.message || 'Error generating notes from document.',
    };
  }
}

export async function generateExamAnswer(params: {
  question: string;
  markType: MarkType;
  subject: string;
  language: ResponseLanguage;
  userId?: string;
}): Promise<{ answer: string; disclaimer: string; markType: MarkType; isDemo: boolean; error?: string }> {
  try {
    const res = await fetch('/api/exam-answer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': params.userId || 'anonymous',
      },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to prepare exam answer');
    }
    return {
      answer: data.answer,
      disclaimer: data.disclaimer,
      markType: data.markType,
      isDemo: !!data.isDemo,
    };
  } catch (error: any) {
    return {
      answer: '',
      disclaimer: 'AI-generated. Verify against your textbook before use.',
      markType: params.markType,
      isDemo: true,
      error: error.message || 'Failed to prepare exam answer.',
    };
  }
}

export async function generateQuiz(params: {
  subject: string;
  topic: string;
  questionCount: number;
  language: ResponseLanguage;
  userId?: string;
}): Promise<{ questions: QuizQuestion[]; isDemo: boolean; error?: string }> {
  try {
    const res = await fetch('/api/generate-quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': params.userId || 'anonymous',
      },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to generate quiz');
    }
    return { questions: data.questions || [], isDemo: !!data.isDemo };
  } catch (error: any) {
    return {
      questions: [],
      isDemo: true,
      error: error.message || 'Failed to generate quiz questions.',
    };
  }
}

export async function queryPdfAssistant(params: {
  documentText: string;
  action: 'summary' | 'revision_notes' | 'practice_questions' | 'qa';
  userQuestion?: string;
  language: ResponseLanguage;
  userId?: string;
}): Promise<{ result: string; isDemo: boolean; error?: string }> {
  try {
    const res = await fetch('/api/pdf-assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': params.userId || 'anonymous',
      },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Document query failed');
    }
    return { result: data.result, isDemo: !!data.isDemo };
  } catch (error: any) {
    return {
      result: '',
      isDemo: true,
      error: error.message || 'Failed to analyze document.',
    };
  }
}

export async function generateStudyPlan(params: {
  subjects: StudySubject[];
  dailyHours: number;
  language: ResponseLanguage;
  userId?: string;
}): Promise<{ plan?: StudyPlan; isDemo: boolean; error?: string }> {
  try {
    const res = await fetch('/api/study-planner', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': params.userId || 'anonymous',
      },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to generate plan');
    }
    return { plan: data.plan, isDemo: !!data.isDemo };
  } catch (error: any) {
    return {
      isDemo: true,
      error: error.message || 'Failed to generate study schedule.',
    };
  }
}
