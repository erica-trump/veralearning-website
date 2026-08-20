function getInitialsFromName(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
  }

  return parts[0]?.slice(0, 2).toUpperCase() || "VL";
}

export function getRecipientInitials(email: string | null | undefined) {
  if (!email) {
    return "VL";
  }

  const localPart = email.split("@")[0]?.trim() ?? "";

  if (!localPart) {
    return "VL";
  }

  const segments = localPart
    .split(/[._-]+/)
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (segments.length >= 2) {
    return `${segments[0][0] ?? ""}${segments[1][0] ?? ""}`.toUpperCase();
  }

  return localPart.slice(0, 2).toUpperCase();
}

export function getRecipientInitialsFromIdentity({
  name,
  email,
}: {
  name?: string | null;
  email?: string | null;
}) {
  if (name?.trim()) {
    return getInitialsFromName(name);
  }

  return getRecipientInitials(email);
}

export function emailsMatch(
  left: string | null | undefined,
  right: string | null | undefined,
) {
  if (!left || !right) {
    return false;
  }

  return left.trim().toLowerCase() === right.trim().toLowerCase();
}

export function anyEmailMatches(
  emails: Array<string | null | undefined>,
  target: string | null | undefined,
) {
  return emails.some((email) => emailsMatch(email, target));
}

export interface ClerkEmailForRecipientAssociation {
  emailAddress: string;
  verification: {
    status: string | null;
  } | null;
}

export function getVerifiedClerkEmailAddresses(
  emailAddresses: readonly ClerkEmailForRecipientAssociation[],
) {
  return emailAddresses
    .filter((email) => email.verification?.status === "verified")
    .map((email) => email.emailAddress);
}

export function anyVerifiedClerkEmailMatches(
  emailAddresses: readonly ClerkEmailForRecipientAssociation[],
  target: string | null | undefined,
) {
  return anyEmailMatches(getVerifiedClerkEmailAddresses(emailAddresses), target);
}
