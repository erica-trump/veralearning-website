import "server-only";

import {
  parseVeraCredentialsResult,
  VeraCredentialsContractError,
  type BrowserSafeVerificationResult,
} from "./vera-credentials-contract.ts";

export const VERACREDENTIALS_VERIFY_PATH = "/api/credential/verify";
export const MAX_VERACREDENTIALS_REQUEST_BYTES = 256 * 1024;
export const MAX_VERACREDENTIALS_RESPONSE_BYTES = 64 * 1024;
export const VERACREDENTIALS_TIMEOUT_MS = 5_000;

export type VeraCredentialsClientErrorCode =
  | "verifier_configuration_invalid"
  | "verifier_request_too_large"
  | "verifier_timeout"
  | "verifier_network_failure"
  | "verifier_redirect_rejected"
  | "verifier_response_status"
  | "verifier_response_content_type"
  | "verifier_response_too_large"
  | "verifier_response_invalid";

export class VeraCredentialsClientError extends Error {
  code: VeraCredentialsClientErrorCode;

  constructor(code: VeraCredentialsClientErrorCode, message: string) {
    super(message);
    this.name = "VeraCredentialsClientError";
    this.code = code;
  }
}

interface VeraCredentialsClientOptions {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  nodeEnv?: string;
  timeoutMs?: number;
}

function isLoopbackHostname(hostname: string) {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  return normalized === "localhost" || normalized === "127.0.0.1" || normalized === "::1";
}

export function buildVeraCredentialsVerifyUrl({
  baseUrl = process.env.VERACREDENTIALS_API_BASE_URL,
  nodeEnv = process.env.NODE_ENV,
}: Pick<VeraCredentialsClientOptions, "baseUrl" | "nodeEnv"> = {}) {
  if (!baseUrl) {
    throw new VeraCredentialsClientError(
      "verifier_configuration_invalid",
      "VeraCredentials verification is not configured.",
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(baseUrl);
  } catch {
    throw new VeraCredentialsClientError(
      "verifier_configuration_invalid",
      "VeraCredentials verification configuration is invalid.",
    );
  }

  const secure = parsed.protocol === "https:";
  const explicitNonProduction = nodeEnv === "development" || nodeEnv === "test";
  const loopbackDevelopment =
    parsed.protocol === "http:" && explicitNonProduction && isLoopbackHostname(parsed.hostname);
  if (
    (!secure && !loopbackDevelopment) ||
    parsed.username !== "" ||
    parsed.password !== "" ||
    parsed.search !== "" ||
    parsed.hash !== "" ||
    (parsed.pathname !== "" && parsed.pathname !== "/")
  ) {
    throw new VeraCredentialsClientError(
      "verifier_configuration_invalid",
      "VeraCredentials verification configuration is invalid.",
    );
  }

  return new URL(VERACREDENTIALS_VERIFY_PATH, parsed.origin).toString();
}

function isJsonMediaType(response: Response) {
  return (
    response.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase() ===
    "application/json"
  );
}

async function readBoundedResponse(response: Response) {
  const contentLength = response.headers.get("content-length");
  if (contentLength !== null) {
    if (!/^\d+$/.test(contentLength)) {
      throw new VeraCredentialsClientError(
        "verifier_response_invalid",
        "VeraCredentials returned an invalid response.",
      );
    }
    const length = Number(contentLength);
    if (!Number.isSafeInteger(length) || length > MAX_VERACREDENTIALS_RESPONSE_BYTES) {
      throw new VeraCredentialsClientError(
        "verifier_response_too_large",
        "VeraCredentials response exceeded its size limit.",
      );
    }
  }

  if (!response.body) {
    throw new VeraCredentialsClientError(
      "verifier_response_invalid",
      "VeraCredentials returned an invalid response.",
    );
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
    if (totalBytes > MAX_VERACREDENTIALS_RESPONSE_BYTES) {
      await reader.cancel().catch(() => undefined);
      throw new VeraCredentialsClientError(
        "verifier_response_too_large",
        "VeraCredentials response exceeded its size limit.",
      );
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new VeraCredentialsClientError(
      "verifier_response_invalid",
      "VeraCredentials returned an invalid response.",
    );
  }
}

export async function verifyWithVeraCredentials(
  credential: Record<string, unknown>,
  {
    baseUrl,
    fetchImpl = fetch,
    nodeEnv,
    timeoutMs = VERACREDENTIALS_TIMEOUT_MS,
  }: VeraCredentialsClientOptions = {},
): Promise<BrowserSafeVerificationResult> {
  const verifierUrl = buildVeraCredentialsVerifyUrl({ baseUrl, nodeEnv });
  const body = JSON.stringify({ credential });
  if (new TextEncoder().encode(body).byteLength > MAX_VERACREDENTIALS_REQUEST_BYTES) {
    throw new VeraCredentialsClientError(
      "verifier_request_too_large",
      "Credential request exceeded the VeraCredentials request limit.",
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(verifierUrl, {
      method: "POST",
      redirect: "manual",
      cache: "no-store",
      credentials: "omit",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body,
      signal: controller.signal,
    });

    if (response.status >= 300 && response.status <= 399) {
      throw new VeraCredentialsClientError(
        "verifier_redirect_rejected",
        "VeraCredentials redirect was rejected.",
      );
    }
    if (response.status !== 200) {
      throw new VeraCredentialsClientError(
        "verifier_response_status",
        "VeraCredentials could not complete verification.",
      );
    }
    if (!isJsonMediaType(response)) {
      throw new VeraCredentialsClientError(
        "verifier_response_content_type",
        "VeraCredentials returned an unsupported response type.",
      );
    }

    const responseText = await readBoundedResponse(response);
    let payload: unknown;
    try {
      payload = JSON.parse(responseText);
    } catch {
      throw new VeraCredentialsClientError(
        "verifier_response_invalid",
        "VeraCredentials returned invalid JSON.",
      );
    }

    try {
      return parseVeraCredentialsResult(payload);
    } catch (error) {
      if (error instanceof VeraCredentialsContractError) {
        throw new VeraCredentialsClientError(
          "verifier_response_invalid",
          "VeraCredentials returned a malformed verification result.",
        );
      }
      throw error;
    }
  } catch (error) {
    if (error instanceof VeraCredentialsClientError) {
      throw error;
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw new VeraCredentialsClientError(
        "verifier_timeout",
        "VeraCredentials verification timed out.",
      );
    }
    throw new VeraCredentialsClientError(
      "verifier_network_failure",
      "VeraCredentials verification is unavailable.",
    );
  } finally {
    clearTimeout(timeout);
  }
}
