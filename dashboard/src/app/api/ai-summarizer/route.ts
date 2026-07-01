import { NextResponse } from "next/server";
import { db } from "@/server/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const mode = (formData.get("mode") as string) || "summary";

  if (!file) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const text = buffer.toString("utf8");

  const res = await fetch(`${process.env.CRAM_AI_ROUTE}/api/summarize-pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, mode }),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json({ error: data.error }, { status: 500 });
  }

  const userId = req.headers.get("x-user-id") as string;

  if (data.summary) {
    await db.notes.create({
      data: {
        title: file.name,
        rawText: data.rawText ?? "",
        summary: data.summary ?? "",
        userId,
      },
    });
  }

  if (data.flashcards?.length) {
    await db.studySet.create({
      data: {
        title: file.name,
        studyGoal: "PDF Study",
        outputType: "flashcards",
        difficulty: "medium",
        cards: data.flashcards,
        userId,
      },
    });
  }

  return NextResponse.json(data);
}