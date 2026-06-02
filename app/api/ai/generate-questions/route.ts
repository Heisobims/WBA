import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateQuestions } from "@/lib/ai";
import { generateQuestionsSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const limiter = rateLimit("ai");

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimitResult = await limiter(req, session.user.id);
  if (rateLimitResult instanceof NextResponse) return rateLimitResult;

  try {
    const body = await req.json();
    const data = generateQuestionsSchema.parse(body);

    const questions = await generateQuestions({
      topic: data.topic,
      category: data.category,
      count: data.count,
      difficulty: data.difficulty,
      types: data.types,
      context: data.context,
    });

    return NextResponse.json({ success: true, data: questions });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    console.error("[AI generate-questions]", JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: "AI generation failed. Check your OpenAI API key." },
      { status: 500 },
    );
  }
}
