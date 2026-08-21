"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  parseWebsiteVerificationPayload,
  type BrowserSafeVerificationResult,
  type NullableBoolean,
  type WebsiteVerificationError,
  type WebsiteVerificationPayload,
} from "@/lib/vera-credentials-contract";
import { verificationStatusCopy } from "@/lib/verification-status-copy";

const OPEN_VERIFICATION_EVENT = "credential:open-verification-details";
export const VERIFICATION_REQUEST_STATE_EVENT =
  "credential:verification-request-state";

interface VerificationDetailsModalProps {
  pageId: string;
  credentialId: string;
  credentialTitle: string;
  recipientName: string;
  issuerName: string;
  proofLabel: string;
  proofTags: string[];
  issueDateLabel: string;
  validUntilLabel: string | null;
}

interface OpenVerificationDetailsButtonProps {
  label: string;
  className: string;
}

type DisplayState = "success" | "failure" | "unknown";

function booleanState(value: NullableBoolean): DisplayState {
  return value === true ? "success" : value === false ? "failure" : "unknown";
}

function safeRequestError(): WebsiteVerificationPayload {
  return {
    kind: "error",
    error: {
      category: "verification_unavailable",
      code: "verification_request_failed",
      message: "Credential verification is unavailable right now.",
    },
  };
}

function verdict(result: BrowserSafeVerificationResult) {
  if (result.profile === "unsupported") {
    return {
      title: "Unsupported credential",
      summary: "This credential profile is not supported.",
    };
  }
  if (result.accepted === true) {
    return {
      title: "Credential accepted",
      summary: "Accepted under VeraCredentials policy.",
    };
  }
  if (result.accepted === false) {
    return {
      title: "Credential not accepted",
      summary: "VeraCredentials completed verification, but the credential was not accepted.",
    };
  }
  return {
    title: "Verification indeterminate",
    summary: "VeraCredentials could not make an acceptance decision.",
  };
}

function fieldCopy({
  value,
  success,
  failure,
  unknown,
}: {
  value: NullableBoolean;
  success: string;
  failure: string;
  unknown: string;
}) {
  return value === true ? success : value === false ? failure : unknown;
}

function ConceptCard({
  title,
  state,
  children,
}: {
  title: string;
  state: DisplayState;
  children: React.ReactNode;
}) {
  const colors =
    state === "success"
      ? "border-[#D7E7DD] bg-[#F6FAF7] text-[#245E4F]"
      : state === "failure"
        ? "border-[#E7C9A7] bg-[#FFF8F0] text-[#92400E]"
        : "border-[#E1E6E8] bg-[#F8FAFB] text-[#566A78]";

  return (
    <div className={`rounded-[18px] border px-4 py-4 ${colors}`}>
      <div className="text-[12px] font-semibold uppercase tracking-[0.08em]">{title}</div>
      <div className="mt-2 text-[13px] leading-6 text-[#30475C]">{children}</div>
    </div>
  );
}

export function openVerificationDetails() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(OPEN_VERIFICATION_EVENT));
  }
}

export function OpenVerificationDetailsButton({
  label,
  className,
}: OpenVerificationDetailsButtonProps) {
  return (
    <button type="button" onClick={openVerificationDetails} className={className}>
      {label}
    </button>
  );
}

export function VerificationDetailsModal({
  pageId,
  credentialId,
  credentialTitle,
  recipientName,
  issuerName,
  proofLabel,
  proofTags,
  issueDateLabel,
  validUntilLabel,
}: VerificationDetailsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [payload, setPayload] = useState<WebsiteVerificationPayload | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    function handleOpen() {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      setIsOpen(true);
    }

    window.addEventListener(OPEN_VERIFICATION_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_VERIFICATION_EVENT, handleOpen);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    window.setTimeout(() => closeButtonRef.current?.focus(), 0);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    async function runVerification() {
      setIsVerifying(true);
      setPayload(null);
      window.dispatchEvent(
        new CustomEvent(VERIFICATION_REQUEST_STATE_EVENT, {
          detail: { state: "verifying" },
        }),
      );

      try {
        const response = await fetch(`/api/credentials/${encodeURIComponent(pageId)}/verify`, {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
          signal: controller.signal,
        });
        const raw: unknown = await response.json();
        const parsed = parseWebsiteVerificationPayload(raw);
        if (!cancelled) {
          setPayload(parsed);
        }
      } catch (error) {
        if (!cancelled && !(error instanceof Error && error.name === "AbortError")) {
          setPayload(safeRequestError());
        }
      } finally {
        if (!cancelled) {
          setIsVerifying(false);
          window.dispatchEvent(
            new CustomEvent(VERIFICATION_REQUEST_STATE_EVENT, {
              detail: { state: "idle" },
            }),
          );
        }
      }
    }

    void runVerification();
    return () => {
      cancelled = true;
      controller.abort();
      window.dispatchEvent(
        new CustomEvent(VERIFICATION_REQUEST_STATE_EVENT, {
          detail: { state: "idle" },
        }),
      );
    };
  }, [isOpen, pageId]);

  const result = payload?.kind === "result" ? payload.result : null;
  const requestError: WebsiteVerificationError | null =
    payload?.kind === "error" ? payload.error : null;
  const activeVerdict = result
    ? verdict(result)
    : requestError
      ? {
          title:
            requestError.category === "artifact_invalid"
              ? "Credential artifact invalid"
              : requestError.category === "artifact_unavailable"
                ? "Credential artifact unavailable"
                : "Verification unavailable",
          summary: requestError.message,
        }
      : {
          title: isVerifying ? "Checking verification" : "Verification details",
          summary: isVerifying
            ? "VeraCredentials is evaluating the credential."
            : "Open verification to evaluate this credential.",
        };

  const trigger = (
    <button
      type="button"
      onClick={() => {
        previousFocusRef.current = document.activeElement as HTMLElement | null;
        setIsOpen(true);
      }}
      className="credential-button credential-link mx-auto inline-flex w-fit max-w-full items-center justify-center gap-2 text-[15px] font-medium tracking-[0.01em] text-[#2A6F59]"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
      <span>Check verification</span>
    </button>
  );

  if (!isOpen || typeof document === "undefined") {
    return trigger;
  }

  const modal = (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(13,43,69,0.42)] p-4 backdrop-blur-[2px]"
      onClick={() => setIsOpen(false)}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="verification-details-title"
        className="credential-enter flex max-h-[90vh] w-full max-w-[900px] flex-col overflow-hidden rounded-[26px] bg-[#FCFBF8] text-left shadow-[0_28px_70px_rgba(13,43,69,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#E8E4DC] bg-[#FCFBF8]/95 px-6 pb-5 pt-6 backdrop-blur md:px-7 md:pt-7">
          <div>
            <h2
              id="verification-details-title"
              className="font-[family:var(--font-credential-serif)] text-[30px] leading-[1.06] text-[#0D2B45]"
            >
              {activeVerdict.title}
            </h2>
            <p className="mt-2.5 max-w-[620px] text-[15px] font-medium leading-6 text-[#30475C]">
              {activeVerdict.summary}
            </p>
            {result ? (
              <p className="mt-1 max-w-[620px] text-[13px] leading-6 text-[#627287]">
                {verificationStatusCopy(result)}
              </p>
            ) : null}
            <div className="mt-4 rounded-[16px] bg-white px-4 py-3 shadow-[inset_0_0_0_1px_#E8ECEA]">
              <div className="text-[16px] font-semibold text-[#243B53]">{recipientName}</div>
              <div className="mt-0.5 text-[14px] font-medium text-[#243B53]">{credentialTitle}</div>
              <div className="mt-1 text-[12px] text-[#627287]">
                Issued {issueDateLabel}
                {validUntilLabel ? ` · Valid until ${validUntilLabel}` : ""}
              </div>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => setIsOpen(false)}
            className="credential-button inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#3D5166] shadow-[inset_0_0_0_1px_rgba(13,43,69,0.08)]"
            aria-label="Close verification details"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto px-6 pb-6 pt-5 md:px-7 md:pb-7">
          {isVerifying ? (
            <div className="rounded-[18px] border border-[#E1E6E8] bg-[#F8FAFB] px-5 py-5 text-[14px] text-[#566A78]">
              Checking the embedded credential with VeraCredentials…
            </div>
          ) : null}

          {result ? (
            <>
              <div className="grid gap-3 md:grid-cols-2">
                <ConceptCard title="Credential proof" state={booleanState(result.credentialProofVerified)}>
                  {fieldCopy({
                    value: result.credentialProofVerified,
                    success: "Cryptographic proof verified.",
                    failure: "Cryptographic proof did not verify.",
                    unknown: "Cryptographic proof was not evaluated.",
                  })}
                </ConceptCard>
                <ConceptCard title="Issuer trust" state={booleanState(result.issuerTrusted)}>
                  {fieldCopy({
                    value: result.issuerTrusted,
                    success: "Issuer trusted under this verification profile.",
                    failure: "Issuer not trusted under this verification profile.",
                    unknown: "Issuer trust is indeterminate.",
                  })}
                </ConceptCard>
                <ConceptCard title="Validity period" state={booleanState(result.temporallyValid)}>
                  {fieldCopy({
                    value: result.temporallyValid,
                    success: "The credential is within its validity period.",
                    failure: "The credential is outside its validity period.",
                    unknown: "The validity period was not evaluated.",
                  })}
                </ConceptCard>
                <ConceptCard
                  title="Credential status"
                  state={
                    result.status.state === "active"
                      ? "success"
                      : result.status.state === "revoked"
                        ? "failure"
                        : "unknown"
                  }
                >
                  {verificationStatusCopy(result)}
                </ConceptCard>
                <ConceptCard title="Policy acceptance" state={booleanState(result.accepted)}>
                  {fieldCopy({
                    value: result.accepted,
                    success: "Accepted under VeraCredentials policy.",
                    failure: "Not accepted under VeraCredentials policy.",
                    unknown: "No policy acceptance decision was made.",
                  })}
                </ConceptCard>
                <ConceptCard title="Holder control" state="unknown">
                  Holder control was not evaluated. Sign-in and recipient association are not cryptographic holder proof.
                </ConceptCard>
              </div>

              <details className="mt-7 rounded-[18px] bg-white px-5 py-4 shadow-[inset_0_0_0_1px_#E8ECEA]">
                <summary className="cursor-pointer list-none text-[13px] font-semibold text-[#0D2B45]">
                  View technical details
                </summary>
                <div className="mt-4 space-y-3">
                  {[
                    ["Credential ID", credentialId],
                    ["Profile", result.profile],
                    ["Outcome", result.outcome],
                    ["Intrinsic verified", String(result.verified)],
                    ["Issuer trusted", String(result.trusted)],
                    ["Accepted", String(result.accepted)],
                    ["Status code", result.status.code],
                    ["Status trust mode", result.statusTrustMode],
                    ["Status object authenticated", String(result.statusObjectAuthenticated)],
                    ["Status evidence pinned", String(result.statusEvidencePinned)],
                    ["Holder proven", "Not evaluated"],
                    ["Declared proof metadata", proofLabel],
                    ["Issuer metadata", issuerName],
                    ["Reason codes", result.reasonCodes.join(", ") || "None"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex flex-col gap-1 border-b border-[#E2E0DB]/40 py-2.5 last:border-b-0 sm:flex-row sm:justify-between sm:gap-4"
                    >
                      <div className="text-[12px] font-medium text-[#7A8A96]">{label}</div>
                      <div className="break-words text-[12px] leading-5 text-[#30475C] sm:max-w-[62%] sm:text-right">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </details>

              <div className="mt-5 flex flex-wrap gap-1.5">
                {proofTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[#F6FBFB] px-3 py-1 text-[10px] font-medium text-[#2E7070] shadow-[inset_0_0_0_1px_rgba(61,143,143,0.1)]"
                  >
                    Declared metadata: {tag}
                  </span>
                ))}
              </div>
            </>
          ) : null}

          {requestError ? (
            <div className="rounded-[18px] border border-[#E7C9A7] bg-[#FFF8F0] px-5 py-4 text-[13px] leading-6 text-[#6F6256]">
              No local cryptographic fallback was attempted. Try again later.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {trigger}
      {createPortal(modal, document.body)}
    </>
  );
}
