import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * AI Resume Analysis Service
 * This is a mock implementation. Replace with actual OpenAI API calls
 */

export interface ResumeAnalysis {
  fitScore: number;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  summary: string;
}

export interface DetailedResumeAnalysis {
  overallScore: number;
  extractedSkills: string[];
  missingSkills: string[];
  suggestions: string[];
  strengthAreas: {
    technical: number;
    experience: number;
    education: number;
    softSkills: number;
  };
  detailedFeedback: {
    formatting: string;
    content: string;
    keywords: string;
    impact: string;
  };
}

export interface HirePredictionResult {
  hireProbability: number;
  verdict: 'likely' | 'uncertain' | 'unlikely';
  missingSkills: string[];
  strengths: string[];
  improvementAreas: string[];
  summary: string;
}

export interface InterviewQuestion {
  id: number;
  question: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface InterviewQuestionsResult {
  questions: InterviewQuestion[];
  jobTitle: string;
  keySkills: string[];
  generatedAt: string;
}

const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const RESOLVED_GEMINI_MODEL = DEFAULT_GEMINI_MODEL.replace(/^models\//i, '');

const clampPercentage = (value: unknown, fallback = 50): number => {
  const numericValue = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numericValue)) return fallback;
  if (numericValue < 0) return 0;
  if (numericValue > 100) return 100;
  return Math.round(numericValue);
};

const normalizeStringList = (value: unknown, fallback: string[] = []): string[] => {
  if (!Array.isArray(value)) return fallback;

  return value
    .map((item) => (typeof item === 'string' ? item.trim() : String(item || '').trim()))
    .filter((item) => item.length > 0)
    .slice(0, 20);
};

const parseJsonFromModelOutput = (text: string): any => {
  const cleanedText = text.replace(/```json|```/gi, '').trim();

  try {
    return JSON.parse(cleanedText);
  } catch {
    const firstBrace = cleanedText.indexOf('{');
    const lastBrace = cleanedText.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
      throw new Error('Model response is not valid JSON');
    }

    const extractedJson = cleanedText.slice(firstBrace, lastBrace + 1);
    return JSON.parse(extractedJson);
  }
};

const sanitizeDetailedAnalysis = (payload: any): DetailedResumeAnalysis => {
  const strengthAreas = payload?.strengthAreas || {};
  const detailedFeedback = payload?.detailedFeedback || {};

  return {
    overallScore: clampPercentage(payload?.overallScore),
    extractedSkills: normalizeStringList(payload?.extractedSkills, []),
    missingSkills: normalizeStringList(payload?.missingSkills, []).slice(0, 10),
    suggestions: normalizeStringList(payload?.suggestions, [
      'Add role-relevant skills and measurable achievements to strengthen your resume.',
    ]),
    strengthAreas: {
      technical: clampPercentage(strengthAreas.technical),
      experience: clampPercentage(strengthAreas.experience),
      education: clampPercentage(strengthAreas.education),
      softSkills: clampPercentage(strengthAreas.softSkills),
    },
    detailedFeedback: {
      formatting:
        typeof detailedFeedback.formatting === 'string' && detailedFeedback.formatting.trim()
          ? detailedFeedback.formatting.trim()
          : 'Formatting is acceptable. Keep sections clear and concise.',
      content:
        typeof detailedFeedback.content === 'string' && detailedFeedback.content.trim()
          ? detailedFeedback.content.trim()
          : 'Content quality can improve with specific examples and outcomes.',
      keywords:
        typeof detailedFeedback.keywords === 'string' && detailedFeedback.keywords.trim()
          ? detailedFeedback.keywords.trim()
          : 'Add more role-specific keywords to improve discoverability.',
      impact:
        typeof detailedFeedback.impact === 'string' && detailedFeedback.impact.trim()
          ? detailedFeedback.impact.trim()
          : 'Highlight business impact using metrics and concrete results.',
    },
  };
};

const buildGeminiPrompt = (resumeText: string, targetRole?: string): string => `
You are an expert technical recruiter and resume reviewer.
Analyze this resume and return ONLY valid JSON using this exact schema:
{
  "overallScore": number (0-100),
  "extractedSkills": string[],
  "missingSkills": string[],
  "suggestions": string[],
  "strengthAreas": {
    "technical": number (0-100),
    "experience": number (0-100),
    "education": number (0-100),
    "softSkills": number (0-100)
  },
  "detailedFeedback": {
    "formatting": string,
    "content": string,
    "keywords": string,
    "impact": string
  }
}

Requirements:
- Respond with JSON only. No markdown. No explanation text.
- Keep suggestions practical and actionable.
- If target role is provided, optimize analysis for that role.
- Limit missingSkills to most important items.

Target role: ${targetRole || 'auto-detect'}

Resume:
${resumeText}
`;

const buildHirePredictionPrompt = (
  resumeText: string,
  jobInput: { title: string; description: string; skills?: string[]; requirements?: string[] }
): string => `
You are an expert recruiter. Predict hiring likelihood for this candidate against this job.
Return ONLY valid JSON in this exact schema:
{
  "hireProbability": number (0-100),
  "verdict": "likely" | "uncertain" | "unlikely",
  "missingSkills": string[],
  "strengths": string[],
  "improvementAreas": string[],
  "summary": string
}

Rules:
- JSON only, no markdown and no extra text.
- missingSkills: max 8 practical skills candidate should add to resume/learn.
- strengths: max 6.
- improvementAreas: max 6 action-oriented points.
- verdict must align with hireProbability.

Job Title: ${jobInput.title}
Job Description: ${jobInput.description}
Required Skills: ${(jobInput.skills || []).join(', ')}
Requirements: ${(jobInput.requirements || []).join(', ')}

Candidate Resume:
${resumeText}
`;

const buildInterviewQuestionsPrompt = (
  jobTitle: string,
  jobDescription: string,
  skills: string[],
  requirements: string[]
): string => `
You are an expert technical interviewer. Generate 10 most important interview questions for this position.
Return ONLY valid JSON in this exact schema:
{
  "questions": [
    {
      "id": number (1-10),
      "question": string,
      "category": "technical" | "behavioral" | "problem-solving" | "experience",
      "difficulty": "beginner" | "intermediate" | "advanced"
    }
  ]
}

Rules:
- JSON only, no markdown and no extra text.
- Include mix: 4 technical, 3 behavioral, 2 problem-solving, 1 experience-based.
- Questions must be specific to the job role and required skills.
- Difficulty should vary: some beginner, mostly intermediate/advanced.
- Questions should help assess real competency for this role.

Job Title: ${jobTitle}
Job Description: ${jobDescription}
Required Skills: ${skills.slice(0, 10).join(', ')}
Requirements: ${requirements.slice(0, 5).join(', ')}
`;

const sanitizeInterviewQuestions = (payload: any): InterviewQuestion[] => {
  if (!Array.isArray(payload?.questions)) return [];

  const validCategories = ['technical', 'behavioral', 'problem-solving', 'experience'];
  const validDifficulties = ['beginner', 'intermediate', 'advanced'];

  return payload.questions
    .slice(0, 10)
    .map((q: any, idx: number) => ({
      id: q.id || idx + 1,
      question:
        typeof q.question === 'string' && q.question.trim().length > 0
          ? q.question.trim()
          : `Question ${idx + 1}`,
      category: validCategories.includes(q.category) ? q.category : 'technical',
      difficulty: validDifficulties.includes(q.difficulty) ? q.difficulty : 'intermediate',
    }))
    .filter((q: InterviewQuestion) => q.question.length > 5);
};

const getFallbackInterviewQuestions = (
  jobTitle: string,
  skills: string[]
): InterviewQuestion[] => {
  const baseQuestions = [
    {
      id: 1,
      question: `Tell us about your experience with ${skills[0] || 'the core technologies'} and how you've applied it in previous roles.`,
      category: 'experience' as const,
      difficulty: 'intermediate' as const,
    },
    {
      id: 2,
      question: `What is your approach to learning new technologies and staying updated with ${jobTitle.toLowerCase()} trends?`,
      category: 'behavioral' as const,
      difficulty: 'beginner' as const,
    },
    {
      id: 3,
      question: `Describe a challenging problem you solved using ${skills[0] || 'technical skills'}. What was your approach?`,
      category: 'problem-solving' as const,
      difficulty: 'intermediate' as const,
    },
    {
      id: 4,
      question: `How do you handle working on a team project? Can you give an example of collaboration?`,
      category: 'behavioral' as const,
      difficulty: 'beginner' as const,
    },
    {
      id: 5,
      question: `What are the key best practices for ${skills[0] || 'development'} that you follow?`,
      category: 'technical' as const,
      difficulty: 'advanced' as const,
    },
    {
      id: 6,
      question: `How do you approach debugging and troubleshooting issues in production?`,
      category: 'technical' as const,
      difficulty: 'intermediate' as const,
    },
    {
      id: 7,
      question: `Tell us about a project where you had to work with tight deadlines. How did you manage it?`,
      category: 'behavioral' as const,
      difficulty: 'intermediate' as const,
    },
    {
      id: 8,
      question: `What interests you most about this ${jobTitle} role?`,
      category: 'behavioral' as const,
      difficulty: 'beginner' as const,
    },
    {
      id: 9,
      question: `If you encountered a critical bug before deployment, how would you prioritize and handle it?`,
      category: 'problem-solving' as const,
      difficulty: 'advanced' as const,
    },
    {
      id: 10,
      question: `What are your career goals, and how does this position align with them?`,
      category: 'experience' as const,
      difficulty: 'intermediate' as const,
    },
  ];

  return baseQuestions;
};

export const generateInterviewQuestions = async (
  jobTitle: string,
  jobDescription: string,
  skills: string[] = [],
  requirements: string[] = []
): Promise<InterviewQuestionsResult> => {
  const safeSkills = Array.isArray(skills) ? skills : [];
  const safeRequirements = Array.isArray(requirements) ? requirements : [];

  try {
    if (process.env.GEMINI_API_KEY) {
      const generativeAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = generativeAI.getGenerativeModel({ model: RESOLVED_GEMINI_MODEL });
      const result = await model.generateContent(
        buildInterviewQuestionsPrompt(jobTitle, jobDescription, safeSkills, safeRequirements)
      );
      const responseText = result.response.text();

      if (!responseText?.trim()) {
        throw new Error('Gemini returned an empty interview questions response');
      }

      const parsed = parseJsonFromModelOutput(responseText);
      const sanitizedQuestions = sanitizeInterviewQuestions(parsed);

      if (sanitizedQuestions.length > 0) {
        return {
          questions: sanitizedQuestions,
          jobTitle,
          keySkills: safeSkills.slice(0, 5),
          generatedAt: new Date().toISOString(),
        };
      }
    }
  } catch (error) {
    console.warn('⚠️ Gemini interview questions generation failed, using fallback:', error);
  }

  const fallbackQuestions = getFallbackInterviewQuestions(jobTitle, safeSkills);
  return {
    questions: fallbackQuestions,
    jobTitle,
    keySkills: safeSkills.slice(0, 5),
    generatedAt: new Date().toISOString(),
  };
};

const sanitizeVerdict = (value: unknown, probability: number): HirePredictionResult['verdict'] => {
  if (value === 'likely' || value === 'uncertain' || value === 'unlikely') {
    return value;
  }

  if (probability >= 70) return 'likely';
  if (probability >= 45) return 'uncertain';
  return 'unlikely';
};

const sanitizeHirePrediction = (payload: any): HirePredictionResult => {
  const hireProbability = clampPercentage(payload?.hireProbability, 50);
  const verdict = sanitizeVerdict(payload?.verdict, hireProbability);

  return {
    hireProbability,
    verdict,
    missingSkills: normalizeStringList(payload?.missingSkills, []).slice(0, 8),
    strengths: normalizeStringList(payload?.strengths, []).slice(0, 6),
    improvementAreas: normalizeStringList(payload?.improvementAreas, []).slice(0, 6),
    summary:
      typeof payload?.summary === 'string' && payload.summary.trim().length > 0
        ? payload.summary.trim()
        : 'Resume partially matches the role. Add missing skills and quantified achievements for better fit.',
  };
};

export const analyzeResumeWithGemini = async (
  resumeText: string,
  targetRole?: string
): Promise<DetailedResumeAnalysis> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const generativeAI = new GoogleGenerativeAI(apiKey);
  const model = generativeAI.getGenerativeModel({ model: RESOLVED_GEMINI_MODEL });

  const result = await model.generateContent(buildGeminiPrompt(resumeText, targetRole));
  const responseText = result.response.text();

  if (!responseText?.trim()) {
    throw new Error('Gemini returned an empty response');
  }

  const parsed = parseJsonFromModelOutput(responseText);
  return sanitizeDetailedAnalysis(parsed);
};

export const predictHireLikelihood = async (
  resumeText: string,
  jobInput: { title: string; description: string; skills?: string[]; requirements?: string[] }
): Promise<HirePredictionResult> => {
  const safeResumeText = resumeText || '';

  try {
    if (process.env.GEMINI_API_KEY) {
      const generativeAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = generativeAI.getGenerativeModel({ model: RESOLVED_GEMINI_MODEL });
      const result = await model.generateContent(buildHirePredictionPrompt(safeResumeText, jobInput));
      const responseText = result.response.text();

      if (!responseText?.trim()) {
        throw new Error('Gemini returned an empty prediction response');
      }

      const parsed = parseJsonFromModelOutput(responseText);
      return sanitizeHirePrediction(parsed);
    }
  } catch (error) {
    console.warn('⚠️ Gemini hire prediction failed, using fallback:', error);
  }

  const fallbackAnalysis = await analyzeResume(safeResumeText, jobInput.description || '');
  const hireProbability = clampPercentage(fallbackAnalysis.fitScore, 50);
  const verdict: HirePredictionResult['verdict'] =
    hireProbability >= 70 ? 'likely' : hireProbability >= 45 ? 'uncertain' : 'unlikely';

  const fallbackSummary =
    verdict === 'likely'
      ? 'Candidate appears to be a strong fit based on current resume-to-job alignment.'
      : verdict === 'uncertain'
        ? 'Candidate has partial fit. Improving missing skills and measurable impact can raise hiring chances.'
        : 'Candidate appears underqualified for key requirements in the current resume.';

  return {
    hireProbability,
    verdict,
    missingSkills: fallbackAnalysis.missingSkills.slice(0, 8),
    strengths: fallbackAnalysis.strengths.slice(0, 6),
    improvementAreas: fallbackAnalysis.weaknesses.slice(0, 6),
    summary: fallbackSummary,
  };
};

/**
 * Analyze resume against job description using AI
 * For now, this is a mock implementation with pattern matching
 */
export const analyzeResume = async (
  resumeText: string,
  jobDescription: string
): Promise<ResumeAnalysis> => {
  try {
    // Mock implementation - in production, use OpenAI API
    // This extracts basic patterns and calculates a simple match score

    const resumeLower = resumeText.toLowerCase();
    const jobLower = jobDescription.toLowerCase();

    // Extract keywords from job description
    const jobKeywords = extractKeywords(jobLower);
    
    // Count matches
    let matchCount = 0;
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const missingSkills: string[] = [];

    jobKeywords.forEach((keyword) => {
      if (resumeLower.includes(keyword)) {
        matchCount++;
        strengths.push(keyword);
      } else {
        missingSkills.push(keyword);
      }
    });

    // Calculate fit score (0-100)
    const fitScore = Math.round((matchCount / jobKeywords.length) * 100) || 0;

    // Simulate weaknesses
    weaknesses.push(
      'Could improve technical depth in emerging technologies',
      'Consider adding more quantifiable achievements'
    );

    const summary = `Resume matches ${fitScore}% of job requirements. Strong in ${strengths.slice(0, 3).join(', ')}. Missing skills: ${missingSkills.slice(0, 3).join(', ')}.`;

    return {
      fitScore,
      strengths: strengths.slice(0, 10),
      weaknesses,
      missingSkills: missingSkills.slice(0, 10),
      summary,
    };
  } catch (error) {
    console.error('Error analyzing resume:', error);
    throw error;
  }
};

/**
 * Extract keywords from text
 */
const extractKeywords = (text: string): string[] => {
  const commonSkills = [
    'javascript',
    'typescript',
    'react',
    'node.js',
    'python',
    'java',
    'sql',
    'mongodb',
    'express',
    'aws',
    'docker',
    'kubernetes',
    'git',
    'rest api',
    'graphql',
    'html',
    'css',
    'angular',
    'vue',
    'fastapi',
    'django',
    'postgresql',
    'redis',
    'rabbitmq',
    'elasticsearch',
    'machine learning',
    'data science',
    'analytics',
    'project management',
    'agile',
    'scrum',
    'leadership',
    'communication',
  ];

  return commonSkills.filter((skill) => text.includes(skill));
};

/**
 * Analyze resume comprehensively without job description
 */
export const analyzeResumeStandalone = async (
  resumeText: string,
  targetRole?: string
): Promise<DetailedResumeAnalysis> => {
  try {
    const resumeLower = resumeText.toLowerCase();

    // Extract all skills present in resume
    const allSkills = [
      'javascript', 'typescript', 'react', 'node.js', 'python', 'java', 'sql',
      'mongodb', 'express', 'aws', 'docker', 'kubernetes', 'git', 'rest api',
      'graphql', 'html', 'css', 'angular', 'vue', 'fastapi', 'django',
      'postgresql', 'redis', 'rabbitmq', 'elasticsearch', 'machine learning',
      'data science', 'analytics', 'project management', 'agile', 'scrum',
      'leadership', 'communication', 'teamwork', 'problem solving',
      'spring boot', 'flutter', 'react native', 'terraform', 'jenkins',
      'ci/cd', 'microservices', 'api development', 'azure', 'gcp'
    ];

    const extractedSkills = allSkills.filter(skill => resumeLower.includes(skill));

    // Determine suggested skills based on target role or extracted skills
    const suggestedSkills = getSuggestedSkills(extractedSkills, targetRole);
    const missingSkills = suggestedSkills.filter(skill => !extractedSkills.includes(skill));

    // Calculate strength areas
    const technicalSkills = ['javascript', 'typescript', 'python', 'java', 'react', 'node.js', 'sql', 'mongodb'];
    const softSkills = ['leadership', 'communication', 'teamwork', 'problem solving', 'agile', 'scrum'];
    
    const technicalScore = Math.min(100, (extractedSkills.filter(s => technicalSkills.includes(s)).length / technicalSkills.length * 100));
    const softSkillScore = Math.min(100, (extractedSkills.filter(s => softSkills.includes(s)).length / softSkills.length * 100));
    
    // Check for experience and education keywords
    const hasExperience = /\d+\s*(year|yr|month)/i.test(resumeText);
    const hasEducation = /(bachelor|master|phd|degree|university|college)/i.test(resumeText);
    const hasQuantifiableResults = /\d+%|\$\d+|increased|improved|reduced|grew/i.test(resumeText);
    
    const experienceScore = hasExperience ? (hasQuantifiableResults ? 85 : 65) : 40;
    const educationScore = hasEducation ? 80 : 50;

    // Overall score calculation
    const overallScore = Math.round(
      (technicalScore * 0.35) +
      (experienceScore * 0.30) +
      (educationScore * 0.15) +
      (softSkillScore * 0.20)
    );

    // Generate suggestions
    const suggestions: string[] = [];
    if (technicalScore < 60) {
      suggestions.push('Add more technical skills relevant to your target role');
    }
    if (!hasQuantifiableResults) {
      suggestions.push('Include quantifiable achievements (e.g., "Increased performance by 40%")');
    }
    if (softSkillScore < 50) {
      suggestions.push('Highlight soft skills like leadership, teamwork, and communication');
    }
    if (extractedSkills.length < 8) {
      suggestions.push('Expand your skills section with more relevant technologies');
    }
    if (!/\b(project|developed|built|created|designed)\b/i.test(resumeText)) {
      suggestions.push('Add more action verbs to describe your work (e.g., developed, built, designed)');
    }
    if (missingSkills.length > 0) {
      suggestions.push(`Consider learning: ${missingSkills.slice(0, 3).join(', ')}`);
    }

    // Detailed feedback
    const detailedFeedback = {
      formatting: resumeText.length > 500 
        ? 'Good resume length. Ensure proper sections and formatting.' 
        : 'Resume seems brief. Add more details about your experience and projects.',
      
      content: hasQuantifiableResults
        ? 'Great! You have quantifiable achievements. Keep using metrics.'
        : 'Add measurable results to showcase your impact (numbers, percentages, outcomes).',
      
      keywords: extractedSkills.length >= 8
        ? `Strong keyword presence with ${extractedSkills.length} relevant skills identified.`
        : `Only ${extractedSkills.length} relevant keywords found. Add more industry-specific terms.`,
      
      impact: hasExperience && hasQuantifiableResults
        ? 'Resume demonstrates clear impact through experience and results.'
        : 'Strengthen your resume by showing how your work made a difference.'
    };

    return {
      overallScore,
      extractedSkills,
      missingSkills: missingSkills.slice(0, 10),
      suggestions,
      strengthAreas: {
        technical: Math.round(technicalScore),
        experience: Math.round(experienceScore),
        education: Math.round(educationScore),
        softSkills: Math.round(softSkillScore)
      },
      detailedFeedback
    };
  } catch (error) {
    console.error('Error analyzing resume:', error);
    throw error;
  }
};

/**
 * Get suggested skills based on what user already has
 */
const getSuggestedSkills = (currentSkills: string[], targetRole?: string): string[] => {
  const roleSkillMap: { [key: string]: string[] } = {
    'frontend': ['react', 'typescript', 'html', 'css', 'javascript', 'vue', 'angular', 'rest api'],
    'backend': ['node.js', 'python', 'java', 'sql', 'mongodb', 'rest api', 'microservices', 'docker'],
    'fullstack': ['react', 'node.js', 'typescript', 'mongodb', 'sql', 'rest api', 'docker', 'aws'],
    'devops': ['docker', 'kubernetes', 'aws', 'jenkins', 'terraform', 'ci/cd', 'git'],
    'data': ['python', 'sql', 'machine learning', 'data science', 'analytics', 'postgresql'],
  };

  // Determine role from target or skills
  let role = targetRole?.toLowerCase() || 'fullstack';
  
  if (!targetRole) {
    if (currentSkills.some(s => ['react', 'angular', 'vue'].includes(s))) {
      role = 'frontend';
    } else if (currentSkills.some(s => ['docker', 'kubernetes', 'terraform'].includes(s))) {
      role = 'devops';
    } else if (currentSkills.some(s => ['machine learning', 'data science'].includes(s))) {
      role = 'data';
    }
  }

  return roleSkillMap[role] || roleSkillMap['fullstack'];
};

/**
 * For production, implement actual OpenAI API integration:
 */
/*
export const analyzeResumeWithOpenAI = async (
  resumeText: string,
  jobDescription: string
): Promise<ResumeAnalysis> => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = `
    Analyze the following resume against the job description and provide:
    1. A fit score (0-100)
    2. Top 5 strengths matching the job
    3. Top 5 weaknesses or gaps
    4. Top 5 missing skills
    5. A brief summary (1-2 sentences)

    Resume:
    ${resumeText}

    Job Description:
    ${jobDescription}

    Respond in JSON format.
  `;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
  });

  return JSON.parse(response.choices[0].message.content || '{}');
};
*/
