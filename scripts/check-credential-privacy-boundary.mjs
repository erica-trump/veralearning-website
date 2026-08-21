import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

async function read(relativePath) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

const [
  publicModel,
  pageComponent,
  recipientGate,
  recipientAuth,
  recipientAssociation,
  associationRoute,
  databaseModule,
  evidencePage,
  verifierClient,
  verifierContract,
  verifyRoute,
  verificationModal,
  verificationStatusCopy,
  credentialActions,
] = await Promise.all([
  read("lib/credentials.ts"),
  read("components/credentials/credential-page.tsx"),
  read("components/credentials/recipient-gate.tsx"),
  read("components/credentials/recipient-access-auth.tsx"),
  read("lib/recipient-association.ts"),
  read("app/api/credentials/[id]/recipient-association/route.ts"),
  read("lib/neon.ts"),
  read("app/(credentials)/credentials/[id]/evidence/page.tsx"),
  read("lib/vera-credentials-client.ts"),
  read("lib/vera-credentials-contract.ts"),
  read("app/api/credentials/[id]/verify/route.ts"),
  read("components/credentials/verification-details-modal.tsx"),
  read("lib/verification-status-copy.ts"),
  read("components/credentials/credential-actions.tsx"),
]);

let assertionCount = 0;

function check(value, message) {
  assertionCount += 1;
  assert.ok(value, message);
}

const clientBoundary = [pageComponent, recipientGate, recipientAuth].join("\n");
const publicQuery = databaseModule.slice(
  databaseModule.indexOf("export async function getPublicIssuedCredentialRow"),
  databaseModule.indexOf(
    "export async function getPrivateIssuedCredentialRecipientEmail",
  ),
);

check(!/learner_email|learner_id/.test(publicModel), "public page model references private DB recipient fields");
check(!/recipientEmail|credentialRecipientEmail/.test(publicModel), "public page model carries a recipient email alias");
check(!/credential\.credentialSubject\?\.email/.test(publicModel), "public page model copies embedded email into page data");
check(!/learner_email|learner_id/.test(publicQuery), "public DB query selects private recipient fields");
check(!/learner_email|learner_id/.test(clientBoundary), "client boundary references private DB field names");
check(!/learnerEmail|recipientEmail|credentialRecipientEmail/.test(clientBoundary), "client boundary accepts an expected recipient email alias");
check(!/from ["']@\/lib\/(?:neon|recipient-association)["']/.test(clientBoundary), "client boundary imports a private server module");
check(recipientAuth.includes('useState("")'), "signed-out OTP flow does not begin with user-supplied input");
check(!/request\.json\(|\.formData\(/.test(associationRoute), "association endpoint accepts caller-supplied comparison data");
check(!/export async function (?:POST|PUT|PATCH|DELETE)/.test(associationRoute), "association endpoint exposes a caller-supplied mutation method");
check(!/email|learner_id|database row/i.test(associationRoute), "association endpoint response source references private comparison operands");
check(associationRoute.includes("{ recipientAssociated }"), "association endpoint is not constrained to the boolean response contract");
check(associationRoute.includes('"Cache-Control": "private, no-store, max-age=0"'), "association endpoint is not explicitly private and no-store");
check(recipientAssociation.startsWith('import "server-only";'), "association helper lacks a server-only boundary");
check(databaseModule.startsWith('import "server-only";'), "database module lacks a server-only boundary");
check(recipientAssociation.indexOf("await auth()") < recipientAssociation.lastIndexOf("getPrivateIssuedCredentialRecipientEmail"), "private recipient lookup can occur before authentication");
check(recipientAssociation.includes("getVerifiedClerkEmailAddresses"), "association helper does not require verified Clerk emails");
check(!/currentUser|getIssuedCredentialRow|@\/lib\/neon/.test(evidencePage), "evidence page bypasses the shared server-only association helper");
check(evidencePage.includes("getCurrentUserRecipientAssociation"), "evidence page does not reuse the private association boundary");
check(!/verified holder|ownership verified|credential owner verified/i.test(clientBoundary), "client copy introduces a holder-proof claim");
const verificationBoundary = [
  verifierClient,
  verifierContract,
  verifyRoute,
  verificationModal,
  verificationStatusCopy,
].join("\n");
check(!/learner_email|learner_id/.test(verificationBoundary), "verification path references private DB recipient fields");
check(!/Clerk|OTP|recipientAssociation|recipientAssociated|currentUser|auth\(/.test(verifierClient + verifyRoute), "server verification transport references account or recipient state");
check(verifierClient.startsWith('import "server-only";'), "VeraCredentials client lacks a server-only boundary");
check(!/NEXT_PUBLIC_VERACREDENTIALS/.test(verificationBoundary), "VeraCredentials configuration is exposed through NEXT_PUBLIC");
check(verifierClient.includes('JSON.stringify({ credential })'), "VeraCredentials request is not constrained to the credential wrapper");
check(!/NextResponse\.json\(credential/.test(verifyRoute), "verify route returns the raw credential");
check(!/from ["']@\/lib\/(?:neon|recipient-association|recipient)["']/.test(verifyRoute), "verify route imports recipient or database helpers");
check(verificationModal.includes("Holder control was not evaluated"), "verification UI omits holder-neutral wording");
check(verificationStatusCopy.includes("Pinned historical status snapshot reports this credential active."), "historical active wording is inaccurate");
check(verificationStatusCopy.includes("Pinned historical status snapshot reports this credential revoked."), "historical revoked wording is inaccurate");
check(verificationStatusCopy.includes("Current status evidence was authenticated, but an active or revoked status could not be determined."), "authenticated-indeterminate current status wording is inaccurate");
check(verifierContract.includes('value.holderProven !== null'), "authoritative holderProven null is not enforced");
check(!/Proof of authenticity|Verify authenticity|cannot be forged|Issuer verified|authentic and currently active/.test(pageComponent + credentialActions), "pre-verification UI overclaims proof or trust");

console.log(`Credential privacy boundary checks passed (${assertionCount} assertions).`);
