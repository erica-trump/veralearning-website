import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildCanonicalCredentialUrl, isUuid } from "@/lib/credentials";
import { EvidenceAccessState } from "@/components/credentials/evidence-access-state";
import { getIssuedCredentialRow } from "@/lib/neon";
import { anyEmailMatches } from "@/lib/recipient";

interface EvidencePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CredentialEvidencePage({
  params,
}: EvidencePageProps) {
  const { id } = await params;

  if (!isUuid(id)) {
    notFound();
  }

  const credentialUrl = buildCanonicalCredentialUrl(id);
  const authEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  if (!authEnabled) {
    return (
      <EvidenceAccessState
        canonicalUrl={credentialUrl}
        title="Sign in to view your evidence report"
        description="Recipient-only evidence access is enabled through Clerk. Configure Clerk keys to unlock this report."
        authEnabled={false}
      />
    );
  }

  const issuedCredential = await getIssuedCredentialRow(`urn:uuid:${id}`);
  const learnerEmail = issuedCredential?.learner_email ?? null;

  if (!learnerEmail) {
    return (
      <EvidenceAccessState
        canonicalUrl={credentialUrl}
        title="Evidence report unavailable"
        description="This credential does not currently have recipient data available for evidence access verification."
        authEnabled={false}
        actionLabel="Evidence unavailable"
      />
    );
  }

  const { userId } = await auth();

  if (!userId) {
    return (
      <EvidenceAccessState
        canonicalUrl={credentialUrl}
        title="Sign in to view your evidence report"
        description="This report is only available to the email this credential was issued to."
        authEnabled
      />
    );
  }

  const user = await currentUser();
  const signedInEmails = user?.emailAddresses.map((email) => email.emailAddress) ?? [];
  const isVerifiedRecipient = anyEmailMatches(signedInEmails, learnerEmail);

  if (!isVerifiedRecipient) {
    return (
      <div className="mx-auto max-w-[720px] px-5 pb-20 pt-8">
        <div className="rounded-[20px] bg-white p-8 text-center shadow-[0_2px_8px_rgba(0,0,0,0.08),0_12px_32px_rgba(0,0,0,0.06)]">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7A8A96]">
            Evidence Report
          </div>
          <h1 className="font-[family:var(--font-credential-serif)] text-[30px] leading-tight text-[#0D2B45]">
            Access denied
          </h1>
          <p className="mx-auto mt-3 max-w-[520px] text-[14px] leading-6 text-[#6B7F8E]">
            This report is only available to the email this credential was issued to.
          </p>
          <Link
            href={credentialUrl}
            className="mt-6 inline-flex rounded-[10px] bg-[#0D2B45] px-5 py-3 text-[14px] font-semibold text-white"
          >
            Back to credential
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[720px] px-5 pb-20 pt-8">
      <div className="rounded-[20px] bg-white p-8 shadow-[0_2px_8px_rgba(0,0,0,0.08),0_12px_32px_rgba(0,0,0,0.06)]">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7A8A96]">
          Evidence Report
        </div>
        <h1 className="font-[family:var(--font-credential-serif)] text-[30px] leading-tight text-[#0D2B45]">
          Evidence report coming soon
        </h1>
        <p className="mt-3 text-[14px] leading-6 text-[#6B7F8E]">
          This route is in place so the recipient page can link to a stable evidence URL now.
          The detailed evidence report will be added in a follow-up.
        </p>
        <Link
          href={credentialUrl}
          className="mt-6 inline-flex rounded-[10px] bg-[#0D2B45] px-5 py-3 text-[14px] font-semibold text-white"
        >
          Back to credential
        </Link>
      </div>
    </div>
  );
}
