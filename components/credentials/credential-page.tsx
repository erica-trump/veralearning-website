import Image from "next/image";
import Link from "next/link";
import { RecipientGate } from "@/components/credentials/recipient-gate";
import {
  OpenVerificationDetailsButton,
  VerificationDetailsModal,
} from "@/components/credentials/verification-details-modal";
import type { CredentialPageData, ReadyCredentialPageData } from "@/lib/credentials";

function ErrorCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-[720px] px-5 pb-20 pt-8">
      <div className="rounded-[20px] border border-[#E2E0DB] bg-white p-8 text-center shadow-[0_2px_8px_rgba(0,0,0,0.08),0_12px_32px_rgba(0,0,0,0.06)]">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FDF6E8] text-[#B8933A]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1 className="text-[24px] font-semibold text-[#0D2B45]">{title}</h1>
        <p className="mx-auto mt-2 max-w-[480px] text-[14px] leading-6 text-[#6B7F8E]">
          {description}
        </p>
      </div>
    </div>
  );
}

function ReadyCredentialPage({ data }: { data: ReadyCredentialPageData }) {
  const authEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  return (
    <div className="mx-auto max-w-[720px] px-5 pb-20 pt-8">
      <div className="credential-enter overflow-hidden rounded-[20px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08),0_12px_32px_rgba(0,0,0,0.06)]">
        <div className="border-b border-[#EAE6DE] bg-white px-7 pb-10 pt-9 text-center">
          <div className="credential-enter relative text-[11px] font-semibold uppercase tracking-[0.14em] text-[#3D8F8F] [animation-delay:40ms]">
            Verifiable Credential
          </div>

          <div className="credential-badge-enter relative mt-5 flex justify-center [animation-delay:100ms]">
            <Image
              src={data.badgeImageDataUrl}
              alt={`${data.title} credential badge`}
              width={197}
              height={197}
              unoptimized
              className="h-[12.25rem] w-[12.25rem] object-contain"
            />
          </div>

          <h1 className="credential-enter relative mt-7 font-[family:var(--font-credential-serif)] text-[30px] leading-[1.08] text-[#0D2B45] [animation-delay:160ms] md:text-[36px]">
            {data.title}
          </h1>

          <div className="credential-enter relative mt-5 flex flex-wrap items-center justify-center gap-2.5 [animation-delay:220ms]">
            <div className="credential-chip inline-flex items-center gap-1.5 rounded-full border border-[#2D7A4F]/20 bg-[#EBF5EF] px-3.5 py-1.5 text-[12px] font-semibold uppercase tracking-[0.04em] text-[#2D7A4F]">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Pass
            </div>

            {data.skills.length > 0 && (
              <div className="credential-chip inline-flex rounded-full border border-[#D7D4CD] bg-white px-3.5 py-1.5 text-[12px] font-semibold uppercase tracking-[0.04em] text-[#31485C]">
                {data.skills.length}/{data.skills.length} Skills Verified
              </div>
            )}

            <div className="credential-chip inline-flex rounded-full border border-[#CFE1E1] bg-[#F6FBFB] px-3.5 py-1.5 text-[12px] font-medium tracking-[0.02em] text-[#31485C]">
              {data.issueDateLabel}
            </div>
          </div>

          <div className="credential-enter relative mt-4 flex items-center justify-center [animation-delay:300ms]">
            <VerificationDetailsModal
              pageId={data.id}
              credentialId={data.credentialId}
              issuerName={data.issuerName}
              proofLabel={data.proofLabel}
              proofTags={data.proofTags}
              issueDateLabel={data.issueDateLabel}
              validUntilLabel={data.validUntilLabel}
            />
          </div>
        </div>

        <div className="credential-enter px-7 py-6 [animation-delay:340ms]">
          <div className="credential-card mb-7 flex items-center gap-3 rounded-[14px] bg-[#FCFBF9] px-5 py-4 shadow-[0_8px_24px_rgba(13,43,69,0.04)]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#3D8F8F]/20 bg-[linear-gradient(135deg,#EBF5F5,#D0EBEB)] text-[15px] font-semibold text-[#2E7070]">
              {data.recipientInitials}
            </div>
            <div>
              <div className="mb-1 text-[10px] font-medium uppercase tracking-[0.1em] text-[#8A98A3]">
                Awarded to
              </div>
              <div className="text-[16px] font-semibold text-[#0D2B45]">
                {data.recipientLabel === "Public credential"
                  ? "Verified Recipient (Public)"
                  : data.recipientLabel}
              </div>
            </div>
          </div>

          {data.skills.length > 0 && (
            <>
              <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7A8A96]">
                Demonstrated Skills
              </div>

              <div>
                {data.skills.map((skill) => (
                  <div
                    key={skill}
                    className="flex items-center gap-2.5 border-b border-[#E2E0DB]/40 py-2.5 text-[14px] text-[#3D5166] last:border-b-0"
                  >
                    <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border border-[#2D7A4F]/30 bg-[#EBF5EF]">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#2D7A4F" strokeWidth="3">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </div>
                    {skill}
                  </div>
                ))}
              </div>
            </>
          )}

          <div className={data.skills.length > 0 ? "mt-8" : ""}>
            <RecipientGate
              title={data.title}
              issuerName={data.issuerName}
              issueYear={data.issueYear}
              issueMonth={data.issueMonth}
              canonicalUrl={data.canonicalUrl}
              badgeUrl={data.badgeUrl}
              evidenceUrl={data.evidenceUrl}
              linkedInUrl={data.linkedInUrl}
              learnerEmail={data.recipientEmail}
              credentialRecipientEmail={data.credentialRecipientEmail}
              score={data.score}
              summary={data.assessmentSummary}
              authEnabled={authEnabled}
            />
          </div>
        </div>
      </div>

      <div className="credential-card credential-enter mt-5 rounded-[22px] bg-[#FDFCF9] p-6 shadow-[0_10px_26px_rgba(13,43,69,0.05)] [animation-delay:380ms]">
        <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7A8A96]">
          Credential Details
        </div>

        <div className="space-y-0">
          <div className="flex items-start justify-between gap-3 border-b border-[#E2E0DB]/28 py-3.5 first:pt-0 last:border-b-0">
            <div className="text-[13px] text-[#7A8A96]">Credential ID</div>
            <div className="rounded-[8px] bg-white px-2.5 py-1.5 font-mono text-[11px] text-[#3D8F8F] shadow-[inset_0_0_0_1px_rgba(61,143,143,0.12)]">
              {data.id}
            </div>
          </div>
          <div className="flex items-start justify-between gap-3 border-b border-[#E2E0DB]/28 py-3.5">
            <div className="text-[13px] text-[#7A8A96]">Issuer</div>
            <div className="text-right text-[13px] font-medium text-[#3D5166]">
              {data.issuerName}
            </div>
          </div>
          <div className="flex items-start justify-between gap-3 border-b border-[#E2E0DB]/28 py-3.5">
            <div className="text-[13px] text-[#7A8A96]">Standard</div>
            <div className="text-right text-[13px] font-medium text-[#3D5166]">
              Open Badges 3.0
            </div>
          </div>
          <div className="flex items-start justify-between gap-3 border-b border-[#E2E0DB]/28 py-3.5">
            <div className="text-[13px] text-[#7A8A96]">Proof</div>
            <div className="text-right text-[13px] font-medium text-[#3D5166]">
              {data.proofLabel}
            </div>
          </div>
          <div className="flex items-start justify-between gap-3 border-b border-[#E2E0DB]/28 py-3.5">
            <div className="text-[13px] text-[#7A8A96]">Issued</div>
            <div className="text-right text-[13px] font-medium text-[#3D5166]">
              {data.issueDateLabel}
            </div>
          </div>
          <div className="flex items-start justify-between gap-3 border-b border-[#E2E0DB]/28 py-3.5">
            <div className="text-[13px] text-[#7A8A96]">Valid Until</div>
            <div className="text-right text-[13px] font-medium text-[#3D5166]">
              {data.validUntilLabel ?? "Not specified"}
            </div>
          </div>
          <div className="flex items-start justify-between gap-3 pt-3.5">
            <div className="text-[13px] text-[#7A8A96]">Evidence</div>
            <div className="text-right text-[13px] font-medium text-[#3D5166]">
              <Link href={data.evidenceUrl} className="credential-link text-[#3D8F8F]">
                View Report →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div
        id="credential-verification"
        className="credential-card credential-enter mt-6 rounded-[22px] bg-[#FCFBF8] p-5 shadow-[0_10px_24px_rgba(13,43,69,0.05)] [animation-delay:460ms]"
      >
        <div className="mb-4 text-[10px] font-medium uppercase tracking-[0.12em] text-[#90A0AA]">
          Proof of authenticity
        </div>

        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-white text-[#3D8F8F] shadow-[inset_0_0_0_1px_rgba(61,143,143,0.12)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>

          <div>
            <div className="text-[14px] font-semibold text-[#0D2B45]">
              Signed by {data.issuerName}
            </div>
            <div className="mt-1 text-[13px] leading-5 text-[#6C7E89]">
              This credential is cryptographically signed by {data.issuerName}.
            </div>
            <div className="mt-2 text-[12px] leading-5 text-[#8B99A3]">
              The embedded proof allows anyone to independently verify its authenticity.
            </div>
            <div className="mt-3">
              <OpenVerificationDetailsButton
                label="Check verification"
                className="credential-link text-[12px] font-medium text-[#2E7070]"
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {data.proofTags.map((tag) => (
                <span
                  key={tag}
                  className="credential-chip rounded-full bg-[#F6FBFB] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.04em] text-[#2E7070] shadow-[inset_0_0_0_1px_rgba(61,143,143,0.1)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CredentialPage({ data }: { data: CredentialPageData }) {
  switch (data.status) {
    case "badge-error":
      return (
        <ErrorCard
          title="Badge unavailable"
          description="We couldn't fetch the badge image for this credential right now. Please try again in a moment."
        />
      );

    case "credential-unavailable":
      return (
        <ErrorCard
          title="Credential unavailable"
          description="The badge loaded, but the embedded credential metadata could not be read from the PNG."
        />
      );

    case "ready":
      return <ReadyCredentialPage data={data} />;
  }
}
