export const VERIFICATION_PROFILES = [
  "vera_current_vc2_ob3",
  "vera_historical_cnc_canary_v1",
  "unsupported",
] as const;

export type VerificationProfile = (typeof VERIFICATION_PROFILES)[number];
export type NullableBoolean = boolean | null;
export type VerificationOutcome = "accepted" | "rejected" | "indeterminate";
export type CredentialStatusState = "active" | "revoked" | "absent" | "indeterminate";
export type StatusTrustMode =
  | "not_applicable"
  | "issuer_signed"
  | "not_evaluated"
  | "pinned_historical_unsigned";

const STATUS_CODES = [
  "STATUS_NOT_EVALUATED",
  "STATUS_ABSENT",
  "STATUS_ACTIVE",
  "STATUS_REVOKED",
  "STATUS_RETRIEVAL_ERROR",
  "STATUS_CREDENTIAL_PROOF_ERROR",
  "STATUS_CREDENTIAL_TRUST_ERROR",
  "STATUS_LIST_NOT_YET_VALID",
  "STATUS_PURPOSE_MISMATCH",
  "STATUS_LIST_MALFORMED",
  "STATUS_LIST_LENGTH_ERROR",
  "STATUS_INDEX_RANGE_ERROR",
  "STATUS_METHOD_UNSUPPORTED",
] as const;

const REASON_CODES = new Set([
  "invalid_document",
  "credential_contract_invalid",
  "jsonld_processing_failed",
  "issuer_key_unauthorized",
  "proof_invalid",
  "credential_expired",
  "credential_not_yet_valid",
  "temporal_validation_failed",
  "credential_revoked",
  "issuer_untrusted",
  "issuer_trust_indeterminate",
  "unsupported_profile",
  "historical_artifact_mismatch",
  "historical_status_evidence_invalid",
  "status_retrieval_error",
  "status_credential_proof_error",
  "status_credential_trust_error",
  "status_list_not_yet_valid",
  "status_purpose_mismatch",
  "status_list_malformed",
  "status_list_length_error",
  "status_index_range_error",
]);

const CHECK_NAMES = [
  "documentParsing",
  "structuralConformance",
  "jsonLdProcessing",
  "verificationMethodResolution",
  "proofVerification",
  "temporalValidity",
  "statusListVerification",
  "revocation",
  "issuerTrust",
  "businessPolicy",
] as const;

const CHECK_STATUSES = new Set([
  "passed",
  "failed",
  "not_performed",
  "not_applicable",
  "indeterminate",
]);
const PROFILE_SET = new Set<string>(VERIFICATION_PROFILES);
const STATUS_CODE_SET = new Set<string>(STATUS_CODES);
const OUTCOME_SET = new Set(["accepted", "rejected", "indeterminate"]);
const STATUS_STATE_SET = new Set(["active", "revoked", "absent", "indeterminate"]);
const STATUS_TRUST_MODE_SET = new Set([
  "not_applicable",
  "issuer_signed",
  "not_evaluated",
  "pinned_historical_unsigned",
]);

type CheckName = (typeof CHECK_NAMES)[number];
type CheckStatus = "passed" | "failed" | "not_performed" | "not_applicable" | "indeterminate";
type ParsedCheck = {
  status: CheckStatus;
  source: Record<string, unknown>;
};
type ParsedChecks = Record<CheckName, ParsedCheck>;

export interface BrowserSafeCredentialStatus {
  state: CredentialStatusState;
  code: (typeof STATUS_CODES)[number];
  reason: string;
  purpose: "revocation" | null;
  valid: NullableBoolean;
}

export interface BrowserSafeVerificationResult {
  profile: VerificationProfile;
  success: true;
  verified: NullableBoolean;
  trusted: NullableBoolean;
  accepted: NullableBoolean;
  credentialProofVerified: NullableBoolean;
  issuerKeyAuthorized: NullableBoolean;
  issuerTrusted: NullableBoolean;
  temporallyValid: NullableBoolean;
  statusType: string | null;
  statusObjectAuthenticated: NullableBoolean;
  statusEvidencePinned: boolean;
  statusTrustMode: StatusTrustMode;
  reasonCodes: string[];
  holderProven: null;
  outcome: VerificationOutcome;
  status: BrowserSafeCredentialStatus;
}

export type WebsiteVerificationErrorCategory =
  | "artifact_invalid"
  | "artifact_unavailable"
  | "verification_unavailable";

export interface WebsiteVerificationError {
  category: WebsiteVerificationErrorCategory;
  code: string;
  message: string;
}

export type WebsiteVerificationPayload =
  | { kind: "result"; result: BrowserSafeVerificationResult }
  | { kind: "error"; error: WebsiteVerificationError };

export class VeraCredentialsContractError extends Error {
  constructor(message = "VeraCredentials response does not match the expected contract.") {
    super(message);
    this.name = "VeraCredentialsContractError";
  }
}

function plainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function fail(message: string): never {
  throw new VeraCredentialsContractError(message);
}

function nullableBoolean(value: unknown, field: string): NullableBoolean {
  if (value === null || typeof value === "boolean") {
    return value;
  }
  return fail(`${field} must be boolean or null.`);
}

function boundedString(value: unknown, field: string, maximumLength: number) {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.length > maximumLength
  ) {
    return fail(`${field} is not a bounded non-empty string.`);
  }
  return value;
}

function parseStatus(value: unknown): BrowserSafeCredentialStatus {
  if (!plainObject(value)) {
    return fail("status must be an object.");
  }

  const state = boundedString(value.state, "status.state", 32);
  const code = boundedString(value.code, "status.code", 64);
  const reason = boundedString(value.reason, "status.reason", 512);
  const purpose = value.purpose;
  const valid = nullableBoolean(value.valid, "status.valid");

  if (!STATUS_STATE_SET.has(state)) {
    return fail("status.state is unsupported.");
  }
  if (!STATUS_CODE_SET.has(code)) {
    return fail("status.code is unsupported.");
  }
  if (purpose !== null && purpose !== "revocation") {
    return fail("status.purpose is unsupported.");
  }

  if (
    (state === "active" && (code !== "STATUS_ACTIVE" || valid !== true)) ||
    (state === "revoked" && (code !== "STATUS_REVOKED" || valid !== false)) ||
    (state === "absent" &&
      (code !== "STATUS_ABSENT" || valid !== null || purpose !== null)) ||
    (state === "indeterminate" &&
      (code === "STATUS_ACTIVE" || code === "STATUS_REVOKED" || code === "STATUS_ABSENT" || valid !== null))
  ) {
    return fail("status fields are internally inconsistent.");
  }

  return {
    state: state as CredentialStatusState,
    code: code as BrowserSafeCredentialStatus["code"],
    reason,
    purpose,
    valid,
  };
}

function validateChecks(value: unknown): ParsedChecks {
  if (!plainObject(value)) {
    return fail("checks must be an object.");
  }

  const unknownNames = Object.keys(value).filter(
    name => !CHECK_NAMES.includes(name as CheckName),
  );
  if (unknownNames.length > 0 || Object.keys(value).length !== CHECK_NAMES.length) {
    return fail("checks must contain exactly the ten authoritative checks.");
  }

  const parsed = {} as ParsedChecks;

  for (const name of CHECK_NAMES) {
    const check = value[name];
    if (
      !plainObject(check) ||
      typeof check.status !== "string" ||
      !CHECK_STATUSES.has(check.status)
    ) {
      return fail(`checks.${name}.status is invalid.`);
    }
    parsed[name] = {
      status: check.status as CheckStatus,
      source: check,
    };
  }

  return parsed;
}

function parseReasonCodes(value: unknown) {
  if (!Array.isArray(value) || value.length > 16) {
    return fail("reasonCodes must be a bounded array.");
  }

  return value.map((entry, index) => {
    const code = boundedString(entry, `reasonCodes[${index}]`, 128);
    if (!REASON_CODES.has(code)) {
      return fail(`reasonCodes[${index}] is unsupported.`);
    }
    return code;
  });
}

function validateOutcome(accepted: NullableBoolean, outcome: VerificationOutcome) {
  if (
    (outcome === "accepted" && accepted !== true) ||
    (outcome === "rejected" && accepted !== false) ||
    (outcome === "indeterminate" && accepted !== null)
  ) {
    fail("accepted and outcome are internally inconsistent.");
  }
}

function checkBoolean(check: ParsedCheck): NullableBoolean {
  return check.status === "passed" ? true : check.status === "failed" ? false : null;
}

function requireCheckStatus(
  checks: ParsedChecks,
  name: CheckName,
  ...allowed: CheckStatus[]
) {
  if (!allowed.includes(checks[name].status)) {
    fail(`checks.${name}.status is inconsistent with the authoritative result.`);
  }
}

function sameReasonCodes(actual: string[], expected: string[]) {
  return actual.length === expected.length &&
    actual.every((code, index) => code === expected[index]);
}

function expectedReasonCodes(
  result: BrowserSafeVerificationResult,
  checks: ParsedChecks,
) {
  if (result.profile === "unsupported") {
    return ["unsupported_profile"];
  }

  if (result.profile === "vera_current_vc2_ob3") {
    if (checks.structuralConformance.status === "failed") {
      return ["credential_contract_invalid"];
    }
    if (checks.jsonLdProcessing.status === "failed") {
      return ["jsonld_processing_failed"];
    }
    if (checks.verificationMethodResolution.status === "failed") {
      return ["issuer_key_unauthorized"];
    }
    if (checks.proofVerification.status === "failed") {
      return ["proof_invalid"];
    }
    if (checks.temporalValidity.status === "failed") {
      const reason = checks.temporalValidity.source.reason;
      if (reason === "Credential has expired.") {
        return ["credential_expired"];
      }
      if (reason === "Credential is not yet valid.") {
        return ["credential_not_yet_valid"];
      }
      return ["temporal_validation_failed"];
    }
    if (result.status.code === "STATUS_REVOKED") {
      return ["credential_revoked"];
    }
    if (result.trusted === false) {
      return ["issuer_untrusted"];
    }
    if (
      result.status.state === "indeterminate" &&
      result.status.code !== "STATUS_NOT_EVALUATED"
    ) {
      return [result.status.code.toLowerCase()];
    }
    return [];
  }

  if (checks.structuralConformance.status === "failed") {
    return ["historical_artifact_mismatch"];
  }
  if (checks.jsonLdProcessing.status === "failed") {
    return ["historical_artifact_mismatch"];
  }
  if (checks.verificationMethodResolution.status === "failed") {
    return ["historical_artifact_mismatch"];
  }
  if (checks.proofVerification.status === "failed") {
    return checks.proofVerification.source.cryptographicVerification === "passed" &&
      checks.proofVerification.source.artifactPin === "failed"
      ? ["historical_artifact_mismatch"]
      : ["proof_invalid"];
  }
  if (checks.temporalValidity.status === "failed") {
    const reason = checks.temporalValidity.source.reason;
    if (reason === "Credential has expired.") {
      return ["credential_expired"];
    }
    if (reason === "Credential is not yet valid.") {
      return ["credential_not_yet_valid"];
    }
    return ["temporal_validation_failed"];
  }
  if (checks.statusListVerification.status === "failed") {
    return ["historical_status_evidence_invalid"];
  }
  if (result.status.code === "STATUS_REVOKED") {
    return ["credential_revoked"];
  }
  if (result.trusted === false) {
    return ["issuer_untrusted"];
  }
  if (result.accepted === null) {
    return ["issuer_trust_indeterminate"];
  }
  return [];
}

function validateExecutionChecks(
  result: BrowserSafeVerificationResult,
  checks: ParsedChecks,
) {
  requireCheckStatus(checks, "documentParsing", "passed");
  requireCheckStatus(checks, "structuralConformance", "passed", "failed");
  requireCheckStatus(checks, "jsonLdProcessing", "passed", "failed", "not_performed");
  requireCheckStatus(checks, "verificationMethodResolution", "passed", "failed", "not_performed");
  requireCheckStatus(checks, "proofVerification", "passed", "failed", "not_performed");
  requireCheckStatus(checks, "temporalValidity", "passed", "failed", "not_performed");
  requireCheckStatus(checks, "issuerTrust", "passed", "failed", "indeterminate", "not_performed");
  requireCheckStatus(checks, "businessPolicy", "passed", "failed", "not_performed");

  const requireNotPerformed = (...names: CheckName[]) => {
    for (const name of names) {
      requireCheckStatus(checks, name, "not_performed");
    }
  };

  if (checks.structuralConformance.status === "failed") {
    requireNotPerformed(
      "jsonLdProcessing",
      "verificationMethodResolution",
      "proofVerification",
      "temporalValidity",
      "statusListVerification",
      "revocation",
      "issuerTrust",
    );
    return;
  }

  if (
    checks.temporalValidity.status === "failed" &&
    checks.jsonLdProcessing.status === "not_performed"
  ) {
    requireNotPerformed(
      "verificationMethodResolution",
      "proofVerification",
      "statusListVerification",
      "revocation",
      "issuerTrust",
    );
    return;
  }

  requireCheckStatus(checks, "jsonLdProcessing", "passed", "failed");
  if (checks.jsonLdProcessing.status === "failed") {
    requireNotPerformed(
      "verificationMethodResolution",
      "proofVerification",
      "temporalValidity",
      "statusListVerification",
      "revocation",
      "issuerTrust",
    );
    return;
  }

  requireCheckStatus(checks, "verificationMethodResolution", "passed", "failed");
  if (checks.verificationMethodResolution.status === "failed") {
    requireNotPerformed(
      "proofVerification",
      "temporalValidity",
      "statusListVerification",
      "revocation",
      "issuerTrust",
    );
    return;
  }

  requireCheckStatus(checks, "proofVerification", "passed", "failed");
  if (checks.proofVerification.status === "failed") {
    requireNotPerformed(
      "temporalValidity",
      "statusListVerification",
      "revocation",
      "issuerTrust",
    );
    return;
  }

  requireCheckStatus(checks, "temporalValidity", "passed", "failed");
  if (checks.temporalValidity.status === "failed") {
    requireNotPerformed("statusListVerification", "revocation", "issuerTrust");
    return;
  }

  requireCheckStatus(checks, "issuerTrust", "passed", "failed", "indeterminate");

  if (result.status.state === "active") {
    requireCheckStatus(checks, "statusListVerification", "passed");
    requireCheckStatus(checks, "revocation", "passed");
  } else if (result.status.state === "revoked") {
    requireCheckStatus(checks, "statusListVerification", "passed");
    requireCheckStatus(checks, "revocation", "failed");
  } else if (result.status.state === "absent") {
    requireCheckStatus(checks, "statusListVerification", "not_applicable");
    requireCheckStatus(checks, "revocation", "not_applicable");
  } else if (result.profile === "vera_historical_cnc_canary_v1") {
    requireCheckStatus(checks, "statusListVerification", "failed");
    requireCheckStatus(checks, "revocation", "not_performed");
  } else if (checks.issuerTrust.status === "passed") {
    requireCheckStatus(checks, "statusListVerification", "indeterminate");
    requireCheckStatus(checks, "revocation", "not_performed");
  } else {
    requireCheckStatus(checks, "statusListVerification", "not_performed");
    requireCheckStatus(checks, "revocation", "not_performed");
  }
}

function validateChecksAgainstSummary(
  result: BrowserSafeVerificationResult,
  checks: ParsedChecks,
) {
  const proofFromCheck = checkBoolean(checks.proofVerification);
  const historicalProofPinFailure =
    result.profile === "vera_historical_cnc_canary_v1" &&
    result.credentialProofVerified === true &&
    checks.proofVerification.status === "failed" &&
    checks.proofVerification.source.cryptographicVerification === "passed" &&
    checks.proofVerification.source.artifactPin === "failed";
  if (
    result.credentialProofVerified !== proofFromCheck &&
    !historicalProofPinFailure
  ) {
    fail("credentialProofVerified contradicts checks.proofVerification.");
  }
  if (result.issuerKeyAuthorized !== checkBoolean(checks.verificationMethodResolution)) {
    fail("issuerKeyAuthorized contradicts checks.verificationMethodResolution.");
  }
  if (result.temporallyValid !== checkBoolean(checks.temporalValidity)) {
    fail("temporallyValid contradicts checks.temporalValidity.");
  }

  const trustFromCheck = checkBoolean(checks.issuerTrust);
  if (result.trusted !== trustFromCheck || result.issuerTrusted !== trustFromCheck) {
    fail("Issuer trust summaries contradict checks.issuerTrust.");
  }

  const policyStatus = checks.businessPolicy.status;
  const policyMatches =
    (policyStatus === "passed" && result.accepted === true && result.outcome === "accepted") ||
    (policyStatus === "failed" && result.accepted === false && result.outcome === "rejected") ||
    (policyStatus === "not_performed" && result.accepted === null && result.outcome === "indeterminate");
  if (!policyMatches) {
    fail("Acceptance decision contradicts checks.businessPolicy.");
  }

  validateExecutionChecks(result, checks);
  const expected = expectedReasonCodes(result, checks);
  if (!sameReasonCodes(result.reasonCodes, expected)) {
    fail("reasonCodes contradict the authoritative checks and result.");
  }
}

function validateDecisionConsistency(result: BrowserSafeVerificationResult) {
  const expectedAccepted =
    result.verified === false || result.trusted === false
      ? false
      : result.verified === true && result.trusted === true
        ? true
        : null;
  if (result.accepted !== expectedAccepted) {
    fail("accepted contradicts the authoritative verification and trust decision.");
  }

  if (
    result.accepted === true &&
    (result.credentialProofVerified !== true ||
      result.issuerKeyAuthorized !== true ||
      result.issuerTrusted !== true ||
      result.temporallyValid !== true)
  ) {
    fail("An accepted result is missing an authoritative prerequisite.");
  }

  if (
    result.verified === true &&
    (result.credentialProofVerified !== true ||
      result.issuerKeyAuthorized !== true ||
      result.temporallyValid !== true)
  ) {
    fail("verified contradicts the authoritative intrinsic summaries.");
  }

  if (
    result.verified === null &&
    (result.profile !== "vera_current_vc2_ob3" ||
      result.status.state !== "indeterminate" ||
      result.credentialProofVerified !== true ||
      result.issuerKeyAuthorized !== true ||
      result.temporallyValid !== true)
  ) {
    fail("Indeterminate verification does not match a current status-evaluation state.");
  }

  if (
    (result.status.state === "active" || result.status.state === "absent") &&
    result.verified !== true
  ) {
    fail("verified contradicts the authoritative active or status-free state.");
  }
  if (result.status.state === "revoked" && result.verified !== false) {
    fail("verified contradicts the authoritative revoked state.");
  }
  if (result.status.state === "indeterminate" && result.profile !== "unsupported") {
    const currentPrerequisitesPassed =
      result.profile === "vera_current_vc2_ob3" &&
      result.credentialProofVerified === true &&
      result.issuerKeyAuthorized === true &&
      result.temporallyValid === true;
    const expectedVerified = currentPrerequisitesPassed ? null : false;
    if (result.verified !== expectedVerified) {
      fail("verified contradicts the authoritative indeterminate status state.");
    }
  }
}

function validateProfileConsistency(result: BrowserSafeVerificationResult) {
  if (result.profile === "vera_historical_cnc_canary_v1") {
    if (
      result.statusType !== "StatusList2021Entry" ||
      result.statusObjectAuthenticated !== false ||
      result.statusTrustMode !== "pinned_historical_unsigned"
    ) {
      fail("Historical verification status trust fields are inconsistent.");
    }

    if (result.status.purpose !== "revocation" || result.status.state === "absent") {
      fail("Historical verification status is inconsistent.");
    }
    if (result.status.state === "indeterminate") {
      if (
        result.status.code !== "STATUS_NOT_EVALUATED" ||
        result.statusEvidencePinned !== false ||
        result.verified !== false ||
        result.accepted !== false
      ) {
        fail("Historical early-failure status is inconsistent.");
      }
    } else if (result.statusEvidencePinned !== true) {
      fail("Evaluated historical status must use pinned evidence.");
    }
    return;
  }

  if (result.statusEvidencePinned !== false) {
    fail("Only the historical canary profile may use pinned status evidence.");
  }

  if (result.profile === "unsupported") {
    if (
      result.statusTrustMode !== "not_evaluated" ||
      result.statusType === null ||
      result.statusType === "BitstringStatusListEntry" ||
      result.statusObjectAuthenticated !== null ||
      result.status.state !== "indeterminate" ||
      result.status.code !== "STATUS_METHOD_UNSUPPORTED" ||
      result.verified !== false ||
      result.trusted !== null ||
      result.accepted !== false ||
      result.outcome !== "rejected" ||
      result.credentialProofVerified !== null ||
      result.issuerKeyAuthorized !== null ||
      result.temporallyValid !== null ||
      !sameReasonCodes(result.reasonCodes, ["unsupported_profile"])
    ) {
      fail("Unsupported-profile result is internally inconsistent.");
    }
    return;
  }

  if (result.statusType !== null && result.statusType !== "BitstringStatusListEntry") {
    fail("Current-profile status type is inconsistent.");
  }

  if (result.status.state === "absent") {
    if (
      result.statusType !== null ||
      result.statusObjectAuthenticated !== null ||
      result.statusEvidencePinned !== false ||
      result.statusTrustMode !== "not_applicable"
    ) {
      fail("Current status-free result is inconsistent.");
    }
    return;
  }

  if (result.status.state === "active" || result.status.state === "revoked") {
    if (
      result.statusType !== "BitstringStatusListEntry" ||
      result.statusObjectAuthenticated !== true ||
      result.statusTrustMode !== "issuer_signed"
    ) {
      fail("Current evaluated status fields are inconsistent.");
    }
    return;
  }

  if (result.statusType === null) {
    if (
      (result.status.code !== "STATUS_NOT_EVALUATED" &&
        result.status.code !== "STATUS_METHOD_UNSUPPORTED") ||
      result.statusObjectAuthenticated !== null ||
      (result.statusTrustMode !== "not_applicable" &&
        result.statusTrustMode !== "issuer_signed") ||
      (result.status.code === "STATUS_METHOD_UNSUPPORTED" &&
        result.statusTrustMode !== "issuer_signed")
    ) {
      fail("Current early-failure status fields are inconsistent.");
    }
    return;
  }

  const authenticatedCodes = new Set([
    "STATUS_ACTIVE",
    "STATUS_REVOKED",
    "STATUS_CREDENTIAL_TRUST_ERROR",
    "STATUS_LIST_NOT_YET_VALID",
    "STATUS_PURPOSE_MISMATCH",
    "STATUS_LIST_LENGTH_ERROR",
    "STATUS_INDEX_RANGE_ERROR",
  ]);
  const unauthenticatedCodes = new Set([
    "STATUS_CREDENTIAL_PROOF_ERROR",
    "STATUS_LIST_MALFORMED",
  ]);
  const expectedAuthentication = authenticatedCodes.has(result.status.code)
    ? true
    : unauthenticatedCodes.has(result.status.code)
      ? false
      : null;
  if (
    result.statusTrustMode !== "issuer_signed" ||
    result.statusObjectAuthenticated !== expectedAuthentication
  ) {
    fail("Current indeterminate status authentication is inconsistent.");
  }
}

function parseVerificationResult(
  value: unknown,
  { requireChecks }: { requireChecks: boolean },
): BrowserSafeVerificationResult {
  if (!plainObject(value)) {
    return fail("VeraCredentials response must be an object.");
  }

  const profile = boundedString(value.profile, "profile", 64);
  if (!PROFILE_SET.has(profile)) {
    return fail("profile is unsupported.");
  }
  if (value.success !== true) {
    return fail("Completed verification responses must have success true.");
  }

  const outcome = boundedString(value.outcome, "outcome", 32);
  if (!OUTCOME_SET.has(outcome)) {
    return fail("outcome is unsupported.");
  }

  const statusTrustMode = boundedString(
    value.statusTrustMode,
    "statusTrustMode",
    64,
  );
  if (!STATUS_TRUST_MODE_SET.has(statusTrustMode)) {
    return fail("statusTrustMode is unsupported.");
  }

  const statusType =
    value.statusType === null
      ? null
      : boundedString(value.statusType, "statusType", 128);
  const trusted = nullableBoolean(value.trusted, "trusted");
  const issuerTrusted = nullableBoolean(value.issuerTrusted, "issuerTrusted");
  if (issuerTrusted !== trusted) {
    return fail("issuerTrusted and trusted must preserve the same authority result.");
  }
  if (value.statusEvidencePinned !== true && value.statusEvidencePinned !== false) {
    return fail("statusEvidencePinned must be boolean.");
  }
  if (value.holderProven !== null) {
    return fail("holderProven must remain null.");
  }

  const parsedChecks = requireChecks ? validateChecks(value.checks) : null;

  const result: BrowserSafeVerificationResult = {
    profile: profile as VerificationProfile,
    success: true,
    verified: nullableBoolean(value.verified, "verified"),
    trusted,
    accepted: nullableBoolean(value.accepted, "accepted"),
    credentialProofVerified: nullableBoolean(
      value.credentialProofVerified,
      "credentialProofVerified",
    ),
    issuerKeyAuthorized: nullableBoolean(
      value.issuerKeyAuthorized,
      "issuerKeyAuthorized",
    ),
    issuerTrusted,
    temporallyValid: nullableBoolean(value.temporallyValid, "temporallyValid"),
    statusType,
    statusObjectAuthenticated: nullableBoolean(
      value.statusObjectAuthenticated,
      "statusObjectAuthenticated",
    ),
    statusEvidencePinned: value.statusEvidencePinned,
    statusTrustMode: statusTrustMode as StatusTrustMode,
    reasonCodes: parseReasonCodes(value.reasonCodes),
    holderProven: null,
    outcome: outcome as VerificationOutcome,
    status: parseStatus(value.status),
  };

  validateOutcome(result.accepted, result.outcome);
  validateDecisionConsistency(result);
  validateProfileConsistency(result);
  if (parsedChecks) {
    validateChecksAgainstSummary(result, parsedChecks);
  }
  return result;
}

export function parseVeraCredentialsResult(
  value: unknown,
): BrowserSafeVerificationResult {
  return parseVerificationResult(value, { requireChecks: true });
}

export function parseWebsiteVerificationPayload(
  value: unknown,
): WebsiteVerificationPayload {
  if (plainObject(value) && "profile" in value) {
    return {
      kind: "result",
      result: parseVerificationResult(value, { requireChecks: false }),
    };
  }

  if (!plainObject(value) || !plainObject(value.error)) {
    return fail("Website verification response is malformed.");
  }

  const category = boundedString(value.error.category, "error.category", 64);
  if (
    category !== "artifact_invalid" &&
    category !== "artifact_unavailable" &&
    category !== "verification_unavailable"
  ) {
    return fail("Website verification error category is unsupported.");
  }

  return {
    kind: "error",
    error: {
      category,
      code: boundedString(value.error.code, "error.code", 128),
      message: boundedString(value.error.message, "error.message", 256),
    },
  };
}
