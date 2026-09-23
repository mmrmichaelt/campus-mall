import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getCurrentUser } from "../../../lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to upload photos." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll("files").filter(
      (value): value is File => value instanceof File
    );

    if (files.length < 1 || files.length > 5) {
      return NextResponse.json(
        { error: "Please select between 1 and 5 photos." },
        { status: 400 }
      );
    }

    const urls: string[] = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.has(file.type)) {
        return NextResponse.json(
          { error: "Only JPG, PNG, WEBP and GIF photos are allowed." },
          { status: 400 }
        );
      }

      if (file.size > MAX_BYTES) {
        return NextResponse.json(
          { error: "Each photo must be 4 MB or smaller." },
          { status: 400 }
        );
      }

      const safeName = file.name
        .replace(/[^a-zA-Z0-9._-]/g, "-")
        .slice(-80);

      const blob = await put(
        `campus-mall/${user.id}/${Date.now()}-${safeName}`,
        file,
        {
          access: "public",
          addRandomSuffix: true,
          contentType: file.type,
        }
      );

      urls.push(blob.url);
    }

    return NextResponse.json({
      success: true,
      urls,
    });
  } catch (error) {
    console.error("Campus Mall photo upload error:", error);

    return NextResponse.json(
      { error: "Unable to upload your photos right now. Please try again." },
      { status: 500 }
    );
  }
}
