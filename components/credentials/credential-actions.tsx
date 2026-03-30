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
              <ActionLink
                href={linkedInUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-[#F6FBFB] text-[#265F5F] shadow-[inset_0_0_0_1px_rgba(61,143,143,0.18)] hover:bg-[#EEF7F7]"
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
  );
}
