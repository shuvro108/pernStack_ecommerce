import { NextResponse } from "next/server";

// AI Search has been disabled
export async function POST(req) {
  return NextResponse.json(
    {
      error: "AI Search has been disabled",
      message:
        "This feature is no longer available. Please use the browse categories or manual search.",
    },
    { status: 403 },
  );
}
