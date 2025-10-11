'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function Header({ userName }) {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <header className="bg-[#E8F5E9] p-6 flex justify-between items-center">
      <Link href="/dashboard">
        <h1 className="text-4xl font-bold text-[#5A5A5A] cursor-pointer hover:opacity-80">
          thrive
        </h1>
      </Link>
      
      <div className="flex items-center gap-4">
        <button className="text-lg text-[#5A5A5A] hover:underline">
          Log Food
        </button>
        
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="bg-[#7B1FA2] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#6A1B9A] transition"
          >
            {userName || 'Profile'}
          </button>
          
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-[#5A5A5A]"
              >
                Dashboard
              </button>
              <button
                onClick={() => router.push('/onboarding')}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-[#5A5A5A]"
              >
                Update Profile
              </button>
              <hr className="my-2" />
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}