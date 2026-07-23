import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name, type, tax_id } = await req.json();

    if (!name || !type) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    // Initialize clerk client to create organization
    const client = await clerkClient();

    const organization = await client.organizations.createOrganization({
      name,
      createdBy: userId,
      publicMetadata: {
        type,
        tax_id,
      }
    });

    // Make the creator an admin and set the active organization
    // Note: Clerk automatically makes the creator an admin.
    
    return NextResponse.json(organization);
  } catch (error: any) {
    console.error("Error creating organization:", error);
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}
