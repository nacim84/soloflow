import { Client } from '@upstash/qstash';
import { sendEmail } from "@/lib/email";
import { VerificationEmail } from "@/emails/verification";
import { ResetPasswordEmail } from "@/emails/reset-password";
import ContactNotificationEmail from "@/emails/contact-notification";
import { WelcomeEmail } from "@/emails/welcome";
import * as React from "react";

// En dev, si QSTASH_TOKEN n'est pas défini, créer un client no-op
let qstash: Client | null = null;
if (process.env.QSTASH_TOKEN) {
  qstash = new Client({
    token: process.env.QSTASH_TOKEN,
  });
}

export type EmailJob =
  | {
      type: 'verification';
      to: string;
      url: string;
      token: string;
    }
  | {
      type: 'reset-password';
      to: string;
      url: string;
      token: string;
    }
  | {
      type: 'contact';
      to: string;
      replyTo: string;
      name: string;
      email: string;
      subject: 'bug' | 'feature' | 'improvement' | 'other';
      message: string;
    }
  | {
      type: 'welcome';
      to: string;
      name: string;
      dashboardUrl: string;
    };

export async function queueEmail(job: EmailJob) {
  // En développement sans QStash, envoyer directement l'email
  if (!qstash) {
    console.log('📧 Dev mode: Sending email directly (bypassing QStash):', {
      type: job.type,
      to: job.to,
    });

    let emailTemplate;
    let subject;
    let replyTo: string | undefined;

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
      case "welcome":
        subject = "Welcome to SoloFlow! 🎉";
        emailTemplate = <WelcomeEmail name={job.name} dashboardUrl={job.dashboardUrl} />;
        break;
    }

    try {
      await sendEmail({
        to: job.to,
        subject,
        react: emailTemplate,
        ...(replyTo && { replyTo }),
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
      // Add Authorization header for endpoint security
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET}`,
      },
    });
    console.log('✅ Email queued successfully via QStash');
  } catch (error) {
    console.error('❌ Error queueing email via QStash:', error);
    // Log mais ne pas lever l'erreur en dev
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Email queue failed in dev mode, continuing anyway');
      return;
    }
    throw error;
  }
}