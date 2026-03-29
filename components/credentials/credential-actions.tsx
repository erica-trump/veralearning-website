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
      className={`credential-button flex min-h-[48px] items-center justify-center gap-2 rounded-[14px] px-5 py-3 text-[14px] font-semibold ${className}`}
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
    <div className="credential-card rounded-[22px] bg-[#FCFBF8] p-6 shadow-[0_12px_32px_rgba(13,43,69,0.06)] credential-enter [animation-delay:300ms]">
      <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7A8A96]">
        Share &amp; Save
      </div>

      <div className="flex flex-col gap-3">
        {isVerifiedRecipient && (
          <>
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
              className="bg-[#3D8F8F] text-white shadow-[0_10px_24px_rgba(61,143,143,0.18)] hover:bg-[#357C7C]"
            >
              Download Badge PNG
            </ActionLink>

            <ActionLink
              href={evidenceUrl}
              className="bg-[#F4EEE0] text-[#8D6A22] shadow-[0_8px_20px_rgba(184,147,58,0.08)] hover:bg-[#F0E7D3]"
            >
              View Evidence Report
            </ActionLink>
          </>
        )}

        <div className="grid grid-cols-2 gap-3">
          <ActionButton
            type="button"
            onClick={handleCopyLink}
            className="bg-white text-[#3D5166] shadow-[inset_0_0_0_1px_rgba(13,43,69,0.06)] hover:bg-[#F8FBFB]"
          >
            {copied ? "Copied" : "Copy Link"}
          </ActionButton>

          <ActionButton
            type="button"
            onClick={handleVerify}
            className="bg-white text-[#3D5166] shadow-[inset_0_0_0_1px_rgba(13,43,69,0.06)] hover:bg-[#F8FBFB]"
          >
            Verify
          </ActionButton>
        </div>

        {!isVerifiedRecipient && (
          <div className="rounded-[14px] bg-white px-4 py-3 text-[12px] text-[#6B7F8E] shadow-[inset_0_0_0_1px_rgba(13,43,69,0.05)]">
            {isSignedIn
              ? "You're signed in, but recipient-only features are only available to the email this credential was issued to."
              : "LinkedIn, Download and Evidence are only visible to the verified recipient."}
          </div>
        )}
      </div>
    </div>
  );
}
