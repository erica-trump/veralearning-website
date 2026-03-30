import { NextResponse } from "next/server";
import { isUuid } from "@/lib/credentials";
import { verifyCredential } from "@/lib/verify-credential";

interface VerifyRouteProps {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_: Request, { params }: VerifyRouteProps) {
  const { id } = await params;

  if (!isUuid(id)) {
    return NextResponse.json(
      {
        error: {
          code: "invalid_id",
          message: "The credential ID is not a valid UUID.",
        },
      },
      { status: 404 },
    );
  }

  const { result } = await verifyCredential({ id });

  return NextResponse.json(result, {
    status: result.status === "verified" ? 200 : 422,
  });
}
