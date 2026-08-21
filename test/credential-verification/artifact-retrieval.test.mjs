import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCredentialBadgeUrl,
  CredentialArtifactError,
  getCredentialArtifact,
} from "../../lib/credential-artifact.ts";
import { MAX_PNG_BYTES } from "../../lib/extract-credential.ts";
import { createCredentialPng } from "../helpers/png-fixture.mjs";

const id = "76cddec5-9415-42b4-a9f3-03ef58ad1e1e";
const credential = {
  id: `urn:uuid:${id}`,
  issuer: "https://attacker.example/issuer",
  credentialStatus: { statusListCredential: "https://attacker.example/status" },
  evidence: [{ id: "https://attacker.example/evidence" }],
  credentialSubject: {
    achievement: { image: { id: "https://attacker.example/image.png" } },
  },
};

function pngResponse(value = credential, init = {}) {
  return new Response(createCredentialPng(value), {
    status: 200,
    headers: { "content-type": "image/png", ...(init.headers ?? {}) },
    ...init,
  });
}

test("fetches only the fixed UUID-derived badge URL and binds the credential ID", async () => {
  const calls = [];
  const artifact = await getCredentialArtifact(id, {
    fetchImpl: async (url, init) => {
      calls.push({ url, init });
      return pngResponse();
    },
  });
  assert.equal(artifact.badgeUrl, buildCredentialBadgeUrl(id));
  assert.deepEqual(artifact.credential, credential);
  assert.deepEqual(calls.map(call => call.url), [
    `https://credentials.veralearning.com/badges/${id}`,
  ]);
  assert.equal(calls[0].init.redirect, "manual");
  assert.equal(JSON.stringify(calls).includes("attacker.example"), false);
});

test("permits one redirect to the exact preserved historical R2 origin", async () => {
  const calls = [];
  const redirected = "https://pub-ecf318c517f8446faae36c2c94bfc7a3.r2.dev/canary.png";
  await getCredentialArtifact(id, {
    fetchImpl: async url => {
      calls.push(url);
      return calls.length === 1
        ? new Response(null, { status: 302, headers: { location: redirected } })
        : pngResponse();
    },
  });
  assert.deepEqual(calls, [buildCredentialBadgeUrl(id), redirected]);
});

test("rejects a badge redirect to every unapproved origin", async () => {
  for (const location of [
    "https://attacker.example/badge.png",
    "https://other.r2.dev/badge.png",
    "https://user:password@pub-ecf318c517f8446faae36c2c94bfc7a3.r2.dev/badge.png",
    "http://pub-ecf318c517f8446faae36c2c94bfc7a3.r2.dev/badge.png",
    "http://127.0.0.1/badge.png",
  ]) {
    await assert.rejects(
      getCredentialArtifact(id, {
        fetchImpl: async () => new Response(null, { status: 302, headers: { location } }),
      }),
      error => error instanceof CredentialArtifactError && error.code === "badge_redirect_rejected",
    );
  }
});

test("rejects a second badge redirect", async () => {
  let calls = 0;
  await assert.rejects(
    getCredentialArtifact(id, {
      fetchImpl: async () => {
        calls += 1;
        return new Response(null, {
          status: 302,
          headers: {
            location: "https://pub-ecf318c517f8446faae36c2c94bfc7a3.r2.dev/again.png",
          },
        });
      },
    }),
    error => error.code === "badge_redirect_rejected",
  );
  assert.equal(calls, 2);
});

test("requires image/png and a successful response", async () => {
  await assert.rejects(
    getCredentialArtifact(id, {
      fetchImpl: async () => new Response("text", { status: 200, headers: { "content-type": "text/plain" } }),
    }),
    error => error.code === "badge_content_type_invalid",
  );
  await assert.rejects(
    getCredentialArtifact(id, {
      fetchImpl: async () => new Response(null, { status: 503 }),
    }),
    error => error.code === "badge_fetch_failed" && error.category === "unavailable",
  );
});

test("rejects oversized bodies with absent, truthful, or lying content length", async () => {
  const oversized = Buffer.alloc(MAX_PNG_BYTES + 1);
  for (const headers of [
    { "content-type": "image/png" },
    { "content-type": "image/png", "content-length": String(oversized.length) },
    { "content-type": "image/png", "content-length": "1" },
  ]) {
    await assert.rejects(
      getCredentialArtifact(id, {
        fetchImpl: async () => new Response(oversized, { status: 200, headers }),
      }),
      error => error.code === "badge_too_large",
    );
  }
});

test("times out without retry", async () => {
  let calls = 0;
  await assert.rejects(
    getCredentialArtifact(id, {
      timeoutMs: 5,
      fetchImpl: async (_url, init) => {
        calls += 1;
        return new Promise((_resolve, reject) => {
          init.signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
        });
      },
    }),
    error => error.code === "badge_fetch_timeout",
  );
  assert.equal(calls, 1);
});

test("rejects malformed PNG and embedded credential ID mismatch", async () => {
  await assert.rejects(
    getCredentialArtifact(id, {
      fetchImpl: async () => new Response(Buffer.of(1, 2, 3), {
        status: 200,
        headers: { "content-type": "image/png" },
      }),
    }),
    error => error.code === "badge_png_invalid",
  );

  await assert.rejects(
    getCredentialArtifact(id, {
      fetchImpl: async () => pngResponse({ id: "urn:uuid:00000000-0000-4000-8000-000000000000" }),
    }),
    error => error.code === "credential_id_mismatch",
  );
});

test("invalid UUID fails before any network call", async () => {
  let called = false;
  await assert.rejects(
    getCredentialArtifact("../metadata", {
      fetchImpl: async () => {
        called = true;
        return pngResponse();
      },
    }),
    error => error.code === "invalid_id",
  );
  assert.equal(called, false);
});
