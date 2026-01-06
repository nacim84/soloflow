import { Resend } from 'resend';
import type React from 'react';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendEmailOptions {
  to: string;
  subject: string;
  react: React.ReactElement;
}

export async function sendEmail({ to, subject, react }: SendEmailOptions) {
  try {
    console.log(`[Email Service] Sending email to: ${to}`);
    console.log(`[Email Service] Subject: ${subject}`);

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to,
      subject,
      react,
    });

    if (error) {
      console.error('[Email Service] Resend Error:', error);
      throw new Error('Failed to send email');
    }

    console.log('[Email Service] Email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('[Email Service] Unexpected Error:', error);
    throw error;
  }
}
