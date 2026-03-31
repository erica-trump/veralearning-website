import type { Metadata } from "next";
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
  return <CredentialPage data={data} />;
}
