import "server-only";

import {
  buildCredentialBadgeUrl,
  CredentialArtifactError,
  getCredentialArtifact,
  isCredentialUuid,
} from "@/lib/credential-artifact";
import type { ExtractedOpenBadgeCredential } from "@/lib/extract-credential";
import { getPublicIssuedCredentialRow } from "@/lib/neon";

const DEFAULT_ISSUER_NAME = "VeraLearning";
const DEFAULT_SCORE = 87;
const DEFAULT_CREDENTIALS_BASE_URL = "https://www.veralearning.com";

interface CredentialIssuer {
  name?: unknown;
}

interface CredentialAchievement {
  name?: unknown;
  description?: unknown;
  alignment?: unknown;
  extensions?: unknown;
  creator?: unknown;
  image?: unknown;
}

interface CredentialSubject {
  name?: unknown;
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
  badgeImageSrc: string;
  credentialId: string;
  title: string;
  issuerName: string;
  displayIssuerName: string;
  recipientLabel: string;
  issueDateLabel: string;
  validUntilLabel: string | null;
  issueYear: number | null;
  issueMonth: number | null;
  validUntilYear: number | null;
  validUntilMonth: number | null;
  proofLabel: string;
  proofTags: string[];
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

function normalizeIssuerName(value: string | null) {
  if (!value) {
    return DEFAULT_ISSUER_NAME;
  }

  return value === "Vera Learning" ? "VeraLearning" : value;
}

function getCreatorRecord(credential: CredentialRecord) {
  const creator = credential.credentialSubject?.achievement?.creator;
  return typeof creator === "object" && creator !== null
    ? (creator as Record<string, unknown>)
    : null;
}

function getCreatorName(credential: CredentialRecord) {
  return getString(getCreatorRecord(credential)?.name);
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
  return isCredentialUuid(value);
}

function getCredentialsBaseUrl() {
  const configuredBaseUrl =
    process.env.NEXT_PUBLIC_CREDENTIALS_BASE_URL?.trim() ||
    DEFAULT_CREDENTIALS_BASE_URL;

  return configuredBaseUrl.replace(/\/+$/, "");
}

export function buildCanonicalCredentialUrl(id: string) {
  return `${getCredentialsBaseUrl()}/credentials/${id}`;
}

export function buildBadgeUrl(id: string) {
  return buildCredentialBadgeUrl(id);
}

export function buildEvidenceUrl(id: string) {
  return `${getCredentialsBaseUrl()}/credentials/${id}/evidence`;
}

export async function getCredentialPageData(
  id: string,
): Promise<CredentialPageData> {
  const canonicalUrl = buildCanonicalCredentialUrl(id);
  const badgeUrl = buildBadgeUrl(id);
  const evidenceUrl = buildEvidenceUrl(id);

  let credential: CredentialRecord;

  try {
    const artifact = await getCredentialArtifact(id);
    credential = artifact.credential as CredentialRecord;
  } catch (error) {
    return {
      status:
        error instanceof CredentialArtifactError && error.category === "unavailable"
          ? "badge-error"
          : "credential-unavailable",
      id,
      canonicalUrl,
      badgeUrl,
      evidenceUrl,
    };
  }

  const row = await getPublicIssuedCredentialRow(`urn:uuid:${id}`);
  const title =
    getString(credential.credentialSubject?.achievement?.name) ??
    getString(credential.name) ??
    "Credential unavailable";
  const issuerName = normalizeIssuerName(getString(credential.issuer?.name));
  const creatorName = getCreatorName(credential);
  const displayIssuerName = normalizeIssuerName(creatorName ?? issuerName);
  const badgeImageSrc = badgeUrl;
  const issueDateSource = row?.created_at ?? getString(credential.validFrom);
  const expiresDateSource = row?.expires_at ?? getString(credential.validUntil);
  const issueDateLabel = formatDisplayDate(issueDateSource) ?? "Unavailable";
  const validUntilLabel = formatDisplayDate(expiresDateSource);
  const issueDateParts = getYearAndMonth(issueDateSource);
  const validUntilParts = getYearAndMonth(expiresDateSource);
  const credentialEvidence = credential.evidence?.[0];
  const recipientName = getString(credential.credentialSubject?.name);
  const recipientLabel = recipientName ?? "Credential recipient";
  const evidenceDescription =
    getString(credentialEvidence?.description) ??
    getString(credentialEvidence?.narrative) ??
    "This credential includes an evidence report describing the assessed performance and verification context.";
  const credentialOverview =
    getString(credential.credentialSubject?.achievement?.description) ??
    null;
  const skills = extractEmbeddedSkills(credential);
  const proofLabel = normalizeProofLabel(row?.proof_type ?? null, credential);
  const proofTags = [
    "Open Badges 3.0",
    "W3C VC 2.0",
    proofLabel.toLowerCase().includes("eddsa") ? "eddsa-rdfc-2022" : proofLabel,
  ];

  return {
    status: "ready",
    id,
    canonicalUrl,
    badgeUrl,
    evidenceUrl,
    badgeImageSrc,
    credentialId: getString(credential.id) ?? `urn:uuid:${id}`,
    title,
    issuerName,
    displayIssuerName,
    recipientLabel,
    issueDateLabel,
    validUntilLabel,
    issueYear: issueDateParts.year,
    issueMonth: issueDateParts.month,
    validUntilYear: validUntilParts.year,
    validUntilMonth: validUntilParts.month,
    proofLabel,
    proofTags,
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
    assessmentSummary: credentialOverview ?? "",
  };
}
