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

interface Note {
  id: string;
  title: string;
  rawText: string;
  summary: string;
  createdAt: string;
}

export default function StudyMaterialsPage() {
  const [studySets, setStudySets] = useState<StudySet[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/study-materials');
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || 'Failed');

        setStudySets(data.studySets || []);
        setNotes(data.notes || []);
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-5xl mx-auto space-y-10">

        <h1 className="text-4xl font-black">📁 Past Content</h1>

        {loading ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
            Loading...
          </div>
        ) : error ? (
          <div className="bg-red-950/30 border border-red-900 rounded-2xl p-8 text-center text-red-300">
            {error}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Study Sets</h2>

              {studySets.map((deck) => (
                <Link
                  key={deck.id}
                  href={`/dashboard/study-materials/${deck.id}`}
                  className="block bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500 transition"
                >
                  <h3 className="text-xl font-bold">{deck.title}</h3>
                  <p className="text-sm text-slate-400 mt-2">
                    {deck.studyGoal} • {deck.outputType} • {deck.difficulty}
                  </p>
                </Link>
              ))}
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Notes</h2>

              {notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
                >
                  <h3 className="text-lg font-bold">{note.title}</h3>
                  <p className="text-sm text-slate-400 mt-2 line-clamp-3">
                    {note.summary}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}