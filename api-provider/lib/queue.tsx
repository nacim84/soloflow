import { Client } from '@upstash/qstash';
import { sendEmail } from "@/lib/email";
import { VerificationEmail } from "@/emails/verification";
import { ResetPasswordEmail } from "@/emails/reset-password";
import * as React from "react";

// En dev, si QSTASH_TOKEN n'est pas défini, créer un client no-op
let qstash: Client | null = null;
if (process.env.QSTASH_TOKEN) {
  qstash = new Client({
    token: process.env.QSTASH_TOKEN,
  });
}

export interface EmailJob {
  type: 'verification' | 'reset-password';
  to: string;
  url: string;
  token: string;
}

export async function queueEmail(job: EmailJob) {
  // En développement sans QStash, envoyer directement l'email
  if (!qstash) {
    console.log('📧 Dev mode: Sending email directly (bypassing QStash):', {
      type: job.type,
      to: job.to,
    });

    let emailTemplate;
    let subject;

    switch (job.type) {
      case "verification":
        subject = "Verify your email address";
        emailTemplate = <VerificationEmail url={job.url} />;
        break;
      case "reset-password":
        subject = "Reset your password";
        emailTemplate = <ResetPasswordEmail url={job.url} />;
        break;
      default:
        console.error("Invalid email type:", job.type);
        return;
    }

    try {
      await sendEmail({
        to: job.to,
        subject,
        react: emailTemplate,
      });
      console.log('✅ Email sent successfully in dev mode');
    } catch (error) {
      console.error('❌ Failed to send email in dev mode:', error);
    }
    return;
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  try {
    await qstash.publishJSON({
      url: `${baseUrl}/api/jobs/send-email`,
      body: job,
    });
  } catch (error) {
    console.error('Error queueing email:', error);
    // Log mais ne pas lever l'erreur en dev
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Email queue failed in dev mode, continuing anyway');
      return;
    }
    throw error;
  }
}