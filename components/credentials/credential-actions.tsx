"use client";

import { useEffect, useState } from "react";
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
  canonicalUrl: string;
  badgeUrl: string;
  evidenceUrl: string;
  linkedInUrl: string;
  isVerifiedRecipient: boolean;
}

export function CredentialActions({
  canonicalUrl,
  badgeUrl,
  evidenceUrl,
  linkedInUrl,
  isVerifiedRecipient,
}: CredentialActionsProps) {
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

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
    <div className="credential-card rounded-[22px] bg-[#FCFBF8] p-6 shadow-[0_12px_32px_rgba(13,43,69,0.06)] credential-enter [animation-delay:300ms]">
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7A8A96]">
        Share &amp; Verify
      </div>
      <div className="mb-4 text-[12px] leading-5 text-[#6B7F8E]">
        Anyone with this link can independently verify its authenticity.
      </div>

      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ActionButton
            type="button"
            onClick={handleCopyLink}
            className="bg-[#377F7F] text-white shadow-[0_8px_18px_rgba(61,143,143,0.14)] hover:bg-[#316F6F]"
          >
            {copied ? "Copied" : "Copy credential link"}
          </ActionButton>

          <ActionButton
            type="button"
            onClick={handleVerify}
            disabled={isVerifying}
            className="bg-[#F6FBFB] text-[#265F5F] shadow-[inset_0_0_0_1px_rgba(61,143,143,0.18)] hover:bg-[#EEF7F7]"
          >
            {isVerifying ? "Verifying..." : "Verify this credential"}
          </ActionButton>
        </div>

        {isVerifiedRecipient && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <ActionLink
              href={linkedInUrl}
              target="_blank"
              rel="noreferrer"
              className="bg-[#0A66C2] text-white shadow-[0_10px_24px_rgba(10,102,194,0.16)] hover:bg-[#0958a8] focus-visible:shadow-[0_0_0_3px_rgba(10,102,194,0.18),0_12px_28px_rgba(10,102,194,0.2)]"
            >
              Add to LinkedIn
            </ActionLink>

            <ActionLink
              href={badgeUrl}
              target="_blank"
              rel="noreferrer"
              download
              className="bg-white text-[#3D5166] shadow-[inset_0_0_0_1px_rgba(13,43,69,0.06)] hover:bg-[#F8FBFB]"
            >
              Download badge PNG
            </ActionLink>

            <ActionLink
              href={evidenceUrl}
              className="bg-[#F4EEE0] text-[#8D6A22] shadow-[0_8px_20px_rgba(184,147,58,0.08)] hover:bg-[#F0E7D3]"
            >
              View evidence report
            </ActionLink>
          </div>
        )}
      </div>
    </div>
  );
}
