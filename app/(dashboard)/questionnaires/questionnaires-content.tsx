"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Plus, Search, Filter, FileQuestion, Play, Edit, BarChart3,
  Clock, Users, Zap, Brain, Star
} from "lucide-react";
import { cn, formatRelative, DIFFICULTY_LABELS, DIFFICULTY_COLORS, STATUS_COLORS } from "@/lib/utils";

interface Questionnaire {
  id: string;
  title: string;
  description: string | null;
  status: string;
  category: string | null;
  difficulty: number;
  estimatedTime: number | null;
  xpReward: number;
  coverImage: string | null;
  updatedAt: Date;
  author: { id: string; name: string | null; image: string | null };
  _count: { responses: number; questions: number };
}

interface QuestionnairesContentProps {
  questionnaires: Questionnaire[];
  total: number;
  page: number;
  limit: number;
  categories: string[];
  userId: string;
}

export function QuestionnairesContent({
  questionnaires,
  total,
  page,
  limit,
  categories,
  userId,
}: QuestionnairesContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");

  const updateSearch = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/questionnaires?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearch("search", searchValue);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Questionnaires</h1>
          <p className="text-muted-foreground text-sm">{total} questionnaires available</p>
        </div>
        <Button variant="gradient" asChild>
          <Link href="/questionnaires/builder">
            <Plus className="h-4 w-4" />
            New questionnaire
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="flex-1 min-w-[200px] max-w-xs">
          <Input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search questionnaires..."
            leftIcon={<Search className="h-4 w-4" />}
          />
        </form>

        <div className="flex gap-2 flex-wrap">
          {["PUBLISHED", "DRAFT", "ARCHIVED"].map((status) => (
            <Button
              key={status}
              variant={searchParams.get("status") === status ? "default" : "outline"}
              size="sm"
              onClick={() =>
                updateSearch("status", searchParams.get("status") === status ? "" : status)
              }
            >
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>

        {categories.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {categories.slice(0, 5).map((cat) => (
              <Button
                key={cat}
                variant={searchParams.get("category") === cat ? "default" : "ghost"}
                size="sm"
                onClick={() =>
                  updateSearch("category", searchParams.get("category") === cat ? "" : cat)
                }
              >
                {cat}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Grid */}
      {questionnaires.length === 0 ? (
        <EmptyState
          icon={FileQuestion}
          title="No questionnaires found"
          description="Try different filters or create a new questionnaire."
          action={{
            label: "Create questionnaire",
            onClick: () => router.push("/questionnaires/builder"),
          }}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {questionnaires.map((q, i) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card variant="default" hover="lift" className="h-full flex flex-col">
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <Badge className={cn("text-xs border", STATUS_COLORS[q.status])}>
                      {q.status}
                    </Badge>
                    {q.difficulty && (
                      <span className={cn("text-xs font-medium", DIFFICULTY_COLORS[q.difficulty])}>
                        {DIFFICULTY_LABELS[q.difficulty]}
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold mb-2 line-clamp-2 flex-1">{q.title}</h3>

                  {q.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {q.description}
                    </p>
                  )}

                  {q.category && (
                    <Badge variant="secondary" className="text-xs w-fit mb-3">
                      {q.category}
                    </Badge>
                  )}

                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <FileQuestion className="h-3 w-3" />
                      {q._count.questions}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {q._count.responses}
                    </span>
                    {q.estimatedTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        ~{q.estimatedTime}m
                      </span>
                    )}
                    <span className="flex items-center gap-1 ml-auto text-violet-400 font-medium">
                      <Zap className="h-3 w-3" />
                      +{q.xpReward} XP
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <div className="flex items-center gap-1.5">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={q.author.image || undefined} />
                        <AvatarFallback name={q.author.name || ""} className="text-[9px]" />
                      </Avatar>
                      <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                        {q.author.name || "Unknown"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {q.author.id === userId && (
                        <Button variant="ghost" size="icon-sm" asChild>
                          <Link href={`/questionnaires/builder/${q.id}`}>
                            <Edit className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      )}
                      <Button variant="ghost" size="icon-sm" asChild>
                        <Link href={`/questionnaires/${q.id}`}>
                          <BarChart3 className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <Button variant="gradient" size="sm" asChild>
                        <Link href={`/questionnaires/play/${q.id}`}>
                          <Play className="h-3.5 w-3.5" />
                          Start
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateSearch("page", String(page - 1))}
            >
              Previous
            </Button>
          )}
          <span className="text-sm text-muted-foreground">
            Page {page} of {Math.ceil(total / limit)}
          </span>
          {page < Math.ceil(total / limit) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateSearch("page", String(page + 1))}
            >
              Next
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
