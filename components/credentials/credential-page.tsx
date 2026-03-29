import Image from "next/image";
import Link from "next/link";
import { RecipientGate } from "@/components/credentials/recipient-gate";
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
      <div className="overflow-hidden rounded-[20px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08),0_12px_32px_rgba(0,0,0,0.06)]">
        <div className="relative overflow-hidden bg-[linear-gradient(160deg,#0D2B45_0%,#1A4A6E_100%)] px-7 pb-7 pt-8 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_50%_120%,rgba(61,143,143,0.15)_0%,transparent_70%)]" />
          <div className="relative text-[11px] font-medium uppercase tracking-[0.14em] text-white/50">
            Credential Evaluation Report
          </div>

          <div className="relative mb-3 mt-5 flex justify-center">
            <Image
              src={data.badgeImageDataUrl}
              alt={`${data.title} credential badge`}
              width={160}
              height={160}
              unoptimized
              className="h-40 w-40 animate-[credential-float_4s_ease-in-out_infinite] object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
            />
          </div>

          <div className="relative mb-4 flex items-center justify-center gap-1.5 text-[11px] text-white/35">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            This image contains your embedded verifiable credential
          </div>

          <h1 className="relative font-[family:var(--font-credential-serif)] text-[28px] leading-[1.15] text-white">
            {data.title}
          </h1>
          <p className="relative mt-1 text-[13px] tracking-[0.02em] text-white/50">
            Applied Skills Assessment · {data.issuerName}
          </p>
        </div>

        <div className="flex items-center justify-center gap-1.5 border-b border-[#2D7A4F]/12 bg-[#EBF5EF] px-4 py-2.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2D7A4F" strokeWidth="2.5">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          <span className="text-[12px] font-medium tracking-[0.02em] text-[#2D7A4F]">
            Cryptographically verified · Open Badge 3.0
          </span>
        </div>

        <div className="px-7 py-6">
          <div className="mb-5 flex items-center gap-3 rounded-[12px] border border-[#E2E0DB] bg-[#F7F6F3] px-4 py-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#3D8F8F]/20 bg-[linear-gradient(135deg,#EBF5F5,#D0EBEB)] text-[15px] font-semibold text-[#2E7070]">
              {data.recipientInitials}
            </div>
            <div>
              <div className="mb-0.5 text-[10px] font-medium uppercase tracking-[0.1em] text-[#7A8A96]">
                Awarded to
              </div>
              <div className="text-[16px] font-semibold text-[#0D2B45]">
                {data.recipientLabel}
              </div>
            </div>
          </div>

          <div className="mb-5 flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#2D7A4F]/20 bg-[#EBF5EF] px-3.5 py-1.5 text-[12px] font-semibold uppercase tracking-[0.04em] text-[#2D7A4F]">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Pass
            </div>
            {data.skills.length > 0 && (
              <div className="inline-flex rounded-full border border-[#E2E0DB] bg-[#F7F6F3] px-3.5 py-1.5 text-[12px] font-semibold uppercase tracking-[0.04em] text-[#3D5166]">
                {data.skills.length}/{data.skills.length} Required Skills
              </div>
            )}
            <div className="inline-flex rounded-full border border-[#3D8F8F]/20 bg-[#EBF5F5] px-3.5 py-1.5 text-[12px] font-semibold uppercase tracking-[0.04em] text-[#2E7070]">
              {data.issueDateLabel}
            </div>
          </div>

          {data.skills.length > 0 && (
            <>
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7A8A96]">
                Demonstrated Skills
              </div>

              <div>
                {data.skills.map((skill) => (
                  <div
                    key={skill}
                    className="flex items-center gap-2.5 border-b border-[#E2E0DB] py-2.5 text-[14px] text-[#3D5166] last:border-b-0"
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

          <RecipientGate
            canonicalUrl={data.canonicalUrl}
            badgeUrl={data.badgeUrl}
            evidenceUrl={data.evidenceUrl}
            linkedInUrl={data.linkedInUrl}
            learnerEmail={data.recipientEmail}
            score={data.score}
            summary={data.assessmentSummary}
            authEnabled={authEnabled}
          />
        </div>
      </div>

      <div className="mt-4 rounded-[20px] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)]">
        <div className="mb-3.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7A8A96]">
          Credential Details
        </div>

        <div className="space-y-0">
          <div className="flex items-start justify-between gap-3 border-b border-[#E2E0DB] py-3 first:pt-0 last:border-b-0">
            <div className="text-[13px] text-[#7A8A96]">Credential ID</div>
            <div className="rounded bg-[#EBF5F5] px-2 py-1 font-mono text-[11px] text-[#3D8F8F]">
              {data.id}
            </div>
          </div>
          <div className="flex items-start justify-between gap-3 border-b border-[#E2E0DB] py-3">
            <div className="text-[13px] text-[#7A8A96]">Issuer</div>
            <div className="text-right text-[13px] font-medium text-[#3D5166]">
              {data.issuerName}
            </div>
          </div>
          <div className="flex items-start justify-between gap-3 border-b border-[#E2E0DB] py-3">
            <div className="text-[13px] text-[#7A8A96]">Standard</div>
            <div className="text-right text-[13px] font-medium text-[#3D5166]">
              Open Badges 3.0
            </div>
          </div>
          <div className="flex items-start justify-between gap-3 border-b border-[#E2E0DB] py-3">
            <div className="text-[13px] text-[#7A8A96]">Proof</div>
            <div className="text-right text-[13px] font-medium text-[#3D5166]">
              {data.proofLabel}
            </div>
          </div>
          <div className="flex items-start justify-between gap-3 border-b border-[#E2E0DB] py-3">
            <div className="text-[13px] text-[#7A8A96]">Issued</div>
            <div className="text-right text-[13px] font-medium text-[#3D5166]">
              {data.issueDateLabel}
            </div>
          </div>
          <div className="flex items-start justify-between gap-3 border-b border-[#E2E0DB] py-3">
            <div className="text-[13px] text-[#7A8A96]">Valid Until</div>
            <div className="text-right text-[13px] font-medium text-[#3D5166]">
              {data.validUntilLabel ?? "Not specified"}
            </div>
          </div>
          <div className="flex items-start justify-between gap-3 pt-3">
            <div className="text-[13px] text-[#7A8A96]">Evidence</div>
            <div className="text-right text-[13px] font-medium text-[#3D5166]">
              <Link href={data.evidenceUrl} className="text-[#3D8F8F]">
                View Report →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div
        id="credential-verification"
        className="mt-4 rounded-[20px] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)]"
      >
        <div className="mb-3.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7A8A96]">
          Verification
        </div>

        <div className="flex items-start gap-3.5">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border border-[#3D8F8F]/20 bg-[#EBF5F5] text-[#3D8F8F]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>

          <div>
            <div className="text-[14px] font-semibold text-[#0D2B45]">
              Signed by {data.issuerName}
            </div>
            <div className="mt-1 text-[13px] leading-5 text-[#6B7F8E]">
              {data.verificationSummary}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {data.proofTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-[4px] border border-[#3D8F8F]/15 bg-[#EBF5F5] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.04em] text-[#2E7070]"
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
