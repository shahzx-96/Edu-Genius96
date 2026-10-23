import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { GoogleGenAI } from '@google/genai';
import pdfParse from 'pdf-parse';

admin.initializeApp();
const db = admin.firestore();

// Rate limiting: 30 requests per user per hour
const RATE_LIMIT_PER_HOUR = 30;

async function enforceUserRateLimit(userId: string) {
  const userRateRef = db.collection('user_rate_limits').doc(userId);
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;

  await db.runTransaction(async (transaction) => {
    const doc = await transaction.get(userRateRef);
    let timestamps: number[] = [];

    if (doc.exists) {
      timestamps = (doc.data()?.timestamps || []).filter((t: number) => t > oneHourAgo);
    }

    if (timestamps.length >= RATE_LIMIT_PER_HOUR) {
      throw new functions.https.HttpsError(
        'resource-exhausted',
        'Too many requests. Please wait a moment and try again.'
      );
    }

    timestamps.push(now);
    transaction.set(userRateRef, { timestamps }, { merge: true });
  });
}

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Gemini API key is not configured in Firebase secrets.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * 1. AI Study Chatbot Cloud Function
 */
export const askStudyChatbot = functions
  .runWith({ secrets: ['GEMINI_API_KEY'], timeoutSeconds: 30 })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }
    const { message, language = 'English', mode = 'normal', subject = 'General' } = data;

    if (!message || typeof message !== 'string') {
      throw new functions.https.HttpsError('invalid-argument', 'Message is required.');
    }
    if (message.length > 2000) {
      throw new functions.https.HttpsError('invalid-argument', 'Question exceeds 2,000 characters limit.');
    }

    await enforceUserRateLimit(context.auth.uid);
    const ai = getGeminiClient();

    let modifier = '';
    if (mode === 'simpler') modifier = ' Explain in simple terms with analogies.';
    if (mode === 'detailed') modifier = ' Provide exhaustive mathematical and technical derivations.';

    const systemInstruction = `You are EduGenius AI, an academic teacher for school, college, and exam candidates.
Subject: ${subject}.${modifier}
Output strictly in language: "${language}" (Hindi in Devanagari script, Kannada in Kannada script, Hinglish in Latin script).
Render all mathematical and chemical equations in standard LaTeX ($...$ and $$...$$).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: message,
      config: { systemInstruction, temperature: 0.6 },
    });

    return { response: response.text || '' };
  });

/**
 * 2. Photo Question Solver Cloud Function
 */
export const solvePhotoQuestion = functions
  .runWith({ secrets: ['GEMINI_API_KEY'], timeoutSeconds: 30 })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }
    const { imageBase64, mimeType = 'image/jpeg', correctedQuestion, language = 'English' } = data;

    await enforceUserRateLimit(context.auth.uid);
    const ai = getGeminiClient();

    const parts: any[] = [];
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      parts.push({
        inlineData: { mimeType, data: cleanBase64 },
      });
    }

    const promptText = correctedQuestion
      ? `Solve this problem step-by-step with LaTeX equations: "${correctedQuestion}"`
      : `Transcribe the question from this image, then provide a rigorous step-by-step solution in LaTeX ($...$ and $$...$$).`;

    parts.push({ text: promptText });

    const systemInstruction = `You are EduGenius AI's Photo Solver. Answer in: "${language}". Provide step-by-step LaTeX derivation and final answer.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: { systemInstruction, temperature: 0.3 },
    });

    return {
      solution: response.text || '',
      extractedQuestion: correctedQuestion || 'Transcribed from photo',
    };
  });

/**
 * 3. AI Notes Generator Cloud Function
 */
export const generateNotes = functions
  .runWith({ secrets: ['GEMINI_API_KEY'], timeoutSeconds: 30 })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }
    const { textContent, subject = 'General', module = 'Module 1', length = 'Medium', language = 'English' } = data;

    if (!textContent) {
      throw new functions.https.HttpsError('invalid-argument', 'Text content is required.');
    }

    await enforceUserRateLimit(context.auth.uid);
    const ai = getGeminiClient();

    let targetWords = length === 'Short' ? 150 : length === 'Detailed' ? 900 : 400;

    const systemInstruction = `You are EduGenius AI Notes Generator. Produce structured academic notes (~${targetWords} words) for ${subject} - ${module} in "${language}". Include key formulas in LaTeX.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: textContent.slice(0, 8000),
      config: { systemInstruction, temperature: 0.5 },
    });

    return { notes: response.text || '' };
  });

/**
 * 4. Exam Answer Generator Cloud Function
 */
export const generateExamAnswer = functions
  .runWith({ secrets: ['GEMINI_API_KEY'], timeoutSeconds: 30 })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }
    const { question, markType = '5-mark', subject = 'Engineering', language = 'English' } = data;

    if (!question || question.length > 2000) {
      throw new functions.https.HttpsError('invalid-argument', 'Question is required and under 2,000 characters.');
    }

    await enforceUserRateLimit(context.auth.uid);
    const ai = getGeminiClient();

    const disclaimer = 'AI-generated. Verify against your textbook before use.';
    let scheme = markType === '2-mark' ? 'Definition + 2-3 points (~60 words)' : markType === '5-mark' ? 'Definition + 4-5 points + example + conclusion (~200 words)' : 'Definition + detailed explanation + diagram description + conclusion (~500 words)';

    const systemInstruction = `You are EduGenius AI Exam Answer Specialist. Subject: ${subject}. Schema: ${markType} (${scheme}). Language: "${language}". You must conclude with notice: "${disclaimer}".`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: question,
      config: { systemInstruction, temperature: 0.4 },
    });

    return { answer: response.text || '', disclaimer, markType };
  });

/**
 * 5. AI Quiz Generator Cloud Function
 */
export const generateQuiz = functions
  .runWith({ secrets: ['GEMINI_API_KEY'], timeoutSeconds: 30 })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }
    const { subject, topic, questionCount = 5, language = 'English' } = data;

    await enforceUserRateLimit(context.auth.uid);
    const ai = getGeminiClient();

    const prompt = `Create a ${questionCount}-question multiple choice quiz on Subject: "${subject}", Topic: "${topic}" in language: "${language}".
Format strictly as a JSON array of objects with keys: id, question, options (array of 4 strings), correctIndex (0-3), and explanation (string).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json', temperature: 0.7 },
    });

    let questions = [];
    try {
      questions = JSON.parse(response.text || '[]');
    } catch {
      questions = [];
    }
    return { questions };
  });

/**
 * 6. PDF Study Assistant Cloud Function
 */
export const queryPdfAssistant = functions
  .runWith({ secrets: ['GEMINI_API_KEY'], timeoutSeconds: 30 })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }
    const { documentText, action = 'summary', userQuestion, language = 'English' } = data;

    if (!documentText) {
      throw new functions.https.HttpsError('invalid-argument', 'Document text is required.');
    }

    await enforceUserRateLimit(context.auth.uid);
    const ai = getGeminiClient();

    const STRICT_NOTICE = 'This information is not present in the uploaded document.';

    let prompt = `Action: ${action}. Language: "${language}".\n\n`;
    if (action === 'qa') {
      prompt += `User Query: "${userQuestion}".\nCRITICAL RULE: Answers must come ONLY from the uploaded document. If the answer is not in the document, respond solely: "${STRICT_NOTICE}".\n\n`;
    }
    prompt += `Document:\n${documentText.slice(0, 15000)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: { temperature: 0.3 },
    });

    return { result: response.text || '' };
  });
