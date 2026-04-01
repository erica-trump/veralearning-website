"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { VerificationUiResult } from "@/lib/verify-credential";

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

function getSignatureLabel(proofLabel: string) {
  if (/eddsa|ed25519/i.test(proofLabel)) {
    return "EdDSA / Ed25519";
  }

  return proofLabel;
}

function getSuiteLabel(proofLabel: string, proofTags: string[]) {
  const suiteTag = proofTags.find((tag) => /rdfc|2022|data integrity/i.test(tag));

  if (suiteTag) {
    return suiteTag;
  }

  if (/eddsa|ed25519/i.test(proofLabel)) {
    return "eddsa-rdfc-2022";
  }

  return "Data Integrity Proof";
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
    <button
      type="button"
      onClick={() => openVerificationDetails()}
      className={className}
    >
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
  const [result, setResult] = useState<VerificationUiResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const signatureLabel = useMemo(() => getSignatureLabel(proofLabel), [proofLabel]);
  const suiteLabel = useMemo(
    () => getSuiteLabel(proofLabel, proofTags),
    [proofLabel, proofTags],
  );

  useEffect(() => {
    function handleOpen() {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      setIsOpen(true);
    }

    window.addEventListener(OPEN_VERIFICATION_EVENT, handleOpen);

    return () => {
      window.removeEventListener(OPEN_VERIFICATION_EVENT, handleOpen);
    };
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
      window.dispatchEvent(
        new CustomEvent(VERIFICATION_REQUEST_STATE_EVENT, {
          detail: { state: "verifying" },
        }),
      );

      try {
        const response = await fetch(`/api/credentials/${pageId}/verify`, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });
        const payload = (await response.json()) as VerificationUiResult | {
          error?: { code?: string; message?: string };
        };

        if (cancelled) {
          return;
        }

        if ("verified" in payload) {
          setResult(payload);
          return;
        }

        setResult({
          verified: false,
          status: "unverifiable",
          checks: {
            issuerResolved: false,
            controllerResolved: false,
            assertionMethodAuthorized: false,
            integrityValid: false,
            signatureValid: false,
            proofFormatSupported: false,
            statusChecked: false,
            statusValid: false,
          },
          credentialSummary: {
            issuerName,
            standard: "Open Badges 3.0",
            proofType: proofLabel,
            cryptosuite: null,
            verificationMethod: null,
            issued: issueDateLabel,
            validUntil: validUntilLabel,
          },
          error: {
            code: payload.error?.code ?? "verification_request_failed",
            message:
              payload.error?.message ??
              "The verification request could not be completed.",
          },
        });
      } catch (error) {
        if (cancelled || (error instanceof Error && error.name === "AbortError")) {
          return;
        }

        setResult({
          verified: false,
          status: "unverifiable",
          checks: {
            issuerResolved: false,
            controllerResolved: false,
            assertionMethodAuthorized: false,
            integrityValid: false,
            signatureValid: false,
            proofFormatSupported: false,
            statusChecked: false,
            statusValid: false,
          },
          credentialSummary: {
            issuerName,
            standard: "Open Badges 3.0",
            proofType: proofLabel,
            cryptosuite: null,
            verificationMethod: null,
            issued: issueDateLabel,
            validUntil: validUntilLabel,
          },
          error: {
            code: "verification_request_failed",
            message:
              error instanceof Error
                ? error.message
                : "The verification request could not be completed.",
          },
        });
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
  }, [
    isOpen,
    issueDateLabel,
    issuerName,
    pageId,
    proofLabel,
    validUntilLabel,
  ]);

  const activeSummary = result?.credentialSummary ?? {
    issuerName,
    standard: "Open Badges 3.0",
    proofType: proofLabel,
    cryptosuite: null,
    verificationMethod: null,
    issued: issueDateLabel,
    validUntil: validUntilLabel,
  };
  const isNotYetValid = result?.error?.code === "credential_not_yet_valid";
  const isExpired = result?.error?.code === "credential_expired";
  const isRevoked = result?.error?.code === "credential_revoked";
  const verdictTitle = isVerifying
    ? "Verifying Credential"
    : result?.status === "verified"
      ? "Verified Credential"
      : isRevoked
        ? "Credential revoked"
      : isNotYetValid
        ? "Credential not yet valid"
        : isExpired
          ? "Credential expired"
        : result?.status === "failed"
          ? "Verification failed"
          : result?.status === "unverifiable"
          ? "Unable to verify"
          : "Verification Details";
  const verdictSummary = isVerifying
    ? "Checking the credential proof, issuer record, and verification method."
    : result?.status === "verified"
      ? "This credential is authentic and currently active."
      : isRevoked
        ? "This credential is authentic, but has been revoked by the issuer (VeraLearning)."
      : isNotYetValid
        ? "This credential's proof is valid, but the credential has not yet become valid."
        : isExpired
          ? "This credential's proof is valid, but the credential has expired."
      : result?.status === "failed"
        ? "Verification was attempted, but this credential's cryptographic proof did not validate."
        : result?.status === "unverifiable"
          ? "Unable to verify — required issuer or verification material could not be resolved."
          : "Open the verifier to inspect this credential's proof record.";
  const verdictSupport = isVerifying
    ? "Verification runs server-side using the credential's embedded proof."
    : result?.status === "verified"
      ? ""
      : isRevoked
        ? ""
      : isNotYetValid
        ? "The signature is valid, but the credential's validity window has not started yet."
        : isExpired
          ? "The signature is valid, but the credential is past its validity window."
      : result?.status === "failed"
        ? "The proof was processed, but signature or authorization checks did not pass."
      : result?.status === "unverifiable"
          ? "This usually means required issuer, key, context, or proof material was unavailable or unsupported."
          : result?.error?.message ?? "Verification results will appear here once the proof has been checked.";
  const integrityState = !result || isVerifying
    ? "unknown"
    : result.status === "unverifiable"
      ? "unknown"
      : result.checks.integrityValid
        ? "success"
        : "failure";
  const signatureState = !result || isVerifying
    ? "unknown"
    : result.status === "unverifiable"
      ? "unknown"
      : result.checks.signatureValid && result.checks.assertionMethodAuthorized
        ? "success"
        : "failure";
  const issuerState = !result || isVerifying
    ? "unknown"
    : result.checks.issuerResolved && result.checks.controllerResolved
      ? "success"
      : "unknown";
  const temporalValidityState = !result || isVerifying
    ? "unknown"
    : isRevoked || isNotYetValid || isExpired
      ? "failure"
      : result.status === "verified"
        ? "success"
        : "unknown";
  const checklistItems = [
    {
      successLabel: "Issuer verified",
      failureLabel: "Issuer unresolved",
      unknownLabel: "Issuer unresolved",
      state: issuerState,
    },
    {
      successLabel: "Integrity confirmed",
      failureLabel: "Integrity failed",
      unknownLabel: "Integrity not evaluated",
      state: integrityState,
    },
    {
      successLabel: "Signature valid",
      failureLabel: "Signature invalid",
      unknownLabel: "Signature not evaluated",
      state: signatureState,
    },
  ];
  const temporalValidityItem = {
    successLabel: "Credential active",
    failureLabel: isRevoked ? "Revoked by issuer" : isNotYetValid ? "Not yet valid" : "Expired",
    unknownLabel: "Validity not evaluated",
    state: temporalValidityState,
  };
  const isVerified = result?.status === "verified";
  const isRevokedState = isRevoked;
  const hasFailureState = !isVerifying && result?.status != null && result.status !== "verified";
  const modalBackgroundClass = isVerifying
    ? "bg-[#F5F5F4]"
    : isVerified
      ? "bg-[#F2F8F4]"
      : isRevokedState
        ? "bg-[#FAF4EC]"
      : hasFailureState
        ? "bg-[#FFF8F0]"
        : "bg-[#FCFBF8]";
  const headerBackgroundClass = isVerifying
    ? "bg-[#F5F5F4]/95"
    : isVerified
      ? "bg-[#F2F8F4]/95"
      : isRevokedState
        ? "bg-[#FAF4EC]/95"
      : hasFailureState
        ? "bg-[#FFF8F0]/95"
        : "bg-[#FCFBF8]/95";
  const headerTextClass = isVerifying
    ? "text-[#6B7280]"
    : isVerified
      ? "text-[#245E4F]"
      : isRevokedState
        ? "text-[#9A4D16]"
      : hasFailureState
        ? "text-[#92400E]"
        : "text-[#0D2B45]";
  const summaryTextClass = isVerified ? "text-[#243B53]" : "text-[#243B53]";
  const supportTextClass = isVerifying
    ? "text-[#6B7280]"
    : isVerified
      ? "text-[#3E7A63]"
      : isRevokedState
        ? "text-[#6F6256]"
        : "text-[#627287]";
  const infoCardClass =
    "rounded-[18px] bg-[#FCFCFB] px-5 py-3 shadow-[inset_0_0_0_1px_#E8ECEA]";
  const utilityCardClass =
    "rounded-[20px] bg-[#FCFCFB] px-5 py-5 shadow-[inset_0_0_0_1px_#E8ECEA]";
  const dateLine = validUntilLabel
    ? isRevoked
      ? `Issued ${issueDateLabel} · Previously valid until ${validUntilLabel}`
      : `Issued ${issueDateLabel} · Valid until ${validUntilLabel}`
    : `Issued ${issueDateLabel}`;

  const trigger = (
    <button
      type="button"
      onClick={() => {
        previousFocusRef.current = document.activeElement as HTMLElement | null;
        setIsOpen(true);
      }}
      className="credential-button credential-link inline-flex max-w-full items-start justify-center gap-2 text-left text-[15px] font-medium tracking-[0.01em] text-[#2A6F59]"
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="mt-[2px] shrink-0"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
      <span>Cryptographically signed · Independently verifiable</span>
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
        className={`credential-enter flex max-h-[90vh] w-full max-w-[900px] flex-col overflow-hidden rounded-[26px] ${modalBackgroundClass} text-left shadow-[0_28px_70px_rgba(13,43,69,0.18)]`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={`sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#E8E4DC] ${headerBackgroundClass} px-6 pb-5 pt-6 backdrop-blur md:px-7 md:pt-7`}>
          <div>
            <h2
              id="verification-details-title"
              className={`font-[family:var(--font-credential-serif)] text-[30px] leading-[1.06] ${headerTextClass}`}
            >
              {verdictTitle}
            </h2>
            <p className={`mt-2.5 max-w-[560px] text-[15px] font-medium leading-6 ${summaryTextClass}`}>
              {verdictSummary}
            </p>
            {verdictSupport ? (
              <p className={`mt-1 max-w-[560px] text-[13px] leading-6 ${supportTextClass}`}>
                {verdictSupport}
              </p>
            ) : null}
            <div className="mt-4 rounded-[16px] bg-[#FCFCFB] px-4 py-3 shadow-[inset_0_0_0_1px_#E8ECEA]">
              <div className="text-[16px] font-semibold leading-6 text-[#243B53]">{recipientName}</div>
              <div className="mt-0.5 text-[14px] font-medium leading-6 text-[#243B53]">{credentialTitle}</div>
              <div className={`mt-1 text-[12px] leading-5 ${isRevoked ? "text-[#6F6256]" : "text-[#627287]"}`}>
                {dateLine}
              </div>
            </div>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => setIsOpen(false)}
            className="credential-button inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#3D5166] shadow-[inset_0_0_0_1px_rgba(13,43,69,0.08)] hover:bg-[#F7FAF8]"
            aria-label="Close verification details"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto px-6 pb-6 pt-5 md:px-7 md:pb-7">
          <div className="grid gap-3 md:grid-cols-3">
            {[temporalValidityItem, ...checklistItems].map((item, index) => (
              <div
                key={item.successLabel}
                className="rounded-[18px] bg-[#FCFCFB] px-3.5 py-3"
                style={{
                  boxShadow: `inset 0 0 0 1px ${
                    index === 0
                      ? item.state === "success"
                        ? "#CFE1D7"
                        : item.state === "failure" && isRevokedState
                          ? "#D9B28A"
                          : item.state === "failure"
                            ? "#E7C9A7"
                            : "#E8ECEA"
                      : item.state === "success"
                        ? "#D7E7DD"
                        : item.state === "failure" && isRevokedState
                          ? "#E6D2BF"
                          : "#E8ECEA"
                  }`,
                }}
              >
                <div className="flex items-start gap-2">
                  <div
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                      item.state === "unknown"
                        ? "bg-[#EEF1F3] text-[#7A8A96]"
                        : item.state === "success"
                          ? "bg-[#E4F1EA] text-[#3E7A63]"
                          : isRevokedState
                            ? "bg-[#F7E6DE] text-[#B35C3A]"
                            : "bg-[#F7E5E3] text-[#A04336]"
                    }`}
                  >
                    {item.state === "unknown" ? (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 8v4" />
                        <path d="M12 16h.01" />
                      </svg>
                    ) : item.state === "success" ? (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    ) : (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 6L6 18" />
                        <path d="M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                  <div
                    className={`text-[13px] ${index === 0 ? "font-semibold" : "font-medium"} leading-5 ${
                      index === 0 && item.state === "success"
                        ? "text-[#245E4F]"
                        : index === 0 && item.state === "failure" && isRevokedState
                          ? "text-[#8B4513]"
                          : index === 0 && item.state === "failure"
                            ? "text-[#92400E]"
                            : item.state === "failure" && isRevokedState
                              ? "text-[#7B4E2F]"
                              : "text-[#243B53]"
                    }`}
                  >
                    {item.state === "unknown"
                      ? item.unknownLabel
                      : item.state === "success"
                        ? item.successLabel
                        : item.failureLabel}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {isRevoked ? (
            <div className="mt-3 rounded-[18px] bg-[#FFF4E6] px-4 py-3 text-[13px] leading-6 text-[#6F6256] shadow-[inset_0_0_0_1px_#E7C9A7]">
              Revocation does not mean the credential was fraudulent - it means the issuer has actively withdrawn it.
            </div>
          ) : null}

          <div className="mt-7">
          <h3 className="text-[16px] font-semibold text-[#243B53]">Verification breakdown</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className={infoCardClass}>
              <div className="text-[13px] font-semibold text-[#0D2B45]">Issuer identity</div>
              <p className="mt-2 text-[13px] leading-6 text-[#243B53]">
                {result?.checks.issuerResolved
                  ? `Issued by ${activeSummary.issuerName ?? issuerName}, a verified organization.`
                  : "The issuer record could not be fully resolved during verification."}
              </p>
              <p className={`mt-2 text-[12px] leading-5 ${isRevokedState ? "text-[#6F6256]" : "text-[#627287]"}`}>
                {result?.checks.issuerResolved
                  ? "The issuer identity has been validated as part of the verification process."
                  : "Without the issuer record, the verifier cannot establish trusted signing authority."}
              </p>
            </div>

            <div className={infoCardClass}>
              <div className="text-[13px] font-semibold text-[#0D2B45]">Credential integrity</div>
              <p className="mt-2 text-[13px] leading-6 text-[#243B53]">
                {result?.checks.integrityValid
                  ? "The credential data matches the original issued version."
                  : "The verifier could not confirm that the credential data matches the originally issued version."}
              </p>
              <p className={`mt-2 text-[12px] leading-5 ${isRevokedState ? "text-[#6F6256]" : "text-[#627287]"}`}>
                {result?.checks.integrityValid
                  ? "Any modification would invalidate the proof and be detected immediately."
                  : "Altered payloads or unresolved proof material will cause integrity verification to fail."}
              </p>
            </div>

            <div className={infoCardClass}>
              <div className="text-[13px] font-semibold text-[#0D2B45]">Cryptographic signature</div>
              <p className="mt-2 text-[13px] leading-6 text-[#243B53]">
                {result?.checks.signatureValid
                  ? "A digital signature confirms that this credential is authentic."
                  : "The cryptographic signature could not be validated for this credential."}
              </p>
              <p className={`mt-2 text-[12px] leading-5 ${isRevokedState ? "text-[#6F6256]" : "text-[#627287]"}`}>
                {result?.checks.signatureValid
                  ? "This signature ensures the credential cannot be forged or modified."
                  : "This can happen if the proof is invalid, unsupported, or the verification material cannot be resolved."}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-[#F6FBFB] px-3 py-[0.3rem] text-[10px] font-medium text-[#2E7070] shadow-[inset_0_0_0_1px_rgba(61,143,143,0.1)]">
                  Signature type: {activeSummary.proofType ?? signatureLabel}
                </span>
                <span className="rounded-full bg-[#F6FBFB] px-3 py-[0.3rem] text-[10px] font-medium text-[#2E7070] shadow-[inset_0_0_0_1px_rgba(61,143,143,0.1)]">
                  Suite: {activeSummary.cryptosuite ?? suiteLabel}
                </span>
              </div>
            </div>

            <div className={infoCardClass}>
              <div className="text-[13px] font-semibold text-[#0D2B45]">Embedded credential data</div>
              <p className="mt-2 text-[13px] leading-6 text-[#243B53]">
                The badge image contains the credential data needed for independent validation.
              </p>
            </div>
          </div>
        </div>

        <div className={`mt-7 ${utilityCardClass}`}>
          <h3 className="text-[14px] font-semibold text-[#0D2B45]">What this means</h3>
          <p className="mt-3 max-w-[620px] text-[13px] leading-6 text-[#243B53]">
            This credential follows the Open Badges 3.0 standard and includes cryptographic proof of authenticity.
            Unlike a traditional certificate or PDF, this credential can be independently verified by anyone and
            cannot be altered without detection.
          </p>
          <p className="mt-3 max-w-[620px] text-[13px] leading-6 text-[#243B53]">
            This allows employers, schools, and other organizations to trust it without relying on VeraLearning
            directly.
          </p>
          <a
            href="https://www.w3.org/TR/vc-data-model-2.0/"
            target="_blank"
            rel="noreferrer"
            className="credential-link mt-4 inline-flex text-[12px] font-medium text-[#2E7070]"
          >
            Learn more about verifiable credentials
          </a>
        </div>

        <details className="mt-7 rounded-[18px] bg-[#FCFCFB] px-5 py-4 shadow-[inset_0_0_0_1px_#E8ECEA]">
          <summary className="cursor-pointer list-none text-[13px] font-semibold text-[#0D2B45]">
            <span className="inline-flex items-center gap-2">
              View technical details
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </span>
          </summary>
          <div className="mt-4 space-y-3">
            {[
              ["Credential ID", credentialId],
              ["Standard", activeSummary.standard ?? "Open Badges 3.0"],
              ["Proof type", activeSummary.proofType ?? proofLabel],
              ["Signature suite", activeSummary.cryptosuite ?? suiteLabel],
              ["Verification key (public)", activeSummary.verificationMethod ?? "Unavailable"],
              ["Issued date", activeSummary.issued ?? issueDateLabel],
              ["Valid until", activeSummary.validUntil ?? "Not specified"],
              ["Issuer name", activeSummary.issuerName ?? issuerName],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex flex-col items-start gap-2 border-b border-[#E2E0DB]/22 py-[1.1rem] last:border-b-0 last:pb-0 sm:flex-row sm:justify-between sm:gap-4"
              >
                <div className="text-[12px] font-medium text-[#7A8A96]">{label}</div>
                <div className="w-full break-words text-left text-[12px] leading-5 text-[#30475C] sm:max-w-[60%] sm:text-right">
                  {value}
                </div>
              </div>
            ))}
          </div>
        </details>
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
