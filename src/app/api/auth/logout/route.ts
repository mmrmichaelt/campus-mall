import { NextResponse } from "next/server";
import { clearSession } from "../../../../lib/auth";

export async function POST() {
  try {
    await clearSession();

    return NextResponse.json({
      success: true,
      message: "You have been logged out.",
      redirectTo: "/",
    });
  } catch (error) {
    console.error("Campus Mall logout error:", error);

    return NextResponse.json(
      {
        error: "Unable to log out right now. Please try again.",
      },
      { status: 500 }
    );
  }
}
