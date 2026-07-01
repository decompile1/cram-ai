import { NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { inngest } from "@/inngest/client";

export async function POST(request: Request) {
  try {
    // 1. Authenticate user session
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized profile session' }, { status: 401 });
    }

    const { courseName, rawText } = await request.json();

    if (!rawText) {
      return NextResponse.json({ message: 'Missing note content' }, { status: 400 });
    }

    // 2. Create the initial StudySet with empty cards placeholder array
    const newStudySet = await db.studySet.create({
      data: {
        title: `${courseName} - ${new Date().toLocaleDateString()}`,
        course: courseName,
        cards: [], // Stays empty until the Inngest worker populates it
        userId: session.user.id,
      },
    });

    // 3. Dispatch payload asynchronously to your background Inngest worker
    await inngest.send({
      name: 'app/cram.requested',
      data: {
        studySetId: newStudySet.id,
        rawText: rawText,
        courseName: courseName,
      },
    });

    // 4. Return initial placeholder status so frontend knows to start polling
    return NextResponse.json({
      success: true,
      studySetId: newStudySet.id,
      cards: [
        { front: "Job Enqueued Successfully!", back: "Processing your text block right now." }
      ]
    }, { status: 200 });

  } catch (error) {
    console.error('Cram execution exception:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}