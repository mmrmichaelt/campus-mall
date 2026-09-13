import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          authenticated: false,
          user: null,
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user,
    });
  } catch (error) {
    console.error("Campus Mall current-user error:", error);

    return NextResponse.json(
      {
        authenticated: false,
        user: null,
        error: "Unable to load your account.",
      },
      { status: 500 }
    );
  }
}
