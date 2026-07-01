import { NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { inngest } from '@/inngest/client';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized profile session' },
        { status: 401 }
      );
    }

    const {
      studyGoal,
      outputType,
      difficulty,
      examDate,
      rawText,
    } = await request.json();

    if (!rawText?.trim()) {
      return NextResponse.json(
        { message: 'Missing note content' },
        { status: 400 }
      );
    }

    const title = `${outputType} - ${new Date().toLocaleDateString()}`;

    const newStudySet = await db.studySet.create({
      data: {
        title,
        studyGoal,
        outputType,
        difficulty,
        cards: [],
        userId: session.user.id,
      },
    });

    await inngest.send({
      name: 'app/cram.requested',
      data: {
        studySetId: newStudySet.id,
        rawText,
        studyGoal,
        outputType,
        difficulty,
        examDate,
      },
    });

    return NextResponse.json(
      {
        success: true,
        studySetId: newStudySet.id,
        flashcards: [
          {
            question: 'Job Enqueued Successfully!',
            answer:
              'Processing your study materials right now.',
          },
        ],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Cram execution exception:', error);

    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}