'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Flashcard {
  question: string;
  answer: string;
}

interface StudySet {
  id: string;
  title: string;
  studyGoal: string;
  outputType: string;
  difficulty: string;
  examDate?: string | null;
  cards: Flashcard[];
  createdAt: string;
}

export default function StudySetPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [studySet, setStudySet] = useState<StudySet | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentCard, setCurrentCard] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchStudySet = async () => {
      try {
        const res = await fetch(`/api/study-sets/${id}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Failed to fetch study set');
        }

        const normalized: StudySet = {
          ...data,
          cards: Array.isArray(data.cards)
            ? data.cards
            : JSON.parse(data.cards || '[]'),
        };

        setStudySet(normalized);
      } catch (err) {
        console.error(err);
        setStudySet(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStudySet();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading study deck...
      </div>
    );
  }

  if (!studySet) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Study set not found.
      </div>
    );
  }

  const cards = studySet.cards ?? [];
  const card = cards[currentCard];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">

        <Link href="/studysets" className="text-slate-400 hover:text-white">
          ← Back to Study Decks
        </Link>

        {/* HEADER */}
        <div>
          <h1 className="text-4xl font-black">{studySet.title}</h1>

          <div className="mt-3 text-sm text-slate-400 space-y-1">
            <p>
              <span className="text-slate-500">Goal:</span>{' '}
              {studySet.studyGoal}
            </p>

            <p>
              <span className="text-slate-500">Type:</span>{' '}
              {studySet.outputType}
            </p>

            <p>
              <span className="text-slate-500">Difficulty:</span>{' '}
              {studySet.difficulty}
            </p>
          </div>
        </div>

        {/* FLASHCARDS */}
        {cards.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
            This study set has no flashcards.
          </div>
        ) : (
          <>
            <div
              onClick={() => setFlipped(!flipped)}
              className="h-80 bg-linear-to-br from-slate-800 to-slate-900 rounded-3xl border border-slate-700 flex items-center justify-center text-center p-10 cursor-pointer hover:border-indigo-500 transition"
            >
              <p className="text-2xl font-medium">
                {flipped ? card.answer : card.question}
              </p>
            </div>

            <div className="flex items-center justify-center gap-8">
              <button
                disabled={currentCard === 0}
                onClick={() => {
                  setCurrentCard((c) => c - 1);
                  setFlipped(false);
                }}
                className="bg-slate-800 p-3 rounded-full disabled:opacity-30"
              >
                ⬅️
              </button>

              <span className="text-slate-400">
                {currentCard + 1} of {cards.length}
              </span>

              <button
                disabled={currentCard === cards.length - 1}
                onClick={() => {
                  setCurrentCard((c) => c + 1);
                  setFlipped(false);
                }}
                className="bg-slate-800 p-3 rounded-full disabled:opacity-30"
              >
                ➡️
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}