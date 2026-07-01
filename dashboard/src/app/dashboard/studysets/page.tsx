'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface StudySet {
  id: string;
  title: string;
  studyGoal: string;
  outputType: string;
  difficulty: string;
  examDate?: string | null;
  createdAt: string;
}

export default function PastStudySetsPage() {
  const [studySets, setStudySets] = useState<StudySet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudySets = async () => {
      try {
        const res = await fetch('/api/study-sets');
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Failed to fetch study sets.');
        }

        setStudySets(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load study decks.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudySets();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-black mb-8">
          📁 Past Study Decks
        </h1>

        {loading ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
            Loading study decks...
          </div>
        ) : error ? (
          <div className="bg-red-950/30 border border-red-900 rounded-2xl p-8 text-center text-red-300">
            {error}
          </div>
        ) : studySets.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
            You have not created any study decks yet.
          </div>
        ) : (
          <div className="grid gap-4">
            {studySets.map((deck) => (
              <Link
                key={deck.id}
                href={`/dashboard/studysets/${deck.id}`}
                className="block bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500 transition"
              >
                <h2 className="text-xl font-bold">{deck.title}</h2>

                <div className="mt-2 text-sm text-slate-400 space-y-1">
                  <p>
                    <span className="text-slate-500">Goal:</span>{' '}
                    {deck.studyGoal}
                  </p>

                  <p>
                    <span className="text-slate-500">Type:</span>{' '}
                    {deck.outputType}
                  </p>

                  <p>
                    <span className="text-slate-500">Difficulty:</span>{' '}
                    {deck.difficulty}
                  </p>

                  {deck.examDate && (
                    <p>
                      <span className="text-slate-500">Exam Date:</span>{' '}
                      {new Date(deck.examDate).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <p className="text-xs text-slate-500 mt-3">
                  Created {new Date(deck.createdAt).toLocaleString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}