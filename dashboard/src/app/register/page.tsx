'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { signUp } from '@/actions/auth';
import { SignUpFormValues, signUpSchema } from '@/schemas/auth';

export default function Register() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange',
  });

  const email = watch('email');
  const password = watch('password');

  // Tracks structural completion values to handle reactive button validation states
  useEffect(() => {
    setIsFormValid(!!email && !!password);
  }, [email, password]);

  const onSubmit = async (data: SignUpFormValues) => {
    setIsLoading(true);
    setError(null);

    // 1. Submit form data directly to your decoupled auth Server Action pipeline
    const result = await signUp(data);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    // 2. Automate user session sign-in using NextAuth standard credentials engine
    const signInResult = await signIn('credentials', {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    if (signInResult?.error) {
      router.push('/login');
      return;
    }

    // 3. Clear space and sync client state parameters into dashboard view layout
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-900 flex justify-center items-center px-4">
      <div className="bg-slate-800 p-8 rounded-2xl w-full max-w-md border border-slate-700 shadow-xl">
        <h2 className="text-3xl font-black text-white text-center mb-2">Create Account</h2>
        <p className="text-slate-400 text-sm text-center mb-6">Start mastering your AP/IB courses</p>
        
        {error && (
          <div className="bg-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-4 border border-red-500/30">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-white">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold mb-1 text-slate-300">
              School Email
            </label>
            <input 
              id="email"
              type="email" 
              {...register('email')}
              className="w-full bg-slate-900 border border-slate-700 p-3 rounded-lg focus:outline-none focus:border-indigo-500 text-white placeholder-slate-500" 
              placeholder="you@school.edu"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-400 font-medium">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold mb-1 text-slate-300">
              Password
            </label>
            <input 
              id="password"
              type="password" 
              {...register('password')}
              className="w-full bg-slate-900 border border-slate-700 p-3 rounded-lg focus:outline-none focus:border-indigo-500 text-white placeholder-slate-500" 
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-400 font-medium">{errors.password.message}</p>
            )}
          </div>

          <button 
            type="submit" 
            disabled={isLoading || !isFormValid}
            className={`w-full py-3 rounded-lg font-bold tracking-wide transition mt-4 flex items-center justify-center ${
              isLoading || !isFormValid 
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="mr-2 h-4 w-4 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </span>
            ) : (
              "Create Free Account"
            )}
          </button>
        </form>

        <p className="text-slate-400 text-sm text-center mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-400 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}