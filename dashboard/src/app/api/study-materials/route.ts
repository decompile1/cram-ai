import { NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { db } from '@/server/db';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const studySets = await db.studySet.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        studyGoal: true,
        outputType: true,
        difficulty: true,
        examDate: true,
        cards: true,
        createdAt: true,
      },
    });

  const notes = await db.notes.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

    return NextResponse.json({ studySets, notes });
  } catch (error) {
    console.error('Failed to fetch study sets:', error);

    return NextResponse.json(
      { message: 'Failed to fetch study sets.' },
      { status: 500 }
    );
  }
}