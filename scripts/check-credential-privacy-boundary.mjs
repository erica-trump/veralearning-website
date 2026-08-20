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
] = await Promise.all([
  read("lib/credentials.ts"),
  read("components/credentials/credential-page.tsx"),
  read("components/credentials/recipient-gate.tsx"),
  read("components/credentials/recipient-access-auth.tsx"),
  read("lib/recipient-association.ts"),
  read("app/api/credentials/[id]/recipient-association/route.ts"),
  read("lib/neon.ts"),
  read("app/(credentials)/credentials/[id]/evidence/page.tsx"),
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

console.log(`Credential privacy boundary checks passed (${assertionCount} assertions).`);
