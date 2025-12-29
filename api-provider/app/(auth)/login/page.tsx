"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Github, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { signIn } from "@/lib/auth-client";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get("error");
  const redirect = searchParams.get("redirect") || "/keys";

  const [isLoading, setIsLoading] = useState<
    "google" | "github" | "email" | null
  >(null);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const handleOAuth = async (provider: "google" | "github") => {
    setIsLoading(provider);
    setAuthError(null);
    try {
      await signIn.social({
        provider,
        callbackURL: redirect,
      });
    } catch {
      setIsLoading(null);
      setAuthError("Échec de l'authentification. Veuillez réessayer.");
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading("email");
    setAuthError(null);

    try {
      const result = await signIn.email({
        email: data.email,
        password: data.password,
        callbackURL: redirect,
      });

      if (result.error) {
        setAuthError(result.error.message || "Email ou password incorrect");
        setIsLoading(null);
      } else {
        router.push(redirect);
      }
    } catch {
      setAuthError("Une erreur est survenue. Veuillez réessayer.");
      setIsLoading(null);
    }
  };

  return (
    <div className="flex flex-col space-y-2 text-center">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
        Welcome back
      </h1>
      <p className="text-sm text-muted-foreground">
        Enter your email to sign in to your account
      </p>

      <div className="grid gap-6 pt-6 text-left">
        {(error === "oauth_failed" || authError) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {authError || "Authentication failed. Please try again."}
            </AlertDescription>
          </Alert>
        )}

        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            disabled={isLoading !== null}
            onClick={() => handleOAuth("google")}
            className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 h-11"
          >
            {isLoading === "google" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
              </svg>
            )}
            Google
          </Button>

          <Button
            variant="outline"
            disabled={isLoading !== null}
            onClick={() => handleOAuth("github")}
            className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 h-11"
          >
            {isLoading === "github" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Github className="mr-2 h-4 w-4" />
            )}
            Github
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              disabled={isLoading !== null}
              className="h-11 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800"
              {...register("email")}
              aria-invalid={errors.email ? "true" : "false"}
            />
            {errors.email && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={isLoading !== null}
                className="h-11 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 pr-10"
                {...register("password")}
                aria-invalid={errors.password ? "true" : "false"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-all font-semibold"
            disabled={isLoading !== null}
          >
            {isLoading === "email" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In with Email"
            )}
          </Button>
        </form>
      </div>

      <p className="px-8 text-center text-sm text-muted-foreground mt-6">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="underline underline-offset-4 hover:text-primary font-medium text-zinc-900 dark:text-white"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}