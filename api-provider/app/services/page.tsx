import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { ServicesClient } from './services-client';

export const metadata = {
  title: 'Services Supportés - Key API Manager',
  description: 'Découvrez tous les services API que vous pouvez gérer',
};

export default async function ServicesPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect('/login');
  }

  return <ServicesClient user={session.user} />;
}
