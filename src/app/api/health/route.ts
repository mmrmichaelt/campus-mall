import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        success: true,
        status: "healthy",
        database: "connected",
        service: "campus-mall",
        timestamp: new Date().toISOString(),
        responseTimeMs: Date.now() - startedAt,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Campus Mall health check failed:", error);

    return NextResponse.json(
      {
        success: false,
        status: "unhealthy",
        database: "unavailable",
        service: "campus-mall",
        timestamp: new Date().toISOString(),
        responseTimeMs: Date.now() - startedAt,
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
