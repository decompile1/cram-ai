import { NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { inngest } from "@/inngest/client";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized profile session' }, { status: 401 });
    }

    const { courseName, rawText } = await request.json();

    if (!rawText) {
      return NextResponse.json({ message: 'Missing note content' }, { status: 400 });
    }

    // 2. Write a temporary study set placeholder in Postgres via Prisma
    const newStudySet = await db.studySet.create({
      data: {
        title: `${courseName} - ${new Date().toLocaleDateString()}`,
        course: courseName,
        cards: [], // Stays empty until the Inngest worker populates it asynchronously
        userId: session.user.id,
      },
    });

    // 3. Dispatch the event payload to the local Inngest pipeline
    await inngest.send({
      name: 'app/cram.requested',
      data: {
        studySetId: newStudySet.id,
        rawText: rawText,
        courseName: courseName,
      },
    });

    return NextResponse.json({
      success: true,
      studySetId: newStudySet.id,
      flashcards: [
        { front: "Job Enqueued Successfully!", back: "Processing your text block right now." },
        { front: "Mock Card 1", back: "Test. test. test" }
      ]
    }, { status: 200 });

  } catch (error) {
    console.error('Cram execution exception:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}