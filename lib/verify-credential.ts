import jsigs from "jsonld-signatures";
import { DataIntegrityProof } from "@digitalbazaar/data-integrity";
import { cryptosuite as eddsaRdfc2022Cryptosuite } from "@digitalbazaar/eddsa-rdfc-2022-cryptosuite";
import {
  createVerificationDocumentLoader,
  type DocumentResolutionDiagnostic,
  DocumentLoaderError,
} from "@/lib/document-loader";
import {
  extractCredentialFromPng,
  type ExtractedOpenBadgeCredential,
} from "@/lib/extract-credential";

const { AssertionProofPurpose } = jsigs.purposes;

interface CredentialIssuer {
  id?: unknown;
  name?: unknown;
}

interface CredentialProof {
  type?: unknown;
  cryptosuite?: unknown;
  verificationMethod?: unknown;
  proofPurpose?: unknown;
  proofValue?: unknown;
}

interface CredentialRecord extends ExtractedOpenBadgeCredential {
  id?: unknown;
  issuer?: CredentialIssuer | string;
  proof?: CredentialProof[];
  validFrom?: unknown;
  validUntil?: unknown;
  type?: unknown;
}

type VerifyCredentialInput =
  | {
      credential: ExtractedOpenBadgeCredential;
      sourceId?: string;
    }
  | {
      id: string;
    }
  | {
      badgeUrl: string;
    };

export interface VerificationChecks {
  issuerResolved: boolean;
  controllerResolved: boolean;
  assertionMethodAuthorized: boolean;
  integrityValid: boolean;
  signatureValid: boolean;
  proofFormatSupported: boolean;
}

export interface VerificationCredentialSummary {
  issuerName: string | null;
  standard: string | null;
  proofType: string | null;
  cryptosuite: string | null;
  verificationMethod: string | null;
  issued: string | null;
  validUntil: string | null;
}

export interface VerificationUiResult {
  verified: boolean;
  status: "verified" | "failed" | "unverifiable";
  checks: VerificationChecks;
  credentialSummary: VerificationCredentialSummary;
  error: {
    code: string;
    message: string;
  } | null;
}

interface VerificationDiagnostics {
  sourceId: string | null;
  badgeUrl: string | null;
  issuerId: string | null;
  proofObject: CredentialProof | null;
  resolvedVerificationMethodId: string | null;
  resolvedControllerId: string | null;
  documentResolution: DocumentResolutionDiagnostic[];
  rawVerificationResult: unknown;
  rawVerificationErrors: unknown[];
}

export interface VerificationRunResult {
  result: VerificationUiResult;
  diagnostics: VerificationDiagnostics;
}

function getString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function getCredentialArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function buildBadgeUrl(id: string) {
  return `https://credentials.veralearning.com/badges/${id}`;
}

function getIssuerId(credential: CredentialRecord) {
  if (typeof credential.issuer === "string") {
    return getString(credential.issuer);
  }

  return getString(credential.issuer?.id);
}

function getIssuerName(credential: CredentialRecord) {
  if (typeof credential.issuer === "string") {
    return null;
  }

  const issuerName = getString(credential.issuer?.name);
  return issuerName === "Vera Learning" ? "VeraLearning" : issuerName;
}

function getStandardLabel(credential: CredentialRecord) {
  const types = getCredentialArray(credential.type)
    .map((value) => getString(value))
    .filter((value): value is string => Boolean(value));

  return types.includes("OpenBadgeCredential")
    ? "Open Badges 3.0"
    : types.includes("VerifiableCredential")
      ? "W3C Verifiable Credential"
      : null;
}

async function fetchBadgeBuffer({
  id,
  badgeUrl,
}: {
  id?: string;
  badgeUrl?: string;
}) {
  const resolvedBadgeUrl = badgeUrl ?? (id ? buildBadgeUrl(id) : null);

  if (!resolvedBadgeUrl) {
    throw new Error("A badge identifier or badge URL is required");
  }

  const response = await fetch(resolvedBadgeUrl, {
    cache: "no-store",
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`Badge fetch failed with status ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();

  return {
    badgeUrl: resolvedBadgeUrl,
    badgeBuffer: Buffer.from(arrayBuffer),
  };
}

async function resolveCredentialSource(input: VerifyCredentialInput) {
  if ("credential" in input) {
    return {
      credential: input.credential as CredentialRecord,
      sourceId: input.sourceId ?? null,
      badgeUrl: null,
    };
  }

  const { badgeBuffer, badgeUrl } = await fetchBadgeBuffer({
    id: "id" in input ? input.id : undefined,
    badgeUrl: "badgeUrl" in input ? input.badgeUrl : undefined,
  });

  return {
    credential: extractCredentialFromPng(badgeBuffer) as CredentialRecord,
    sourceId: "id" in input ? input.id : null,
    badgeUrl,
  };
}

function createBaseChecks(): VerificationChecks {
  return {
    issuerResolved: false,
    controllerResolved: false,
    assertionMethodAuthorized: false,
    integrityValid: false,
    signatureValid: false,
    proofFormatSupported: false,
  };
}

function createSummary(credential: CredentialRecord): VerificationCredentialSummary {
  const proof = credential.proof?.[0];

  return {
    issuerName: getIssuerName(credential),
    standard: getStandardLabel(credential),
    proofType: getString(proof?.type),
    cryptosuite: getString(proof?.cryptosuite),
    verificationMethod: getString(proof?.verificationMethod),
    issued: getString(credential.validFrom),
    validUntil: getString(credential.validUntil),
  };
}

function createErrorResult({
  status,
  checks,
  summary,
  code,
  message,
}: {
  status: VerificationUiResult["status"];
  checks: VerificationChecks;
  summary: VerificationCredentialSummary;
  code: string;
  message: string;
}): VerificationUiResult {
  return {
    verified: false,
    status,
    checks,
    credentialSummary: summary,
    error: {
      code,
      message,
    },
  };
}

function logVerificationIssue({
  result,
  diagnostics,
}: {
  result: VerificationUiResult;
  diagnostics: VerificationDiagnostics;
}) {
  if (result.status === "verified") {
    return;
  }

  console.error("[credential-verification]", {
    sourceId: diagnostics.sourceId,
    credentialId: diagnostics.sourceId
      ? `urn:uuid:${diagnostics.sourceId}`
      : null,
    badgeUrl: diagnostics.badgeUrl,
    status: result.status,
    errorCode: result.error?.code ?? null,
    errorMessage: result.error?.message ?? null,
    verificationMethod:
      result.credentialSummary.verificationMethod ??
      diagnostics.resolvedVerificationMethodId,
    issuerId: diagnostics.issuerId,
    issuerResolved: result.checks.issuerResolved,
    controllerResolved: result.checks.controllerResolved,
    assertionMethodAuthorized: result.checks.assertionMethodAuthorized,
    integrityValid: result.checks.integrityValid,
    signatureValid: result.checks.signatureValid,
    proofFormatSupported: result.checks.proofFormatSupported,
    documentResolutionFailures: diagnostics.documentResolution
      .filter((entry) => entry.status === "failed")
      .map((entry) => ({
        url: entry.url,
        category: entry.category,
        errorCode: entry.errorCode ?? null,
        errorMessage: entry.errorMessage ?? null,
      })),
  });
}

function includesAssertionMethod(controllerDocument: unknown, verificationMethodId: string) {
  if (typeof controllerDocument !== "object" || controllerDocument === null) {
    return false;
  }

  const assertionMethod = (controllerDocument as { assertionMethod?: unknown }).assertionMethod;

  if (!Array.isArray(assertionMethod)) {
    return false;
  }

  return assertionMethod.some((value) => {
    if (typeof value === "string") {
      return value === verificationMethodId;
    }

    if (typeof value === "object" && value !== null) {
      return getString((value as { id?: unknown }).id) === verificationMethodId;
    }

    return false;
  });
}

function getVerificationErrors(rawVerificationResult: unknown) {
  if (
    typeof rawVerificationResult === "object" &&
    rawVerificationResult !== null &&
    "results" in rawVerificationResult &&
    Array.isArray((rawVerificationResult as { results?: unknown[] }).results)
  ) {
    return (rawVerificationResult as { results: Array<{ error?: unknown }> }).results
      .map((entry) => entry.error)
      .filter((value) => value !== undefined);
  }

  return [];
}

export async function verifyCredential(
  input: VerifyCredentialInput,
): Promise<VerificationRunResult> {
  let credential: CredentialRecord;
  let sourceId: string | null = null;
  let badgeUrl: string | null = null;

  try {
    const source = await resolveCredentialSource(input);
    credential = source.credential;
    sourceId = source.sourceId;
    badgeUrl = source.badgeUrl;
  } catch (error) {
    const checks = createBaseChecks();
    const summary = {
      issuerName: null,
      standard: null,
      proofType: null,
      cryptosuite: null,
      verificationMethod: null,
      issued: null,
      validUntil: null,
    } satisfies VerificationCredentialSummary;

    return {
      result: createErrorResult({
        status: "unverifiable",
        checks,
        summary,
        code: "credential_extraction_failed",
        message:
          error instanceof Error
            ? error.message
            : "The credential could not be fetched or extracted.",
      }),
      diagnostics: {
        sourceId,
        badgeUrl,
        issuerId: null,
        proofObject: null,
        resolvedVerificationMethodId: null,
        resolvedControllerId: null,
        documentResolution: [],
        rawVerificationResult: null,
        rawVerificationErrors: [],
      },
    };
  }

  const checks = createBaseChecks();
  const summary = createSummary(credential);
  const proof = credential.proof?.[0] ?? null;
  const diagnostics: VerificationDiagnostics = {
    sourceId,
    badgeUrl,
    issuerId: getIssuerId(credential),
    proofObject: proof,
    resolvedVerificationMethodId: null,
    resolvedControllerId: null,
    documentResolution: [],
    rawVerificationResult: null,
    rawVerificationErrors: [],
  };

  if (!proof) {
    return {
      result: (() => {
        const result = createErrorResult({
          status: "unverifiable",
          checks,
          summary,
          code: "missing_proof",
          message: "This credential does not include a verifiable proof.",
        });
        logVerificationIssue({ result, diagnostics });
        return result;
      })(),
      diagnostics,
    };
  }

  const proofType = getString(proof.type);
  const cryptosuite = getString(proof.cryptosuite);
  const verificationMethodId = getString(proof.verificationMethod);
  const issuerId = getIssuerId(credential);

  if (
    proofType !== "DataIntegrityProof" ||
    cryptosuite !== "eddsa-rdfc-2022" ||
    !verificationMethodId
  ) {
    return {
      result: (() => {
        const result = createErrorResult({
          status: "unverifiable",
          checks,
          summary,
          code: "unsupported_proof_format",
          message:
            "This credential uses a proof format that is not currently supported for verification.",
        });
        logVerificationIssue({ result, diagnostics });
        return result;
      })(),
      diagnostics,
    };
  }

  checks.proofFormatSupported = true;

  const { documentLoader, getDiagnostics } = createVerificationDocumentLoader({
    additionalAllowedUrls: issuerId ? [issuerId] : [],
  });

  let verificationMethodDocument: unknown;
  let controllerDocument: unknown;

  try {
    const verificationMethodRemote = await documentLoader(verificationMethodId);
    verificationMethodDocument = verificationMethodRemote.document;
    checks.issuerResolved = Boolean(issuerId);
    diagnostics.resolvedVerificationMethodId = getString(
      (verificationMethodDocument as { id?: unknown }).id,
    );

    const controllerId =
      getString((verificationMethodDocument as { controller?: unknown }).controller) ??
      issuerId;

    diagnostics.resolvedControllerId = controllerId;

    if (!controllerId) {
      throw new DocumentLoaderError({
        code: "controller_missing",
        message: "The verification method does not reference a controller.",
        url: verificationMethodId,
      });
    }

    const controllerRemote = await documentLoader(controllerId);
    controllerDocument = controllerRemote.document;
    checks.controllerResolved = true;
    checks.issuerResolved = true;
    checks.assertionMethodAuthorized = includesAssertionMethod(
      controllerDocument,
      verificationMethodId,
    );
  } catch (error) {
    diagnostics.documentResolution = getDiagnostics();

    return {
      result: (() => {
        const result = createErrorResult({
          status: "unverifiable",
          checks,
          summary,
          code:
            error instanceof DocumentLoaderError
              ? error.code
              : "document_resolution_failed",
          message:
            "We could not resolve the issuer, key, or proof material required to complete verification.",
        });
        logVerificationIssue({ result, diagnostics });
        return result;
      })(),
      diagnostics,
    };
  }

  if (!checks.assertionMethodAuthorized) {
    diagnostics.documentResolution = getDiagnostics();

    return {
      result: (() => {
        const result = createErrorResult({
          status: "failed",
          checks,
          summary,
          code: "assertion_method_unauthorized",
          message:
            "Verification was attempted, but the issuer did not authorize this signing method for credential assertions.",
        });
        logVerificationIssue({ result, diagnostics });
        return result;
      })(),
      diagnostics,
    };
  }

  try {
    const suite = new DataIntegrityProof({
      cryptosuite: eddsaRdfc2022Cryptosuite,
    });
    const purpose = new AssertionProofPurpose();
    const rawVerificationResult = await jsigs.verify(credential, {
      suite,
      purpose,
      documentLoader,
    });
    const verificationErrors = getVerificationErrors(rawVerificationResult);

    diagnostics.documentResolution = getDiagnostics();
    diagnostics.rawVerificationResult = rawVerificationResult;
    diagnostics.rawVerificationErrors = verificationErrors;

    const verified = Boolean(
      typeof rawVerificationResult === "object" &&
        rawVerificationResult !== null &&
        "verified" in rawVerificationResult &&
        (rawVerificationResult as { verified?: unknown }).verified === true,
    );

    checks.signatureValid = verified;
    checks.integrityValid = verified;

    if (verified) {
      return {
        result: {
          verified: true,
          status: "verified",
          checks,
          credentialSummary: summary,
          error: null,
        },
        diagnostics,
      };
    }

    return {
      result: (() => {
        const result = createErrorResult({
          status: "failed",
          checks,
          summary,
          code: "proof_validation_failed",
          message:
            "Verification was attempted, but this credential's cryptographic proof did not validate.",
        });
        logVerificationIssue({ result, diagnostics });
        return result;
      })(),
      diagnostics,
    };
  } catch (error) {
    diagnostics.documentResolution = getDiagnostics();
    diagnostics.rawVerificationErrors = [error];

    if (error instanceof DocumentLoaderError) {
      return {
        result: (() => {
          const result = createErrorResult({
            status: "unverifiable",
            checks,
            summary,
            code: error.code,
            message:
              "We could not resolve the issuer, key, or proof material required to complete verification.",
          });
          logVerificationIssue({ result, diagnostics });
          return result;
        })(),
        diagnostics,
      };
    }

    return {
      result: (() => {
        const result = createErrorResult({
          status: "failed",
          checks,
          summary,
          code: "proof_validation_failed",
          message:
            "Verification was attempted, but this credential's cryptographic proof did not validate.",
        });
        logVerificationIssue({ result, diagnostics });
        return result;
      })(),
      diagnostics,
    };
  }
}
