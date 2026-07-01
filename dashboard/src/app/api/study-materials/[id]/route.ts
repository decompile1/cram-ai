import { NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { db } from '@/server/db';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { id } = await context.params;

  const studySet = await db.studySet.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!studySet) {
    return NextResponse.json(
      { message: 'Not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(studySet);
}