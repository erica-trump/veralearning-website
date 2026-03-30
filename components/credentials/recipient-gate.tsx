"use client";

import { useSignIn, useSignUp, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CredentialActions } from "@/components/credentials/credential-actions";
import { anyEmailMatches } from "@/lib/recipient";

interface RecipientGateProps {
  title: string;
  issuerName: string;
  issueYear: number | null;
  issueMonth: number | null;
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
}

type SignInStage = "default" | "code" | "success";
type AuthFlowMode = "sign-in" | "sign-up";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function maskEmail(email: string) {
  const [localPart, domain = ""] = email.split("@");

  if (!localPart || !domain) {
    return email;
  }

  const firstChar = localPart[0] ?? "";
  const lastChar = localPart.length > 1 ? localPart[localPart.length - 1] : "";
  const maskedLocal =
    localPart.length <= 2 ? `${firstChar}*` : `${firstChar}${"*".repeat(Math.max(localPart.length - 2, 1))}${lastChar}`;

  return `${maskedLocal}@${domain}`;
}

function getClerkErrorMessage(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return "We couldn't complete sign-in. Please try again.";
  }

  const errors = (error as { errors?: Array<{ longMessage?: string; message?: string }> }).errors;
  const firstError = errors?.[0];

  return (
    firstError?.longMessage ??
    firstError?.message ??
    "We couldn't complete sign-in. Please try again."
  );
}

function isAccountNotFoundError(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const errors = (error as { errors?: Array<{ code?: string; message?: string; longMessage?: string }> }).errors ?? [];

  return errors.some((entry) => {
    const code = entry.code?.toLowerCase() ?? "";
    const message = `${entry.message ?? ""} ${entry.longMessage ?? ""}`.toLowerCase();

    return (
      code.includes("not_found") ||
      code.includes("identifier_not_found") ||
      message.includes("couldn't find your account") ||
      message.includes("could not find your account") ||
      message.includes("not found")
    );
  });
}

function InlineRecipientSignIn({
  credentialRecipientEmail,
}: {
  credentialRecipientEmail: string | null;
}) {
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();
  const { isLoaded: isSignUpLoaded, signUp } = useSignUp();
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [emailInput, setEmailInput] = useState(credentialRecipientEmail ?? "");
  const [activeEmail, setActiveEmail] = useState(credentialRecipientEmail ?? "");
  const [otpCode, setOtpCode] = useState("");
  const [stage, setStage] = useState<SignInStage>("default");
  const [flowMode, setFlowMode] = useState<AuthFlowMode>("sign-in");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!credentialRecipientEmail) {
      return;
    }

    setEmailInput((current) => (current ? current : credentialRecipientEmail));
    setActiveEmail((current) => (current ? current : credentialRecipientEmail));
  }, [credentialRecipientEmail]);

  const normalizedRecipientEmail = useMemo(
    () => (credentialRecipientEmail ? normalizeEmail(credentialRecipientEmail) : null),
    [credentialRecipientEmail],
  );

  async function sendCode(emailToUse: string) {
    if (!isLoaded || !isSignUpLoaded || !signIn || !signUp || !setActive) {
      setErrorMessage("Sign-in is still loading. Please try again in a moment.");
      return;
    }

    setErrorMessage(null);
    setIsSending(true);

    try {
      await signIn.create({
        identifier: emailToUse,
        strategy: "email_code",
      });

      setActiveEmail(emailToUse);
      setFlowMode("sign-in");
      setStage("code");
      setOtpCode("");
    } catch (error) {
      if (!isAccountNotFoundError(error)) {
        setErrorMessage(getClerkErrorMessage(error));
        return;
      }

      try {
        await signUp.create({
          emailAddress: emailToUse,
        });
        await signUp.prepareEmailAddressVerification({
          strategy: "email_code",
        });

        setActiveEmail(emailToUse);
        setFlowMode("sign-up");
        setStage("code");
        setOtpCode("");
      } catch (signUpError) {
        setErrorMessage(getClerkErrorMessage(signUpError));
      }
    } finally {
      setIsSending(false);
    }
  }

  async function handleSendCode() {
    if (!normalizedRecipientEmail) {
      setErrorMessage("This credential does not include a recipient email.");
      return;
    }

    await sendCode(normalizedRecipientEmail);
  }

  async function handleDifferentEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedInput = normalizeEmail(emailInput);

    if (!normalizedRecipientEmail || normalizedInput !== normalizedRecipientEmail) {
      setErrorMessage("This email does not match the credential recipient");
      return;
    }

    await sendCode(normalizedInput);
  }

  async function handleVerifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isLoaded || !isSignUpLoaded || !signIn || !signUp || !setActive) {
      setErrorMessage("Sign-in is still loading. Please try again in a moment.");
      return;
    }

    setErrorMessage(null);
    setIsVerifying(true);

    try {
      if (flowMode === "sign-up") {
        const result = await signUp.attemptEmailAddressVerification({
          code: otpCode,
        });

        if (result.status !== "complete" || !result.createdSessionId) {
          setErrorMessage("We couldn't verify that code. Please try again.");
          return;
        }

        await setActive({ session: result.createdSessionId });
      } else {
        const result = await signIn.attemptFirstFactor({
          strategy: "email_code",
          code: otpCode,
        });

        if (result.status !== "complete" || !result.createdSessionId) {
          setErrorMessage("We couldn't verify that code. Please try again.");
          return;
        }

        await setActive({ session: result.createdSessionId });
      }

      setStage("success");
      router.refresh();
    } catch (error) {
      setErrorMessage(getClerkErrorMessage(error));
    } finally {
      setIsVerifying(false);
    }
  }

  const maskedRecipientEmail = credentialRecipientEmail ? maskEmail(credentialRecipientEmail) : null;

  return (
    <>
      {!isExpanded && (
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
              onClick={() => setIsExpanded(true)}
              className="credential-button inline-flex items-center justify-center rounded-[12px] bg-[#F6FBFB] px-5 py-2.5 text-[14px] font-semibold text-[#265F5F] shadow-[inset_0_0_0_1px_rgba(61,143,143,0.18)] hover:bg-[#EEF7F7]"
            >
              Access your credential
            </button>
          </div>
        </div>
      )}

      {isExpanded && stage === "default" && (
        <>
          <div className="mx-auto max-w-[420px] rounded-[16px] bg-white px-4 py-4 text-left shadow-[inset_0_0_0_1px_rgba(13,43,69,0.05)]">
            <div className="text-[13px] leading-5 text-[#3D5166]">
              {maskedRecipientEmail ? (
                <>
                  We&apos;ll send a verification code to{" "}
                  <span className="font-semibold text-[#0D2B45]">{maskedRecipientEmail}</span>.
                </>
              ) : (
                "We need the recipient email embedded in this credential before we can send a verification code."
              )}
            </div>

            {showEmailInput ? (
              <form className="mt-4 space-y-3" onSubmit={handleDifferentEmailSubmit}>
                <label className="block text-left text-[12px] font-medium text-[#5D7180]">
                  Email address
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(event) => setEmailInput(event.target.value)}
                  className="w-full rounded-[12px] border border-[#D6DFE1] bg-white px-4 py-3 text-[14px] text-[#0D2B45] outline-none transition focus:border-[#3D8F8F] focus:ring-2 focus:ring-[#3D8F8F]/15"
                  placeholder="name@example.com"
                  autoComplete="email"
                />
                <button
                  type="submit"
                  disabled={isSending || !emailInput.trim()}
                  className="credential-button inline-flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#3D8F8F] px-6 py-3 text-[14px] font-semibold text-white shadow-[0_10px_24px_rgba(61,143,143,0.18)] hover:bg-[#357C7C] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSending ? "Sending..." : "Send code"}
                </button>
              </form>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={isSending || !normalizedRecipientEmail}
                  className="credential-button mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#3D8F8F] px-6 py-3 text-[14px] font-semibold text-white shadow-[0_10px_24px_rgba(61,143,143,0.18)] hover:bg-[#357C7C] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSending ? "Sending..." : "Send code"}
                </button>

                {normalizedRecipientEmail && (
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setShowEmailInput(true);
                    }}
                    className="credential-link mt-3 text-[12px] font-medium text-[#2E7070]"
                  >
                    Not your email? Enter a different address
                  </button>
                )}
              </>
            )}
          </div>

          {errorMessage && (
            <div className="mx-auto mt-2.5 max-w-[420px] rounded-[12px] bg-[#FFF5F3] px-4 py-3 text-[12px] leading-5 text-[#A15241] shadow-[inset_0_0_0_1px_rgba(177,88,67,0.12)]">
              {errorMessage}
            </div>
          )}
        </>
      )}

      {stage === "code" && (
        <>
          <form
            className="mx-auto max-w-[420px] rounded-[16px] bg-white px-4 py-4 text-left shadow-[inset_0_0_0_1px_rgba(13,43,69,0.05)]"
            onSubmit={handleVerifyCode}
          >
            <div className="text-[13px] leading-5 text-[#3D5166]">
              Enter the 6-digit code sent to{" "}
              <span className="font-semibold text-[#0D2B45]">{maskEmail(activeEmail)}</span>.
            </div>
            <label className="mt-4 block text-left text-[12px] font-medium text-[#5D7180]">
              Verification code
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={otpCode}
              onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
              className="mt-2 w-full rounded-[12px] border border-[#D6DFE1] bg-white px-4 py-3 text-[18px] tracking-[0.3em] text-[#0D2B45] outline-none transition focus:border-[#3D8F8F] focus:ring-2 focus:ring-[#3D8F8F]/15"
              placeholder="123456"
              autoComplete="one-time-code"
            />
            <button
              type="submit"
              disabled={isVerifying || otpCode.length !== 6}
              className="credential-button mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#3D8F8F] px-6 py-3 text-[14px] font-semibold text-white shadow-[0_10px_24px_rgba(61,143,143,0.18)] hover:bg-[#357C7C] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isVerifying ? "Verifying..." : "Verify code"}
            </button>

            <button
              type="button"
              onClick={() => void sendCode(activeEmail)}
              disabled={isSending}
              className="credential-link mt-3 text-[12px] font-medium text-[#2E7070]"
            >
              {isSending ? "Sending..." : "Resend code"}
            </button>
          </form>

          {errorMessage && (
            <div className="mx-auto mt-2.5 max-w-[420px] rounded-[12px] bg-[#FFF5F3] px-4 py-3 text-[12px] leading-5 text-[#A15241] shadow-[inset_0_0_0_1px_rgba(177,88,67,0.12)]">
              {errorMessage}
            </div>
          )}
        </>
      )}

      {stage === "success" && (
        <div className="mx-auto max-w-[420px] rounded-[16px] bg-white px-4 py-4 text-[13px] leading-5 text-[#2D7A4F] shadow-[inset_0_0_0_1px_rgba(45,122,79,0.12)]">
          Verification successful. Reloading your credential access...
        </div>
      )}

      {isExpanded && (
        <div id="clerk-captcha" className="mx-auto mt-4 flex max-w-[420px] justify-center" />
      )}
    </>
  );
}

function RecipientGateContent({
  title,
  issuerName,
  issueYear,
  issueMonth,
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
          canonicalUrl={canonicalUrl}
          badgeUrl={badgeUrl}
          evidenceUrl={evidenceUrl}
          isVerifiedRecipient={isVerifiedRecipient}
        />
      </div>

      {showSignedOutState && (
        <div className="credential-enter mt-6 border-t border-[#E2E0DB]/35 pt-4 [animation-delay:380ms]">
          {authEnabled ? (
            <InlineRecipientSignIn credentialRecipientEmail={credentialRecipientEmail} />
          ) : (
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
          )}
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

function RecipientGateWithClerk({
  title,
  issuerName,
  issueYear,
  issueMonth,
  canonicalUrl,
  badgeUrl,
  evidenceUrl,
  learnerEmail,
  credentialRecipientEmail,
  score,
  summary,
}: RecipientGateProps) {
  const { isLoaded, isSignedIn, user } = useUser();
  const signedInEmails = user?.emailAddresses.map((email) => email.emailAddress) ?? [];
  const isVerifiedRecipient =
    isLoaded && isSignedIn && anyEmailMatches(signedInEmails, learnerEmail);
  const showSignedOutState = !isLoaded || !isSignedIn;
  const showMismatchState = isLoaded && isSignedIn && !isVerifiedRecipient;

  return (
    <RecipientGateContent
      title={title}
      issuerName={issuerName}
      issueYear={issueYear}
      issueMonth={issueMonth}
      canonicalUrl={canonicalUrl}
      badgeUrl={badgeUrl}
      evidenceUrl={evidenceUrl}
      score={score}
      summary={summary}
      authEnabled={true}
      isVerifiedRecipient={isVerifiedRecipient}
      showSignedOutState={showSignedOutState}
      showMismatchState={showMismatchState}
      credentialRecipientEmail={credentialRecipientEmail}
    />
  );
}

export function RecipientGate(props: RecipientGateProps) {
  if (!props.authEnabled) {
    return (
      <RecipientGateContent
        title={props.title}
        issuerName={props.issuerName}
        issueYear={props.issueYear}
        issueMonth={props.issueMonth}
        canonicalUrl={props.canonicalUrl}
        badgeUrl={props.badgeUrl}
        evidenceUrl={props.evidenceUrl}
        score={props.score}
        summary={props.summary}
        authEnabled={false}
        isVerifiedRecipient={false}
        showSignedOutState
        showMismatchState={false}
        credentialRecipientEmail={props.credentialRecipientEmail}
      />
    );
  }

  return <RecipientGateWithClerk {...props} />;
}
