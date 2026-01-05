import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
});

export const {
  signIn,
  signOut,
  signUp,
  useSession,
  resetPassword,
  sendVerificationEmail,
} = authClient;

// Better Auth uses requestPasswordReset (not forgetPassword) for email/password auth
export const forgetPassword = authClient.requestPasswordReset;