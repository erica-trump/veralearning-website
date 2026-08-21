import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

async function read(relativePath) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

async function doesNotExist(relativePath) {
  try {
    await access(path.join(repositoryRoot, relativePath));
    return false;
  } catch (error) {
    return error?.code === "ENOENT";
  }
}

test("the website-local cryptographic verifier and support files are removed", async () => {
  for (const relativePath of [
    "lib/verify-credential.ts",
    "lib/document-loader.ts",
    "types/verification-libs.d.ts",
    "types/png-chunks-extract.d.ts",
    "scripts/check-jsonld-safe-mode.mjs",
  ]) {
    assert.equal(await doesNotExist(relativePath), true, `${relativePath} still exists`);
  }

  const packageJson = JSON.parse(await read("package.json"));
  for (const dependency of [
    "@digitalbazaar/data-integrity",
    "@digitalbazaar/ed25519-multikey",
    "@digitalbazaar/eddsa-rdfc-2022-cryptosuite",
    "jsonld-signatures",
    "png-chunks-extract",
  ]) {
    assert.equal(packageJson.dependencies?.[dependency], undefined, `${dependency} still declared`);
  }
  assert.equal(packageJson.scripts?.["check:jsonld-safe-mode"], undefined);
});

test("the production verification path delegates without a local cryptographic fallback", async () => {
  const sources = await Promise.all([
    "app/api/credentials/[id]/verify/route.ts",
    "lib/credential-artifact.ts",
    "lib/credentials.ts",
    "lib/extract-credential.ts",
    "lib/vera-credentials-client.ts",
    "lib/vera-credentials-contract.ts",
  ].map(read));
  const runtime = sources.join("\n");
  const route = sources[0];

  for (const forbidden of [
    /@digitalbazaar\//,
    /jsonld-signatures/,
    /png-chunks-extract/,
    /createVerificationDocumentLoader/,
    /verifyCredentialProof/,
    /eddsaRdfc2022Cryptosuite/,
    /credentialStatus\.statusListCredential[^\n]*fetch/,
    /(?:gunzip|inflate|decompress)\s*\(/,
  ]) {
    assert.doesNotMatch(runtime, forbidden);
  }

  assert.doesNotMatch(route, /verify-credential|document-loader/);
  assert.match(route, /verifyWithVeraCredentials\(credential\)/);
  assert.match(route, /verification_unavailable/);
});

test("the browser-facing result and copy preserve privacy and holder boundaries", async () => {
  const [route, client, modal, statusCopy, page, actions] = await Promise.all([
    read("app/api/credentials/[id]/verify/route.ts"),
    read("lib/vera-credentials-client.ts"),
    read("components/credentials/verification-details-modal.tsx"),
    read("lib/verification-status-copy.ts"),
    read("components/credentials/credential-page.tsx"),
    read("components/credentials/credential-actions.tsx"),
  ]);
  const boundary = [route, client, modal, statusCopy].join("\n");

  assert.doesNotMatch(boundary, /learner_email|learner_id/);
  assert.doesNotMatch(client + route, /Clerk|OTP|currentUser|recipientAssociated|auth\(/);
  assert.doesNotMatch(route, /NextResponse\.json\(artifact\.credential|credential:\s*artifact\.credential/);
  assert.match(modal, /Holder control was not evaluated\./);
  assert.match(statusCopy, /Pinned historical status snapshot reports this credential active\./);
  assert.match(statusCopy, /Pinned historical status snapshot reports this credential revoked\./);
  assert.match(statusCopy, /Current status evidence was authenticated, but an active or revoked status could not be determined\./);
  assert.doesNotMatch(
    page + actions,
    /Proof of authenticity|Verify authenticity|cannot be forged|Issuer verified|authentic and currently active/,
  );
});
