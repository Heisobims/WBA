import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateAdaptiveFollowUp, scoreResponse } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { questionTitle, userResponse, targetSkillLevel = 3 } = await req.json();

    if (!questionTitle || !userResponse) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // First score the response to determine quality
    const scoring = await scoreResponse({
      questionTitle,
      questionType: "TEXT_LONG",
      response: userResponse,
    });

    const followUp = await generateAdaptiveFollowUp({
      questionTitle,
      userResponse,
      responseQuality: scoring.qualityScore,
      targetSkillLevel,
    });

    return NextResponse.json({ success: true, followUp });
  } catch (error) {
    console.error("[AI follow-up]", error);
    return NextResponse.json({ followUp: null });
  }
}
