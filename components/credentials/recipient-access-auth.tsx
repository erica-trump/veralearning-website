"use client";

import { ClerkProvider, useSignIn, useSignUp, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

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
    localPart.length <= 2
      ? `${firstChar}*`
      : `${firstChar}${"*".repeat(Math.max(localPart.length - 2, 1))}${lastChar}`;

  return `${maskedLocal}@${domain}`;
}

function getClerkErrorMessage(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return "We couldn't complete sign-in. Please try again.";
  }

  const errors = (
    error as {
      errors?: Array<{ longMessage?: string; message?: string }>;
    }
  ).errors;
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

  const errors = (
    error as {
      errors?: Array<{
        code?: string;
        message?: string;
        longMessage?: string;
      }>;
    }
  ).errors ?? [];

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

function RecipientAccessAuthFlowInner({
  onSessionEstablished,
}: {
  onSessionEstablished?: () => void;
}) {
  const router = useRouter();
  const { isLoaded: isUserLoaded, isSignedIn } = useUser();
  const { isLoaded, signIn, setActive } = useSignIn();
  const { isLoaded: isSignUpLoaded, signUp } = useSignUp();
  const [emailInput, setEmailInput] = useState("");
  const [activeEmail, setActiveEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [stage, setStage] = useState<SignInStage>("default");
  const [flowMode, setFlowMode] = useState<AuthFlowMode>("sign-in");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isUserLoaded && isSignedIn) {
      onSessionEstablished?.();
    }
  }, [isSignedIn, isUserLoaded, onSessionEstablished]);

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

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const emailToUse = normalizeEmail(emailInput);

    if (!emailToUse) {
      setErrorMessage("Enter your email address to continue.");
      return;
    }

    await sendCode(emailToUse);
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

  return (
    <>
      {!isUserLoaded ? (
        <div className="mx-auto max-w-[420px] rounded-[16px] bg-white px-4 py-4 text-[13px] leading-5 text-[#3D5166] shadow-[inset_0_0_0_1px_rgba(13,43,69,0.05)]">
          Loading sign-in...
        </div>
      ) : null}

      {isUserLoaded && isSignedIn ? (
        <div className="mx-auto max-w-[420px] rounded-[16px] bg-white px-4 py-4 text-[13px] leading-5 text-[#3D5166] shadow-[inset_0_0_0_1px_rgba(13,43,69,0.05)]">
          You&apos;re signed in. Checking recipient association...
        </div>
      ) : null}

      {isUserLoaded && !isSignedIn && stage === "default" && (
        <>
          <form
            className="mx-auto max-w-[420px] rounded-[16px] bg-white px-4 py-4 text-left shadow-[inset_0_0_0_1px_rgba(13,43,69,0.05)]"
            onSubmit={handleEmailSubmit}
          >
            <div className="text-[13px] leading-5 text-[#3D5166]">
              Enter your email address. Clerk will send you a one-time sign-in code, then VeraLearning will privately check whether a verified account email is associated with this credential.
            </div>
            <label className="mt-4 block text-left text-[12px] font-medium text-[#5D7180]">
              Email address
            </label>
            <input
              type="email"
              value={emailInput}
              onChange={(event) => setEmailInput(event.target.value)}
              className="mt-2 w-full rounded-[12px] border border-[#D6DFE1] bg-white px-4 py-3 text-[14px] text-[#0D2B45] outline-none transition focus:border-[#3D8F8F] focus:ring-2 focus:ring-[#3D8F8F]/15"
              placeholder="name@example.com"
              autoComplete="email"
            />
            <button
              type="submit"
              disabled={isSending || !emailInput.trim()}
              className="credential-button mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#3D8F8F] px-6 py-3 text-[14px] font-semibold text-white shadow-[0_10px_24px_rgba(61,143,143,0.18)] hover:bg-[#357C7C] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSending ? "Sending..." : "Send code"}
            </button>
          </form>

          {errorMessage && (
            <div className="mx-auto mt-2.5 max-w-[420px] rounded-[12px] bg-[#FFF5F3] px-4 py-3 text-[12px] leading-5 text-[#A15241] shadow-[inset_0_0_0_1px_rgba(177,88,67,0.12)]">
              {errorMessage}
            </div>
          )}
        </>
      )}

      {isUserLoaded && !isSignedIn && stage === "code" && (
        <>
          <form
            className="mx-auto max-w-[420px] rounded-[16px] bg-white px-4 py-4 text-left shadow-[inset_0_0_0_1px_rgba(13,43,69,0.05)]"
            onSubmit={handleVerifyCode}
          >
            <div className="text-[13px] leading-5 text-[#3D5166]">
              Enter the 6-digit code sent to{" "}
              <span className="font-semibold text-[#0D2B45]">
                {maskEmail(activeEmail)}
              </span>
              .
            </div>
            <label className="mt-4 block text-left text-[12px] font-medium text-[#5D7180]">
              Verification code
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={otpCode}
              onChange={(event) =>
                setOtpCode(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              className="mt-2 w-full rounded-[12px] border border-[#D6DFE1] bg-white px-4 py-3 text-[18px] tracking-[0.3em] text-[#0D2B45] outline-none transition focus:border-[#3D8F8F] focus:ring-2 focus:ring-[#3D8F8F]/15"
              placeholder="123456"
              autoComplete="one-time-code"
            />
            <button
              type="submit"
              disabled={isVerifying || otpCode.length !== 6}
              className="credential-button mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#3D8F8F] px-6 py-3 text-[14px] font-semibold text-white shadow-[0_10px_24px_rgba(61,143,143,0.18)] hover:bg-[#357C7C] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isVerifying ? "Checking code..." : "Continue"}
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

      {isUserLoaded && !isSignedIn && stage === "success" && (
        <div className="mx-auto max-w-[420px] rounded-[16px] bg-white px-4 py-4 text-[13px] leading-5 text-[#2D7A4F] shadow-[inset_0_0_0_1px_rgba(45,122,79,0.12)]">
          Email sign-in complete. Checking recipient association...
        </div>
      )}

      {isUserLoaded && !isSignedIn && (
        <div
          id="clerk-captcha"
          className="mx-auto mt-4 flex max-w-[420px] justify-center"
        />
      )}
    </>
  );
}

export function RecipientAccessAuthFlow({
  onSessionEstablished,
}: {
  onSessionEstablished?: () => void;
}) {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!clerkPublishableKey) {
    return (
      <div className="mx-auto max-w-[420px] rounded-[12px] bg-[#FFF5F3] px-4 py-3 text-[12px] leading-5 text-[#A15241] shadow-[inset_0_0_0_1px_rgba(177,88,67,0.12)]">
        Sign-in is not available right now.
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <RecipientAccessAuthFlowInner
        onSessionEstablished={onSessionEstablished}
      />
    </ClerkProvider>
  );
}
