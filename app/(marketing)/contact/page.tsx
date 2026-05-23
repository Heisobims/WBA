"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MessageSquare, Zap, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactInput) => {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      toast.error("Failed to send message. Please try again.");
      return;
    }
    setSubmitted(true);
    reset();
    toast.success("Message sent! We'll get back to you within 24 hours.");
  };

  return (
    <main className="pt-24 pb-32">
      <div className="container max-w-5xl">
        <div className="text-center mb-16">
          <Badge variant="gradient" className="mb-4">Contact</Badge>
          <h1 className="text-5xl font-bold tracking-tight mb-4">Get in touch</h1>
          <p className="text-xl text-muted-foreground">
            Have questions? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-12">
          {/* Contact info */}
          <div className="md:col-span-2 space-y-6">
            {[
              {
                icon: Mail,
                title: "Email us",
                value: "hello@wbacademy.com",
                desc: "We respond within 24 hours",
              },
              {
                icon: MessageSquare,
                title: "Live chat",
                value: "Available in-app",
                desc: "Mon–Fri, 9am–6pm UTC",
              },
              {
                icon: Zap,
                title: "Enterprise sales",
                value: "hello@wbacademy.com",
                desc: "For teams of 20+",
              },
            ].map((item) => (
              <Card key={item.title} variant="default">
                <CardContent className="p-4 flex gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{item.title}</p>
                    <p className="text-sm text-primary">{item.value}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Form */}
          <div className="md:col-span-3">
            {submitted ? (
              <Card variant="default" className="text-center p-12">
                <CardContent className="p-0">
                  <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Message sent!</h3>
                  <p className="text-muted-foreground mb-6">
                    We&apos;ll get back to you at your email within 24 hours.
                  </p>
                  <Button onClick={() => setSubmitted(false)} variant="outline">
                    Send another message
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card variant="default">
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Name</label>
                        <Input
                          {...register("name")}
                          placeholder="Your name"
                          error={errors.name?.message}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Email</label>
                        <Input
                          {...register("email")}
                          type="email"
                          placeholder="you@company.com"
                          error={errors.email?.message}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Subject</label>
                      <Input
                        {...register("subject")}
                        placeholder="How can we help?"
                        error={errors.subject?.message}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Message</label>
                      <Textarea
                        {...register("message")}
                        placeholder="Tell us more..."
                        rows={6}
                        error={errors.message?.message}
                      />
                    </div>
                    <Button
                      type="submit"
                      variant="gradient"
                      className="w-full"
                      loading={isSubmitting}
                    >
                      Send message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
