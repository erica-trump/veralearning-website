"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { CredentialActions } from "@/components/credentials/credential-actions";

type RecipientAssociationState =
  | "checking"
  | "signed-out"
  | "associated"
  | "not-associated"
  | "unavailable";

interface RecipientGateProps {
  credentialPageId: string;
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
  onSessionEstablished,
}: {
  authEnabled: boolean;
  onSessionEstablished: () => void;
}) {
  const [showAuthFlow, setShowAuthFlow] = useState(false);

  if (!authEnabled) {
    return (
      <div className="credential-card rounded-[12px] bg-[#F8FAFB] px-5 py-4 shadow-[0_12px_32px_rgba(13,43,69,0.055)]">
        <div className="mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold tracking-[0.02em] text-[#2F4F4F]">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="-translate-y-px text-[#6B8F8F]"
          >
            <path d="M20 21a8 8 0 0 0-16 0" />
            <circle cx="12" cy="8" r="4" />
          </svg>
          Recipient-only access
        </div>
        <div className="mb-3 text-[13px] leading-5 text-[#6B7F8E]">
          Sign in to access recipient-only report, download, and sharing features.
        </div>
        <div className="credential-button inline-flex items-center justify-center rounded-[12px] bg-[#F6FBFB] px-5 py-2.5 text-[14px] font-semibold text-[#265F5F] shadow-[inset_0_0_0_1px_rgba(61,143,143,0.18)]">
          Access recipient features
        </div>
      </div>
    );
  }

  return (
    <>
      {!showAuthFlow ? (
        <div className="credential-card rounded-[12px] bg-[#F8FAFB] px-5 py-4 shadow-[0_12px_32px_rgba(13,43,69,0.055)]">
          <div className="mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold tracking-[0.02em] text-[#2F4F4F]">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="-translate-y-px text-[#6B8F8F]"
            >
              <path d="M20 21a8 8 0 0 0-16 0" />
              <circle cx="12" cy="8" r="4" />
            </svg>
            Recipient-only access
          </div>
          <div className="mb-3 text-[13px] leading-5 text-[#6B7F8E]">
            Sign in to access recipient-only report, download, and sharing features.
          </div>
          <button
            type="button"
            onClick={() => setShowAuthFlow(true)}
            className="credential-button inline-flex items-center justify-center rounded-[12px] bg-[#F6FBFB] px-5 py-2.5 text-[14px] font-semibold text-[#265F5F] shadow-[inset_0_0_0_1px_rgba(61,143,143,0.18)] hover:bg-[#EEF7F7]"
          >
            Access recipient features
          </button>
        </div>
      ) : (
        <RecipientAccessAuthFlow
          onSessionEstablished={onSessionEstablished}
        />
      )}
    </>
  );
}

async function fetchRecipientAssociationState(
  credentialPageId: string,
  signal?: AbortSignal,
): Promise<RecipientAssociationState> {
  try {
    const response = await fetch(
      `/api/credentials/${encodeURIComponent(credentialPageId)}/recipient-association`,
      {
        cache: "no-store",
        credentials: "same-origin",
        signal,
      },
    );

    if (response.status === 401) {
      return "signed-out";
    }

    if (!response.ok) {
      return "unavailable";
    }

    const body: unknown = await response.json();
    const recipientAssociated =
      typeof body === "object" &&
      body !== null &&
      "recipientAssociated" in body &&
      typeof body.recipientAssociated === "boolean"
        ? body.recipientAssociated
        : null;

    return recipientAssociated === null
      ? "unavailable"
      : recipientAssociated
        ? "associated"
        : "not-associated";
  } catch {
    return "unavailable";
  }
}

export function RecipientGate({
  credentialPageId,
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
}: RecipientGateProps) {
  const [associationState, setAssociationState] =
    useState<RecipientAssociationState>(
      authEnabled ? "checking" : "signed-out",
    );

  useEffect(() => {
    if (!authEnabled) {
      return;
    }

    const abortController = new AbortController();
    let isActive = true;

    void fetchRecipientAssociationState(
      credentialPageId,
      abortController.signal,
    ).then((nextState) => {
      if (isActive) {
        setAssociationState(nextState);
      }
    });

    return () => {
      isActive = false;
      abortController.abort();
    };
  }, [authEnabled, credentialPageId]);

  const handleSessionEstablished = useCallback(() => {
    void fetchRecipientAssociationState(credentialPageId).then(
      setAssociationState,
    );
  }, [credentialPageId]);

  const isRecipientAssociated = associationState === "associated";

  return (
    <>
      {isRecipientAssociated && (
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

      <div className={isRecipientAssociated ? "mt-10" : "mt-2"}>
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
          isRecipientAssociated={isRecipientAssociated}
        />
      </div>

      {associationState === "checking" && (
        <div className="credential-card credential-enter mt-5 rounded-[22px] bg-[#F8FAFB] px-6 py-5 text-center text-[13px] text-[#6B7F8E] shadow-[0_10px_24px_rgba(13,43,69,0.045)]">
          Checking recipient access...
        </div>
      )}

      {associationState === "signed-out" && (
        <div className="credential-enter mt-5 [animation-delay:380ms]">
          <SignedOutAccess
            authEnabled={authEnabled}
            onSessionEstablished={handleSessionEstablished}
          />
        </div>
      )}

      {associationState === "not-associated" && (
        <div className="credential-card credential-enter mt-9 rounded-[22px] bg-[#F9F7F2] px-6 py-5 text-center shadow-[0_10px_24px_rgba(13,43,69,0.045)] [animation-delay:380ms]">
          <div className="text-[15px] font-semibold text-[#0D2B45]">
            Recipient-only features are still locked
          </div>
          <div className="mt-1 text-[13px] leading-5 text-[#7A8A96]">
            You&apos;re signed in, but none of your verified account emails is associated with this credential.
          </div>
        </div>
      )}

      {associationState === "unavailable" && (
        <div className="credential-card credential-enter mt-9 rounded-[22px] bg-[#F9F7F2] px-6 py-5 text-center shadow-[0_10px_24px_rgba(13,43,69,0.045)] [animation-delay:380ms]">
          <div className="text-[15px] font-semibold text-[#0D2B45]">
            Recipient access is unavailable
          </div>
          <div className="mt-1 text-[13px] leading-5 text-[#7A8A96]">
            We couldn&apos;t check recipient association right now. Please try again later.
          </div>
        </div>
      )}
    </>
  );
}
