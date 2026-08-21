import { NextResponse } from "next/server";
import {
  CredentialArtifactError,
  getCredentialArtifact,
  isCredentialUuid,
} from "@/lib/credential-artifact";
import {
  VeraCredentialsClientError,
  verifyWithVeraCredentials,
} from "@/lib/vera-credentials-client";

export const dynamic = "force-dynamic";

interface VerifyRouteProps {
  params: Promise<{
    id: string;
  }>;
}

const noStoreHeaders = {
  "Cache-Control": "no-store, max-age=0",
};

function errorResponse({
  category,
  code,
  message,
  status,
}: {
  category: "artifact_invalid" | "artifact_unavailable" | "verification_unavailable";
  code: string;
  message: string;
  status: number;
}) {
  return NextResponse.json(
    { error: { category, code, message } },
    { status, headers: noStoreHeaders },
  );
}

export async function GET(_: Request, { params }: VerifyRouteProps) {
  const { id } = await params;

  if (!isCredentialUuid(id)) {
    return errorResponse({
      category: "artifact_invalid",
      code: "invalid_id",
      message: "The credential ID is not a valid UUID.",
      status: 404,
    });
  }

  let credential: Record<string, unknown>;
  try {
    ({ credential } = await getCredentialArtifact(id));
  } catch (error) {
    if (error instanceof CredentialArtifactError) {
      const unavailable = error.category === "unavailable";
      return errorResponse({
        category: unavailable ? "artifact_unavailable" : "artifact_invalid",
        code: error.code,
        message: unavailable
          ? "The credential badge is unavailable right now."
          : "The credential badge artifact is invalid.",
        status: error.code === "badge_fetch_timeout" ? 504 : unavailable ? 502 : 422,
      });
    }

    return errorResponse({
      category: "artifact_unavailable",
      code: "badge_fetch_failed",
      message: "The credential badge is unavailable right now.",
      status: 502,
    });
  }

  try {
    const result = await verifyWithVeraCredentials(credential);

    return NextResponse.json(result, {
      status: 200,
      headers: noStoreHeaders,
    });
  } catch (error) {
    const code =
      error instanceof VeraCredentialsClientError
        ? error.code
        : "verifier_network_failure";
    return errorResponse({
      category: "verification_unavailable",
      code,
      message: "Credential verification is unavailable right now.",
      status:
        code === "verifier_timeout"
          ? 504
          : code === "verifier_configuration_invalid"
            ? 503
            : 502,
    });
  }
}
