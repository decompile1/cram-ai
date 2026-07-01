"use client";

import { useState } from "react";

interface Flashcard {
  question: string;
  answer: string;
}

interface Result {
  summary?: string;
  rawText?: string;
  flashcards?: Flashcard[];
}

export default function AISummarizerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"summary" | "flashcards" | "raw text">(
    "summary"
  );

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  async function handleUpload() {
    if (!file) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", mode);

      const res = await fetch("/api/ai-summarizer", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed");

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">

        <h1 className="text-4xl font-black">📄 AI PDF Summarizer</h1>

        <p className="text-slate-400">
          Upload a PDF and choose how Cram AI processes it.
        </p>

        {/* MODE SELECTOR */}
        <div className="flex gap-3">
          {["summary", "flashcards", "raw"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m as any)}
              className={`px-4 py-2 rounded-xl border ${
                mode === m
                  ? "bg-indigo-600 border-indigo-500"
                  : "bg-slate-900 border-slate-800"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Upload */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-slate-400"
          />

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="bg-indigo-600 px-4 py-2 rounded-xl font-medium disabled:opacity-50"
          >
            {loading ? "Processing..." : "Upload & Generate"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="text-red-400 bg-red-950/20 p-4 rounded-xl">
            {error}
          </div>
        )}

        {/* RESULT */}
        {result && (
          <div className="space-y-6">

            {/* SUMMARY */}
            {result.summary && (
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <h2 className="text-xl font-bold mb-2">Summary</h2>
                <p className="text-slate-300 whitespace-pre-wrap">
                  {result.summary}
                </p>
              </div>
            )}

            {/* RAW NOTES */}
            {result.rawText && (
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <h2 className="text-xl font-bold mb-2">Raw Notes</h2>
                <p className="text-slate-300 whitespace-pre-wrap">
                  {result.rawText}
                </p>
              </div>
            )}

            {/* FLASHCARDS */}
            {result.flashcards && (
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <h2 className="text-xl font-bold mb-4">Flashcards</h2>

                <div className="space-y-3">
                  {result.flashcards.map((card, i) => (
                    <div key={i} className="p-4 bg-slate-800 rounded-xl">
                      <p className="font-semibold">Q: {card.question}</p>
                      <p className="text-slate-300">A: {card.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}