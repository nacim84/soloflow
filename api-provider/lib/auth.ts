import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import * as schema from "@/drizzle/schema";
import { queueEmail } from "./queue";
import { eq, and, ne } from "drizzle-orm";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
    schema: {
      ...schema,
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),

  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github"],
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 jours
    updateAge: 60 * 60 * 24, // Refresh si > 24h
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 min cache
    },
  },

  // Email/Password Authentication
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
    // En dev: pas de vérification email requise, auto sign-in
    // En prod: vérification email requise
    requireEmailVerification: process.env.NODE_ENV === "production",
    autoSignIn: process.env.NODE_ENV === "development",

    sendVerificationEmail: async ({ user, url, token }) => {
      // Queue email de vérification
      try {
        await queueEmail({
          type: "verification",
          to: user.email,
          url,
          token,
        });
      } catch (error) {
        console.error("Failed to queue verification email:", error);
        // En dev, continuer quand même
        if (process.env.NODE_ENV !== "development") {
          throw error;
        }
      }
    },

    sendResetPassword: async ({ user, url, token }) => {
      // Revoke ALL old reset tokens (critical security)
      await db
        .delete(schema.verifications)
        .where(
          and(
            eq(schema.verifications.identifier, user.email),
            ne(schema.verifications.value, token),
          ),
        );

      // Queue email
      try {
        await queueEmail({
          type: "reset-password",
          to: user.email,
          url,
          token,
        });
      } catch (error) {
        console.error("Failed to queue reset password email:", error);
        // En dev, continuer quand même
        if (process.env.NODE_ENV !== "development") {
          throw error;
        }
      }
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/google`,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/github`,
    },
  },

  advanced: {
    database: {
      generateId: () => crypto.randomUUID(),
    },
    useSecureCookies: process.env.NODE_ENV === "production",
    cookiePrefix: "api-key-manager",
    crossSubDomainCookies: {
      enabled: false,
    },
  },

  // NOTE: Hooks Better Auth temporairement désactivés (API incompatible v1.4+)
  // La création d'organisation se fait via une action serveur appelée depuis le composant register
  // Voir: app/actions/organisation-actions.ts - createDefaultOrganisation()
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
