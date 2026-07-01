import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { getAvatarUrl } from "@/lib/s3";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { fileType } = await req.json();

  const data = await getAvatarUrl(fileType);

  return NextResponse.json(data);
}