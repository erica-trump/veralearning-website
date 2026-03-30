"use client";

import { useEffect, useMemo, useState } from "react";
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
  validUntilYear: number | null;
  validUntilMonth: number | null;
  canonicalUrl: string;
  badgeUrl: string;
  evidenceUrl: string;
  isVerifiedRecipient: boolean;
}

function buildLinkedInOpenUrl({
  baseUrl,
  title,
  issuerName,
  issueYear,
  issueMonth,
  validUntilYear,
  validUntilMonth,
  canonicalUrl,
}: {
  baseUrl: string;
  title: string;
  issuerName: string;
  issueYear: number | null;
  issueMonth: number | null;
  validUntilYear: number | null;
  validUntilMonth: number | null;
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

      if (validUntilYear) {
        url.searchParams.set("expirationYear", String(validUntilYear));
      }

      if (validUntilMonth) {
        url.searchParams.set("expirationMonth", String(validUntilMonth));
      }
    }

    return url.toString();
  } catch {
    return baseUrl;
  }
}

export function CredentialActions({
  title,
  issuerName,
  issueYear,
  issueMonth,
  validUntilYear,
  validUntilMonth,
  canonicalUrl,
  badgeUrl,
  evidenceUrl,
  isVerifiedRecipient,
}: CredentialActionsProps) {
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
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
        validUntilYear,
        validUntilMonth,
        canonicalUrl,
      }),
    [
      canonicalUrl,
      issueMonth,
      issueYear,
      issuerName,
      linkedInBaseUrl,
      title,
      validUntilMonth,
      validUntilYear,
    ],
  );

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
                onClick={() => window.open(linkedInOpenUrl, "_blank", "noopener,noreferrer")}
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

    </>
  );
}
