import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

import { ConvexHttpClient } from "convex/browser";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name, type, tax_id, details } = await req.json();

    if (!name || !type) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    // Connect to Convex to check for duplicates
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    
    let exists = false;
    if (type === "SUPPLIER" || type === "CORPORATE") {
      if (details?.tax_id) {
        exists = await convex.query("companies:checkExists" as any, { tax_id: details.tax_id });
      }
    } else if (type === "BANK") {
      if (details?.banking_license) {
        exists = await convex.query("companies:checkExists" as any, { banking_license: details.banking_license });
      }
    }

    if (exists) {
      return new NextResponse("This entity (Tax ID or License) is already registered in our system.", { status: 409 });
    }

    // Initialize clerk client to create organization
    const client = await clerkClient();

    const organization = await client.organizations.createOrganization({
      name,
      createdBy: userId,
      publicMetadata: {
        type,
        tax_id, // For backward compatibility
        details,
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
