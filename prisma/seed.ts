import { PrismaClient, BadgeCategory } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Super Admin ───────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin@123456", 12);
  const superAdmin = await db.user.upsert({
    where: { email: "admin@wbacademy.com" },
    update: {},
    create: {
      email: "admin@wbacademy.com",
      name: "Super Admin",
      password: adminPassword,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      plan: "ENTERPRISE",
      xpPoints: 9999,
      level: 10,
      onboardingCompleted: true,
      emailVerified: new Date(),
    },
  });
  console.log("✓ Super admin created:", superAdmin.email);

  // ─── Demo User ─────────────────────────────────────────────────────
  const demoPassword = await bcrypt.hash("Demo@123456", 12);
  const demoUser = await db.user.upsert({
    where: { email: "demo@neuroform.ai" },
    update: {},
    create: {
      email: "demo@neuroform.ai",
      name: "Demo User",
      password: demoPassword,
      role: "USER",
      status: "ACTIVE",
      plan: "PRO",
      xpPoints: 1250,
      level: 4,
      streakDays: 7,
      totalResponses: 48,
      completedQuestionnaires: 12,
      avgQualityScore: 78.5,
      onboardingCompleted: true,
      bio: "AI enthusiast contributing to the future of machine learning.",
      emailVerified: new Date(),
    },
  });
  console.log("✓ Demo user created:", demoUser.email);

  // ─── Achievements ──────────────────────────────────────────────────
  const achievements = [
    // Engagement
    { name: "first_steps", title: "First Steps", description: "Complete your first questionnaire", icon: "🎯", category: BadgeCategory.COMPLETION, xpReward: 50, requirement: { type: "responses", count: 1 } },
    { name: "getting_started", title: "Getting Started", description: "Complete 10 questionnaires", icon: "🚀", category: BadgeCategory.COMPLETION, xpReward: 100, requirement: { type: "responses", count: 10 } },
    { name: "committed", title: "Committed", description: "Complete 50 questionnaires", icon: "💪", category: BadgeCategory.COMPLETION, xpReward: 250, requirement: { type: "responses", count: 50 } },
    { name: "dedicated", title: "Dedicated", description: "Complete 100 questionnaires", icon: "🏆", category: BadgeCategory.COMPLETION, xpReward: 500, requirement: { type: "responses", count: 100 } },
    { name: "century_club", title: "Century Club", description: "Submit 100 total responses", icon: "💯", category: BadgeCategory.COMPLETION, xpReward: 300, requirement: { type: "totalResponses", count: 100 } },
    // Quality
    { name: "quality_starter", title: "Quality Starter", description: "Achieve 70%+ average quality score", icon: "⭐", category: BadgeCategory.QUALITY, xpReward: 100, requirement: { type: "avgQuality", score: 70 } },
    { name: "high_standards", title: "High Standards", description: "Achieve 85%+ average quality score", icon: "🌟", category: BadgeCategory.QUALITY, xpReward: 250, requirement: { type: "avgQuality", score: 85 } },
    { name: "perfectionist", title: "Perfectionist", description: "Achieve 95%+ average quality score", icon: "💎", category: BadgeCategory.QUALITY, xpReward: 500, requirement: { type: "avgQuality", score: 95 } },
    // Streaks
    { name: "hot_streak", title: "Hot Streak", description: "Maintain a 3-day streak", icon: "🔥", category: BadgeCategory.STREAK, xpReward: 75, requirement: { type: "streak", days: 3 } },
    { name: "week_warrior", title: "Week Warrior", description: "Maintain a 7-day streak", icon: "⚡", category: BadgeCategory.STREAK, xpReward: 150, requirement: { type: "streak", days: 7 } },
    { name: "unstoppable", title: "Unstoppable", description: "Maintain a 30-day streak", icon: "🌊", category: BadgeCategory.STREAK, xpReward: 500, requirement: { type: "streak", days: 30 } },
    // Milestones
    { name: "level_5", title: "Level 5", description: "Reach level 5", icon: "🎖️", category: BadgeCategory.MILESTONE, xpReward: 200, requirement: { type: "level", level: 5 } },
    { name: "level_10", title: "Level 10", description: "Reach level 10", icon: "🥇", category: BadgeCategory.MILESTONE, xpReward: 500, requirement: { type: "level", level: 10 } },
    { name: "level_25", title: "Level 25", description: "Reach level 25", icon: "👑", category: BadgeCategory.MILESTONE, xpReward: 1000, requirement: { type: "level", level: 25 } },
    { name: "xp_millionaire", title: "XP Millionaire", description: "Accumulate 10,000 XP", icon: "💰", category: BadgeCategory.MILESTONE, xpReward: 1000, requirement: { type: "xp", amount: 10000 } },
    // Special
    { name: "early_adopter", title: "Early Adopter", description: "Join during the beta period", icon: "🌅", category: BadgeCategory.SPECIAL, xpReward: 200, requirement: { type: "special", key: "early_adopter" } },
    { name: "profile_complete", title: "Profile Complete", description: "Fill out all profile fields", icon: "✨", category: BadgeCategory.SPECIAL, xpReward: 50, requirement: { type: "special", key: "profile_complete" } },
    { name: "onboarded", title: "Onboarded", description: "Complete the onboarding flow", icon: "🎓", category: BadgeCategory.SPECIAL, xpReward: 50, requirement: { type: "special", key: "onboarded" } },
  ];

  for (const ach of achievements) {
    await db.achievement.upsert({
      where: { name: ach.name },
      update: {},
      create: ach,
    });
  }
  console.log(`✓ ${achievements.length} achievements seeded`);

  // ─── Question Templates ────────────────────────────────────────────
  const templates = [
    {
      title: "How would you describe your experience with [topic]?",
      category: "Open-ended",
      type: "TEXT_LONG" as const,
      description: "General experience question",
      content: { minLength: 50, maxLength: 500 },
    },
    {
      title: "On a scale of 1-10, how would you rate [topic]?",
      category: "Rating",
      type: "RATING_SCALE" as const,
      description: "Simple rating question",
      content: { minValue: 1, maxValue: 10 },
    },
    {
      title: "Which of the following best describes your opinion on [topic]?",
      category: "Choice",
      type: "SINGLE_CHOICE" as const,
      description: "Opinion classification",
      content: { options: ["Strongly agree", "Agree", "Neutral", "Disagree", "Strongly disagree"] },
    },
    {
      title: "Please rank the following options from most to least preferred:",
      category: "Ranking",
      type: "COMPARATIVE_RANKING" as const,
      description: "Preference ranking task",
      content: { options: ["Option A", "Option B", "Option C", "Option D"] },
    },
    {
      title: "What improvements would you suggest for [topic]?",
      category: "Open-ended",
      type: "TEXT_LONG" as const,
      description: "Improvement suggestions",
      content: { minLength: 30, placeholder: "Describe your suggestions in detail..." },
    },
    {
      title: "Which of these best represents the sentiment: [text sample]?",
      category: "AI Training",
      type: "SENTIMENT_CLASSIFICATION" as const,
      description: "Sentiment labeling task",
      content: { labels: ["Positive", "Negative", "Neutral", "Mixed"] },
    },
    {
      title: "Given this scenario: [scenario], what would you do?",
      category: "Assessment",
      type: "SITUATIONAL_JUDGMENT" as const,
      description: "Behavioral judgment question",
      content: { options: ["Option A", "Option B", "Option C", "Option D"] },
    },
    {
      title: "Compare responses A and B. Which is more helpful?",
      category: "AI Training",
      type: "RLHF_TASK" as const,
      description: "RLHF preference comparison",
      content: { responseA: "", responseB: "" },
    },
  ];

  for (const template of templates) {
    await db.questionTemplate.create({ data: template }).catch(() => {
      // Skip duplicates on re-seed
    });
  }
  console.log(`✓ ${templates.length} question templates seeded`);

  // ─── Demo Questionnaire ────────────────────────────────────────────
  const existingQ = await db.questionnaire.findFirst({
    where: { authorId: superAdmin.id, title: "AI Language Model Evaluation" },
  });

  if (!existingQ) {
    const questionnaire = await db.questionnaire.create({
      data: {
        title: "AI Language Model Evaluation",
        slug: "ai-language-model-evaluation-demo",
        description: "Help us evaluate the quality of AI-generated text by answering these questions. Your responses will directly improve language model training.",
        category: "NLP",
        difficulty: 2,
        estimatedTime: 10,
        status: "PUBLISHED",
        authorId: superAdmin.id,
        xpReward: 150,
        aiEnabled: true,
        adaptiveEnabled: true,
        tags: ["nlp", "llm", "evaluation"],
        questions: {
          create: [
            {
              title: "How would you describe the overall quality of AI-generated text you've encountered recently?",
              type: "TEXT_LONG",
              order: 1,
              isRequired: true,
              minLength: 50,
              placeholder: "Share your experience with AI text quality...",
            },
            {
              title: "Which aspects of AI writing do you find most problematic?",
              type: "MULTIPLE_CHOICE",
              order: 2,
              isRequired: true,
              options: [
                { id: "1", text: "Factual inaccuracies", value: "factual" },
                { id: "2", text: "Repetitive phrasing", value: "repetitive" },
                { id: "3", text: "Lack of nuance", value: "nuance" },
                { id: "4", text: "Inconsistent tone", value: "tone" },
                { id: "5", text: "Missing context", value: "context" },
              ],
            },
            {
              title: "On a scale of 1-10, how much do you trust AI-generated content for professional use?",
              type: "RATING_SCALE",
              order: 3,
              isRequired: true,
              minValue: 1,
              maxValue: 10,
            },
            {
              title: "Rank these AI applications by how beneficial you find them for society:",
              type: "COMPARATIVE_RANKING",
              order: 4,
              isRequired: true,
              options: [
                { id: "1", text: "Medical diagnosis assistance" },
                { id: "2", text: "Educational tutoring" },
                { id: "3", text: "Creative writing" },
                { id: "4", text: "Code generation" },
              ],
            },
            {
              title: "Describe a situation where AI-generated content either helped or hindered your work:",
              type: "ESSAY",
              order: 5,
              isRequired: false,
              minLength: 100,
              maxLength: 1000,
            },
          ],
        },
      },
    });
    console.log("✓ Demo questionnaire created:", questionnaire.title);
  }

  // ─── Leaderboard Seed ──────────────────────────────────────────────
  // Upsert demo user into all-time leaderboard
  await db.leaderboardEntry.upsert({
    where: {
      userId_period_periodKey: { userId: demoUser.id, period: "all-time", periodKey: "all-time" },
    },
    update: {
      xpPoints: demoUser.xpPoints,
      responses: demoUser.totalResponses,
      rank: 1,
    },
    create: {
      userId: demoUser.id,
      period: "all-time",
      periodKey: "all-time",
      xpPoints: demoUser.xpPoints,
      responses: demoUser.totalResponses,
      rank: 1,
    },
  });
  console.log("✓ Leaderboard entry seeded");

  // ─── Training Tracks ───────────────────────────────────────────────
  const trackDefs = [
    {
      slug: "rlhf-ranking",
      name: "RLHF Ranking",
      description: "Compare and rank AI responses to train reward models",
      icon: "⚖️",
      color: "blue",
      difficulty: 2,
      estimatedHours: 6,
      skills: ["Comparative Ranking", "Quality Assessment", "Preference Labeling"],
      companies: ["Outlier AI", "Scale AI", "Anthropic", "OpenAI"],
      order: 1,
    },
    {
      slug: "response-evaluation",
      name: "AI Response Evaluation",
      description: "Score and critique AI-generated responses with precision",
      icon: "🔍",
      color: "emerald",
      difficulty: 2,
      estimatedHours: 10,
      skills: ["Quality Scoring", "Rubric Application", "Critical Analysis"],
      companies: ["Outlier AI", "Scale AI", "Surge AI"],
      order: 2,
    },
    {
      slug: "prompt-engineering",
      name: "Prompt Engineering",
      description: "Master the art of writing effective prompts for AI systems",
      icon: "✍️",
      color: "violet",
      difficulty: 2,
      estimatedHours: 8,
      skills: ["Prompt Design", "Instruction Following", "Context Setting"],
      companies: ["Outlier AI", "Scale AI", "Alignerr"],
      order: 3,
    },
    {
      slug: "toxicity-detection",
      name: "Toxicity Detection",
      description: "Identify harmful, offensive, and policy-violating content",
      icon: "🛡️",
      color: "red",
      difficulty: 3,
      estimatedHours: 7,
      skills: ["Content Moderation", "Policy Understanding", "Nuance Detection"],
      companies: ["Meta", "Scale AI", "Surge AI", "Outlier AI"],
      order: 4,
    },
    {
      slug: "coding-evaluation",
      name: "Coding Evaluation",
      description: "Review, debug, and evaluate AI-generated code",
      icon: "💻",
      color: "cyan",
      difficulty: 4,
      estimatedHours: 12,
      skills: ["Code Review", "Bug Detection", "Security Review"],
      companies: ["Outlier AI", "Scale AI", "DataAnnotation"],
      order: 5,
    },
    {
      slug: "math-science-eval",
      name: "Math & Science Evaluation",
      description: "Verify STEM reasoning and mathematical solutions",
      icon: "🔬",
      color: "amber",
      difficulty: 5,
      estimatedHours: 15,
      skills: ["Mathematical Reasoning", "Scientific Accuracy", "Proof Verification"],
      companies: ["Outlier AI", "Alignerr", "Scale AI"],
      order: 6,
    },
  ];

  const tracks: Record<string, { id: string }> = {};
  for (const def of trackDefs) {
    const track = await db.trainingTrack.upsert({
      where: { slug: def.slug },
      update: { name: def.name, description: def.description },
      create: def,
    });
    tracks[def.slug] = track;
  }
  console.log(`✓ ${trackDefs.length} training tracks seeded`);

  // ─── Practice Tasks ────────────────────────────────────────────────
  const rlhfTrackId = tracks["rlhf-ranking"]?.id;
  const evalTrackId = tracks["response-evaluation"]?.id;
  const promptTrackId = tracks["prompt-engineering"]?.id;
  const toxicTrackId = tracks["toxicity-detection"]?.id;

  if (rlhfTrackId) {
    const rlhfTasks = [
      {
        trackId: rlhfTrackId,
        title: "Compare explanations of quantum entanglement",
        instructions: "Read both AI responses. Select the one that better explains quantum entanglement for a high school student — considering accuracy, clarity, and helpfulness.",
        taskType: "COMPARE_RESPONSES" as const,
        difficulty: 2,
        xpReward: 20,
        timeLimit: 300,
        order: 1,
        hints: ["Check for factual accuracy", "Does it use a helpful analogy?", "Which is clearer for a high schooler?"],
        tags: ["science", "explanation", "clarity"],
        content: {
          responseA: "Quantum entanglement is when two particles become connected such that measuring one instantly affects the other, no matter the distance. Imagine two coins that always land on opposite sides — when you flip one and get heads, the other is always tails. Einstein called this 'spooky action at a distance' because it seemed to violate the speed of light, but no information actually travels — the correlation exists from the moment of entanglement.",
          responseB: "Quantum entanglement is a quantum mechanics thing where particles are connected. When you measure one particle it affects the other one even if they are far away. Scientists use this for quantum computers and quantum cryptography. It's really complicated but basically the particles are linked together.",
          correctAnswer: "A",
          explanation: "Response A is better because it uses an effective analogy, accurately references the physics, addresses the Einstein criticism correctly, and is well-structured. Response B is vague and contains errors.",
        },
      },
      {
        trackId: rlhfTrackId,
        title: "Rank four summaries of a news article",
        instructions: "A news article about climate change was summarized by four AI models. Rank them from best (1) to worst (4) based on accuracy, coverage of key points, and conciseness.",
        taskType: "RANK_OUTPUTS" as const,
        difficulty: 3,
        xpReward: 30,
        timeLimit: 420,
        order: 2,
        hints: ["Check that key facts are included", "Is the summary concise but complete?", "Avoid summaries that add opinions not in the original"],
        tags: ["ranking", "summarization", "news"],
        content: {
          article: "Scientists reported record high global temperatures in 2024, with ocean temperatures breaking records for the 13th consecutive month. The UN climate panel called for immediate reduction in fossil fuel use.",
          outputs: [
            { id: "A", text: "2024 saw record global temperatures, with oceans at 13-month highs. UN experts urge immediate fossil fuel cuts." },
            { id: "B", text: "It was very hot in 2024 and oceans were warm. Climate change is a big problem we all need to fix together." },
            { id: "C", text: "Global temperatures hit record highs in 2024. For the 13th straight month, ocean temperatures broke records, prompting UN calls to reduce fossil fuel use immediately." },
            { id: "D", text: "Scientists studied climate in 2024. The oceans were hot. People should use less fossil fuels according to some experts." },
          ],
          correctRanking: ["C", "A", "B", "D"],
          explanation: "C is most complete and accurate. A is concise and good but slightly less detailed. B adds opinion. D is vague and hedged.",
        },
      },
    ];
    for (const t of rlhfTasks) {
      await db.practiceTask.create({ data: t }).catch(() => null);
    }
    console.log("✓ RLHF ranking tasks seeded");
  }

  if (evalTrackId) {
    const evalTasks = [
      {
        trackId: evalTrackId,
        title: "Rate a customer support response",
        instructions: "Use the rubric to rate this AI-generated customer support response across four dimensions.",
        taskType: "RATE_QUALITY" as const,
        difficulty: 1,
        xpReward: 15,
        timeLimit: 180,
        order: 1,
        hints: ["Focus on whether it commits to a solution", "Does it give the customer clear next steps?"],
        tags: ["customer-service", "rating", "rubric"],
        content: {
          prompt: "User: My order hasn't arrived and it's been 2 weeks. Tracking shows 'in transit' but nothing has changed in 10 days.",
          response: "Thank you for reaching out! I understand how frustrating this must be. I'm escalating your case to our shipping team immediately and will have an update within 24 hours. I've also added a $10 store credit for the inconvenience. If not resolved in 72 hours, I'll process a full replacement or refund — your choice.",
          rubric: [
            { dimension: "Helpfulness", desc: "Does it solve the problem?", weight: 30 },
            { dimension: "Tone & Empathy", desc: "Is it warm and professional?", weight: 25 },
            { dimension: "Clarity", desc: "Is it easy to understand?", weight: 25 },
            { dimension: "Completeness", desc: "Does it cover all aspects?", weight: 20 },
          ],
          modelAnswer: { helpfulness: 5, tone: 5, clarity: 4, completeness: 4, overall: 4.7 },
          explanation: "This response is excellent — it acknowledges frustration, commits to action, gives timelines, and offers resolution options.",
        },
      },
    ];
    for (const t of evalTasks) {
      await db.practiceTask.create({ data: t }).catch(() => null);
    }
    console.log("✓ Response evaluation tasks seeded");
  }

  if (promptTrackId) {
    const promptTasks = [
      {
        trackId: promptTrackId,
        title: "Improve a vague coding prompt",
        instructions: "The original prompt is too vague and produces inconsistent AI outputs. Rewrite it to be specific, unambiguous, and likely to produce exactly the desired output every time.",
        taskType: "PROMPT_ENGINEERING" as const,
        difficulty: 3,
        xpReward: 35,
        timeLimit: 360,
        order: 1,
        hints: ["Specify the exact function signature", "Include example inputs and expected outputs", "Mention language and constraints"],
        tags: ["coding", "clarity", "instruction"],
        content: {
          problem: "Write a function to sort products",
          badOutput: "def sort(products):\n    return sorted(products)",
          targetOutput: "A Python function sort_products(products: list[dict], key: str = 'price', reverse: bool = False) that sorts a list of product dicts by the given key, with proper type hints and error handling.",
          modelPrompt: "Write a Python function called sort_products that accepts: (1) products: list[dict] — a list of product dictionaries, (2) key: str = 'price' — the dict key to sort by, (3) reverse: bool = False — sort direction. The function must include type hints, handle missing keys gracefully, and return the sorted list.",
          explanation: "The improved prompt specifies the exact function name, parameter names and types, default values, behavior for edge cases, and return type — eliminating all ambiguity.",
        },
      },
    ];
    for (const t of promptTasks) {
      await db.practiceTask.create({ data: t }).catch(() => null);
    }
    console.log("✓ Prompt engineering tasks seeded");
  }

  if (toxicTrackId) {
    const toxicTasks = [
      {
        trackId: toxicTrackId,
        title: "Label comments for harmful content",
        instructions: "For each comment, select all applicable harmful content categories. Some comments may have multiple issues, others may be clean.",
        taskType: "TOXICITY_DETECTION" as const,
        difficulty: 3,
        xpReward: 25,
        timeLimit: 300,
        order: 1,
        hints: ["Look for subtle dog whistles, not just obvious slurs", "Context matters — is it descriptive or targeted?"],
        tags: ["moderation", "safety", "labeling"],
        content: {
          items: [
            { id: "1", text: "I hope all people from that country get what they deserve.", answer: "hate_speech" },
            { id: "2", text: "The weather today is absolutely terrible!", answer: "clean" },
            { id: "3", text: "You're so stupid, you couldn't find water in the ocean.", answer: "harassment" },
            { id: "4", text: "Studies show vaccines cause autism — share this!", answer: "misinformation" },
            { id: "5", text: "Check out this great deal — click here now!!!", answer: "spam" },
          ],
          categories: ["hate_speech", "harassment", "misinformation", "spam", "clean"],
          explanation: "Items 1 (hate speech targeting nationality), 3 (personal attack), 4 (health misinformation), 5 (spam) are harmful. Item 2 is clean.",
        },
      },
    ];
    for (const t of toxicTasks) {
      await db.practiceTask.create({ data: t }).catch(() => null);
    }
    console.log("✓ Toxicity detection tasks seeded");
  }

  // ─── Qualification Exams ───────────────────────────────────────────
  const rlhfTrack = await db.trainingTrack.findUnique({ where: { slug: "rlhf-ranking" } });
  const evalTrack = await db.trainingTrack.findUnique({ where: { slug: "response-evaluation" } });

  if (rlhfTrack) {
    const existingExam = await db.qualificationExam.findFirst({
      where: { title: "RLHF Fundamentals Qualification" },
    });
    if (!existingExam) {
      await db.qualificationExam.create({
        data: {
          title: "RLHF Fundamentals Qualification",
          description: "Simulates the Outlier AI RLHF qualification screening. Tests your ability to compare and rank AI responses across diverse domains.",
          trackId: rlhfTrack.id,
          timeLimit: 1800,
          passingScore: 70,
          maxAttempts: 3,
          difficulty: 2,
          isActive: true,
          questions: [],
        },
      });
    }
  }

  if (evalTrack) {
    const existingExam = await db.qualificationExam.findFirst({
      where: { title: "AI Response Evaluation — Level 1" },
    });
    if (!existingExam) {
      await db.qualificationExam.create({
        data: {
          title: "AI Response Evaluation — Level 1",
          description: "Mirrors the Scale AI tasker qualification. Evaluate AI responses using structured rubrics.",
          trackId: evalTrack.id,
          timeLimit: 2400,
          passingScore: 75,
          maxAttempts: 3,
          difficulty: 2,
          isActive: true,
          questions: [],
        },
      });
    }
  }
  console.log("✓ Qualification exams seeded");

  console.log("\n✅ Seed complete!");
  console.log("   Admin:  admin@wbacademy.com / Admin@123456");
  console.log("   Demo:   demo@neuroform.ai  / Demo@123456");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
