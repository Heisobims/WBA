import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@prisma/client";

// Edge-safe auth config — no Prisma, no bcrypt
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
    verifyRequest: "/verify",
    newUser: "/onboarding",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: UserRole }).role ?? "USER";
        token.status = (user as { status?: string }).status ?? "ACTIVE";
        token.xpPoints = (user as { xpPoints?: number }).xpPoints ?? 0;
        token.level = (user as { level?: number }).level ?? 1;
      }
      if (trigger === "update" && session) {
        token = { ...token, ...session };
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.xpPoints = (token.xpPoints as number) ?? 0;
        session.user.level = (token.level as number) ?? 1;
      }
      return session;
    },
  },
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      role: UserRole;
      xpPoints: number;
      level: number;
    };
  }
}
