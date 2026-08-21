import "server-only";

import {
  extractCredentialFromPng,
  MAX_PNG_BYTES,
  type ExtractedOpenBadgeCredential,
} from "./extract-credential.ts";

const BADGE_ORIGIN = "https://credentials.veralearning.com";
const HISTORICAL_BADGE_REDIRECT_ORIGIN =
  "https://pub-ecf318c517f8446faae36c2c94bfc7a3.r2.dev";
const APPROVED_BADGE_ORIGINS = new Set([
  BADGE_ORIGIN,
  HISTORICAL_BADGE_REDIRECT_ORIGIN,
]);
const BADGE_FETCH_TIMEOUT_MS = 5_000;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type CredentialArtifactErrorCategory = "invalid" | "unavailable";

export class CredentialArtifactError extends Error {
  code: string;
  category: CredentialArtifactErrorCategory;

  constructor({
    code,
    category,
    message,
  }: {
    code: string;
    category: CredentialArtifactErrorCategory;
    message: string;
  }) {
    super(message);
    this.name = "CredentialArtifactError";
    this.code = code;
    this.category = category;
  }
}

export interface CredentialArtifact {
  badgeUrl: string;
  credential: ExtractedOpenBadgeCredential;
}

interface CredentialArtifactOptions {
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

export function isCredentialUuid(value: string) {
  return UUID_PATTERN.test(value);
}

export function buildCredentialBadgeUrl(id: string) {
  if (!isCredentialUuid(id)) {
    throw new CredentialArtifactError({
      code: "invalid_id",
      category: "invalid",
      message: "Credential ID is not a valid UUID.",
    });
  }

  return `${BADGE_ORIGIN}/badges/${id}`;
}

function isRedirectStatus(status: number) {
  return status >= 300 && status <= 399;
}

function isPrivateNetworkHostname(hostname: string) {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (
    normalized === "localhost" ||
    normalized.endsWith(".localhost") ||
    normalized.endsWith(".local") ||
    normalized === "::1" ||
    normalized.startsWith("fe80:") ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd")
  ) {
    return true;
  }

  const ipv4 = normalized.split(".").map((part) => Number(part));
  if (
    ipv4.length === 4 &&
    ipv4.every((part) => Number.isInteger(part) && part >= 0 && part <= 255)
  ) {
    return (
      ipv4[0] === 10 ||
      ipv4[0] === 127 ||
      (ipv4[0] === 169 && ipv4[1] === 254) ||
      (ipv4[0] === 172 && ipv4[1] >= 16 && ipv4[1] <= 31) ||
      (ipv4[0] === 192 && ipv4[1] === 168) ||
      ipv4[0] === 0
    );
  }

  return false;
}

function validateRedirectTarget(location: string, sourceUrl: string) {
  let target: URL;

  try {
    target = new URL(location, sourceUrl);
  } catch {
    throw new CredentialArtifactError({
      code: "badge_redirect_rejected",
      category: "invalid",
      message: "Badge redirect target is invalid.",
    });
  }

  if (
    target.protocol !== "https:" ||
    target.username !== "" ||
    target.password !== "" ||
    isPrivateNetworkHostname(target.hostname) ||
    !APPROVED_BADGE_ORIGINS.has(target.origin)
  ) {
    throw new CredentialArtifactError({
      code: "badge_redirect_rejected",
      category: "invalid",
      message: "Badge redirect target is not approved.",
    });
  }

  return target.toString();
}

function parseContentLength(response: Response) {
  const value = response.headers.get("content-length");
  if (value === null) {
    return null;
  }

  if (!/^\d+$/.test(value)) {
    throw new CredentialArtifactError({
      code: "badge_invalid_content_length",
      category: "invalid",
      message: "Badge response has an invalid content length.",
    });
  }

  const length = Number(value);
  if (!Number.isSafeInteger(length) || length > MAX_PNG_BYTES) {
    throw new CredentialArtifactError({
      code: "badge_too_large",
      category: "invalid",
      message: "Badge response exceeds the maximum PNG size.",
    });
  }

  return length;
}

async function readBoundedBody(response: Response) {
  parseContentLength(response);

  if (!response.body) {
    throw new CredentialArtifactError({
      code: "badge_empty_response",
      category: "unavailable",
      message: "Badge response did not contain a body.",
    });
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    totalBytes += value.byteLength;
    if (totalBytes > MAX_PNG_BYTES) {
      await reader.cancel().catch(() => undefined);
      throw new CredentialArtifactError({
        code: "badge_too_large",
        category: "invalid",
        message: "Badge response exceeds the maximum PNG size.",
      });
    }
    chunks.push(value);
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return body;
}

async function fetchBadgeResponse({
  badgeUrl,
  fetchImpl,
  signal,
}: {
  badgeUrl: string;
  fetchImpl: typeof fetch;
  signal: AbortSignal;
}) {
  let currentUrl = badgeUrl;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await fetchImpl(currentUrl, {
      method: "GET",
      cache: "no-store",
      credentials: "omit",
      redirect: "manual",
      headers: { Accept: "image/png" },
      signal,
    });

    if (isRedirectStatus(response.status)) {
      if (attempt > 0) {
        throw new CredentialArtifactError({
          code: "badge_redirect_rejected",
          category: "invalid",
          message: "Badge response redirected more than once.",
        });
      }

      const location = response.headers.get("location");
      if (!location) {
        throw new CredentialArtifactError({
          code: "badge_redirect_rejected",
          category: "invalid",
          message: "Badge redirect response did not provide a location.",
        });
      }
      currentUrl = validateRedirectTarget(location, currentUrl);
      continue;
    }

    return response;
  }

  throw new CredentialArtifactError({
    code: "badge_redirect_rejected",
    category: "invalid",
    message: "Badge redirect policy rejected the response.",
  });
}

export async function getCredentialArtifact(
  id: string,
  {
    fetchImpl = fetch,
    timeoutMs = BADGE_FETCH_TIMEOUT_MS,
  }: CredentialArtifactOptions = {},
): Promise<CredentialArtifact> {
  const badgeUrl = buildCredentialBadgeUrl(id);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchBadgeResponse({
      badgeUrl,
      fetchImpl,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new CredentialArtifactError({
        code: "badge_fetch_failed",
        category: "unavailable",
        message: "Badge artifact could not be retrieved.",
      });
    }

    const mediaType = response.headers
      .get("content-type")
      ?.split(";", 1)[0]
      .trim()
      .toLowerCase();
    if (mediaType !== "image/png") {
      throw new CredentialArtifactError({
        code: "badge_content_type_invalid",
        category: "invalid",
        message: "Badge response is not an image/png artifact.",
      });
    }

    const pngBytes = await readBoundedBody(response);
    let credential: ExtractedOpenBadgeCredential;

    try {
      credential = extractCredentialFromPng(pngBytes);
    } catch {
      throw new CredentialArtifactError({
        code: "badge_png_invalid",
        category: "invalid",
        message: "Badge PNG or embedded credential is invalid.",
      });
    }

    if (credential.id !== `urn:uuid:${id}`) {
      throw new CredentialArtifactError({
        code: "credential_id_mismatch",
        category: "invalid",
        message: "Embedded credential does not match the requested credential ID.",
      });
    }

    return { badgeUrl, credential };
  } catch (error) {
    if (error instanceof CredentialArtifactError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new CredentialArtifactError({
        code: "badge_fetch_timeout",
        category: "unavailable",
        message: "Badge artifact retrieval timed out.",
      });
    }

    throw new CredentialArtifactError({
      code: "badge_fetch_failed",
      category: "unavailable",
      message: "Badge artifact could not be retrieved.",
    });
  } finally {
    clearTimeout(timeout);
  }
}
