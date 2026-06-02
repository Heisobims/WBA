import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from "@/lib/auth.config";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await db.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            role: true,
            status: true,
            image: true,
            emailVerified: true,
            xpPoints: true,
            level: true,
          },
        });

        if (!user || !user.password) return null;
        if (user.status === "SUSPENDED") throw new Error("Account suspended");

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          status: user.status,
          xpPoints: user.xpPoints,
          level: user.level,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "github") {
        if (user.email) {
          // updateMany is safe here — runs after adapter creates the user,
          // and only patches rows where emailVerified is still null
          await db.user.updateMany({
            where: { email: user.email, emailVerified: null },
            data: { emailVerified: new Date(), status: "ACTIVE" },
          }).catch(() => {});
        }
      }
      return true;
    },
  },
  events: {
    async signIn({ user }) {
      if (user.id) {
        await db.user.update({
          where: { id: user.id },
          data: { lastActiveAt: new Date() },
        }).catch(() => {});

        await db.auditLog.create({
          data: {
            userId: user.id,
            action: "LOGIN",
            resource: "user",
            resourceId: user.id,
          },
        }).catch(() => {});
      }
    },
    async signOut(params) {
      const token = (params as any).token;
      if (token?.id) {
        await db.auditLog.create({
          data: {
            userId: token.id as string,
            action: "LOGOUT",
            resource: "user",
            resourceId: token.id as string,
          },
        }).catch(() => {});
      }
    },
  },
});
