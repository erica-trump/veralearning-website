"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  openVerificationDetails,
  VERIFICATION_REQUEST_STATE_EVENT,
} from "@/components/credentials/verification-details-modal";

function ActionButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  className: string;
}) {
  return (
    <button
      className={`credential-button flex min-h-[48px] items-center justify-center gap-2 rounded-[14px] px-5 py-3 text-[14px] font-semibold disabled:cursor-not-allowed disabled:opacity-75 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function ActionLink({
  children,
  className,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  className: string;
}) {
  return (
    <a
      className={`credential-button flex min-h-[48px] items-center justify-center gap-2 rounded-[14px] px-5 py-3 text-[14px] font-semibold ${className}`}
      {...props}
    >
      {children}
    </a>
  );
}

interface CredentialActionsProps {
  title: string;
  issuerName: string;
  issueYear: number | null;
  issueMonth: number | null;
  canonicalUrl: string;
  badgeUrl: string;
  evidenceUrl: string;
  isVerifiedRecipient: boolean;
}

interface LinkedInGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  issuerName: string;
  issueYear: number | null;
  issueMonth: number | null;
  canonicalUrl: string;
}

function formatIssueMonthYear(issueYear: number | null, issueMonth: number | null) {
  if (!issueYear || !issueMonth) {
    return "Not specified";
  }

  const date = new Date(Date.UTC(issueYear, issueMonth - 1, 1));

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function buildLinkedInOpenUrl({
  baseUrl,
  title,
  issuerName,
  issueYear,
  issueMonth,
  canonicalUrl,
}: {
  baseUrl: string;
  title: string;
  issuerName: string;
  issueYear: number | null;
  issueMonth: number | null;
  canonicalUrl: string;
}) {
  try {
    const url = new URL(baseUrl);
    const credentialId = canonicalUrl.split("/").filter(Boolean).pop() ?? "";

    if (url.hostname.includes("linkedin.com") && url.pathname === "/profile/add") {
      url.searchParams.set("startTask", "CERTIFICATION_NAME");
      url.searchParams.set("name", title);
      url.searchParams.set("certUrl", canonicalUrl);

      if (credentialId) {
        url.searchParams.set("certId", credentialId);
      }

      if (!url.searchParams.has("organizationId")) {
        url.searchParams.set("organizationName", issuerName);
      }

      if (issueYear) {
        url.searchParams.set("issueYear", String(issueYear));
      }

      if (issueMonth) {
        url.searchParams.set("issueMonth", String(issueMonth));
      }
    }

    return url.toString();
  } catch {
    return baseUrl;
  }
}

function LinkedInGuideModal({
  isOpen,
  onClose,
  title,
  issuerName,
  issueYear,
  issueMonth,
  canonicalUrl,
}: LinkedInGuideModalProps) {
  const [copiedStep, setCopiedStep] = useState<string | null>(null);
  const [lastCopiedStep, setLastCopiedStep] = useState<string>("name");
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const linkedInBaseUrl =
    process.env.NEXT_PUBLIC_LINKEDIN_ADD_TO_PROFILE_URL?.trim() ||
    "https://www.linkedin.com/";
  const linkedInOpenUrl = useMemo(
    () =>
      buildLinkedInOpenUrl({
        baseUrl: linkedInBaseUrl,
        title,
        issuerName,
        issueYear,
        issueMonth,
        canonicalUrl,
      }),
    [canonicalUrl, issueMonth, issueYear, issuerName, linkedInBaseUrl, title],
  );

  const steps = useMemo(
    () => [
      { id: "name", label: "Name", value: title },
      { id: "issuer", label: "Issuing organization", value: issuerName },
      { id: "date", label: "Issue date", value: formatIssueMonthYear(issueYear, issueMonth) },
      { id: "url", label: "Credential URL", value: canonicalUrl, hint: "This link lets employers view and verify your credential." },
    ],
    [canonicalUrl, issueMonth, issueYear, issuerName, title],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    window.setTimeout(() => closeButtonRef.current?.focus(), 0);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    async function autoCopyFirstStep() {
      try {
        await navigator.clipboard.writeText(steps[0]?.value ?? "");
        setCopiedStep("name");
        setLastCopiedStep("name");
      } catch {
        setCopiedStep(null);
      }
    }

    void autoCopyFirstStep();
  }, [isOpen, steps]);

  async function handleCopy(stepId: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedStep(stepId);
      setLastCopiedStep(stepId);
      window.setTimeout(() => setCopiedStep((current) => (current === stepId ? null : current)), 1400);
    } catch {
      setCopiedStep(null);
    }
  }

  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-[rgba(13,43,69,0.45)] px-4 py-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[760px] rounded-[24px] bg-[#FFFEFC] shadow-[0_24px_64px_rgba(13,43,69,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 flex items-start justify-between gap-4 rounded-t-[24px] border-b border-[#E7E3DA] bg-[#FFFEFC] px-6 py-5">
          <div>
            <h2 className="font-[family:var(--font-credential-serif)] text-[30px] leading-[1.1] text-[#0D2B45]">
              Add this credential to LinkedIn
            </h2>
            <p className="mt-2 text-[14px] leading-6 text-[#647887]">
              Add it to your Licenses &amp; Certifications section. Takes about 10 seconds.
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F6FBFB] text-[#2E7070] shadow-[inset_0_0_0_1px_rgba(61,143,143,0.14)] hover:bg-[#EEF7F7]"
            aria-label="Close LinkedIn instructions"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
          <div className="mb-5">
            <a
              href={linkedInOpenUrl}
              target="_blank"
              rel="noreferrer"
              className="credential-button inline-flex min-h-[46px] items-center justify-center rounded-[14px] bg-[#0A66C2] px-5 py-3 text-[14px] font-semibold text-white shadow-[0_10px_22px_rgba(10,102,194,0.18)] hover:bg-[#0958a8]"
            >
              Open LinkedIn
            </a>
          </div>

          <div className="space-y-3">
            {steps.map((step, index) => {
              const isActive = lastCopiedStep === step.id;
              const isJustCopied = copiedStep === step.id;

              return (
                <div
                  key={step.id}
                  className={`rounded-[18px] px-4 py-4 transition ${
                    isActive
                      ? "bg-[#F6FBFB] shadow-[inset_0_0_0_1px_rgba(61,143,143,0.16)]"
                      : "bg-[#FFFEFC] shadow-[inset_0_0_0_1px_rgba(13,43,69,0.06)]"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7A8A96]">
                      Step {index + 1}
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleCopy(step.id, step.value)}
                      className={`rounded-full px-3 py-1 text-[12px] font-semibold transition ${
                        isJustCopied
                          ? "bg-[#EBF5EF] text-[#2D7A4F]"
                          : "bg-white text-[#2E7070] shadow-[inset_0_0_0_1px_rgba(61,143,143,0.14)] hover:bg-[#F6FBFB]"
                      }`}
                    >
                      {isJustCopied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <div className="text-[12px] font-medium uppercase tracking-[0.06em] text-[#8A98A3]">
                    {step.label}
                  </div>
                  <div className="mt-1 text-[18px] font-semibold leading-7 text-[#0D2B45] break-words">
                    {step.value}
                  </div>
                  {step.hint && (
                    <div className="mt-2 text-[12px] leading-5 text-[#6B7F8E]">
                      {step.hint}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-5 text-[13px] leading-5 text-[#6B7F8E]">
            Done? Your credential should now appear on your LinkedIn profile.
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function CredentialActions({
  title,
  issuerName,
  issueYear,
  issueMonth,
  canonicalUrl,
  badgeUrl,
  evidenceUrl,
  isVerifiedRecipient,
}: CredentialActionsProps) {
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLinkedInModalOpen, setIsLinkedInModalOpen] = useState(false);

  useEffect(() => {
    function handleVerificationStateChange(event: Event) {
      const detail = (event as CustomEvent<{ state?: string }>).detail;
      setIsVerifying(detail?.state === "verifying");
    }

    window.addEventListener(
      VERIFICATION_REQUEST_STATE_EVENT,
      handleVerificationStateChange as EventListener,
    );

    return () => {
      window.removeEventListener(
        VERIFICATION_REQUEST_STATE_EVENT,
        handleVerificationStateChange as EventListener,
      );
    };
  }, []);

  async function handleCopyLink() {
    await navigator.clipboard.writeText(canonicalUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  function handleVerify() {
    openVerificationDetails();
  }

  return (
    <>
      <div className="credential-card rounded-[22px] bg-[#FEFDFC] px-6 py-5 shadow-[0_12px_32px_rgba(13,43,69,0.055)] credential-enter [animation-delay:300ms]">
        <div className="mb-0.5 text-[10px] font-medium uppercase tracking-[0.11em] text-[#8A98A3]">
          Share &amp; Verify
        </div>
        <div className="mb-3 text-[12px] leading-5 text-[#6B7F8E]">
          Anyone with this link can independently verify its authenticity.
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ActionButton
              type="button"
              onClick={handleVerify}
              disabled={isVerifying}
              className="bg-[#377F7F] text-white shadow-[0_8px_18px_rgba(61,143,143,0.14)] hover:bg-[#316F6F]"
            >
              {isVerifying ? "Verifying..." : "Verify this credential"}
            </ActionButton>

            <ActionButton
              type="button"
              onClick={handleCopyLink}
              className="bg-[#F6FBFB] text-[#265F5F] shadow-[inset_0_0_0_1px_rgba(61,143,143,0.18)] hover:bg-[#EEF7F7]"
            >
              {copied ? "Copied" : "Copy credential link"}
            </ActionButton>
          </div>

          {isVerifiedRecipient && (
            <div className="pt-1">
              <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.11em] text-[#8A98A3]">
                Use this credential
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <ActionButton
                  type="button"
                  onClick={() => setIsLinkedInModalOpen(true)}
                  className="bg-[#F6FBFB] text-[#265F5F] shadow-[inset_0_0_0_1px_rgba(61,143,143,0.18)] hover:bg-[#EEF7F7]"
                >
                  Add to LinkedIn
                </ActionButton>

                <ActionLink
                  href={badgeUrl}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="bg-white text-[#3D5166] shadow-[inset_0_0_0_1px_rgba(13,43,69,0.06)] hover:bg-[#F8FBFB]"
                >
                  Download badge
                </ActionLink>
              </div>
              <div className="mt-3">
                <ActionLink
                  href={evidenceUrl}
                  className="inline-flex min-h-0 items-center gap-1 rounded-none bg-transparent px-0 py-0 text-[13px] font-medium text-[#8D6A22] shadow-none hover:bg-transparent hover:text-[#75571d]"
                >
                  View detailed evidence report →
                </ActionLink>
              </div>
            </div>
          )}
        </div>
      </div>

      <LinkedInGuideModal
        isOpen={isLinkedInModalOpen}
        onClose={() => setIsLinkedInModalOpen(false)}
        title={title}
        issuerName={issuerName}
        issueYear={issueYear}
        issueMonth={issueMonth}
        canonicalUrl={canonicalUrl}
      />
    </>
  );
}
