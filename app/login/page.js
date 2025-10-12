'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Sign in with Supabase Auth
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        // Handle specific error cases
        if (signInError.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please try again');
        } else if (signInError.message.includes('Email not confirmed') || signInError.message.includes('email_not_confirmed')) {
          throw new Error('Please check your email and click the verification link before signing in.');
        } else {
          throw signInError;
        }
      }

      // Check if user exists in users table
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      // If no user record exists, redirect to onboarding
      if (userError && userError.code === 'PGRST116') {
        console.log('No user record found, redirecting to onboarding');
        router.push('/onboarding');
        return;
      }

      // Check if user has a profile (measurements)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      // If no profile exists, redirect to onboarding
      if (profileError && profileError.code === 'PGRST116') {
        console.log('No profile found, redirecting to onboarding');
        router.push('/onboarding');
        return;
      }

      // If profile exists but onboarding data is incomplete, redirect to onboarding
      if (profile) {
        const hasIncompleteProfile = !profile.gender || 
                                      !profile.height || 
                                      !profile.weight || 
                                      !profile.age;
        
        if (hasIncompleteProfile) {
          console.log('Profile incomplete, redirecting to onboarding');
          router.push('/onboarding');
          return;
        }
      }

      // If everything is complete, go to dashboard
      console.log('Profile complete, redirecting to dashboard');
      router.push('/dashboard');
    } catch (error) {
      setError(error.message);
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="w-1/2 bg-[#C8E6C9] flex flex-col justify-center items-center p-12">
        <div className="mb-8 self-start">
          <Link href="/">
            <h1 className="text-5xl font-bold text-[#5A5A5A] cursor-pointer hover:opacity-80">
              thrive
            </h1>
          </Link>
        </div>
        <h2 className="text-5xl font-bold text-[#5A5A5A] leading-tight">
          Sign In to Continue Your Fitness Journey
        </h2>
      </div>

      {/* Right Side - Form */}
      <div className="w-1/2 bg-[#F5F5F5] flex flex-col justify-center items-center p-12">
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-6 py-4 rounded-lg border-2 border-[#9E9E9E] bg-[#F5F5F5] text-[#5A5A5A] text-lg placeholder-[#9E9E9E] focus:outline-none focus:border-[#81D4FA]"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            required
            className="w-full px-6 py-4 rounded-lg border-2 border-[#9E9E9E] bg-[#F5F5F5] text-[#5A5A5A] text-lg placeholder-[#9E9E9E] focus:outline-none focus:border-[#81D4FA]"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#B3E5FC] hover:bg-[#81D4FA] text-[#5A5A5A] text-xl font-semibold px-6 py-4 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          <p className="text-center text-[#757575]">
            Don't have an account?{' '}
            <Link href="/signup" className="text-[#5A5A5A] underline hover:no-underline">
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}