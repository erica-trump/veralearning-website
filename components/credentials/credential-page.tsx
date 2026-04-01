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
  const issuerLogoSrc =
    data.displayIssuerLogoUrl ??
    (data.displayIssuerName === "VeraLearning" ? "/logo-vera-circle.svg" : null);

  return (
    <div className="mx-auto max-w-[720px] px-5 pb-20 pt-8">
      <div className="credential-enter overflow-hidden rounded-[20px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08),0_12px_32px_rgba(0,0,0,0.06)]">
        <div className="bg-white pb-12 pt-9 text-center">
          <div className="mx-7 rounded-[16px] bg-[#F3F6F7] px-6 pb-8 pt-4">
            <div className="credential-enter relative text-center [animation-delay:40ms]">
              <div className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#7B8C97]">
                Issued to
              </div>
              <div className="mt-1.5 font-[family:var(--font-credential-serif)] text-[24px] font-bold text-[#1F2D3D]">
                {data.recipientLabel === "Public credential"
                  ? "Verified Recipient (Public)"
                  : data.recipientLabel}
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[14px] text-[#71818C]">
                <span>{`Issued ${data.issueDateLabel}`}</span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1">
                  <span>Issued by</span>
                {issuerLogoSrc ? (
                  <Image
                    src={issuerLogoSrc}
                    alt=""
                    width={16}
                    height={16}
                    unoptimized
                    className="translate-y-px h-4 w-4 self-center object-contain"
                  />
                ) : null}
                  <span className="font-medium text-[#5C6F7D]">{data.displayIssuerName}</span>
                </span>
              </div>
              <div className="mx-auto mt-5 h-px w-3/5 bg-[#E6ECEF]" />
            </div>

            <div className="credential-badge-enter relative mt-9 flex justify-center [animation-delay:100ms]">
              <Image
                src={data.badgeImageSrc}
                alt={`${data.title} credential badge`}
                width={200}
                height={200}
                unoptimized
                className="h-[12.5rem] w-[12.5rem] object-contain"
              />
            </div>

            <h1 className="credential-enter relative mt-4 font-[family:var(--font-credential-serif)] text-[24px] font-semibold leading-[1.08] tracking-[-0.012em] text-[#0A2339] [animation-delay:160ms] md:text-[24px]">
              {data.title}
            </h1>

            <div className="credential-enter relative mt-2 flex items-center justify-center [animation-delay:300ms]">
              <VerificationDetailsModal
                pageId={data.id}
                credentialId={data.credentialId}
                credentialTitle={data.title}
                recipientName={
                  data.recipientLabel === "Public credential"
                    ? "Verified Recipient"
                    : data.recipientLabel
                }
                issuerName={data.issuerName}
                proofLabel={data.proofLabel}
                proofTags={data.proofTags}
                issueDateLabel={data.issueDateLabel}
                validUntilLabel={data.validUntilLabel}
              />
            </div>
          </div>

        </div>

        <div className="credential-enter px-7 py-6 [animation-delay:340ms]">
          {data.assessmentSummary ? (
            <div className="mb-8">
              <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7A8A96]">
                Credential Overview
              </div>
              <div className="text-[15px] leading-7 text-[#4B6072]">
                {data.assessmentSummary}
              </div>
            </div>
          ) : null}

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
              validUntilYear={data.validUntilYear}
              validUntilMonth={data.validUntilMonth}
              canonicalUrl={data.canonicalUrl}
              badgeUrl={data.badgeUrl}
              evidenceUrl={data.evidenceUrl}
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
        </div>
      </div>

      <div
        id="credential-verification"
        className="credential-card credential-enter mt-6 rounded-[22px] bg-[#FCFBF8] p-5 shadow-[0_10px_24px_rgba(13,43,69,0.05)] [animation-delay:460ms]"
      >
        <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7A8A96]">
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
              This credential is{" "}
              <OpenVerificationDetailsButton
                label="cryptographically signed"
                className="inline-flex text-[13px] font-medium text-[#2E7070]"
              />
              {" "}by {data.issuerName} and can be independently verified.
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

export function CredentialPage({
  data,
}: {
  data: CredentialPageData;
}) {
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
