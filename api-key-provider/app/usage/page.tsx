import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { UsageClient } from './usage-client';
import { db } from "@/drizzle/db";
import { organisationMembers } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { createDefaultOrganisation } from "@/app/actions/organisation-actions";

export const metadata = {
  title: 'Historique d\'Utilisation - Key API Manager',
  description: 'Suivez l\'utilisation de vos clés API et votre consommation de crédits',
};

export default async function UsagePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect('/login');
  }

  // Fetch the user's first organization
  let orgMembership = await db.query.organisationMembers.findFirst({
    where: eq(organisationMembers.userId, session.user.id),
    with: {
      organisation: true,
    },
  });

  // Auto-create organization if user doesn't have one (OAuth or first login)
  if (!orgMembership) {
    const result = await createDefaultOrganisation();

    if (result.success && result.data) {
      // Refetch the organization membership
      orgMembership = await db.query.organisationMembers.findFirst({
        where: eq(organisationMembers.userId, session.user.id),
        with: {
          organisation: true,
        },
      });
    } else {
      // If organization creation failed, show error
      return (
        <div className="container mx-auto py-8">
          <p className="text-red-500">Erreur lors de la création de votre organisation.</p>
        </div>
      );
    }
  }

  if (!orgMembership) {
    return (
      <div className="container mx-auto py-8">
        <p>Impossible de charger votre organisation.</p>
      </div>
    );
  }

  return <UsageClient user={session.user} orgId={orgMembership.organisation.id} />;
}
