'use client';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-[#C8E6C9] py-8">
        <h1 className="text-center text-6xl font-bold text-[#5A5A5A]">thrive</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-[#F5F5F5] flex flex-col items-center justify-center px-8">
        <h2 className="text-3xl text-[#9E9E9E] text-center mb-4">
          Welcome to thrive – Your Fitness and Nutrition Mentor
        </h2>
        <p className="text-xl text-[#9E9E9E] text-center mb-12 max-w-3xl">
          Eat smarter. Train Harder. Reach your fitness and health goals effortlessly.
          Thrive helps you track your fitness journey and reach your fitness goals.
        </p>
        
        {/* Call to Action Buttons */}
        <Link href="/signup">
          <button className="bg-[#B3E5FC] hover:bg-[#81D4FA] text-[#5A5A5A] text-2xl font-semibold px-16 py-6 rounded-full mb-6 transition">
            Get Started
          </button>
        </Link>
        
        <p className="text-[#757575] text-lg">
          Already have an account?{' '}
          <Link href="/login" className="underline hover:text-[#5A5A5A]">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}