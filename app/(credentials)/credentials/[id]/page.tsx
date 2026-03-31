import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { CredentialPage } from "@/components/credentials/credential-page";
import { getCredentialPageData, isUuid } from "@/lib/credentials";

interface CredentialPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: CredentialPageProps): Promise<Metadata> {
  const { id } = await params;

  if (!isUuid(id)) {
    return {
      title: "Credential Not Found | VeraLearning",
    };
  }

  return {
    title: `Credential ${id} | VeraLearning`,
  };
}

export default async function CredentialRecipientPage({
  params,
}: CredentialPageProps) {
  const { id } = await params;

  if (!isUuid(id)) {
    notFound();
  }

  const data = await getCredentialPageData(id);
  const authEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const user = authEnabled ? await currentUser() : null;
  const initialViewerEmails = user?.emailAddresses.map((email) => email.emailAddress) ?? [];
  const initialSignedIn = Boolean(user);

  return (
    <CredentialPage
      data={data}
      initialSignedIn={initialSignedIn}
      initialViewerEmails={initialViewerEmails}
    />
  );
}
