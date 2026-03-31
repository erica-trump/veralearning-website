interface VerificationDocumentLoaderOptions {
  additionalAllowedUrls?: string[];
  timeoutMs?: number;
}

export interface DocumentResolutionDiagnostic {
  url: string;
  category: "context" | "issuer" | "verificationMethod" | "controller" | "statusList" | "other";
  status: "resolved" | "failed";
  errorCode?: string;
  errorMessage?: string;
}

interface RemoteDocument {
  contextUrl: null;
  documentUrl: string;
  document: unknown;
}

export class DocumentLoaderError extends Error {
  code: string;
  url: string;

  constructor({
    code,
    message,
    url,
  }: {
    code: string;
    message: string;
    url: string;
  }) {
    super(message);
    this.name = "DocumentLoaderError";
    this.code = code;
    this.url = url;
  }
}

const DEFAULT_TIMEOUT_MS = 20_000;
const STANDARD_CONTEXT_URLS = new Set([
  "https://www.w3.org/ns/credentials/v2",
  "https://www.w3.org/ns/did/v1",
  "https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json",
  "https://purl.imsglobal.org/spec/ob/v3p0/extensions.json",
  "https://w3id.org/security/multikey/v1",
  "https://w3id.org/vc/status-list/2021/v1",
  "https://w3id.org/security/data-integrity/v2",
]);
const VERA_ISSUER_URL = "https://credentials.veralearning.com/issuer.json";
const VERA_KEY_PREFIX = "https://credentials.veralearning.com/keys/";
const sharedDocumentCache = new Map<string, RemoteDocument>();

function getCategory(url: string): DocumentResolutionDiagnostic["category"] {
  if (STANDARD_CONTEXT_URLS.has(url)) {
    return "context";
  }

  if (url === VERA_ISSUER_URL) {
    return "issuer";
  }

  if (url.startsWith(VERA_KEY_PREFIX)) {
    return "verificationMethod";
  }

  if (/status[\/_-]?list/i.test(url)) {
    return "statusList";
  }

  return "other";
}

function toMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown document loader failure";
}

function isAllowedUrl(url: string, additionalAllowedUrls: string[]) {
  return (
    STANDARD_CONTEXT_URLS.has(url) ||
    url === VERA_ISSUER_URL ||
    url.startsWith(VERA_KEY_PREFIX) ||
    additionalAllowedUrls.includes(url)
  );
}

function isStatusListUrl(url: string) {
  return /status[\/_-]?list/i.test(url);
}

async function fetchRemoteDocumentOnce(url: string, timeoutMs: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      cache: isStatusListUrl(url) ? "no-store" : "force-cache",
      redirect: "follow",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new DocumentLoaderError({
        code: "document_fetch_failed",
        message: `Failed to resolve ${url}: ${response.status}`,
        url,
      });
    }

    const document = (await response.json()) as unknown;

    return {
      contextUrl: null,
      documentUrl: url,
      document,
    } satisfies RemoteDocument;
  } catch (error) {
    if (error instanceof DocumentLoaderError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new DocumentLoaderError({
        code: "document_fetch_timeout",
        message: `Timed out while resolving ${url}`,
        url,
      });
    }

    throw new DocumentLoaderError({
      code: "document_fetch_failed",
      message: `Failed to resolve ${url}: ${toMessage(error)}`,
      url,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchRemoteDocument(url: string, timeoutMs: number) {
  try {
    return await fetchRemoteDocumentOnce(url, timeoutMs);
  } catch (error) {
    if (
      error instanceof DocumentLoaderError &&
      error.code === "document_fetch_timeout"
    ) {
      return fetchRemoteDocumentOnce(url, timeoutMs);
    }

    throw error;
  }
}

export function createVerificationDocumentLoader({
  additionalAllowedUrls = [],
  timeoutMs = DEFAULT_TIMEOUT_MS,
}: VerificationDocumentLoaderOptions = {}) {
  const diagnostics = new Map<string, DocumentResolutionDiagnostic>();

  async function documentLoader(url: string): Promise<RemoteDocument> {
    if (!isAllowedUrl(url, additionalAllowedUrls)) {
      const blockedError = new DocumentLoaderError({
        code: "document_not_allowed",
        message: `Document resolution is not allowed for ${url}`,
        url,
      });
      diagnostics.set(url, {
        url,
        category: getCategory(url),
        status: "failed",
        errorCode: blockedError.code,
        errorMessage: blockedError.message,
      });
      throw blockedError;
    }

    const cached = isStatusListUrl(url) ? null : sharedDocumentCache.get(url);

    if (cached) {
      diagnostics.set(url, {
        url,
        category: getCategory(url),
        status: "resolved",
      });

      return cached;
    }

    try {
      const remoteDocument = await fetchRemoteDocument(url, timeoutMs);
      if (!isStatusListUrl(url)) {
        sharedDocumentCache.set(url, remoteDocument);
      }
      diagnostics.set(url, {
        url,
        category: getCategory(url),
        status: "resolved",
      });

      return remoteDocument;
    } catch (error) {
      const loaderError =
        error instanceof DocumentLoaderError
          ? error
          : new DocumentLoaderError({
              code: "document_fetch_failed",
              message: toMessage(error),
              url,
            });

      diagnostics.set(url, {
        url,
        category: getCategory(url),
        status: "failed",
        errorCode: loaderError.code,
        errorMessage: loaderError.message,
      });

      throw loaderError;
    }
  }

  return {
    documentLoader,
    getDiagnostics() {
      return Array.from(diagnostics.values());
    },
  };
}
