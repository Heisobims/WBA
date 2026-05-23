import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { openai } from "@/lib/ai";
import { rateLimit } from "@/lib/rate-limit";

const limiter = rateLimit("ai");

const SYSTEM_PROMPT = `You are NeuroTutor, an expert AI trainer coach specializing in helping people prepare for AI training jobs at companies like Outlier AI, Scale AI, Alignerr, DataAnnotation, Remotasks, and Appen.

Your role is to:
1. Explain concepts related to AI training tasks (RLHF, response evaluation, prompt engineering, toxicity detection, code review, etc.)
2. Give personalized feedback on practice task performance
3. Provide exam preparation tips and strategies
4. Explain WHY certain answers are correct in AI annotation tasks
5. Help users understand rubrics and quality standards
6. Suggest which training tracks to focus on based on the user's goals

Key principles:
- Be encouraging and supportive — many users are new to AI work
- Use concrete examples from real AI annotation tasks
- Explain concepts in plain language, then go deeper if asked
- Reference specific company standards (Outlier, Scale AI, etc.) where relevant
- Tailor advice to the user's skill level and track they're practicing

If asked about specific practice tasks, explain the reasoning behind correct answers.
If asked about a track, describe what skills are needed and how to improve.
Keep responses concise (2-4 paragraphs max) unless the user asks for more detail.`;

const MODEL =
  process.env.AI_MODEL ||
  (process.env.GEMINI_API_KEY
    ? "gemini-2.0-flash"
    : process.env.GROQ_API_KEY
    ? "llama-3.3-70b-versatile"
    : "gpt-4o");

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rateLimitResult = await limiter(req, session.user.id);
  if (rateLimitResult instanceof NextResponse) return rateLimitResult;

  try {
    const body = await req.json();
    const { messages, context } = body as {
      messages: { role: "user" | "assistant"; content: string }[];
      context?: { track?: string; taskId?: string; examId?: string; score?: number };
    };

    if (!messages?.length) {
      return NextResponse.json({ error: "Messages required" }, { status: 400 });
    }

    // Build context message if provided
    let systemContent = SYSTEM_PROMPT;
    if (context?.track) {
      systemContent += `\n\nThe user is currently practicing the "${context.track}" training track.`;
    }
    if (context?.taskId) {
      systemContent += ` They just completed task ${context.taskId}.`;
    }
    if (context?.score !== undefined) {
      systemContent += ` Their score was ${context.score}/100.`;
    }

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemContent },
        ...messages.slice(-12), // keep last 12 messages for context
      ],
      temperature: 0.7,
      max_tokens: 600,
    });

    const reply = completion.choices[0].message.content || "I'm not sure how to help with that. Could you rephrase your question?";

    return NextResponse.json({ message: reply });
  } catch (err) {
    console.error("[AI tutor]", err);
    return NextResponse.json({ error: "AI tutor unavailable" }, { status: 500 });
  }
}
