export const CHECK_NAMES = [
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
];

export function checks(status = "passed") {
  return Object.fromEntries(CHECK_NAMES.map(name => [name, { status }]));
}

function checkFromNullable(value) {
  return { status: value === true ? "passed" : value === false ? "failed" : "not_performed" };
}

function businessCheck(accepted) {
  return { status: accepted === true ? "passed" : accepted === false ? "failed" : "not_performed" };
}

function currentChecks(result) {
  if (result.profile === "unsupported" || result.reasonCodes.includes("credential_contract_invalid")) {
    return {
      ...checks("not_performed"),
      documentParsing: { status: "passed" },
      structuralConformance: { status: "failed" },
      businessPolicy: { status: "failed" },
    };
  }

  const resultChecks = checks("passed");
  resultChecks.verificationMethodResolution = checkFromNullable(result.issuerKeyAuthorized);
  resultChecks.proofVerification = checkFromNullable(result.credentialProofVerified);
  resultChecks.temporalValidity = checkFromNullable(result.temporallyValid);
  resultChecks.issuerTrust = checkFromNullable(result.issuerTrusted);
  resultChecks.businessPolicy = businessCheck(result.accepted);

  if (result.status.state === "absent") {
    resultChecks.statusListVerification = { status: "not_applicable" };
    resultChecks.revocation = { status: "not_applicable" };
  } else if (result.status.state === "active") {
    resultChecks.statusListVerification = { status: "passed" };
    resultChecks.revocation = { status: "passed" };
  } else if (result.status.state === "revoked") {
    resultChecks.statusListVerification = { status: "passed" };
    resultChecks.revocation = { status: "failed" };
  } else if (result.issuerTrusted === true && result.credentialProofVerified === true) {
    resultChecks.statusListVerification = { status: "indeterminate" };
    resultChecks.revocation = { status: "not_performed" };
  } else {
    resultChecks.statusListVerification = { status: "not_performed" };
    resultChecks.revocation = { status: "not_performed" };
  }

  return resultChecks;
}

function historicalChecks(result) {
  const resultChecks = checks("passed");
  resultChecks.verificationMethodResolution = checkFromNullable(result.issuerKeyAuthorized);
  resultChecks.proofVerification = checkFromNullable(result.credentialProofVerified);
  resultChecks.temporalValidity = checkFromNullable(result.temporallyValid);
  resultChecks.issuerTrust = checkFromNullable(result.issuerTrusted);
  resultChecks.businessPolicy = businessCheck(result.accepted);

  if (result.credentialProofVerified === false) {
    resultChecks.temporalValidity = { status: "not_performed" };
    resultChecks.issuerTrust = { status: "not_performed" };
    resultChecks.statusListVerification = { status: "not_performed" };
    resultChecks.revocation = { status: "not_performed" };
  } else if (result.status.state === "active") {
    resultChecks.statusListVerification = { status: "passed" };
    resultChecks.revocation = { status: "passed" };
  } else if (result.status.state === "revoked") {
    resultChecks.statusListVerification = { status: "passed" };
    resultChecks.revocation = { status: "failed" };
  } else {
    resultChecks.statusListVerification = { status: "failed" };
    resultChecks.revocation = { status: "not_performed" };
  }

  return resultChecks;
}

export function currentResult(overrides = {}) {
  const result = {
    profile: "vera_current_vc2_ob3",
    success: true,
    verified: true,
    trusted: true,
    accepted: true,
    holderProven: null,
    outcome: "accepted",
    checks: {
      ...checks(),
      statusListVerification: { status: "not_applicable" },
      revocation: { status: "not_applicable" },
    },
    credentialProofVerified: true,
    issuerKeyAuthorized: true,
    issuerTrusted: true,
    temporallyValid: true,
    statusType: null,
    statusObjectAuthenticated: null,
    statusEvidencePinned: false,
    statusTrustMode: "not_applicable",
    reasonCodes: [],
    status: {
      state: "absent",
      code: "STATUS_ABSENT",
      reason: "Credential status is not declared.",
      purpose: null,
      valid: null,
    },
    ...overrides,
  };
  if (!Object.hasOwn(overrides, "checks")) {
    result.checks = currentChecks(result);
  }
  return result;
}

export function historicalResult(overrides = {}) {
  const result = {
    profile: "vera_historical_cnc_canary_v1",
    success: true,
    verified: true,
    trusted: true,
    accepted: true,
    holderProven: null,
    outcome: "accepted",
    checks: checks(),
    credentialProofVerified: true,
    issuerKeyAuthorized: true,
    issuerTrusted: true,
    temporallyValid: true,
    statusType: "StatusList2021Entry",
    statusObjectAuthenticated: false,
    statusEvidencePinned: true,
    statusTrustMode: "pinned_historical_unsigned",
    reasonCodes: [],
    status: {
      state: "active",
      code: "STATUS_ACTIVE",
      reason: "Pinned historical status snapshot reports this credential active.",
      purpose: "revocation",
      valid: true,
    },
    ...overrides,
  };
  if (!Object.hasOwn(overrides, "checks")) {
    result.checks = historicalChecks(result);
  }
  return result;
}
