"use client";

import { SignInButton } from "@clerk/nextjs";

interface EvidenceAccessStateProps {
  canonicalUrl: string;
  title: string;
  description: string;
  authEnabled: boolean;
  actionLabel?: string;
}

export function EvidenceAccessState({
  canonicalUrl,
  title,
  description,
  authEnabled,
  actionLabel = "Send me a magic link",
}: EvidenceAccessStateProps) {
  return (
    <div className="mx-auto max-w-[720px] px-5 pb-20 pt-8">
      <div className="rounded-[20px] bg-white p-8 text-center shadow-[0_2px_8px_rgba(0,0,0,0.08),0_12px_32px_rgba(0,0,0,0.06)]">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7A8A96]">
          Evidence Report
        </div>
        <h1 className="font-[family:var(--font-credential-serif)] text-[30px] leading-tight text-[#0D2B45]">
          {title}
        </h1>
        <p className="mx-auto mt-3 max-w-[520px] text-[14px] leading-6 text-[#6B7F8E]">
          {description}
        </p>

        <div className="mt-6">
          {authEnabled ? (
            <SignInButton
              mode="modal"
              forceRedirectUrl={`${canonicalUrl}/evidence`}
              fallbackRedirectUrl={`${canonicalUrl}/evidence`}
            >
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-[10px] bg-[#0D2B45] px-6 py-3 text-[14px] font-semibold text-white transition hover:-translate-y-px hover:bg-[#1A4060]"
              >
                {actionLabel}
              </button>
            </SignInButton>
          ) : (
            <div className="inline-flex rounded-[10px] bg-[#0D2B45] px-6 py-3 text-[14px] font-semibold text-white/80">
              Clerk is not configured yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
