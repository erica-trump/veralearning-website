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
      <div className="credential-card credential-enter relative overflow-hidden rounded-[22px] bg-[#F7F4ED] p-6 shadow-[0_14px_34px_rgba(13,43,69,0.07)] [animation-delay:220ms]">
        <div className={isVerifiedRecipient ? "" : "pointer-events-none select-none blur-[4px]"}>
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

        {!isVerifiedRecipient && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-[22px] bg-[rgba(247,244,237,0.84)] px-6 text-center backdrop-blur-[2px]">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#3D5166] shadow-[inset_0_0_0_1px_rgba(13,43,69,0.06)]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>
            <div className="text-[15px] font-semibold text-[#0D2B45]">
              Detailed Assessment Insights
            </div>
            <div className="max-w-[320px] text-[13px] leading-5 text-[#6B7F8E]">
              {showMismatchState
                ? "Recipient-only access is limited to the email this credential was issued to."
                : "Sign in to unlock your full report, detailed score, and assessment summary."}
            </div>

            {showSignedOutState && authEnabled && (
              <SignInButton
                mode="modal"
                forceRedirectUrl={canonicalUrl}
                fallbackRedirectUrl={canonicalUrl}
              >
                <button
                  type="button"
                  className="credential-button mt-1 inline-flex items-center gap-2 rounded-[12px] bg-[#3D8F8F] px-5 py-3 text-[14px] font-semibold text-white shadow-[0_10px_24px_rgba(61,143,143,0.18)] hover:bg-[#357C7C]"
                >
                  Sign in to view full report
                </button>
              </SignInButton>
            )}

            {showSignedOutState && !authEnabled && (
              <div className="mt-1 rounded-[12px] bg-[#3D8F8F] px-5 py-3 text-[14px] font-semibold text-white shadow-[0_10px_24px_rgba(61,143,143,0.18)]">
                Sign in to view full report
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6">
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
        <div className="credential-card credential-enter mt-6 rounded-[22px] bg-[#FCFBF8] px-6 py-6 text-center shadow-[0_12px_32px_rgba(13,43,69,0.06)] [animation-delay:380ms]">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#3D8F8F] shadow-[inset_0_0_0_1px_rgba(61,143,143,0.12)]">
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
                className="credential-button inline-flex items-center gap-2 rounded-[12px] bg-[#3D8F8F] px-6 py-3 text-[14px] font-semibold text-white shadow-[0_10px_24px_rgba(61,143,143,0.18)] hover:bg-[#357C7C]"
              >
                Sign in to access your credential
              </button>
            </SignInButton>
          ) : (
            <div className="inline-flex rounded-[12px] bg-[#3D8F8F] px-6 py-3 text-[14px] font-semibold text-white shadow-[0_10px_24px_rgba(61,143,143,0.18)]">
              Sign in to access your credential
            </div>
          )}
        </div>
      )}

      {showMismatchState && (
        <div className="credential-card credential-enter mt-6 rounded-[22px] bg-[#FCFBF8] px-6 py-5 text-center shadow-[0_12px_32px_rgba(13,43,69,0.06)] [animation-delay:380ms]">
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
