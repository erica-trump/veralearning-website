import assert from "node:assert/strict";
import test from "node:test";

import {
  parseVeraCredentialsResult,
  parseWebsiteVerificationPayload,
} from "../../lib/vera-credentials-contract.ts";
import {
  checks,
  currentResult,
  historicalResult,
} from "../helpers/verification-result.mjs";

function earlyFailureChecks(failedCheck, extra = {}) {
  const result = {
    ...checks("not_performed"),
    documentParsing: { status: "passed" },
    businessPolicy: { status: "failed" },
  };
  const executionOrder = [
    "structuralConformance",
    "jsonLdProcessing",
    "verificationMethodResolution",
    "proofVerification",
    "temporalValidity",
  ];
  for (const name of executionOrder) {
    result[name] = name === failedCheck
      ? { status: "failed", ...extra }
      : { status: "passed" };
    if (name === failedCheck) break;
  }
  return result;
}

function historicalStatusFailureChecks() {
  return {
    ...checks("passed"),
    statusListVerification: { status: "failed" },
    revocation: { status: "not_performed" },
    businessPolicy: { status: "failed" },
  };
}

test("sanitizes a current accepted result without forwarding checks or unknown fields", () => {
  const result = parseVeraCredentialsResult(currentResult({
    arbitraryFutureField: { secret: "must not cross" },
    credential: { credentialSubject: { email: "private@example.invalid" } },
  }));
  assert.equal(result.accepted, true);
  assert.equal("checks" in result, false);
  assert.equal("arbitraryFutureField" in result, false);
  assert.equal(JSON.stringify(result).includes("private@example.invalid"), false);
});

test("validates the sanitized website result without requiring upstream-only checks", () => {
  const sanitized = parseVeraCredentialsResult(currentResult());
  assert.equal("checks" in sanitized, false);

  const payload = parseWebsiteVerificationPayload(sanitized);
  assert.equal(payload.kind, "result");
  assert.equal(payload.result.accepted, true);
});

test("preserves current revoked semantics", () => {
  const result = parseVeraCredentialsResult(currentResult({
    verified: false,
    accepted: false,
    outcome: "rejected",
    statusType: "BitstringStatusListEntry",
    statusObjectAuthenticated: true,
    statusTrustMode: "issuer_signed",
    reasonCodes: ["credential_revoked"],
    status: {
      state: "revoked",
      code: "STATUS_REVOKED",
      reason: "Credential status is revoked.",
      purpose: "revocation",
      valid: false,
    },
  }));
  assert.equal(result.status.state, "revoked");
  assert.equal(result.statusObjectAuthenticated, true);
});

test("preserves nullable current status indeterminate semantics", () => {
  const result = parseVeraCredentialsResult(currentResult({
    verified: null,
    accepted: null,
    outcome: "indeterminate",
    statusType: "BitstringStatusListEntry",
    statusObjectAuthenticated: null,
    statusTrustMode: "issuer_signed",
    reasonCodes: ["status_retrieval_error"],
    status: {
      state: "indeterminate",
      code: "STATUS_RETRIEVAL_ERROR",
      reason: "Credential status could not be retrieved.",
      purpose: "revocation",
      valid: null,
    },
  }));
  assert.equal(result.verified, null);
  assert.equal(result.accepted, null);
  assert.equal(result.statusObjectAuthenticated, null);
});

test("accepts the current early-failure mode for a status entry without a usable type", () => {
  const result = parseVeraCredentialsResult(currentResult({
    verified: false,
    accepted: false,
    outcome: "rejected",
    credentialProofVerified: null,
    issuerKeyAuthorized: null,
    issuerTrusted: null,
    trusted: null,
    temporallyValid: null,
    statusType: null,
    statusObjectAuthenticated: null,
    statusTrustMode: "issuer_signed",
    reasonCodes: ["credential_contract_invalid"],
    status: {
      state: "indeterminate",
      code: "STATUS_METHOD_UNSUPPORTED",
      reason: "The credential status method is unsupported.",
      purpose: null,
      valid: null,
    },
    checks: earlyFailureChecks("structuralConformance"),
  }));
  assert.equal(result.statusType, null);
  assert.equal(result.statusTrustMode, "issuer_signed");
});

test("preserves proof-valid but issuer-untrusted separation", () => {
  const result = parseVeraCredentialsResult(currentResult({
    trusted: false,
    issuerTrusted: false,
    accepted: false,
    outcome: "rejected",
    reasonCodes: ["issuer_untrusted"],
  }));
  assert.equal(result.credentialProofVerified, true);
  assert.equal(result.verified, true);
  assert.equal(result.trusted, false);
  assert.equal(result.accepted, false);
});

test("preserves invalid proof as an authoritative rejected decision", () => {
  const result = parseVeraCredentialsResult(currentResult({
    verified: false,
    trusted: null,
    issuerTrusted: null,
    accepted: false,
    outcome: "rejected",
    credentialProofVerified: false,
    temporallyValid: null,
    reasonCodes: ["proof_invalid"],
    status: {
      state: "indeterminate",
      code: "STATUS_NOT_EVALUATED",
      reason: "Credential status was not evaluated.",
      purpose: null,
      valid: null,
    },
    checks: earlyFailureChecks("proofVerification"),
  }));
  assert.equal(result.credentialProofVerified, false);
  assert.equal(result.accepted, false);
});

test("accepts the exact unsupported profile semantics", () => {
  const result = parseVeraCredentialsResult(currentResult({
    profile: "unsupported",
    verified: false,
    trusted: null,
    issuerTrusted: null,
    accepted: false,
    outcome: "rejected",
    credentialProofVerified: null,
    issuerKeyAuthorized: null,
    temporallyValid: null,
    statusType: "StatusList2021Entry",
    statusObjectAuthenticated: null,
    statusTrustMode: "not_evaluated",
    reasonCodes: ["unsupported_profile"],
    status: {
      state: "indeterminate",
      code: "STATUS_METHOD_UNSUPPORTED",
      reason: "The credential status method is unsupported.",
      purpose: "revocation",
      valid: null,
    },
  }));
  assert.equal(result.profile, "unsupported");
});

test("accepts historical active and revoked only with pinned unsigned status", () => {
  assert.equal(parseVeraCredentialsResult(historicalResult()).statusEvidencePinned, true);

  const revoked = parseVeraCredentialsResult(historicalResult({
    verified: false,
    accepted: false,
    outcome: "rejected",
    reasonCodes: ["credential_revoked"],
    status: {
      state: "revoked",
      code: "STATUS_REVOKED",
      reason: "Pinned historical status snapshot reports this credential revoked.",
      purpose: "revocation",
      valid: false,
    },
  }));
  assert.equal(revoked.status.state, "revoked");
  assert.equal(revoked.statusObjectAuthenticated, false);
});

test("accepts legitimate historical early proof failure with statusEvidencePinned false", () => {
  const result = parseVeraCredentialsResult(historicalResult({
    verified: false,
    trusted: null,
    issuerTrusted: null,
    accepted: false,
    outcome: "rejected",
    credentialProofVerified: false,
    temporallyValid: null,
    statusEvidencePinned: false,
    reasonCodes: ["proof_invalid"],
    status: {
      state: "indeterminate",
      code: "STATUS_NOT_EVALUATED",
      reason: "Pinned historical status evidence was not evaluated.",
      purpose: "revocation",
      valid: null,
    },
    checks: earlyFailureChecks("proofVerification"),
  }));
  assert.equal(result.statusEvidencePinned, false);
  assert.equal(result.statusTrustMode, "pinned_historical_unsigned");
});

test("accepts historical invalid evidence before successful pin evaluation", () => {
  const result = parseVeraCredentialsResult(historicalResult({
    verified: false,
    accepted: false,
    outcome: "rejected",
    statusEvidencePinned: false,
    reasonCodes: ["historical_status_evidence_invalid"],
    status: {
      state: "indeterminate",
      code: "STATUS_NOT_EVALUATED",
      reason: "Pinned historical status evidence is invalid.",
      purpose: "revocation",
      valid: null,
    },
    checks: historicalStatusFailureChecks(),
  }));
  assert.equal(result.statusEvidencePinned, false);
});

test("rejects a historical response that claims authenticated status", () => {
  assert.throws(
    () => parseVeraCredentialsResult(historicalResult({ statusObjectAuthenticated: true })),
    /Historical verification status trust fields/i,
  );
});

test("requires holderProven null", () => {
  assert.throws(
    () => parseVeraCredentialsResult(currentResult({ holderProven: true })),
    /holderProven/i,
  );
});

test("rejects malformed checks, reason codes, and inconsistent status", () => {
  assert.throws(() => parseVeraCredentialsResult(currentResult({ checks: {} })), /checks/i);
  assert.throws(
    () => parseVeraCredentialsResult(currentResult({ reasonCodes: ["future_unknown"] })),
    /reasonCodes/i,
  );
  assert.throws(
    () => parseVeraCredentialsResult(currentResult({
      status: { state: "active", code: "STATUS_ACTIVE", reason: "Active", purpose: "revocation", valid: null },
    })),
    /inconsistent/i,
  );
});

test("rejects impossible acceptance and outcome combinations", async t => {
  const cases = [
    ["accepted true with verified false", currentResult({ verified: false })],
    ["accepted true with proof false", currentResult({ credentialProofVerified: false })],
    ["accepted outcome with accepted false", currentResult({
      verified: true,
      trusted: false,
      issuerTrusted: false,
      accepted: false,
      outcome: "accepted",
      reasonCodes: ["issuer_untrusted"],
    })],
    ["rejected outcome with accepted true", currentResult({ outcome: "rejected" })],
    ["indeterminate outcome with non-null accepted", currentResult({ outcome: "indeterminate" })],
  ];

  for (const [name, value] of cases) {
    await t.test(name, () => {
      assert.throws(() => parseVeraCredentialsResult(value), /accepted|outcome|prerequisite/i);
    });
  }
});

test("rejects summary fields that contradict authoritative checks", async t => {
  const proof = currentResult();
  proof.checks.proofVerification = { status: "failed" };

  const issuer = currentResult({
    trusted: false,
    issuerTrusted: false,
    accepted: false,
    outcome: "rejected",
    reasonCodes: ["issuer_untrusted"],
  });
  issuer.checks.issuerTrust = { status: "passed" };

  const temporal = currentResult();
  temporal.checks.temporalValidity = { status: "failed" };

  const policy = currentResult({
    trusted: false,
    issuerTrusted: false,
    accepted: false,
    outcome: "rejected",
    reasonCodes: ["issuer_untrusted"],
  });
  policy.checks.businessPolicy = { status: "passed" };

  for (const [name, value, message] of [
    ["proofVerification", proof, /proofVerification/i],
    ["issuerTrust", issuer, /issuer trust/i],
    ["temporalValidity", temporal, /temporallyValid/i],
    ["businessPolicy", policy, /businessPolicy/i],
  ]) {
    await t.test(name, () => {
      assert.throws(() => parseVeraCredentialsResult(value), message);
    });
  }
});

test("rejects impossible current status matrix combinations", async t => {
  const activeWithoutType = currentResult({
    statusObjectAuthenticated: true,
    status: {
      state: "active",
      code: "STATUS_ACTIVE",
      reason: "Credential status is active.",
      purpose: "revocation",
      valid: true,
    },
  });
  const activeNotApplicable = currentResult({
    statusType: "BitstringStatusListEntry",
    statusObjectAuthenticated: true,
    statusTrustMode: "not_applicable",
    status: {
      state: "active",
      code: "STATUS_ACTIVE",
      reason: "Credential status is active.",
      purpose: "revocation",
      valid: true,
    },
  });
  const revokedNotApplicable = currentResult({
    verified: false,
    accepted: false,
    outcome: "rejected",
    statusType: "BitstringStatusListEntry",
    statusObjectAuthenticated: true,
    statusTrustMode: "not_applicable",
    reasonCodes: ["credential_revoked"],
    status: {
      state: "revoked",
      code: "STATUS_REVOKED",
      reason: "Credential status is revoked.",
      purpose: "revocation",
      valid: false,
    },
  });
  const absentAuthenticated = currentResult({ statusObjectAuthenticated: true });
  const absentPinned = currentResult({ statusEvidencePinned: true });

  for (const [name, value] of [
    ["active with null statusType", activeWithoutType],
    ["active with not_applicable trust", activeNotApplicable],
    ["revoked with not_applicable trust", revokedNotApplicable],
    ["absent with authenticated evidence", absentAuthenticated],
    ["absent with pinned evidence", absentPinned],
  ]) {
    await t.test(name, () => {
      assert.throws(() => parseVeraCredentialsResult(value), /status|pinned/i);
    });
  }
});

test("rejects impossible historical status combinations", async t => {
  await t.test("active without pinned evidence", () => {
    assert.throws(
      () => parseVeraCredentialsResult(historicalResult({ statusEvidencePinned: false })),
      /pinned/i,
    );
  });
  await t.test("authenticated historical evidence", () => {
    assert.throws(
      () => parseVeraCredentialsResult(historicalResult({ statusObjectAuthenticated: true })),
      /historical/i,
    );
  });
  await t.test("active status with verified false", () => {
    assert.throws(
      () => parseVeraCredentialsResult(historicalResult({
        verified: false,
        accepted: false,
        outcome: "rejected",
      })),
      /verified/i,
    );
  });
});

test("rejects a completed current indeterminate status with verified false", () => {
  assert.throws(
    () => parseVeraCredentialsResult(currentResult({
      verified: false,
      accepted: false,
      outcome: "rejected",
      statusType: "BitstringStatusListEntry",
      statusObjectAuthenticated: true,
      statusTrustMode: "issuer_signed",
      reasonCodes: ["status_credential_trust_error"],
      status: {
        state: "indeterminate",
        code: "STATUS_CREDENTIAL_TRUST_ERROR",
        reason: "The status credential issuer is not trusted.",
        purpose: "revocation",
        valid: null,
      },
    })),
    /verified/i,
  );
});

test("accepts source-derived current authenticated-indeterminate status", () => {
  const result = parseVeraCredentialsResult(currentResult({
    verified: null,
    accepted: null,
    outcome: "indeterminate",
    statusType: "BitstringStatusListEntry",
    statusObjectAuthenticated: true,
    statusTrustMode: "issuer_signed",
    reasonCodes: ["status_credential_trust_error"],
    status: {
      state: "indeterminate",
      code: "STATUS_CREDENTIAL_TRUST_ERROR",
      reason: "The status credential issuer is not trusted.",
      purpose: "revocation",
      valid: null,
    },
  }));
  assert.equal(result.statusObjectAuthenticated, true);
  assert.equal(result.status.state, "indeterminate");
});

test("validates the website error envelope without arbitrary nested data", () => {
  const payload = parseWebsiteVerificationPayload({
    error: {
      category: "verification_unavailable",
      code: "verifier_timeout",
      message: "Credential verification is unavailable right now.",
      stack: "must not be exposed",
    },
  });
  assert.equal(payload.kind, "error");
  assert.equal("stack" in payload.error, false);
});
