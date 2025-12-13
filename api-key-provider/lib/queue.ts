import { Client } from '@upstash/qstash';

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
  // En développement sans QStash, simplement logger et retourner
  if (!qstash) {
    console.log('📧 Email would be sent (dev mode, QStash not configured):', {
      type: job.type,
      to: job.to,
      url: job.url,
    });
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
