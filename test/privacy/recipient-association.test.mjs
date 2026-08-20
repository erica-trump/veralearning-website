import assert from "node:assert/strict";
import test from "node:test";
import {
  anyVerifiedClerkEmailMatches,
  getVerifiedClerkEmailAddresses,
} from "../../lib/recipient.ts";

function clerkEmail(emailAddress, status) {
  return {
    emailAddress,
    verification: status === null ? null : { status },
  };
}

test("selects every and only Clerk-verified email", () => {
  const emails = [
    clerkEmail("primary@example.com", "verified"),
    clerkEmail("secondary@example.com", "verified"),
    clerkEmail("pending@example.com", "unverified"),
    clerkEmail("missing@example.com", null),
  ];

  assert.deepEqual(getVerifiedClerkEmailAddresses(emails), [
    "primary@example.com",
    "secondary@example.com",
  ]);
});

test("matches any verified Clerk email, not only the primary email", () => {
  const emails = [
    clerkEmail("primary@example.com", "verified"),
    clerkEmail("recipient@example.com", "verified"),
  ];

  assert.equal(
    anyVerifiedClerkEmailMatches(emails, "recipient@example.com"),
    true,
  );
});

test("preserves trim-and-lowercase comparison semantics", () => {
  const emails = [clerkEmail(" Recipient@Example.COM ", "verified")];

  assert.equal(
    anyVerifiedClerkEmailMatches(emails, "recipient@example.com"),
    true,
  );
});

test("does not associate an otherwise matching unverified email", () => {
  const emails = [clerkEmail("recipient@example.com", "unverified")];

  assert.equal(
    anyVerifiedClerkEmailMatches(emails, "recipient@example.com"),
    false,
  );
});

test("does not associate an email without verification state", () => {
  const emails = [clerkEmail("recipient@example.com", null)];

  assert.equal(
    anyVerifiedClerkEmailMatches(emails, "recipient@example.com"),
    false,
  );
});

test("does not associate when no private expected email exists", () => {
  const emails = [clerkEmail("recipient@example.com", "verified")];

  assert.equal(anyVerifiedClerkEmailMatches(emails, null), false);
});
