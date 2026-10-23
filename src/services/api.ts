import { MarkType, NoteLength, QuizQuestion, ResponseLanguage, StudyPlan, StudySubject } from '../types';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  isDemo?: boolean;
}

/**
 * Robust fetch wrapper that safely inspects HTTP status and Content-Type
 * before parsing JSON, preventing SyntaxError: Unexpected token 'T' ("The page...").
 */
async function safeFetchJson<T>(
  url: string,
  options: RequestInit,
  defaultErrorMsg: string
): Promise<{ ok: boolean; data?: T; error?: string }> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.toLowerCase().includes('application/json');

    if (!res.ok) {
      if (isJson) {
        try {
          const errBody = await res.json();
          return {
            ok: false,
            error: errBody.error || errBody.message || `${defaultErrorMsg} (HTTP ${res.status})`,
          };
        } catch {
          return { ok: false, error: `${defaultErrorMsg} (HTTP ${res.status})` };
        }
      } else {
        const text = await res.text().catch(() => '');
        // Strip HTML tags if a reverse proxy returned an HTML error page (e.g., 502/504 "The page...")
        const snippet = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 140);
        return {
          ok: false,
          error: snippet
            ? `${defaultErrorMsg}: ${snippet}`
            : `${defaultErrorMsg} (HTTP ${res.status})`,
        };
      }
    }

    if (!isJson) {
      const text = await res.text().catch(() => '');
      const snippet = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 140);
      return {
        ok: false,
        error: snippet
          ? `Server returned non-JSON response: ${snippet}`
          : 'Invalid non-JSON response received from server',
      };
    }

    const data = (await res.json()) as T;
    return { ok: true, data };
  } catch (err: any) {
    return {
      ok: false,
      error: err?.message || 'Network request failed. Please check your connection.',
    };
  }
}

export async function checkServerStatus(): Promise<{ demoMode: boolean; model: string }> {
  try {
    const res = await safeFetchJson<{ demoMode: boolean; model: string }>(
      '/api/status',
      { method: 'GET' },
      'Status check failed'
    );
    if (res.ok && res.data) {
      return { demoMode: !!res.data.demoMode, model: res.data.model || 'gemini-3.8-flash' };
    }
    return { demoMode: true, model: 'Mock Gemini Engine (Demo Mode)' };
  } catch {
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
  const result = await safeFetchJson<{ response: string; isDemo?: boolean }>(
    '/api/chat',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': params.userId || 'anonymous',
      },
      body: JSON.stringify(params),
    },
    'Server error occurred in chat'
  );

  if (!result.ok || !result.data) {
    return {
      response: '',
      isDemo: true,
      error: result.error || 'Failed to generate answer. Please try again.',
    };
  }

  return {
    response: result.data.response,
    isDemo: !!result.data.isDemo,
  };
}

export async function solvePhotoQuestion(params: {
  imageBase64?: string;
  mimeType?: string;
  correctedQuestion?: string;
  language: ResponseLanguage;
  userId?: string;
}): Promise<{ extractedQuestion: string; solution: string; isDemo: boolean; error?: string }> {
  const result = await safeFetchJson<{
    extractedQuestion?: string;
    solution: string;
    isDemo?: boolean;
  }>(
    '/api/solve-photo',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': params.userId || 'anonymous',
      },
      body: JSON.stringify(params),
    },
    'Failed to solve photo problem'
  );

  if (!result.ok || !result.data) {
    return {
      extractedQuestion: '',
      solution: '',
      isDemo: true,
      error: result.error || 'Failed to analyze problem image.',
    };
  }

  return {
    extractedQuestion: result.data.extractedQuestion || '',
    solution: result.data.solution,
    isDemo: !!result.data.isDemo,
  };
}

export async function generateNotes(params: {
  subject: string;
  module: string;
  textContent: string;
  length: NoteLength;
  language: ResponseLanguage;
  userId?: string;
}): Promise<{ notes: string; wordCount?: number; isDemo: boolean; error?: string }> {
  const result = await safeFetchJson<{
    notes: string;
    wordCount?: number;
    isDemo?: boolean;
  }>(
    '/api/generate-notes',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': params.userId || 'anonymous',
      },
      body: JSON.stringify(params),
    },
    'Failed to generate study notes'
  );

  if (!result.ok || !result.data) {
    return {
      notes: '',
      isDemo: true,
      error: result.error || 'Error generating notes from document.',
    };
  }

  return {
    notes: result.data.notes,
    wordCount: result.data.wordCount,
    isDemo: !!result.data.isDemo,
  };
}

export async function generateExamAnswer(params: {
  question: string;
  markType: MarkType;
  subject: string;
  language: ResponseLanguage;
  userId?: string;
}): Promise<{ answer: string; disclaimer: string; markType: MarkType; isDemo: boolean; error?: string }> {
  const result = await safeFetchJson<{
    answer: string;
    disclaimer?: string;
    markType?: MarkType;
    isDemo?: boolean;
  }>(
    '/api/exam-answer',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': params.userId || 'anonymous',
      },
      body: JSON.stringify(params),
    },
    'Failed to prepare exam answer'
  );

  if (!result.ok || !result.data) {
    return {
      answer: '',
      disclaimer: 'AI-generated. Verify against your textbook before use.',
      markType: params.markType,
      isDemo: true,
      error: result.error || 'Failed to prepare exam answer.',
    };
  }

  return {
    answer: result.data.answer,
    disclaimer: result.data.disclaimer || 'AI-generated. Verify against your textbook before use.',
    markType: result.data.markType || params.markType,
    isDemo: !!result.data.isDemo,
  };
}

export async function generateQuiz(params: {
  subject: string;
  topic: string;
  questionCount: number;
  language: ResponseLanguage;
  userId?: string;
}): Promise<{ questions: QuizQuestion[]; isDemo: boolean; error?: string }> {
  const result = await safeFetchJson<{
    questions: QuizQuestion[];
    isDemo?: boolean;
  }>(
    '/api/generate-quiz',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': params.userId || 'anonymous',
      },
      body: JSON.stringify(params),
    },
    'Failed to generate quiz questions'
  );

  if (!result.ok || !result.data) {
    return {
      questions: [],
      isDemo: true,
      error: result.error || 'Failed to generate quiz questions.',
    };
  }

  return {
    questions: result.data.questions || [],
    isDemo: !!result.data.isDemo,
  };
}

export async function queryPdfAssistant(params: {
  documentText: string;
  action: 'summary' | 'revision_notes' | 'practice_questions' | 'qa';
  userQuestion?: string;
  language: ResponseLanguage;
  userId?: string;
}): Promise<{ result: string; isDemo: boolean; error?: string }> {
  const result = await safeFetchJson<{
    result: string;
    isDemo?: boolean;
  }>(
    '/api/pdf-assistant',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': params.userId || 'anonymous',
      },
      body: JSON.stringify(params),
    },
    'Document analysis query failed'
  );

  if (!result.ok || !result.data) {
    return {
      result: '',
      isDemo: true,
      error: result.error || 'Failed to analyze document.',
    };
  }

  return {
    result: result.data.result,
    isDemo: !!result.data.isDemo,
  };
}

export async function generateStudyPlan(params: {
  subjects: StudySubject[];
  dailyHours: number;
  language: ResponseLanguage;
  userId?: string;
}): Promise<{ plan?: StudyPlan; isDemo: boolean; error?: string }> {
  const result = await safeFetchJson<{
    plan: StudyPlan;
    isDemo?: boolean;
  }>(
    '/api/study-planner',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': params.userId || 'anonymous',
      },
      body: JSON.stringify(params),
    },
    'Failed to create study schedule'
  );

  if (!result.ok || !result.data) {
    return {
      isDemo: true,
      error: result.error || 'Failed to generate study schedule.',
    };
  }

  return {
    plan: result.data.plan,
    isDemo: !!result.data.isDemo,
  };
}
