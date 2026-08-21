import type { BrowserSafeVerificationResult } from "./vera-credentials-contract.ts";

export function verificationStatusCopy(result: BrowserSafeVerificationResult) {
  if (result.profile === "unsupported") {
    return "This credential profile is not supported.";
  }

  if (result.profile === "vera_historical_cnc_canary_v1") {
    if (result.status.state === "active" && result.statusEvidencePinned) {
      return "Pinned historical status snapshot reports this credential active.";
    }
    if (result.status.state === "revoked" && result.statusEvidencePinned) {
      return "Pinned historical status snapshot reports this credential revoked.";
    }
    if (result.reasonCodes.includes("historical_status_evidence_invalid")) {
      return "Pinned historical status evidence is missing or invalid.";
    }
    return "Pinned historical status evidence was not successfully evaluated.";
  }

  if (result.status.state === "active" && result.statusObjectAuthenticated === true) {
    return "Authenticated current status reports this credential active.";
  }
  if (result.status.state === "revoked" && result.statusObjectAuthenticated === true) {
    return "Authenticated current status reports this credential revoked.";
  }
  if (result.status.state === "absent") {
    return "No credential-status mechanism is present.";
  }
  if (
    result.status.state === "indeterminate" &&
    result.statusObjectAuthenticated === true
  ) {
    return "Current status evidence was authenticated, but an active or revoked status could not be determined.";
  }
  return "Current credential status could not be authenticated.";
}
