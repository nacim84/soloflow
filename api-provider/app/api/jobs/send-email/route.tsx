import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { VerificationEmail } from "@/emails/verification";
import { ResetPasswordEmail } from "@/emails/reset-password";
import ContactNotificationEmail from "@/emails/contact-notification";
import type { EmailJob } from "@/lib/queue";

export async function POST(req: NextRequest) {
  try {
    // 1. SÉCURITÉ : Vérifier que l'appel est autorisé
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. VALIDATION : Vérifier le body
    const job: EmailJob = await req.json();

    if (!job.to || !job.type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    let emailTemplate;
    let subject;
    let replyTo: string | undefined;

    // 3. LOGIQUE STRICTE : Gérer tous les types d'emails
    switch (job.type) {
      case "verification":
        subject = "Verify your email address";
        emailTemplate = <VerificationEmail url={job.url} />;
        break;
      case "reset-password":
        subject = "Reset your password";
        emailTemplate = <ResetPasswordEmail url={job.url} />;
        break;
      case "contact":
        subject = `[${job.subject.toUpperCase()}] New message from ${job.name}`;
        emailTemplate = <ContactNotificationEmail data={{
          name: job.name,
          email: job.email,
          subject: job.subject,
          message: job.message,
        }} />;
        replyTo = job.replyTo;
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
        ...(replyTo && { replyTo }),
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
