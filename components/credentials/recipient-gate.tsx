"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { CredentialActions } from "@/components/credentials/credential-actions";
import { anyEmailMatches } from "@/lib/recipient";

interface RecipientGateProps {
  title: string;
  issuerName: string;
  issueYear: number | null;
  issueMonth: number | null;
  validUntilYear: number | null;
  validUntilMonth: number | null;
  canonicalUrl: string;
  badgeUrl: string;
  evidenceUrl: string;
  learnerEmail: string | null;
  credentialRecipientEmail: string | null;
  score: number;
  summary: string;
  authEnabled: boolean;
}

interface RecipientGateContentProps {
  title: string;
  issuerName: string;
  issueYear: number | null;
  issueMonth: number | null;
  validUntilYear: number | null;
  validUntilMonth: number | null;
  canonicalUrl: string;
  badgeUrl: string;
  evidenceUrl: string;
  score: number;
  summary: string;
  authEnabled: boolean;
  isVerifiedRecipient: boolean;
  showSignedOutState: boolean;
  showMismatchState: boolean;
  credentialRecipientEmail: string | null;
  onSignedInResolved: (emails: string[]) => void;
}

const RecipientAccessAuthFlow = dynamic(
  () =>
    import("@/components/credentials/recipient-access-auth").then((module) => ({
      default: module.RecipientAccessAuthFlow,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto max-w-[420px] rounded-[16px] bg-white px-4 py-4 text-[13px] leading-5 text-[#3D5166] shadow-[inset_0_0_0_1px_rgba(13,43,69,0.05)]">
        Loading recipient access...
      </div>
    ),
  },
);

function SignedOutAccess({
  authEnabled,
  credentialRecipientEmail,
  onSignedInResolved,
}: {
  authEnabled: boolean;
  credentialRecipientEmail: string | null;
  onSignedInResolved: (emails: string[]) => void;
}) {
  const [showAuthFlow, setShowAuthFlow] = useState(false);

  if (!authEnabled) {
    return (
      <div>
        <div className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.11em] text-[#8A98A3]">
          For the credential recipient
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-[460px] text-[13px] leading-5 text-[#6B7F8E]">
            View your full report, download your badge, and share it on LinkedIn.
          </div>
          <div className="credential-button inline-flex items-center justify-center rounded-[12px] bg-[#F6FBFB] px-5 py-2.5 text-[14px] font-semibold text-[#265F5F] shadow-[inset_0_0_0_1px_rgba(61,143,143,0.18)]">
            Access your credential
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {!showAuthFlow ? (
        <div>
          <div className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.11em] text-[#8A98A3]">
            For the credential recipient
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-[460px] text-[13px] leading-5 text-[#6B7F8E]">
              View your full report, download your badge, and share it on LinkedIn.
            </div>
            <button
              type="button"
              onClick={() => setShowAuthFlow(true)}
              className="credential-button inline-flex items-center justify-center rounded-[12px] bg-[#F6FBFB] px-5 py-2.5 text-[14px] font-semibold text-[#265F5F] shadow-[inset_0_0_0_1px_rgba(61,143,143,0.18)] hover:bg-[#EEF7F7]"
            >
              Access your credential
            </button>
          </div>
        </div>
      ) : (
        <RecipientAccessAuthFlow
          credentialRecipientEmail={credentialRecipientEmail}
          onSignedInResolved={onSignedInResolved}
        />
      )}
    </>
  );
}

function RecipientGateContent({
  title,
  issuerName,
  issueYear,
  issueMonth,
  validUntilYear,
  validUntilMonth,
  canonicalUrl,
  badgeUrl,
  evidenceUrl,
  score,
  summary,
  authEnabled,
  isVerifiedRecipient,
  showSignedOutState,
  showMismatchState,
  credentialRecipientEmail,
  onSignedInResolved,
}: RecipientGateContentProps) {
  return (
    <>
      {isVerifiedRecipient && (
        <div className="credential-card credential-enter relative overflow-hidden rounded-[22px] bg-[#FBF9F4] p-6 shadow-[0_14px_34px_rgba(13,43,69,0.06)] [animation-delay:220ms]">
          <div className="flex items-center justify-between rounded-[16px] bg-white px-5 py-4 shadow-[inset_0_0_0_1px_rgba(13,43,69,0.05)]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#7A8A96]">
              Performance Score
            </div>
            <div className="text-[22px] font-bold text-[#0D2B45]">
              {score}
              <span className="text-[14px] font-normal text-[#7A8A96]">/100</span>
            </div>
          </div>

          <div className="mt-4 rounded-[16px] bg-[#F4F8F7] px-5 py-4 text-[13px] italic leading-6 text-[#3D5166] shadow-[inset_0_0_0_1px_rgba(61,143,143,0.08)]">
            {summary}
          </div>
        </div>
      )}

      <div className={isVerifiedRecipient ? "mt-10" : "mt-2"}>
        <CredentialActions
          title={title}
          issuerName={issuerName}
          issueYear={issueYear}
          issueMonth={issueMonth}
          validUntilYear={validUntilYear}
          validUntilMonth={validUntilMonth}
          canonicalUrl={canonicalUrl}
          badgeUrl={badgeUrl}
          evidenceUrl={evidenceUrl}
          isVerifiedRecipient={isVerifiedRecipient}
        />
      </div>

      {showSignedOutState && (
        <div className="credential-enter mt-6 border-t border-[#E2E0DB]/35 pt-4 [animation-delay:380ms]">
          <SignedOutAccess
            authEnabled={authEnabled}
            credentialRecipientEmail={credentialRecipientEmail}
            onSignedInResolved={onSignedInResolved}
          />
        </div>
      )}

      {showMismatchState && (
        <div className="credential-card credential-enter mt-9 rounded-[22px] bg-[#F9F7F2] px-6 py-5 text-center shadow-[0_10px_24px_rgba(13,43,69,0.045)] [animation-delay:380ms]">
          <div className="text-[15px] font-semibold text-[#0D2B45]">
            Recipient-only features are still locked
          </div>
          <div className="mt-1 text-[13px] leading-5 text-[#7A8A96]">
            You&apos;re signed in, but recipient-only features are only available to the email address associated with this credential.
          </div>
        </div>
      )}
    </>
  );
}

export function RecipientGate(props: RecipientGateProps) {
  const [resolvedViewerEmails, setResolvedViewerEmails] = useState<string[] | null>(null);
  const isVerifiedRecipient =
    resolvedViewerEmails !== null && anyEmailMatches(resolvedViewerEmails, props.learnerEmail);
  const showSignedOutState = resolvedViewerEmails === null;
  const showMismatchState = resolvedViewerEmails !== null && !isVerifiedRecipient;

  return (
    <RecipientGateContent
      title={props.title}
      issuerName={props.issuerName}
      issueYear={props.issueYear}
      issueMonth={props.issueMonth}
      validUntilYear={props.validUntilYear}
      validUntilMonth={props.validUntilMonth}
      canonicalUrl={props.canonicalUrl}
      badgeUrl={props.badgeUrl}
      evidenceUrl={props.evidenceUrl}
      score={props.score}
      summary={props.summary}
      authEnabled={props.authEnabled}
      isVerifiedRecipient={isVerifiedRecipient}
      showSignedOutState={showSignedOutState}
      showMismatchState={showMismatchState}
      credentialRecipientEmail={props.credentialRecipientEmail}
      onSignedInResolved={setResolvedViewerEmails}
    />
  );
}
