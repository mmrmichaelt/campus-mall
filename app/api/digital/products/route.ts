import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const typeParam = searchParams.get("type");
    const network = searchParams.get("network");

    const type =
      typeParam === "DATA" || typeParam === "AIRTIME"
        ? typeParam
        : undefined;

    const products = await prisma.digitalProduct.findMany({
      where: {
        active: true,

        ...(type
          ? {
              type,
            }
          }
          : {}),

        ...(network
          ? {
              network,
            }
          }
          : {}),
      },

      orderBy: [
        {
          network: "asc",
        },

        {
          amount: "asc",
        },
      ],

      select: {
        id: true,
        type: true,
        network: true,
        name: true,
        description: true,
        amount: true,
        providerCode: true,
      },
    });

    return NextResponse.json({
      products,
    });
  } catch (error) {
    console.error("Digital products error:", error);

    return NextResponse.json(
      {
        error: "Unable to load digital products.",
      },
      {
        status: 500,
      },
    );
  }
}
