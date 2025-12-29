import { createAuthClient } from "better-auth/react";

export const {
  signIn,
  signOut,
  signUp,
  useSession,
  resetPassword,
  sendVerificationEmail,
} = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
});
