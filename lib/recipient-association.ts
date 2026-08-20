import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";
import { getPrivateIssuedCredentialRecipientEmail } from "@/lib/neon";
import {
  anyVerifiedClerkEmailMatches,
  getVerifiedClerkEmailAddresses,
} from "@/lib/recipient";

export type RecipientAssociationStatus =
  | "not_authenticated"
  | "recipient_unavailable"
  | "associated"
  | "not_associated";

export async function getCurrentUserRecipientAssociation(
  credentialPageId: string,
): Promise<RecipientAssociationStatus> {
  const { userId } = await auth();

  if (!userId) {
    return "not_authenticated";
  }

  const user = await currentUser();

  if (!user) {
    return "not_authenticated";
  }

  const verifiedEmails = getVerifiedClerkEmailAddresses(user.emailAddresses);

  if (verifiedEmails.length === 0) {
    return "not_associated";
  }

  const expectedRecipientEmail =
    await getPrivateIssuedCredentialRecipientEmail(
      `urn:uuid:${credentialPageId}`,
    );

  if (!expectedRecipientEmail) {
    return "recipient_unavailable";
  }

  return anyVerifiedClerkEmailMatches(
    user.emailAddresses,
    expectedRecipientEmail,
  )
    ? "associated"
    : "not_associated";
}
