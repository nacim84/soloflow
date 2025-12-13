"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Sparkles,
} from "lucide-react";
import { sendVerificationEmail } from "@/lib/auth-client";
import { z } from "zod";

const resendEmailSchema = z.object({
  email: z.string().email("Email invalide").toLowerCase().trim(),
});

type ResendEmailFormData = z.infer<typeof resendEmailSchema>;

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [isVerifying, setIsVerifying] = useState(true);
  const [isResending, setIsResending] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    "verifying" | "success" | "error"
  >("verifying");
  const [error, setError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResendEmailFormData>({
    resolver: zodResolver(resendEmailSchema),
  });

  // Verify token on mount
  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setVerificationStatus("error");
        setError("Token de vérification manquant");
        setIsVerifying(false);
        return;
      }

      try {
        // Call Better Auth verification endpoint
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (response.ok) {
          setVerificationStatus("success");
        } else {
          setVerificationStatus("error");
          setError("Le lien de vérification est invalide ou a expiré");
        }
      } catch {
        setVerificationStatus("error");
        setError("Erreur lors de la vérification. Veuillez réessayer.");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [token]);

  // Countdown redirect on success
  useEffect(() => {
    if (verificationStatus === "success" && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (verificationStatus === "success" && countdown === 0) {
      router.push("/keys");
    }
  }, [verificationStatus, countdown, router]);

  const onResendSubmit = async (data: ResendEmailFormData) => {
    setIsResending(true);
    setError(null);

    try {
      await sendVerificationEmail({
        email: data.email,
      });
      setResendSuccess(true);
      setIsResending(false);
    } catch {
      setError("Échec de l'envoi de l'email. Veuillez réessayer.");
      setIsResending(false);
    }
  };

  // Verifying state
  if (isVerifying) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              Verifying your email...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (verificationStatus === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/20">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Email verified!
            </CardTitle>
            <CardDescription>
              Your account has been successfully verified
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
              <Sparkles className="h-4 w-4" />
              <AlertDescription>
                Redirecting to keys in <strong>{countdown}</strong> seconds...
              </AlertDescription>
            </Alert>

            <Button className="w-full" size="lg" asChild>
              <Link href="/keys">Continue to keys</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state (with resend option)
  if (resendSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Verification email sent
            </CardTitle>
            <CardDescription>
              Please check your inbox and click the verification link
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/login">Back to login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Verification failed
          </CardTitle>
          <CardDescription>
            This verification link is invalid or has expired
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground text-center">
              Enter your email to receive a new verification link
            </p>
          </div>

          <form onSubmit={handleSubmit(onResendSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                autoFocus
                disabled={isResending}
                {...register("email")}
                aria-invalid={errors.email ? "true" : "false"}
              />
              {errors.email && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isResending}
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending verification email...
                </>
              ) : (
                "Resend verification email"
              )}
            </Button>
          </form>

          <Button variant="outline" className="w-full" asChild>
            <Link href="/login">Back to login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
