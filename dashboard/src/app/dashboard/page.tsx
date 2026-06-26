'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

interface Flashcard {
  front: string;
  back: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [course, setCourse] = useState('AP US History');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  
  const [flashcards, setFlashcards] = useState<Flashcard[]>([
    { 
      front: "Welcome to cram.ai!", 
      back: "Paste your notes on the left and click 'Transform' to generate custom CED-aligned flashcards." 
    }
  ]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseName: course,
          rawText: notes,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatusMessage('✨ AI Job added to queue! Check your Inngest dashboard.');
        
        if (data.flashcards && data.flashcards.length > 0) {
          setFlashcards(data.flashcards);
          setCurrentCardIndex(0);
          setIsFlipped(false);
        }
      } else {
        setStatusMessage(`❌ Error: ${data.message || 'Failed to dispatch job.'}`);
      }
    } catch (err) {
      console.error(err);
      setStatusMessage('❌ Network error tracking background job.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-950 flex justify-center items-center text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col md:flex-row">
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-slate-900 p-6 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between">
        <div>
          <div className="text-xl font-black text-indigo-400 tracking-wider mb-8">cram.ai Console</div>
          <nav className="space-y-2">
            <button className="w-full text-left bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 p-3 rounded-xl font-semibold">⚡ New Cram Session</button>
            <button className="w-full text-left text-slate-400 hover:text-white hover:bg-slate-800 p-3 rounded-xl transition">📁 Past Study Decks</button>
          </nav>
        </div>
        
        <div className="space-y-4">
          <div className="text-xs text-slate-500 truncate">
            Logged in as:<br/>
            <span className="text-slate-300 font-medium">{session?.user?.email}</span>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full bg-slate-950 border border-slate-800 hover:border-red-900/30 text-slate-400 hover:text-red-400 p-2.5 rounded-xl text-sm font-medium transition"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main UI Arena */}
      <main className="flex-1 p-6 lg:p-12 max-w-5xl mx-auto w-full grid md:grid-cols-2 gap-8 items-start">
        
        {/* Left Side: Input Form */}
        <section className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-xl font-bold tracking-wide">Generate Study Set</h2>
          
          {statusMessage && (
            <div className="text-sm bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300">
              {statusMessage}
            </div>
          )}

          <div>
            <label className="block text-sm text-slate-400 mb-1">Target AP / IB Course</label>
            <select value={course} onChange={(e) => setCourse(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl focus:outline-none focus:border-indigo-500">
              <option>AP US History</option>
              <option>AP World History</option>
              <option>AP Biology</option>
              <option>AP Chemistry</option>
              <option>AP Macroeconomics</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Paste Your Notes or Handouts</label>
            <textarea rows={8} value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl focus:outline-none focus:border-indigo-500 placeholder-slate-600" placeholder="Paste class slides, textbook transcriptions, or handwritten notes here..."/>
          </div>
          <button onClick={handleCramGeneration} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 py-3 rounded-xl font-bold tracking-wide transition flex justify-center items-center">
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : "Transform to CED Flashcards"}
          </button>
        </section>

        {/* Right Side: Interactive AI Flashcard Visualizer */}
        <section className="flex flex-col items-center justify-center space-y-6">
          <h2 className="text-xl font-bold self-start text-slate-400">Interactive Recall Center</h2>
          
          {/* Flashcard Frame */}
          <div onClick={() => setIsFlipped(!isFlipped)} className="w-full h-64 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 flex flex-col justify-center items-center text-center border border-slate-700 cursor-pointer shadow-2xl relative select-none hover:border-indigo-500 transition duration-300">
            <span className="absolute top-4 left-6 text-xs font-bold text-indigo-400 tracking-widest uppercase">
              {isFlipped ? "Answer / CED Context" : "Key Concept / Prompt"}
            </span>
            <p className="text-xl font-medium px-4 transition-all duration-200">
              {isFlipped ? flashcards[currentCardIndex]?.back : flashcards[currentCardIndex]?.front}
            </p>
            <span className="absolute bottom-4 text-xs text-slate-500">Click card to flip</span>
          </div>

          {/* Flashcard Pagination Navigation */}
          <div className="flex items-center space-x-6">
            <button 
              disabled={currentCardIndex === 0}
              onClick={() => { setCurrentCardIndex(prev => prev - 1); setIsFlipped(false); }}
              className="bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 p-3 rounded-full text-lg transition"
            >
              ⬅️
            </button>
            <span className="text-slate-400 font-medium">
              {currentCardIndex + 1} of {flashcards.length}
            </span>
            <button 
              disabled={currentCardIndex === flashcards.length - 1}
              onClick={() => { setCurrentCardIndex(prev => prev + 1); setIsFlipped(false); }}
              className="bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 p-3 rounded-full text-lg transition"
            >
              ➡️
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}