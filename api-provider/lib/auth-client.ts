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

// Force export forgetPassword avoiding TS inference issues
export const forgetPassword = authClient.forgetPassword;