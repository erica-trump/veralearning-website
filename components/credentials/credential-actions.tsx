"use client";

import { useState } from "react";

function ActionButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  className: string;
}) {
  return (
    <button
      className={`flex items-center justify-center gap-2 rounded-[12px] px-5 py-3.5 text-[14px] font-semibold transition-all ${className}`}
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
      className={`flex items-center justify-center gap-2 rounded-[12px] px-5 py-3.5 text-[14px] font-semibold transition-all ${className}`}
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
  isSignedIn: boolean;
}

export function CredentialActions({
  canonicalUrl,
  badgeUrl,
  evidenceUrl,
  linkedInUrl,
  isVerifiedRecipient,
  isSignedIn,
}: CredentialActionsProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopyLink() {
    await navigator.clipboard.writeText(canonicalUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  function handleVerify() {
    document.getElementById("credential-verification")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <div className="rounded-[20px] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)]">
      <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7A8A96]">
        Share &amp; Save
      </div>

      <div className="flex flex-col gap-2.5">
        {isVerifiedRecipient && (
          <>
            <ActionLink
              href={linkedInUrl}
              target="_blank"
              rel="noreferrer"
              className="bg-[#0A66C2] text-white hover:-translate-y-px hover:bg-[#0958a8] hover:shadow-[0_4px_16px_rgba(10,102,194,0.25)]"
            >
              Add to LinkedIn
            </ActionLink>

            <ActionLink
              href={badgeUrl}
              target="_blank"
              rel="noreferrer"
              download
              className="bg-[#3D8F8F] text-white hover:-translate-y-px hover:bg-[#2E7070]"
            >
              Download Badge PNG
            </ActionLink>

            <ActionLink
              href={evidenceUrl}
              className="border border-[#B8933A]/20 bg-[#FDF6E8] text-[#B8933A] hover:-translate-y-px hover:bg-[#FAEFD4]"
            >
              View Evidence Report
            </ActionLink>
          </>
        )}

        <div className="grid grid-cols-2 gap-2.5">
          <ActionButton
            type="button"
            onClick={handleCopyLink}
            className="border border-[#E2E0DB] bg-[#F7F6F3] text-[#3D5166] hover:-translate-y-px hover:bg-[#E2E0DB]"
          >
            {copied ? "Copied" : "Copy Link"}
          </ActionButton>

          <ActionButton
            type="button"
            onClick={handleVerify}
            className="border border-[#E2E0DB] bg-[#F7F6F3] text-[#3D5166] hover:-translate-y-px hover:bg-[#E2E0DB]"
          >
            Verify
          </ActionButton>
        </div>

        {!isVerifiedRecipient && (
          <div className="rounded-[8px] border border-[#E2E0DB] bg-[#F7F6F3] px-3.5 py-2.5 text-[12px] text-[#7A8A96]">
            {isSignedIn
              ? "You're signed in, but recipient-only features are only available to the email this credential was issued to."
              : "LinkedIn, Download and Evidence are only visible to the verified recipient."}
          </div>
        )}
      </div>
    </div>
  );
}
