"use client";

import { useBuilderStore } from "@/store/questionnaire-store";
import {
  QUESTION_TYPES,
  QUESTION_TYPE_CATEGORIES,
} from "@/components/questionnaire/question-type-config";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function QuestionTypePanel() {
  const { addQuestion } = useBuilderStore();

  const grouped = Object.entries(QUESTION_TYPE_CATEGORIES).map(([key, label]) => ({
    key,
    label,
    types: QUESTION_TYPES.filter((qt) => qt.category === key),
  }));

  return (
    <div className="p-3 space-y-4">
      {grouped.map(({ key, label, types }) => (
        <div key={key}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2 px-1">
            {label}
          </p>
          <div className="space-y-1">
            {types.map((qt) => (
              <motion.button
                key={qt.type}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => addQuestion(qt.type)}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-accent/50 transition-colors group"
                title={qt.description}
              >
                <div
                  className={cn(
                    "h-7 w-7 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0",
                    qt.color,
                  )}
                >
                  <qt.icon className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate group-hover:text-foreground transition-colors">
                    {qt.label}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
