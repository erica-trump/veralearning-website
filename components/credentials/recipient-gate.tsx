"use client";

import { SignInButton, useUser } from "@clerk/nextjs";
import { CredentialActions } from "@/components/credentials/credential-actions";
import { anyEmailMatches } from "@/lib/recipient";

interface RecipientGateProps {
  canonicalUrl: string;
  badgeUrl: string;
  evidenceUrl: string;
  linkedInUrl: string;
  learnerEmail: string | null;
  score: number;
  summary: string;
  authEnabled: boolean;
}

interface RecipientGateContentProps {
  canonicalUrl: string;
  badgeUrl: string;
  evidenceUrl: string;
  linkedInUrl: string;
  score: number;
  summary: string;
  authEnabled: boolean;
  isSignedIn: boolean;
  isVerifiedRecipient: boolean;
  showSignedOutState: boolean;
  showMismatchState: boolean;
}

function RecipientGateContent({
  canonicalUrl,
  badgeUrl,
  evidenceUrl,
  linkedInUrl,
  score,
  summary,
  authEnabled,
  isSignedIn,
  isVerifiedRecipient,
  showSignedOutState,
  showMismatchState,
}: RecipientGateContentProps) {
  return (
    <>
      <div className="relative mt-5 overflow-hidden rounded-[12px]">
        <div className={isVerifiedRecipient ? "" : "pointer-events-none select-none blur-[4px]"}>
          <div className="flex items-center justify-between rounded-[10px] border border-[#E2E0DB] bg-[#F7F6F3] px-4 py-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#7A8A96]">
              Performance Score
            </div>
            <div className="text-[22px] font-bold text-[#0D2B45]">
              {score}
              <span className="text-[14px] font-normal text-[#7A8A96]">/100</span>
            </div>
          </div>

          <div className="mt-3 rounded-[10px] border border-[#3D8F8F]/15 bg-[#EBF5F5] px-4 py-3.5 text-[13px] italic leading-6 text-[#3D5166]">
            {summary}
          </div>
        </div>

        {!isVerifiedRecipient && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-[12px] border border-dashed border-[#E2E0DB] bg-white/75 px-4 text-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E2E0DB] bg-[#F7F6F3] text-[#3D5166]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>
            <div className="text-[13px] font-medium text-[#3D5166]">
              Score &amp; assessment details are private
            </div>
            <div className="max-w-[260px] text-[12px] text-[#7A8A96]">
              {showMismatchState
                ? "Recipient-only access is limited to the email this credential was issued to."
                : "Sign in to access your full report."}
            </div>

            {showSignedOutState && authEnabled && (
              <SignInButton
                mode="modal"
                forceRedirectUrl={canonicalUrl}
                fallbackRedirectUrl={canonicalUrl}
              >
                <button
                  type="button"
                  className="mt-1 inline-flex items-center gap-2 rounded-[8px] bg-[#3D8F8F] px-4 py-2 text-[13px] font-semibold text-white"
                >
                  Sign in with email
                </button>
              </SignInButton>
            )}

            {showSignedOutState && !authEnabled && (
              <div className="mt-1 rounded-[8px] bg-[#3D8F8F] px-4 py-2 text-[13px] font-semibold text-white/80">
                Sign-in unavailable
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-4">
        <CredentialActions
          canonicalUrl={canonicalUrl}
          badgeUrl={badgeUrl}
          evidenceUrl={evidenceUrl}
          linkedInUrl={linkedInUrl}
          isVerifiedRecipient={isVerifiedRecipient}
          isSignedIn={isSignedIn}
        />
      </div>

      {showSignedOutState && (
        <div className="mt-4 rounded-[20px] border border-dashed border-[#E2E0DB] bg-white px-6 py-6 text-center shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)]">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#EBF5F5] text-[#3D8F8F]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div className="mb-1 text-[15px] font-semibold text-[#0D2B45]">
            Is this your credential?
          </div>
          <div className="mx-auto mb-4 max-w-[420px] text-[13px] leading-5 text-[#7A8A96]">
            Sign in with your email to access your full assessment report, download your badge, and share to LinkedIn.
          </div>

          {authEnabled ? (
            <SignInButton
              mode="modal"
              forceRedirectUrl={canonicalUrl}
              fallbackRedirectUrl={canonicalUrl}
            >
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-[10px] bg-[#0D2B45] px-6 py-3 text-[14px] font-semibold text-white transition hover:-translate-y-px hover:bg-[#1A4060]"
              >
                Send me a magic link
              </button>
            </SignInButton>
          ) : (
            <div className="inline-flex rounded-[10px] bg-[#0D2B45] px-6 py-3 text-[14px] font-semibold text-white/80">
              Clerk is not configured yet
            </div>
          )}
        </div>
      )}

      {showMismatchState && (
        <div className="mt-4 rounded-[20px] border border-[#E2E0DB] bg-white px-6 py-5 text-center shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)]">
          <div className="text-[15px] font-semibold text-[#0D2B45]">
            Recipient-only features are still locked
          </div>
          <div className="mt-1 text-[13px] leading-5 text-[#7A8A96]">
            You&apos;re signed in, but recipient-only features are only available to the email this credential was issued to.
          </div>
        </div>
      )}
    </>
  );
}

function RecipientGateWithClerk({
  canonicalUrl,
  badgeUrl,
  evidenceUrl,
  linkedInUrl,
  learnerEmail,
  score,
  summary,
  authEnabled,
}: RecipientGateProps) {
  const { isLoaded, isSignedIn, user } = useUser();
  const signedInEmails = user?.emailAddresses.map((email) => email.emailAddress) ?? [];
  const isVerifiedRecipient =
    isLoaded && isSignedIn && anyEmailMatches(signedInEmails, learnerEmail);
  const showSignedOutState = !isLoaded || !isSignedIn;
  const showMismatchState = isLoaded && isSignedIn && !isVerifiedRecipient;

  return (
    <RecipientGateContent
      canonicalUrl={canonicalUrl}
      badgeUrl={badgeUrl}
      evidenceUrl={evidenceUrl}
      linkedInUrl={linkedInUrl}
      score={score}
      summary={summary}
      authEnabled={authEnabled}
      isSignedIn={Boolean(isSignedIn)}
      isVerifiedRecipient={isVerifiedRecipient}
      showSignedOutState={showSignedOutState}
      showMismatchState={showMismatchState}
    />
  );
}

export function RecipientGate(props: RecipientGateProps) {
  if (!props.authEnabled) {
    return (
      <RecipientGateContent
        canonicalUrl={props.canonicalUrl}
        badgeUrl={props.badgeUrl}
        evidenceUrl={props.evidenceUrl}
        linkedInUrl={props.linkedInUrl}
        score={props.score}
        summary={props.summary}
        authEnabled={false}
        isSignedIn={false}
        isVerifiedRecipient={false}
        showSignedOutState
        showMismatchState={false}
      />
    );
  }

  return <RecipientGateWithClerk {...props} />;
}
