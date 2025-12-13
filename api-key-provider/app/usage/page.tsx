import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { UsageClient } from './usage-client';

export const metadata = {
  title: 'Historique d\'Utilisation - Key API Manager',
  description: 'Suivez l\'utilisation de vos clés API et votre consommation de crédits',
};

export default async function UsagePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect('/login');
  }

  return <UsageClient user={session.user} />;
}
