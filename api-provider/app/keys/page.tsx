import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { KeysClient } from "./keys-client";
import { getOrgApiKeys } from "@/app/actions/api-key-actions";
import { createDefaultOrganisation } from "@/app/actions/organisation-actions";
import { db } from "@/drizzle/db";
import { organisationMembers, organisations } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Keys - Key Ops",
  description: "Gérez vos clés API pour votre organisation",
};

export default async function KeysPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/login");
  }

  // Await searchParams
  const params = await searchParams;

  // Fetch the user's first organization
  let orgMembership = await db.query.organisationMembers.findFirst({
    where: eq(organisationMembers.userId, session.user.id),
    with: {
      organisation: true,
    },
  });

  // Auto-create organization if user doesn't have one (OAuth or first login)
  if (!orgMembership) {
    console.log(`[AUTO-ORG] Creating default organization for user ${session.user.email}`);
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
          <p className="text-sm text-muted-foreground mt-2">Veuillez contacter le support.</p>
        </div>
      );
    }
  }

  // This should never happen after auto-creation, but safety check
  if (!orgMembership) {
    return (
      <div className="container mx-auto py-8">
        <p>Impossible de charger votre organisation.</p>
      </div>
    );
  }

  const { organisation } = orgMembership;

  const keysResult = await getOrgApiKeys(organisation.id);

  if (!keysResult.success) {
    // Handle error case
    return (
      <div className="container mx-auto py-8">
        <p>Erreur lors de la récupération des clés API.</p>
        <p className="text-red-500">{keysResult.error}</p>
      </div>
    );
  }

  if (!keysResult.data) {
    return (
      <div className="container mx-auto py-8">
        <p>Aucune donnée disponible.</p>
      </div>
    );
  }

  return (
    <KeysClient
      initialKeys={keysResult.data}
      orgId={organisation.id}
      orgName={organisation.name}
      purchaseSuccess={params.success === "true"}
    />
  );
}
