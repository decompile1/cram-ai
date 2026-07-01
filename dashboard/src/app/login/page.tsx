'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from "next-auth/react";

export default function Login() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    // Execute NextAuth client-side credentials authentication sign-in routine
    const result = await signIn("credentials", {
      name,
      email,
      password,
      redirect: false,
    });

    // Check if the NextAuth provider rejected the login attempt
    if (result?.error) {
      // Handle known error variations or default to a generic safety message
      if (result.error === "CredentialsSignin") {
        setError("Invalid email or password. Please try again.");
      } else {
        setError("Invalid credentials matching profile.");
      }
    } else {
      // Authentication successful: redirect the student into the active workspace console
      router.push('/dashboard');
      router.refresh();
    }
  } catch (err) {
    console.error("Authentication submission execution crash:", err);
    setError("An unexpected connection breakdown occurred. Please try again.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 font-sans">
      {/* Dynamic Branding Logo */}
      <Link href="/" className="text-2xl font-black text-indigo-400 tracking-wider mb-8 hover:opacity-80 transition">
        cram.ai
      </Link>

      <div className="bg-slate-900 p-8 rounded-2xl w-full max-w-md border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Subtle top ambient glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

        <h2 className="text-3xl font-extrabold text-white text-center mb-2">Welcome Back</h2>
        <p className="text-slate-400 text-sm text-center mb-8">Log in to resume your cram sessions</p>
        
        {error && (
          <div className="bg-red-500/10 text-red-400 p-4 rounded-xl text-sm mb-6 border border-red-500/20 flex items-center gap-2">
            ⚠️ <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-white">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-400">Email</label>
            <input 
              type="text" 
              required
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-800 p-3.5 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition placeholder-slate-600" 
              placeholder="Type your username"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-400">Email</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-800 p-3.5 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition placeholder-slate-600" 
              placeholder="you@gmail.com"
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Password</label>
              <a href="#" className="text-xs font-semibold text-indigo-400 hover:underline">Forgot password?</a>
            </div>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-800 p-3.5 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition placeholder-slate-600" 
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 py-3.5 rounded-xl font-bold tracking-wide shadow-lg shadow-indigo-600/20 transition duration-200 mt-6 flex justify-center items-center"
          >
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : "Log In"}
          </button>
        </form>

        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 border-t border-slate-800"></div>
          <span className="relative bg-slate-900 px-4 text-xs font-bold uppercase tracking-widest text-slate-500">New to the platform?</span>
        </div>

        <Link 
          href="/register" 
          className="block text-center w-full bg-slate-950 border border-slate-800 hover:border-slate-700 py-3.5 rounded-xl font-bold text-slate-300 hover:text-white transition duration-200"
        >
          Create Free Account
        </Link>
      </div>
      
      {/* Footer disclaimer */}
      <p className="text-center text-xs text-slate-600 mt-8 max-w-xs leading-relaxed">
        Secure authentication mapped via encrypted signatures to your PostgreSQL instance.
      </p>
    </div>
  );
}