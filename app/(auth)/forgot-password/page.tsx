"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { forgotPasswordSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";

type ForgotInput = { email: string };

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotInput) => {
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.email }),
    });
    setSentEmail(data.email);
    setSubmitted(true);
    toast.success("Reset link sent if that email exists.");
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <div className="h-16 w-16 rounded-2xl bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Check your inbox</h2>
        <p className="text-muted-foreground mb-2">
          If <strong>{sentEmail}</strong> has an account, we&apos;ve sent a reset link.
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          The link expires in 1 hour. Check spam if you don&apos;t see it.
        </p>
        <div className="flex flex-col gap-3">
          <Button onClick={() => setSubmitted(false)} variant="outline">
            Try a different email
          </Button>
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground text-center">
            Back to login
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Forgot your password?</h1>
        <p className="text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Email</label>
          <Input
            {...register("email")}
            type="email"
            placeholder="you@company.com"
            leftIcon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
          />
        </div>
        <Button type="submit" variant="gradient" className="w-full" loading={isSubmitting}>
          Send reset link
        </Button>
      </form>

      <Link
        href="/login"
        className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to login
      </Link>
    </motion.div>
  );
}
