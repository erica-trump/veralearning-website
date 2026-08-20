import { NextResponse } from "next/server";
import { isUuid } from "@/lib/credentials";
import { getCurrentUserRecipientAssociation } from "@/lib/recipient-association";

export const dynamic = "force-dynamic";

interface RecipientAssociationRouteProps {
  params: Promise<{
    id: string;
  }>;
}

const privateNoStoreHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
};

function associationResponse(recipientAssociated: boolean, status = 200) {
  return NextResponse.json(
    { recipientAssociated },
    {
      status,
      headers: privateNoStoreHeaders,
    },
  );
}

export async function GET(
  _: Request,
  { params }: RecipientAssociationRouteProps,
) {
  const { id } = await params;

  if (!isUuid(id)) {
    return associationResponse(false, 404);
  }

  try {
    const association = await getCurrentUserRecipientAssociation(id);

    if (association === "not_authenticated") {
      return associationResponse(false, 401);
    }

    if (association === "recipient_unavailable") {
      return associationResponse(false, 503);
    }

    return associationResponse(association === "associated");
  } catch {
    return associationResponse(false, 500);
  }
}
