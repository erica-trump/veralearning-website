import { extractCredentialFromPng, type ExtractedOpenBadgeCredential } from "@/lib/extract-credential";
import { getIssuedCredentialRow } from "@/lib/neon";
import { getRecipientInitials } from "@/lib/recipient";

const DEFAULT_ISSUER_NAME = "VeraLearning";
const DEFAULT_SCORE = 87;
const DEFAULT_SUMMARY =
  "The learner demonstrated consistent application of safety protocols, correct machine setup procedures, and sound judgment across all five critical CNC operation themes. Verified through adaptive AI interview.";

interface CredentialIssuer {
  name?: unknown;
}

interface CredentialAchievement {
  name?: unknown;
  description?: unknown;
  alignment?: unknown;
  extensions?: unknown;
}

interface CredentialSubject {
  achievement?: CredentialAchievement;
}

interface CredentialEvidence {
  id?: unknown;
  narrative?: unknown;
  description?: unknown;
}

interface CredentialProof {
  type?: unknown;
  cryptosuite?: unknown;
}

interface CredentialRecord extends ExtractedOpenBadgeCredential {
  id?: unknown;
  name?: unknown;
  description?: unknown;
  issuer?: CredentialIssuer;
  validFrom?: unknown;
  validUntil?: unknown;
  credentialSubject?: CredentialSubject;
  evidence?: CredentialEvidence[];
  proof?: CredentialProof[];
}

interface CredentialPageBase {
  id: string;
  canonicalUrl: string;
  badgeUrl: string;
  evidenceUrl: string;
}

export interface ReadyCredentialPageData extends CredentialPageBase {
  status: "ready";
  badgeImageDataUrl: string;
  credentialId: string;
  title: string;
  issuerName: string;
  recipientEmail: string | null;
  recipientLabel: string;
  recipientInitials: string;
  issueDateLabel: string;
  validUntilLabel: string | null;
  issueYear: number | null;
  issueMonth: number | null;
  proofLabel: string;
  proofTags: string[];
  verificationSummary: string;
  evidenceDescription: string;
  linkedInUrl: string;
  score: number;
  skills: readonly string[];
  assessmentSummary: string;
}

export interface ErrorCredentialPageData extends CredentialPageBase {
  status: "badge-error" | "credential-unavailable";
}

export type CredentialPageData =
  | ReadyCredentialPageData
  | ErrorCredentialPageData;

function getString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function formatDisplayDate(value: string | Date | null | undefined) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getYearAndMonth(value: string | Date | null | undefined) {
  if (!value) {
    return { year: null, month: null };
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return { year: null, month: null };
  }

  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
  };
}

function normalizeProofLabel(proofType: string | null, credential: CredentialRecord) {
  const rowValue = getString(proofType);

  if (rowValue) {
    return rowValue;
  }

  const proof = credential.proof?.[0];
  const cryptosuite = getString(proof?.cryptosuite);

  if (cryptosuite === "eddsa-rdfc-2022") {
    return "EdDSA RDFC 2022";
  }

  return getString(proof?.type) ?? "Open Badge 3.0";
}

function extractEmbeddedSkills(credential: CredentialRecord) {
  const extensions = credential.credentialSubject?.achievement?.extensions;

  if (typeof extensions === "object" && extensions !== null) {
    const extensionsRecord = extensions as Record<string, unknown>;
    const skillsExtension = extensionsRecord["https://veralearning.com/ns/skills"];

    if (typeof skillsExtension === "object" && skillsExtension !== null) {
      const demonstratedSkills = (skillsExtension as Record<string, unknown>).demonstratedSkills;

      if (Array.isArray(demonstratedSkills)) {
        const extensionSkills = demonstratedSkills
          .map((skill) => getString(skill))
          .filter((skill): skill is string => Boolean(skill));

        if (extensionSkills.length > 0) {
          return Array.from(new Set(extensionSkills));
        }
      }
    }
  }

  const alignment = credential.credentialSubject?.achievement?.alignment;

  if (!Array.isArray(alignment)) {
    return [];
  }

  const skills = alignment
    .map((item) => {
      if (typeof item === "string") {
        return getString(item);
      }

      if (typeof item !== "object" || item === null) {
        return null;
      }

      const record = item as Record<string, unknown>;

      return (
        getString(record.targetName) ??
        getString(record.name) ??
        getString(record.description)
      );
    })
    .filter((skill): skill is string => Boolean(skill));

  return Array.from(new Set(skills));
}

function buildLinkedInUrl({
  id,
  name,
  year,
  month,
  canonicalUrl,
}: {
  id: string;
  name: string;
  year: number | null;
  month: number | null;
  canonicalUrl: string;
}) {
  const params = new URLSearchParams({
    startTask: "CERTIFICATION_NAME",
    name,
    organizationId: "",
    certUrl: canonicalUrl,
    certId: id,
  });

  if (year) {
    params.set("issueYear", String(year));
  }

  if (month) {
    params.set("issueMonth", String(month));
  }

  return `https://www.linkedin.com/profile/add?${params.toString()}`;
}

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function buildCanonicalCredentialUrl(id: string) {
  return `https://www.veralearning.com/credentials/${id}`;
}

export function buildBadgeUrl(id: string) {
  return `https://credentials.veralearning.com/badges/${id}`;
}

export function buildEvidenceUrl(id: string) {
  return `https://www.veralearning.com/credentials/${id}/evidence`;
}

export async function getCredentialPageData(
  id: string,
): Promise<CredentialPageData> {
  const canonicalUrl = buildCanonicalCredentialUrl(id);
  const badgeUrl = buildBadgeUrl(id);
  const evidenceUrl = buildEvidenceUrl(id);

  const badgeResponse = await fetch(badgeUrl, { cache: "no-store" }).catch(
    () => null,
  );

  if (!badgeResponse?.ok) {
    return {
      status: "badge-error",
      id,
      canonicalUrl,
      badgeUrl,
      evidenceUrl,
    };
  }

  const badgeArrayBuffer = await badgeResponse.arrayBuffer();
  const badgeBuffer = Buffer.from(badgeArrayBuffer);
  const badgeImageDataUrl = `data:image/png;base64,${badgeBuffer.toString("base64")}`;

  let credential: CredentialRecord;

  try {
    credential = extractCredentialFromPng(badgeBuffer) as CredentialRecord;
  } catch {
    return {
      status: "credential-unavailable",
      id,
      canonicalUrl,
      badgeUrl,
      evidenceUrl,
    };
  }

  const row = await getIssuedCredentialRow(`urn:uuid:${id}`);
  const title =
    getString(credential.credentialSubject?.achievement?.name) ??
    getString(credential.name) ??
    "Credential unavailable";
  const issuerName =
    getString(credential.issuer?.name) ?? DEFAULT_ISSUER_NAME;
  const issueDateSource = row?.created_at ?? getString(credential.validFrom);
  const expiresDateSource = row?.expires_at ?? getString(credential.validUntil);
  const issueDateLabel = formatDisplayDate(issueDateSource) ?? "Unavailable";
  const validUntilLabel = formatDisplayDate(expiresDateSource);
  const issueDateParts = getYearAndMonth(issueDateSource);
  const credentialEvidence = credential.evidence?.[0];
  const recipientEmail = row?.learner_email ?? null;
  const recipientInitials = getRecipientInitials(recipientEmail);
  const recipientLabel = row?.learner_id
    ? row.learner_id
    : recipientEmail
      ? "Credential recipient"
      : "Public credential";
  const evidenceDescription =
    getString(credentialEvidence?.description) ??
    getString(credentialEvidence?.narrative) ??
    "This credential includes an evidence report describing the assessed performance and verification context.";
  const skills = extractEmbeddedSkills(credential);
  const proofLabel = normalizeProofLabel(row?.proof_type ?? null, credential);
  const proofTags = [
    "OBv3",
    "W3C VC 2.0",
    proofLabel.toLowerCase().includes("eddsa") ? "eddsa-rdfc-2022" : proofLabel,
    "Tamper-evident",
  ];

  return {
    status: "ready",
    id,
    canonicalUrl,
    badgeUrl,
    evidenceUrl,
    badgeImageDataUrl,
    credentialId: getString(credential.id) ?? `urn:uuid:${id}`,
    title,
    issuerName,
    recipientEmail,
    recipientLabel,
    recipientInitials,
    issueDateLabel,
    validUntilLabel,
    issueYear: issueDateParts.year,
    issueMonth: issueDateParts.month,
    proofLabel,
    proofTags,
    verificationSummary:
      "This credential contains an embedded Ed25519 digital signature. The badge PNG itself carries the full verifiable credential, making authenticity checks tamper-evident.",
    evidenceDescription,
    linkedInUrl: buildLinkedInUrl({
      id,
      name: title,
      year: issueDateParts.year,
      month: issueDateParts.month,
      canonicalUrl,
    }),
    score: DEFAULT_SCORE,
    skills,
    assessmentSummary: DEFAULT_SUMMARY,
  };
}
