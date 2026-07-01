import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { getPresignedUrl } from "@/lib/s3";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      image: true,
    },
  });

  if (!user?.image) {
    return NextResponse.json({
      url: null,
    });
  }

  const url = await getPresignedUrl({
    key: user.image,
  });

  return NextResponse.json({
    url,
  });
}