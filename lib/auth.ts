import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  // @ts-ignore — PrismaAdapter type mismatch between next-auth versions
  adapter: PrismaAdapter(db),

  providers: [
    // ── Google OAuth ─────────────────────────────────────────
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "CLIENTE" as const,
        };
      },
    }),

    // ── Email + Senha ─────────────────────────────────────────
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "E-mail", type: "email" },
        password: { label: "Senha",  type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) return null;

        return {
          id:    user.id,
          name:  user.name,
          email: user.email,
          image: user.image,
          role:  user.role,
        };
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    // Injeta `role` e `petShopId` no token JWT
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id   = user.id;
      }

      // Busca petShopId se for DONO (apenas uma vez por sessão)
      if (token.role === "DONO" && !token.petShopId) {
        const petShop = await db.petShop.findUnique({
          where: { ownerId: token.id as string },
          select: { id: true },
        });
        token.petShopId = petShop?.id ?? null;
      }

      return token;
    },

    // Expõe `role` e `petShopId` no objeto `session` do cliente
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id         = token.id;
        (session.user as any).role       = token.role;
        (session.user as any).petShopId  = token.petShopId ?? null;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error:  "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
