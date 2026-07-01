import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/server/auth';

export default async function LandingPage() {
  const session = await auth();

  if (session?.user?.id) {
    redirect('/dashboard');
  }

  return (
    <div className="bg-slate-900 text-white min-h-screen font-sans">
      {/* Navbar */}
      <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center border-b border-slate-800">
        <div className="text-2xl font-black text-indigo-400 tracking-wider">
          cram.ai
        </div>

        <div className="space-x-4">
          <Link
            href="/login"
            className="text-slate-300 hover:text-white transition"
          >
            Log In
          </Link>

          <Link
            href="/register"
            className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg font-medium transition"
          >
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-5xl mx-auto px-6 text-center pt-24 pb-16">
        <span className="bg-indigo-950 text-indigo-400 border border-indigo-800 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide uppercase">
          AI-Powered Study Tools
        </span>

        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mt-6 leading-tight">
          Cram AI offers AI models to succeed in{' '}
          <span className="text-indigo-400">any subject</span>
        </h1>

        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mt-6">
          Quizlet and most flashcard/study tools can be slow,
          clunky, and bloated with ads. Cram AI gets rid of all of that.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link
            href="/register"
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 px-8 py-4 rounded-xl text-lg font-bold shadow-lg shadow-indigo-600/30 transition"
          >
            Generate Your First Study Guide
          </Link>
        </div>
      </header>

      {/* Feature Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-8 border-t border-slate-800">
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-800">
          <div className="text-3xl mb-4">🎯</div>
          <h3 className="text-xl font-bold mb-2">
            Strict CED Alignment
          </h3>
          <p className="text-slate-400">
            Our AI filters out textbook fluff and formats your study data
          </p>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-800">
          <div className="text-3xl mb-4">🗂️</div>
          <h3 className="text-xl font-bold mb-2">
            Instant Active Recall
          </h3>
          <p className="text-slate-400">
            Pasted notes turn into beautiful, interactive,
            mobile-friendly flipping flashcards instantly.
          </p>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-800">
          <div className="text-3xl mb-4">⚖️</div>
          <h3 className="text-xl font-bold mb-2">
            Educational Equity
          </h3>
          <p className="text-slate-400">
            Closing the achievement gap by making elite academic tools
            available to every student, everywhere.
          </p>
        </div>
      </section>
    </div>
  );
}