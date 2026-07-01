import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { key } = await req.json();

  await db.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      image: key,
    },
  });

  return NextResponse.json({
    success: true,
  });
}