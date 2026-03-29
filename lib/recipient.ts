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
