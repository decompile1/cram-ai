'use client';

import { useState } from 'react';

interface Flashcard {
  question: string;
  answer: string;
}

export default function Dashboard() {
  const [studyGoal, setStudyGoal] = useState('Exam Prep');
  const [outputType, setOutputType] = useState('Flashcards');
  const [difficulty, setDifficulty] = useState('Medium');
  const [examDate, setExamDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleCramGeneration = async () => {
    if (!notes.trim()) {
      setStatusMessage('⚠️ Please paste some notes before generating!');
      return;
    }

    setLoading(true);
    setStatusMessage('🚀 Dispatching AI background worker...');

    try {
      const response = await fetch('/api/cram/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studyGoal,
          outputType,
          difficulty,
          examDate,
          rawText: notes,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatusMessage(
          'Cram AI is now generating your flashcards! This may take a few moments. Check "Past Study Sets" to view your study set'
        );
      } else {
        setStatusMessage(
          `❌ Error: ${
            data.message || 'Failed to dispatch job.'
          }`
        );
      }
    } catch (err) {
      console.error(err);
      setStatusMessage(
        '❌ Network error tracking background job.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col md:flex-row">
      <main className="flex-1 p-6 lg:p-12 max-w-5xl mx-auto w-full grid md:grid-cols-2 gap-8 items-start">
        <section className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-xl font-bold tracking-wide">
            Generate Study Set
          </h2>

          {statusMessage && (
            <div className="text-sm bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300">
              {statusMessage}
            </div>
          )}

          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Study Goal
            </label>
            <select
              value={studyGoal}
              onChange={(e) =>
                setStudyGoal(e.target.value)
              }
              className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl focus:outline-none focus:border-indigo-500"
            >
              <option>Exam Prep</option>
              <option>Memorization</option>
              <option>Concept Review</option>
              <option>Last-Minute Cramming</option>
              <option>Practice Questions</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Output Type
            </label>
            <select
              value={outputType}
              onChange={(e) =>
                setOutputType(e.target.value)
              }
              className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl focus:outline-none focus:border-indigo-500"
            >
              <option>Flashcards</option>
              <option>Practice Test</option>
              <option>Study Guide</option>
              <option>Summary Notes</option>
              <option>Mixed Study Set</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Difficulty Level
            </label>
            <select
              value={difficulty}
              onChange={(e) =>
                setDifficulty(e.target.value)
              }
              className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl focus:outline-none focus:border-indigo-500"
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
              <option>AP / College Level</option>
              <option>Graduate Level</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Exam Date
            </label>
            <input
              type="date"
              value={examDate}
              onChange={(e) =>
                setExamDate(e.target.value)
              }
              className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Paste Your Notes or Handouts
            </label>
            <textarea
              rows={8}
              value={notes}
              onChange={(e) =>
                setNotes(e.target.value)
              }
              className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl focus:outline-none focus:border-indigo-500 placeholder-slate-600"
              placeholder="Paste class slides, textbook transcriptions, or handwritten notes here..."
            />
          </div>

          <button
            onClick={handleCramGeneration}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 py-3 rounded-xl font-bold tracking-wide transition flex justify-center items-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              'Generate Study Materials'
            )}
          </button>
        </section>
      </main>
    </div>
  );
}