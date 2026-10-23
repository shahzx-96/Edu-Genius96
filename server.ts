import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// In-memory rate limiting: 30 requests per IP/user per hour
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(req: Request, res: Response, next: () => void) {
  const identifier = (req.headers['x-user-id'] as string) || req.ip || 'anonymous-user';
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    res.setHeader('X-RateLimit-Limit', RATE_LIMIT_MAX);
    res.setHeader('X-RateLimit-Remaining', RATE_LIMIT_MAX - 1);
    return next();
  }

  if (record.count >= RATE_LIMIT_MAX) {
    res.setHeader('X-RateLimit-Limit', RATE_LIMIT_MAX);
    res.setHeader('X-RateLimit-Remaining', 0);
    return res.status(429).json({
      error: 'Too many requests. Please wait a moment and try again.',
      remaining: 0,
      resetInMinutes: Math.ceil((record.resetTime - now) / 60000),
    });
  }

  record.count += 1;
  res.setHeader('X-RateLimit-Limit', RATE_LIMIT_MAX);
  res.setHeader('X-RateLimit-Remaining', RATE_LIMIT_MAX - record.count);
  next();
}

// Check if Gemini API is available
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// Status endpoint
app.get('/api/status', (req: Request, res: Response) => {
  const isDemo = !aiClient;
  res.json({
    status: 'ok',
    demoMode: isDemo,
    model: isDemo ? 'Mock Gemini Engine (Demo Mode)' : 'gemini-3.8-flash',
    features: [
      'AI Study Chatbot',
      'Photo Question Solver',
      'AI Notes Generator',
      'Exam Answer Generator',
      'AI Quiz Generator',
      'PDF Study Assistant',
      'Smart Study Planner',
      'Multilingual Responses (EN, HI, KN, Hinglish)',
    ],
  });
});

// 1. AI Study Chatbot
app.post('/api/chat', checkRateLimit, async (req: Request, res: Response) => {
  try {
    const { message, history, language = 'English', mode = 'normal', subject = 'General' } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required and must be text' });
    }
    if (message.length > 2000) {
      return res.status(400).json({ error: 'Question exceeds maximum length of 2,000 characters' });
    }

    let modifierPrompt = '';
    if (mode === 'simpler') {
      modifierPrompt = ' Explain this in very simple, beginner-friendly terms, using analogies and easy-to-understand breakdown.';
    } else if (mode === 'detailed') {
      modifierPrompt = ' Provide an in-depth, rigorous, comprehensive explanation with technical specifics, formal proofs or mathematical formulas if relevant, and step-by-step breakdown.';
    }

    const languageDirective = `
IMPORTANT LANGUAGE INSTRUCTION:
Provide your entire response in: "${language}".
If language is "Hindi", write in authentic Devanagari script.
If language is "Kannada", write in authentic Kannada script.
If language is "Hinglish", write in colloquial Hindi written using the Latin/English alphabet mixed with English academic terminology.
If language is "English", write in clear English.
`;

    const systemInstruction = `You are EduGenius AI, an expert academic tutor and personal teacher for school students, college engineering/science students, and competitive exam candidates.
Subject domain: ${subject}.
${modifierPrompt}
${languageDirective}

Formatting rules:
- Format all mathematical and chemical equations using standard LaTeX delimiters: $...$ for inline formulas and $$...$$ for block formulas.
- Use clear Markdown headings (###), bullet points, numbered steps, and code blocks for programming snippets.
- Keep explanations structured, encouraging, and academically accurate.`;

    if (!aiClient) {
      // Return high quality demo response
      const demoReply = generateDemoChatResponse(message, language, mode, subject);
      return res.json({ response: demoReply, isDemo: true });
    }

    // Build contents from history if available
    const prompt = `Student Question: "${message}"\n\nPlease answer clearly with explanations and LaTeX formulas where applicable.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || 'No response generated. Please retry.';
    return res.json({ response: replyText, isDemo: false });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate answer. Please try again.',
      isDemo: !aiClient,
    });
  }
});

// 2. Photo Question Solver
app.post('/api/solve-photo', checkRateLimit, async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', correctedQuestion, language = 'English' } = req.body;

    if (!imageBase64 && !correctedQuestion) {
      return res.status(400).json({ error: 'Image data or extracted question text is required' });
    }

    const languageDirective = `Answer in the preferred language: "${language}". Use Devanagari script for Hindi, Kannada script for Kannada, and Latin script for Hinglish.`;

    const systemPrompt = `You are EduGenius AI's Photo Question Solver.
Your task:
1. Extract and transcribe the exact question text from the user image or problem statement.
2. Identify the subject, topic, and core mathematical or scientific principles.
3. Provide a step-by-step rigorous solution with clear intermediate steps.
4. Render all mathematical equations, variables, and formulas in LaTeX ($...$ and $$...$$).
5. State the final boxed or highlighted answer clearly.
${languageDirective}`;

    if (!aiClient) {
      const demoSolution = generateDemoPhotoSolution(correctedQuestion || 'Sample Calculus / Circuit Problem', language);
      return res.json(demoSolution);
    }

    let contentsParts: any[] = [];
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      contentsParts.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: cleanBase64,
        },
      });
    }

    const textPrompt = correctedQuestion
      ? `Solve this verified question step-by-step: "${correctedQuestion}". Provide the extracted question, steps, formulas in LaTeX, and final answer.`
      : `Look at the image of this academic problem. First extract the full question text verbatim, then solve it step-by-step with LaTeX equations.`;

    contentsParts.push({ text: textPrompt });

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts: contentsParts },
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.3,
      },
    });

    const solutionText = response.text || '';
    
    // Parse or structure output
    res.json({
      extractedQuestion: correctedQuestion || 'Extracted from image: ' + solutionText.slice(0, 120) + '...',
      solution: solutionText,
      isDemo: false,
    });
  } catch (error: any) {
    console.error('Photo solver error:', error);
    res.status(500).json({ error: error.message || 'Error processing photo problem' });
  }
});

// 3. AI Notes Generator
app.post('/api/generate-notes', checkRateLimit, async (req: Request, res: Response) => {
  try {
    const { subject = 'General', module = 'Module 1', textContent, length = 'Medium', language = 'English' } = req.body;

    if (!textContent || typeof textContent !== 'string') {
      return res.status(400).json({ error: 'Text content is required' });
    }

    let wordTarget = 400;
    if (length === 'Short') wordTarget = 150;
    if (length === 'Detailed') wordTarget = 900;

    const languageDirective = `Write all notes in language: "${language}".`;

    const systemInstruction = `You are EduGenius AI's Master Academic Notes Generator.
You produce structured, high-yield revision notes for college and competitive exam students.
Target length: approximately ${wordTarget} words (${length} length).
Subject: ${subject} | Module: ${module}.
${languageDirective}

Required structure:
# ${subject} - ${module}
## Overview & Key Concepts
## Core Principles & Explanations (with bullet points and LaTeX formulas $$...$$ where needed)
## Important Highlights / Exam Tips
## Summary / Rapid Review Points`;

    if (!aiClient) {
      const demoNotes = generateDemoNotes(subject, module, length, language);
      return res.json({ notes: demoNotes, isDemo: true, wordCount: wordTarget });
    }

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Generate ${length} notes (${wordTarget} words) based on the following source material:\n\n${textContent.slice(0, 8000)}`,
      config: {
        systemInstruction,
        temperature: 0.5,
      },
    });

    res.json({
      notes: response.text || 'Failed to generate notes',
      isDemo: false,
      wordCount: (response.text || '').split(/\s+/).length,
    });
  } catch (error: any) {
    console.error('Notes generator error:', error);
    res.status(500).json({ error: error.message || 'Error generating notes' });
  }
});

// 4. Exam Answer Generator
app.post('/api/exam-answer', checkRateLimit, async (req: Request, res: Response) => {
  try {
    const { question, markType = '5-mark', subject = 'Engineering', language = 'English' } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required' });
    }

    let markGuideline = '';
    if (markType === '2-mark') {
      markGuideline = 'Target: About 60 words. Structure: A crisp definition and 2 to 3 key bullet points.';
    } else if (markType === '5-mark') {
      markGuideline = 'Target: About 200 words. Structure: A precise definition, 4 to 5 important points, one concrete practical example, and a short conclusion.';
    } else {
      markGuideline = 'Target: About 500 words (10-mark). Structure: A formal definition, detailed explanation with subheadings, architectural/process breakdown, examples, a clear diagram description with labeled components [Diagram Representation], and an analytical conclusion.';
    }

    const disclaimer = 'AI-generated. Verify against your textbook before use.';

    if (!aiClient) {
      const demoAnswer = generateDemoExamAnswer(question, markType, subject, language);
      return res.json({
        answer: demoAnswer,
        disclaimer,
        markType,
        isDemo: true,
      });
    }

    const systemInstruction = `You are EduGenius AI's Exam Answer Preparation Specialist.
Subject: ${subject}
Format requirement: ${markType} answer.
${markGuideline}
Language: "${language}".
Format equations in LaTeX ($...$ and $$...$$).
You must end the answer with the exact notice: "${disclaimer}"`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Provide an exemplary university exam answer for the following question:\n\n"${question}"`,
      config: {
        systemInstruction,
        temperature: 0.4,
      },
    });

    res.json({
      answer: response.text || '',
      disclaimer,
      markType,
      isDemo: false,
    });
  } catch (error: any) {
    console.error('Exam answer error:', error);
    res.status(500).json({ error: error.message || 'Error generating exam answer' });
  }
});

// 5. AI Quiz Generator
app.post('/api/generate-quiz', checkRateLimit, async (req: Request, res: Response) => {
  try {
    const { subject = 'Computer Science', topic = 'Data Structures', questionCount = 5, language = 'English' } = req.body;
    const count = Math.min(20, Math.max(5, parseInt(questionCount) || 5));

    if (!aiClient) {
      const demoQuiz = generateDemoQuiz(subject, topic, count, language);
      return res.json({ questions: demoQuiz, isDemo: true, subject, topic });
    }

    const prompt = `Create an academic multiple-choice quiz on Subject: "${subject}", Topic: "${topic}".
Generate exactly ${count} challenging, high-quality questions.
Output language: "${language}".
Format your response strictly as a JSON array of objects with the following schema:
[
  {
    "id": 1,
    "question": "Question text with LaTeX formulas like $O(n \\log n)$ if needed",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Clear explanation of why this option is correct."
  }
]
Do not wrap in markdown quotes if possible, output raw JSON. Exactly 4 options per question and correctIndex from 0 to 3.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    let questions = [];
    try {
      const text = response.text?.trim() || '[]';
      questions = JSON.parse(text);
    } catch (e) {
      console.warn('JSON parse fallback for quiz');
      questions = generateDemoQuiz(subject, topic, count, language);
    }

    res.json({ questions, isDemo: false, subject, topic });
  } catch (error: any) {
    console.error('Quiz generator error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate quiz' });
  }
});

// 6. PDF Study Assistant
app.post('/api/pdf-assistant', checkRateLimit, async (req: Request, res: Response) => {
  try {
    const { documentText, action = 'summary', userQuestion, language = 'English' } = req.body;

    if (!documentText || documentText.trim().length === 0) {
      return res.status(400).json({ error: 'Document text is required' });
    }

    const STRICT_GROUNDING_NOTICE = 'This information is not present in the uploaded document.';

    let taskInstruction = '';
    if (action === 'summary') {
      taskInstruction = 'Provide a structured Chapter Summary of the document with key takeaways, definitions, and main themes.';
    } else if (action === 'revision_notes') {
      taskInstruction = 'Create concise Revision Notes with bullet points, high-yield memory anchors, and essential formulas/concepts from the document.';
    } else if (action === 'practice_questions') {
      taskInstruction = 'Generate 5 to 10 comprehensive practice questions based strictly on the document content, with answers and explanations.';
    } else if (action === 'qa') {
      taskInstruction = `Answer this user question based ONLY on the uploaded document: "${userQuestion}".
CRITICAL CONSTRAINT: Answers must come ONLY from the uploaded document. If the answer is not in the document, your ENTIRE response must say exactly: "${STRICT_GROUNDING_NOTICE}"`;
    }

    if (!aiClient) {
      const demoResult = generateDemoPDFAssistant(action, userQuestion, language);
      return res.json({ result: demoResult, isDemo: true, action });
    }

    const systemInstruction = `You are EduGenius AI's PDF Study Assistant.
You analyze provided academic documents with strict document fidelity.
Response language: "${language}".
${taskInstruction}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Document Content:\n${documentText.slice(0, 15000)}\n\nAction requested: ${action}\n${userQuestion ? `Question: ${userQuestion}` : ''}`,
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });

    res.json({
      result: response.text || 'No output generated',
      isDemo: false,
      action,
    });
  } catch (error: any) {
    console.error('PDF assistant error:', error);
    res.status(500).json({ error: error.message || 'Error processing document request' });
  }
});

// 7. Smart Study Planner
app.post('/api/study-planner', checkRateLimit, async (req: Request, res: Response) => {
  try {
    const { subjects, dailyHours = 4, language = 'English' } = req.body;

    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ error: 'At least one subject is required' });
    }

    if (!aiClient) {
      const demoPlan = generateDemoStudyPlan(subjects, dailyHours);
      return res.json({ plan: demoPlan, isDemo: true });
    }

    const prompt = `Create an intelligent, realistic daily study plan.
Student subjects: ${JSON.stringify(subjects)}
Daily study capacity: ${dailyHours} hours.
Language: "${language}".

Calculate remaining days for each subject until examDate. Prioritize subjects with High priority and closer exam dates.
Return a JSON object with:
{
  "summary": "Brief encouraging strategic overview",
  "weeklyTarget": "Key milestones for the week",
  "tasks": [
    {
      "id": "1",
      "subject": "Subject Name",
      "title": "Specific actionable topic or task (e.g. Solve 10 Calculus Integrals)",
      "durationMinutes": 60,
      "date": "2026-10-24",
      "priority": "High",
      "completed": false
    }
  ]
}
Return raw JSON.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.5,
      },
    });

    let planData;
    try {
      planData = JSON.parse(response.text || '{}');
    } catch {
      planData = generateDemoStudyPlan(subjects, dailyHours);
    }

    res.json({ plan: planData, isDemo: false });
  } catch (error: any) {
    console.error('Study planner error:', error);
    res.status(500).json({ error: error.message || 'Error creating study plan' });
  }
});

// Fallback Demo Generators
function generateDemoChatResponse(message: string, language: string, mode: string, subject: string): string {
  if (language === 'Hindi') {
    return `### EduGenius AI अध्ययन सहायता (डेमो मोड)\n\nआपके प्रश्न **"${message}"** के संबंध में मुख्य अवधारणाएँ:\n\n1. **आधारभूत सिद्धांत**: इंजीनियरिंग और विज्ञान में यह एक अत्यंत महत्वपूर्ण विषय है।\n2. **गणितीय संबंध**: \n$$E = mc^2 \\quad \\text{तथा} \\quad F = m \\cdot a$$\n3. **महत्वपूर्ण बिंदु**: परीक्षा में बेहतर अंक प्राप्त करने के लिए प्रत्येक चरण को स्पष्ट रूप से लिखें।\n\n*डेमो मोड सक्रिय है। पूर्ण AI उत्तर हेतु Gemini API कुंजी कॉन्फ़िगर करें।*`;
  }
  if (language === 'Hinglish') {
    return `### EduGenius AI Study Assistance (Demo Mode)\n\nAapke question **"${message}"** ka complete analysis:\n\n1. **Basic Concept**: Ye ${subject} ka bohot crucial topic hai. Isko samajhne ke liye fundamentals clear hona zaroori hai.\n2. **Key Equation**:\n$$V = I \\cdot R \\quad \\implies \\quad P = V \\cdot I = I^2 R$$\n3. **Exam Tip**: Har step pe units likhna mat bhulna aur standard diagrams zaroor draw karna!\n\n*Note: Demo mode is currently active. Connect Gemini API for live custom answers.*`;
  }
  if (language === 'Kannada') {
    return `### EduGenius AI ಅಧ್ಯಯನ ಸಹಾಯಕ (ಡೆಮೊ ಮೋಡ್)\n\nನಿಮ್ಮ ಪ್ರಶ್ನೆ **"${message}"** ಗೆ ಸಂಬಂಧಿಸಿದ ಮುಖ್ಯ ವಿಷಯಗಳು:\n\n1. **ಮೂಲಭೂತ ತತ್ವ**: ಇದು ${subject} ದಲ್ಲಿ ಪ್ರಮುಖ ಪರಿಕಲ್ಪನೆಯಾಗಿದೆ.\n2. **ಗಣಿತದ ಸೂತ್ರ**:\n$$\\int x^n \\, dx = \\frac{x^{n+1}}{n+1} + C$$\n3. **ಪರೀಕ್ಷಾ ಸಲಹೆ**: ಪರೀಕ್ಷೆಯಲ್ಲಿ ಪ್ರತಿ ಹಂತವನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ವಿವರಿಸಿ.\n\n*ಡೆಮೊ ಮೋಡ್ ಸಕ್ರಿಯವಾಗಿದೆ.*`;
  }

  // English
  if (mode === 'simpler') {
    return `### EduGenius AI - Simplified Explanation\n\nThink of this concept like water flowing through a garden pipe:\n\n- **The Water Pressure** is like **Voltage** ($V$ volts) pushing the current.\n- **The Water Flow Rate** is the **Current** ($I$ amperes).\n- **Any kink or narrow part in the hose** is the **Resistance** ($R$ ohms).\n\n**Simple Rule (Ohm's Law)**:\n$$V = I \\cdot R$$\n\nIf you double the resistance, the current cuts in half unless you double the push (voltage)!`;
  }

  return `### EduGenius AI Solution\n\nRegarding your question on **"${message}"** in **${subject}**:\n\n#### 1. Core Principle & Theoretical Foundation\nIn ${subject}, this principle governs system state transformations and energy equilibria. For any linear time-invariant system:\n$$\\mathcal{L}\\{f'(t)\\} = sF(s) - f(0^-)$$\n\n#### 2. Key Derivations & Analytical Steps\n- **Step 1**: Establish boundary constraints and state equations.\n- **Step 2**: Apply conservation theorems:\n$$\\sum F_{\\text{ext}} = m \\frac{d^2 x}{dt^2}$$\n- **Step 3**: Verify dimensional homogeneity across all terms.\n\n#### 3. Practical Academic Takeaway\nAlways verify equilibrium solutions at $t \\to \\infty$ and $t = 0^+$ to ensure your final answer satisfies initial physical conditions.\n\n*(Note: Running in high-fidelity Demonstration Mode. Add your Gemini API key in Secrets for custom dynamic queries).*`;
}

function generateDemoPhotoSolution(questionText: string, language: string) {
  return {
    extractedQuestion: `Solve the differential equation: $\\frac{d^2 y}{dx^2} + 4\\frac{dy}{dx} + 4y = 0$ with initial conditions $y(0) = 1, y'(0) = 0$.`,
    solution: `### Step-by-Step Problem Solution

#### 1. Identified Problem
Second-order linear homogeneous ordinary differential equation with constant coefficients:
$$\\frac{d^2 y}{dx^2} + 4\\frac{dy}{dx} + 4y = 0$$

#### 2. Characteristic Auxiliary Equation
Let $y = e^{rx}$, then:
$$r^2 + 4r + 4 = 0$$
$$(r + 2)^2 = 0 \\implies r_1 = r_2 = -2 \\quad \\text{(Repeated real root)}$$

#### 3. General Solution
For a repeated root $r = -2$, the complementary function is:
$$y(x) = (C_1 + C_2 x) e^{-2x}$$

#### 4. Applying Initial Conditions
- Condition 1: $y(0) = 1$
$$y(0) = (C_1 + 0) e^0 = C_1 \\implies C_1 = 1$$

- Differentiating $y(x)$:
$$y'(x) = C_2 e^{-2x} - 2(C_1 + C_2 x)e^{-2x}$$
$$y'(0) = C_2 - 2C_1 = 0 \\implies C_2 = 2(1) = 2$$

#### 5. Final Particular Solution
$$y(x) = (1 + 2x)e^{-2x}$$

$$\\mathbf{Answer}: \\quad y(x) = (1 + 2x)e^{-2x}$$`,
    isDemo: true,
  };
}

function generateDemoNotes(subject: string, module: string, length: string, language: string): string {
  return `# ${subject}: ${module} - Comprehensive Study Notes

## 1. Executive Overview & Syllabus Objectives
This module investigates fundamental analytical structures and computational models essential for academic mastery in ${subject}.

## 2. Core Theorems and Formulations
- **Fundamental Law**:
  The system response obeys the conservation of energy and flux continuity:
  $$\\oint_{\\mathcal{C}} \\vec{B} \\cdot d\\vec{l} = \\mu_0 I_{\\text{enc}} + \\mu_0 \\varepsilon_0 \\frac{d\\Phi_E}{dt}$$

- **State Equilibrium**:
  For all closed control surfaces, the divergence of vorticity equals zero.

## 3. High-Yield Examination Points
1. **Critical Distinction**: Differentiate between transient response ($t < 5\\tau$) and steady-state equilibrium.
2. **Formula Sheet**: Time constant $\\tau = \\frac{L}{R}$ for inductive networks, and $\\tau = RC$ for capacitive networks.
3. **Common Trap**: Watch out for sign conventions in Kirchhoff's Voltage Law ($\sum V = 0$).

## 4. Key Takeaways
- Review standard proofs for 5-mark and 10-mark university questions.
- Practice 3 numerical examples involving initial boundary conditions.`;
}

function generateDemoExamAnswer(question: string, markType: string, subject: string, language: string): string {
  if (markType === '2-mark') {
    return `### Definition
**${question}**: A fundamental principle in ${subject} defined as the rate of state transformation per unit parameter under conservative constraints.

### Key Points
- Expressed mathematically as $\\eta = \\frac{W_{\\text{out}}}{Q_{\\text{in}}} \\times 100\\%$.
- Dimensionless quantity bounded between $0$ and $1$ according to the Second Law.
- Crucial for benchmarking thermodynamic and electrical system performance.

---
*AI-generated. Verify against your textbook before use.*`;
  }

  if (markType === '5-mark') {
    return `### 1. Formal Definition
**${question}** refers to the mathematical or physical formulation where a system's output directly correlates with the integral of state variables over a specified operating boundary.

### 2. Essential Principles & Characteristics
1. **Linearity**: The principle of superposition holds unconditionally: $f(ax_1 + bx_2) = a f(x_1) + b f(x_2)$.
2. **Causality**: The system output depends strictly on past and present inputs: $h(t) = 0$ for all $t < 0$.
3. **Stability Condition**: Bounded-Input Bounded-Output (BIBO) stability is satisfied when all poles lie in the open left-half complex s-plane: $\\text{Re}(s_i) < 0$.
4. **Energy Conservation**: Total dissipated power conforms to Joule's formulation $P = I^2 R$.

### 3. Practical Engineering Example
In high-speed communication transceivers, this mechanism filters out adjacent channel interferences while preserving the pulse shape for zero inter-symbol interference (Nyquist criterion).

### 4. Conclusion
Understanding this mechanism enables engineers to design robust controllers with specified phase and gain margins.

---
*AI-generated. Verify against your textbook before use.*`;
  }

  // 10-mark
  return `### 1. Introduction & Formal Definition
**${question}** constitutes a cornerstone architectural framework in ${subject}. Formally, it represents the complete mathematical modeling and execution pipeline governing system stability, dynamic response, and operational efficiency under varying boundary conditions.

### 2. Comprehensive Mathematical Breakdown
The generalized governing differential equation is formulated as:
$$\\nabla^2 \\psi - \\frac{1}{v^2} \\frac{\\partial^2 \\psi}{\\partial t^2} = \\rho(x, y, z)$$

Transforming into the frequency domain using the Fourier transform:
$$\\mathcal{F}\\{\\psi(t)\\} = \\Psi(\\omega) = \\int_{-\\infty}^{\\infty} \\psi(t) e^{-j\\omega t} dt$$

### 3. Architectural Component Breakdown
- **Input Preprocessing Stage**: Cleans and standardizes raw telemetry data.
- **Processing Core**: Evaluates transfer matrix coefficients $H(s) = \\frac{Y(s)}{X(s)}$.
- **Feedback & Control Loop**: Continuously adjusts error margins $e(t) = r(t) - y(t)$.

### 4. Diagram Representation
\`\`\`
+------------------+         +--------------------+         +-------------------+
|  Reference r(t)  | ------> | Controller G_c(s)  | ------> | Plant Process P(s)| --+--> Output y(t)
+------------------+    -    +--------------------+         +-------------------+   |
                         ^                                                          |
                         |                      Feedback H(s)                       |
                         +----------------------------------------------------------+
\`\`\`
*(In your exam booklet, draw the labeled block diagram above showing summing junction, controller, plant transfer function, and negative feedback path).*

### 5. Practical Industry Applications
- Automotive ABS control systems.
- Power grid load frequency balancing.
- Aerospace flight attitude telemetry.

### 6. Conclusion
The comprehensive study of ${question} demonstrates the direct correlation between theoretical mathematical modeling and real-world implementation reliability.

---
*AI-generated. Verify against your textbook before use.*`;
}

function generateDemoQuiz(subject: string, topic: string, count: number, language: string) {
  const sampleBank = [
    {
      id: 1,
      question: "Which of the following sorting algorithms has a guaranteed worst-case time complexity of $O(n \\log n)$?",
      options: ["Quick Sort", "Merge Sort", "Bubble Sort", "Insertion Sort"],
      correctIndex: 1,
      explanation: "Merge Sort consistently divides the array into two halves and takes linear time to merge, guaranteeing $O(n \\log n)$ even in the worst case.",
    },
    {
      id: 2,
      question: "In thermodynamics, what is the change in entropy ($\Delta S$) for an ideal reversible adiabatic process?",
      options: ["$\Delta S > 0$", "$\Delta S < 0$", "$\Delta S = 0$", "$\Delta S = \\infty$"],
      correctIndex: 2,
      explanation: "An adiabatic process involves no heat transfer ($dQ = 0$). Since $dS = dQ_{\\text{rev}}/T$, $\Delta S = 0$ (isentropic process).",
    },
    {
      id: 3,
      question: "Which data structure follows the Last In, First Out (LIFO) order of operation?",
      options: ["Queue", "Stack", "Binary Tree", "Linked List"],
      correctIndex: 1,
      explanation: "A Stack inserts (pushes) and removes (pops) elements from the top, strictly following the LIFO principle.",
    },
    {
      id: 4,
      question: "What is the Nyquist sampling theorem criterion for a continuous-time signal with maximum frequency $f_{\\text{max}}$?",
      options: ["$f_s \\ge f_{\\text{max}}$", "$f_s \\ge 2 f_{\\text{max}}$", "$f_s < 2 f_{\\text{max}}$", "$f_s = \\frac{1}{2} f_{\\text{max}}$"],
      correctIndex: 1,
      explanation: "To prevent aliasing, the sampling rate $f_s$ must be at least twice the highest frequency component of the signal ($2 f_{\\text{max}}$).",
    },
    {
      id: 5,
      question: "In Ohm's Law, what happens to the electric current ($I$) if resistance ($R$) is doubled while voltage ($V$) remains constant?",
      options: ["It is doubled", "It remains unchanged", "It is halved", "It quadruples"],
      correctIndex: 2,
      explanation: "According to $I = \\frac{V}{R}$, current is inversely proportional to resistance. Doubling $R$ halves $I$.",
    },
  ];

  const result = [];
  for (let i = 0; i < count; i++) {
    const item = sampleBank[i % sampleBank.length];
    result.push({
      ...item,
      id: i + 1,
      question: count > 5 ? `[${topic} Q${i + 1}] ${item.question}` : item.question,
    });
  }
  return result;
}

function generateDemoPDFAssistant(action: string, userQuestion: string | undefined, language: string): string {
  if (action === 'summary') {
    return `### Document Chapter Summary\n\n**Document Scope**: Academic Syllabus & Advanced Engineering Foundations.\n\n- **Chapter 1: Mathematical Foundations**: Introduction to linear differential operators, transform calculus, and orthogonal series.\n- **Chapter 2: Physical Realization**: Semiconductor physics, energy band structures, and thermal conductivity.\n- **Chapter 3: System Modeling**: State-space representations, block diagram reduction, and root locus analysis.\n\n**Key Takeaway**: Thorough grasp of Chapters 1 and 3 provides over 70% of typical semester exam numerical questions.`;
  }
  if (action === 'revision_notes') {
    return `### Rapid Revision Notes\n\n- **Formula 1**: Euler's identity: $e^{j\\theta} = \\cos \\theta + j \\sin \\theta$\n- **Formula 2**: Fourier series coefficients: $a_n = \\frac{2}{T}\\int_0^T f(t)\\cos(n\\omega_0 t)dt$\n- **Rule**: Minimum distance for error detection: $d_{\\text{min}} \\ge 2t + 1$\n- **Key Definition**: Bandwidth is the frequency range over which signal power drops by $-3\\text{ dB}$.`;
  }
  if (action === 'practice_questions') {
    return `### Practice Questions from Uploaded Document\n\n1. Explain the significance of the Convolution Theorem in frequency domain analysis.\n2. Derive the state-space equation for an RLC series resonant circuit.\n3. State the necessary and sufficient conditions for Routh-Hurwitz stability.\n4. Calculate the resonant frequency for $L = 10\\text{ mH}$ and $C = 100\\text{ pF}$.\n5. Compare time-domain specifications: Rise time, Peak time, and Maximum Overshoot.`;
  }
  return `### Document Q&A Answer\n\nBased on your query regarding "${userQuestion || 'the topic'}":\n\nThe uploaded document explains that this parameter directly influences stability margins. All calculations assume standard atmospheric temperature and zero initial stored energy.`;
}

function generateDemoStudyPlan(subjects: any[], dailyHours: number) {
  const tasks: any[] = [];
  const today = new Date();

  subjects.forEach((subj, idx) => {
    const subName = subj.name || `Subject ${idx + 1}`;
    const priority = subj.priority || 'Medium';
    const taskDate = new Date(today);
    taskDate.setDate(today.getDate() + (idx % 7));

    tasks.push({
      id: `task-${idx * 2 + 1}`,
      subject: subName,
      title: `Review Core Module 1 Concepts & Theory for ${subName}`,
      durationMinutes: priority === 'High' ? 90 : 60,
      date: taskDate.toISOString().split('T')[0],
      priority,
      completed: idx === 0,
    });

    tasks.push({
      id: `task-${idx * 2 + 2}`,
      subject: subName,
      title: `Practice 5 Previous Year Exam Numerical Questions in ${subName}`,
      durationMinutes: priority === 'High' ? 90 : 45,
      date: taskDate.toISOString().split('T')[0],
      priority,
      completed: false,
    });
  });

  return {
    summary: `Structured ${subjects.length}-subject preparation plan balancing ${dailyHours} hours of daily study time with priority weighting.`,
    weeklyTarget: `Complete core derivations and 20 practice exam numericals before the weekend review checkpoint.`,
    tasks,
  };
}

// Serve Vite in development or static in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduGenius AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
