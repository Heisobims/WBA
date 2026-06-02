import OpenAI from "openai";
import { QuestionType } from "@prisma/client";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = process.env.AI_MODEL || "gpt-4o";

// ============================================
// QUESTION GENERATION
// ============================================

export interface GeneratedQuestion {
  type: QuestionType;
  title: string;
  description?: string;
  options?: { id: string; text: string; isCorrect?: boolean }[];
  minValue?: number;
  maxValue?: number;
  correctAnswer?: unknown;
  scoringEnabled?: boolean;
  maxScore?: number;
  aiTags?: string[];
}

export async function generateQuestions(params: {
  topic: string;
  category: string;
  count: number;
  difficulty: number;
  types?: QuestionType[];
  context?: string;
}): Promise<GeneratedQuestion[]> {
  const { topic, category, count, difficulty, types, context } = params;

  const allowedTypes = types?.length
    ? types.join(", ")
    : "MULTIPLE_CHOICE, SINGLE_CHOICE, TEXT_SHORT, TEXT_LONG, RATING_SCALE";

  const prompt = `Generate ${count} high-quality AI training questions about "${topic}" in the "${category}" category.

Difficulty level: ${difficulty}/5

Allowed question types: ${allowedTypes}

${context ? `Additional context: ${context}` : ""}

Return a JSON object with this exact structure:
{
  "questions": [
    {
      "type": "QUESTION_TYPE",
      "title": "Question text here",
      "description": "Optional helper text",
      "options": [
        {"id": "opt1", "text": "Option text", "isCorrect": false},
        {"id": "opt2", "text": "Option text", "isCorrect": true}
      ],
      "minValue": null,
      "maxValue": null,
      "correctAnswer": null,
      "scoringEnabled": true,
      "maxScore": 10,
      "aiTags": ["tag1", "tag2"]
    }
  ]
}

Rules:
- Multiple/single choice questions must have 4 options with at least 1 correct
- Rating scale questions need minValue and maxValue
- Text questions need thoughtful, open-ended prompts
- All questions must be unique and high quality for AI training purposes
- Use variety in question types
- Make questions that require thoughtful, nuanced responses`;

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content:
          "You are an expert at creating high-quality AI training data. Generate questions that capture diverse human reasoning, creativity, and knowledge. Return only valid JSON.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.8,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0].message.content;
  if (!content) return [];

  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed.questions)) return parsed.questions;
    // fallback: find the first array-valued key
    const arrayVal = Object.values(parsed).find((v) => Array.isArray(v));
    return (arrayVal as GeneratedQuestion[]) || [];
  } catch {
    return [];
  }
}

// ============================================
// RESPONSE SCORING
// ============================================

export interface ScoringResult {
  score: number;
  confidence: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  tags: string[];
  toxicity: number;
  isDuplicate: boolean;
  qualityScore: number;
}

export async function scoreResponse(params: {
  questionTitle: string;
  questionType: string;
  questionContext?: string;
  response: string;
  rubric?: string;
}): Promise<ScoringResult> {
  const { questionTitle, questionType, questionContext, response, rubric } = params;

  const prompt = `Evaluate this human response for AI training quality.

Question: ${questionTitle}
Question Type: ${questionType}
${questionContext ? `Context: ${questionContext}` : ""}
${rubric ? `Scoring Rubric: ${rubric}` : ""}

Human Response:
"""
${response}
"""

Evaluate and return JSON with:
{
  "score": <0-100 number>,
  "confidence": <0-1 float>,
  "summary": "Brief evaluation summary",
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1"],
  "tags": ["relevant", "semantic", "tags"],
  "toxicity": <0-1 float, 0=clean>,
  "isDuplicate": false,
  "qualityScore": <0-100 overall quality>
}

Scoring criteria:
- Relevance to the question
- Depth and thoughtfulness
- Clarity of expression
- Accuracy (if factual)
- Uniqueness/originality
- Grammar and coherence`;

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content:
          "You are an expert AI training data evaluator. Assess response quality objectively and return only valid JSON.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.2,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0].message.content;
  if (!content) {
    return {
      score: 50,
      confidence: 0.5,
      summary: "Unable to evaluate",
      strengths: [],
      weaknesses: [],
      tags: [],
      toxicity: 0,
      isDuplicate: false,
      qualityScore: 50,
    };
  }

  return JSON.parse(content);
}

// ============================================
// AI CONVERSATION SIMULATION
// ============================================

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export async function generateAIConversationResponse(params: {
  scenario: string;
  systemPrompt: string;
  history: ConversationMessage[];
  userMessage: string;
}): Promise<string> {
  const { scenario, systemPrompt, history, userMessage } = params;

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `${systemPrompt}\n\nScenario: ${scenario}\n\nYou are having a conversation to collect high-quality AI training data. Be engaging, ask follow-up questions, and guide the conversation to elicit detailed, thoughtful responses.`,
    },
    ...history.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
    { role: "user", content: userMessage },
  ];

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages,
    temperature: 0.7,
    max_tokens: 500,
  });

  return completion.choices[0].message.content || "Thank you for your response.";
}

// ============================================
// ADAPTIVE QUESTION GENERATION
// ============================================

export async function generateAdaptiveFollowUp(params: {
  questionTitle: string;
  userResponse: string;
  responseQuality: number;
  targetSkillLevel: number;
}): Promise<string | null> {
  const { questionTitle, userResponse, responseQuality, targetSkillLevel } = params;

  if (responseQuality < 30) return null;

  const prompt = `Based on this question and response, generate a single adaptive follow-up question.

Original Question: ${questionTitle}
User's Response: "${userResponse}"
Response Quality Score: ${responseQuality}/100
Target Difficulty Level: ${targetSkillLevel}/5

Generate one thoughtful follow-up question that:
- Builds on what the user said
- Explores their reasoning more deeply
- Matches the difficulty level
- Collects more valuable AI training data

Return only the follow-up question text, nothing else.`;

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: "Generate concise, insightful follow-up questions for AI training data collection.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 200,
  });

  return completion.choices[0].message.content?.trim() || null;
}

// ============================================
// RESPONSE ANALYSIS
// ============================================

export async function analyzeResponseBatch(responses: string[]): Promise<{
  themes: string[];
  sentiment: "positive" | "negative" | "neutral" | "mixed";
  avgComplexity: number;
  keyInsights: string[];
}> {
  const prompt = `Analyze this batch of ${responses.length} responses for AI training insights.

Responses:
${responses.map((r, i) => `${i + 1}. "${r}"`).join("\n")}

Return JSON:
{
  "themes": ["main theme 1", "theme 2"],
  "sentiment": "positive|negative|neutral|mixed",
  "avgComplexity": <1-5>,
  "keyInsights": ["insight 1", "insight 2"]
}`;

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: "Analyze response batches for AI training data quality and patterns. Return only valid JSON.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.3,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0].message.content;
  return content
    ? JSON.parse(content)
    : { themes: [], sentiment: "neutral", avgComplexity: 3, keyInsights: [] };
}

// ============================================
// SMART TAGGING & CATEGORIZATION
// ============================================

export async function autoTagContent(text: string): Promise<string[]> {
  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: "Extract 3-7 relevant semantic tags from text. Return as JSON array of strings.",
      },
      { role: "user", content: text },
    ],
    temperature: 0.3,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0].message.content;
  if (!content) return [];
  const parsed = JSON.parse(content);
  return Array.isArray(parsed) ? parsed : parsed.tags || [];
}

// ============================================
// TOXICITY DETECTION
// ============================================

export async function detectToxicity(text: string): Promise<{
  isToxic: boolean;
  score: number;
  categories: string[];
}> {
  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content:
          "Detect toxicity, hate speech, spam, or inappropriate content. Return JSON: {isToxic: bool, score: 0-1, categories: []}",
      },
      { role: "user", content: `Analyze: "${text}"` },
    ],
    temperature: 0,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0].message.content;
  return content
    ? JSON.parse(content)
    : { isToxic: false, score: 0, categories: [] };
}

export { openai };
