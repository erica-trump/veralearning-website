import assert from "node:assert/strict";
import test from "node:test";

import { parseVeraCredentialsResult } from "../../lib/vera-credentials-contract.ts";
import { verificationStatusCopy } from "../../lib/verification-status-copy.ts";
import { currentResult, historicalResult } from "../helpers/verification-result.mjs";

function currentStatus(overrides) {
  return parseVeraCredentialsResult(currentResult(overrides));
}

test("describes authenticated current active and revoked decisions", () => {
  const active = currentStatus({
    statusType: "BitstringStatusListEntry",
    statusObjectAuthenticated: true,
    statusTrustMode: "issuer_signed",
    status: {
      state: "active",
      code: "STATUS_ACTIVE",
      reason: "Credential status is active.",
      purpose: "revocation",
      valid: true,
    },
  });
  const revoked = currentStatus({
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
  });

  assert.equal(
    verificationStatusCopy(active),
    "Authenticated current status reports this credential active.",
  );
  assert.equal(
    verificationStatusCopy(revoked),
    "Authenticated current status reports this credential revoked.",
  );
});

test("distinguishes authenticated-indeterminate from unauthenticated current status", () => {
  const authenticated = currentStatus({
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
  });
  const notAuthenticated = currentStatus({
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
  });

  assert.equal(
    verificationStatusCopy(authenticated),
    "Current status evidence was authenticated, but an active or revoked status could not be determined.",
  );
  assert.equal(
    verificationStatusCopy(notAuthenticated),
    "Current credential status could not be authenticated.",
  );
});

test("keeps status-absent and historical status language unchanged", () => {
  assert.equal(
    verificationStatusCopy(parseVeraCredentialsResult(currentResult())),
    "No credential-status mechanism is present.",
  );
  assert.equal(
    verificationStatusCopy(parseVeraCredentialsResult(historicalResult())),
    "Pinned historical status snapshot reports this credential active.",
  );
});
