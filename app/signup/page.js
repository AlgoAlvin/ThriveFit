'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase.js';

export default function SignUpPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
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
        // Sign up with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
            data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            username: formData.username,
            }
        }
        });

        if (authError) throw authError;

        // Create profile in profiles table
        const { error: profileError } = await supabase
        .from('profiles')
        .insert([
            {
            id: authData.user.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            username: formData.username,
            }
        ]);

        if (profileError) throw profileError;

        // Redirect to onboarding
        router.push('/onboarding');
    } catch (error) {
        setError(error.message);
        console.error('Sign up error:', error);
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
            Sign Up to Start Your Fitness Journey
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
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleInputChange}
            required
            className="w-full px-6 py-4 rounded-lg border-2 border-[#9E9E9E] bg-[#F5F5F5] text-[#5A5A5A] text-lg placeholder-[#9E9E9E] focus:outline-none focus:border-[#81D4FA]"
            />

            <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleInputChange}
            required
            className="w-full px-6 py-4 rounded-lg border-2 border-[#9E9E9E] bg-[#F5F5F5] text-[#5A5A5A] text-lg placeholder-[#9E9E9E] focus:outline-none focus:border-[#81D4FA]"
            />

            <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleInputChange}
            required
            className="w-full px-6 py-4 rounded-lg border-2 border-[#9E9E9E] bg-[#F5F5F5] text-[#5A5A5A] text-lg placeholder-[#9E9E9E] focus:outline-none focus:border-[#81D4FA]"
            />

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
            minLength={6}
            className="w-full px-6 py-4 rounded-lg border-2 border-[#9E9E9E] bg-[#F5F5F5] text-[#5A5A5A] text-lg placeholder-[#9E9E9E] focus:outline-none focus:border-[#81D4FA]"
            />

            <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#B3E5FC] hover:bg-[#81D4FA] text-[#5A5A5A] text-xl font-semibold px-6 py-4 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
            {loading ? 'Creating Account...' : 'Sign Up'}
            </button>

            <p className="text-center text-[#757575]">
            Already have an account?{' '}
            <Link href="/login" className="text-[#5A5A5A] underline hover:no-underline">
                Log In
            </Link>
            </p>
        </form>
        </div>
    </div>
    );
}