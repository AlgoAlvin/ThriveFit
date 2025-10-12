'use client';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      {/* Header */}
      <header className="bg-[#C8E6C9] py-10 shadow-sm">
        <h1 className="text-center text-5xl font-bold text-[#5A5A5A] tracking-tight">
          thrive
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-2xl w-full text-center flex flex-col items-center gap-y-6">
          <h2 className="text-3xl font-medium text-[#757575]">
            Welcome to thrive – Your Fitness and Nutrition Mentor
          </h2>

          <p className="text-lg text-[#757575] leading-relaxed">
            Eat smarter. Train Harder. Reach your fitness and health goals
            effortlessly. Thrive helps you track your fitness journey and reach
            your fitness goals.
          </p>

          {/* Call to Action Buttons */}
          <div className="mt-6">
            <Link href="/signup">
              <button className="bg-[#B3E5FC] hover:bg-[#81D4FA] text-[#5A5A5A] text-xl font-semibold px-12 py-4 rounded-lg shadow-sm">
                Get Started
              </button>
            </Link>
          </div>

          <p className="text-[#757575] text-base mt-4">
            Already have an account?{' '}
            <Link href="/login" className="underline hover:text-[#5A5A5A] font-medium">
              Log In
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}