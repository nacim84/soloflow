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
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to,
      subject,
      react,
    });

    if (error) {
      console.error('Email send failed:', error);
      throw new Error('Failed to send email');
    }

    return data;
  } catch (error) {
    console.error('Email service error:', error);
    throw error;
  }
}
