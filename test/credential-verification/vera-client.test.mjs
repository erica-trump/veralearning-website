import assert from "node:assert/strict";
import test from "node:test";

import {
  buildVeraCredentialsVerifyUrl,
  MAX_VERACREDENTIALS_RESPONSE_BYTES,
  VeraCredentialsClientError,
  verifyWithVeraCredentials,
} from "../../lib/vera-credentials-client.ts";
import { currentResult, historicalResult } from "../helpers/verification-result.mjs";

const baseUrl = "https://veracredentials.example";
const credential = {
  id: "urn:uuid:76cddec5-9415-42b4-a9f3-03ef58ad1e1e",
  issuer: "https://attacker.example/issuer",
  credentialStatus: { statusListCredential: "https://attacker.example/status" },
  credentialSubject: { email: "preserved-historical@example.invalid" },
};

function jsonResponse(value, init = {}) {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: { "content-type": "application/json", ...(init.headers ?? {}) },
    ...init,
  });
}

test("posts exactly the credential wrapper to the fixed authoritative path without auth", async () => {
  const calls = [];
  const result = await verifyWithVeraCredentials(credential, {
    baseUrl,
    fetchImpl: async (url, init) => {
      calls.push({ url, init });
      return jsonResponse(historicalResult());
    },
  });

  assert.equal(result.profile, "vera_historical_cnc_canary_v1");
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, `${baseUrl}/api/credential/verify`);
  assert.equal(calls[0].init.method, "POST");
  assert.equal(calls[0].init.redirect, "manual");
  assert.equal(calls[0].init.headers.Authorization, undefined);
  assert.deepEqual(Object.keys(JSON.parse(calls[0].init.body)), ["credential"]);
  assert.deepEqual(JSON.parse(calls[0].init.body).credential, credential);
  for (const forbidden of ["learner_email", "learner_id", "otp", "clerk", "session", "profile", "badgeUrl"] ) {
    assert.equal(Object.hasOwn(JSON.parse(calls[0].init.body), forbidden), false);
  }
  assert.equal(JSON.stringify(result).includes("credentialStatus"), false);
});

test("returns authoritative rejected and indeterminate HTTP 200 decisions", async () => {
  const rejected = currentResult({
    trusted: false,
    issuerTrusted: false,
    accepted: false,
    outcome: "rejected",
    reasonCodes: ["issuer_untrusted"],
  });
  assert.equal((await verifyWithVeraCredentials(credential, {
    baseUrl,
    fetchImpl: async () => jsonResponse(rejected),
  })).accepted, false);

  const indeterminate = currentResult({
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
  assert.equal((await verifyWithVeraCredentials(credential, {
    baseUrl,
    fetchImpl: async () => jsonResponse(indeterminate),
  })).accepted, null);
});

test("rejects every verifier redirect and performs no retry", async () => {
  let calls = 0;
  await assert.rejects(
    verifyWithVeraCredentials(credential, {
      baseUrl,
      fetchImpl: async () => {
        calls += 1;
        return new Response(null, { status: 302, headers: { location: "https://elsewhere.example" } });
      },
    }),
    error => error instanceof VeraCredentialsClientError && error.code === "verifier_redirect_rejected",
  );
  assert.equal(calls, 1);
});

test("rejects non-JSON and malformed JSON responses", async () => {
  await assert.rejects(
    verifyWithVeraCredentials(credential, {
      baseUrl,
      fetchImpl: async () => new Response("text", { status: 200, headers: { "content-type": "text/plain" } }),
    }),
    error => error.code === "verifier_response_content_type",
  );
  await assert.rejects(
    verifyWithVeraCredentials(credential, {
      baseUrl,
      fetchImpl: async () => new Response("{", { status: 200, headers: { "content-type": "application/json" } }),
    }),
    error => error.code === "verifier_response_invalid",
  );
});

test("rejects oversized responses with or without a truthful content length", async () => {
  const oversized = "x".repeat(MAX_VERACREDENTIALS_RESPONSE_BYTES + 1);
  for (const headers of [
    { "content-type": "application/json" },
    { "content-type": "application/json", "content-length": String(oversized.length) },
  ]) {
    await assert.rejects(
      verifyWithVeraCredentials(credential, {
        baseUrl,
        fetchImpl: async () => new Response(oversized, { status: 200, headers }),
      }),
      error => error.code === "verifier_response_too_large",
    );
  }
});

test("times out once without retry", async () => {
  let calls = 0;
  await assert.rejects(
    verifyWithVeraCredentials(credential, {
      baseUrl,
      timeoutMs: 5,
      fetchImpl: async (_url, init) => {
        calls += 1;
        return new Promise((_resolve, reject) => {
          init.signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
        });
      },
    }),
    error => error.code === "verifier_timeout",
  );
  assert.equal(calls, 1);
});

test("treats non-200 and malformed normalized responses as unavailable", async () => {
  await assert.rejects(
    verifyWithVeraCredentials(credential, {
      baseUrl,
      fetchImpl: async () => jsonResponse({ success: false }, { status: 500 }),
    }),
    error => error.code === "verifier_response_status",
  );
  await assert.rejects(
    verifyWithVeraCredentials(credential, {
      baseUrl,
      fetchImpl: async () => jsonResponse({ success: true }),
    }),
    error => error.code === "verifier_response_invalid",
  );
});

test("enforces the 256 KiB serialized request limit", async () => {
  await assert.rejects(
    verifyWithVeraCredentials({ value: "x".repeat(256 * 1024) }, {
      baseUrl,
      fetchImpl: async () => jsonResponse(currentResult()),
    }),
    error => error.code === "verifier_request_too_large",
  );
});

test("validates the server-controlled base URL", () => {
  assert.equal(
    buildVeraCredentialsVerifyUrl({ baseUrl, nodeEnv: "production" }),
    `${baseUrl}/api/credential/verify`,
  );
  for (const invalid of [
    "http://veracredentials.example",
    "https://user:secret@veracredentials.example",
    "https://veracredentials.example/path",
    "https://veracredentials.example?target=other",
    "https://veracredentials.example#fragment",
  ]) {
    assert.throws(
      () => buildVeraCredentialsVerifyUrl({ baseUrl: invalid, nodeEnv: "production" }),
      /configuration/i,
    );
  }
});

test("permits loopback HTTP only in explicit development and test environments", () => {
  assert.equal(
    buildVeraCredentialsVerifyUrl({
      baseUrl: "http://127.0.0.1:3000",
      nodeEnv: "development",
    }),
    "http://127.0.0.1:3000/api/credential/verify",
  );
  assert.equal(
    buildVeraCredentialsVerifyUrl({
      baseUrl: "http://[::1]:3000",
      nodeEnv: "test",
    }),
    "http://[::1]:3000/api/credential/verify",
  );

  for (const nodeEnv of ["production", "staging", "", "unexpected"]) {
    assert.throws(
      () => buildVeraCredentialsVerifyUrl({
        baseUrl: "http://localhost:3000",
        nodeEnv,
      }),
      /configuration/i,
      nodeEnv || "empty NODE_ENV",
    );
  }
});

test("rejects loopback HTTP when NODE_ENV is undefined", () => {
  const original = process.env.NODE_ENV;
  delete process.env.NODE_ENV;
  try {
    assert.throws(
      () => buildVeraCredentialsVerifyUrl({ baseUrl: "http://localhost:3000" }),
      /configuration/i,
    );
  } finally {
    if (original === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = original;
    }
  }
});

test("keeps HTTPS valid independently of NODE_ENV", () => {
  for (const nodeEnv of [undefined, "development", "test", "production", "staging"]) {
    assert.equal(
      buildVeraCredentialsVerifyUrl({ baseUrl, nodeEnv }),
      `${baseUrl}/api/credential/verify`,
    );
  }
});
