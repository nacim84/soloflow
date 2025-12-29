import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
// N'oublie pas d'importer tes templates !
import { VerificationEmail } from "@/emails/verification";
import { ResetPasswordEmail } from "@/emails/reset-password";
// Importe tes types
import type { EmailJob } from "@/lib/queue";

export async function POST(req: NextRequest) {
  try {
    // 1. SÉCURITÉ : Vérifier que l'appel est autorisé
    // (Par exemple, un secret partagé dans tes variables d'environnement)
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. VALIDATION : Vérifier le body
    const job: EmailJob = await req.json();

    if (!job.to || !job.url || !job.type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    let emailTemplate;
    let subject;

    // 3. LOGIQUE STRICTE : Éviter les comportements par défaut dangereux
    switch (job.type) {
      case "verification":
        subject = "Verify your email address";
        emailTemplate = <VerificationEmail url={job.url} />;
        break;
      case "reset-password": // Assure-toi que ton type correspond ici
        subject = "Reset your password";
        emailTemplate = <ResetPasswordEmail url={job.url} />;
        break;
      default:
        return NextResponse.json(
          { error: "Invalid email type" },
          { status: 400 },
        );
    }

    try {
      await sendEmail({
        to: job.to,
        subject,
        react: emailTemplate,
      });
    } catch (error) {
      console.error("Email sending failed:", error);
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email job failed:", error);
    return NextResponse.json(
      { error: "Email sending failed" },
      { status: 500 },
    );
  }
}
