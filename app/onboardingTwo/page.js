'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function GoalsAndProgress() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [formData, setFormData] = useState({
    goal: '',
    exercise_freq: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setUserId(user.id);
      }
    };
    checkUser();
  }, [router]);

  const handleSelectOption = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleBack = () => {
    router.push('/onboarding');
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Update profile with onboarding data
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          goal: formData.goal,
          exercise_freq: formData.exercise_freq,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      setError(error.message);
      console.error('Onboarding error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <p className="text-2xl text-[#9E9E9E]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-1/2 bg-[#F5F5F5] flex flex-col justify-start p-12 overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          {/* Goal Selection */}
            <div>
            <p className="text-2xl text-[#9E9E9E] mb-4">What is your goal?</p>
            <div className="flex flex-col gap-3">
              {['Lose weight', 'Maintain weight', 'Increase muscle mass and gain weight'].map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => handleSelectOption('goal', goal)}
                  className={`px-8 py-3 rounded-full text-lg font-medium transition text-left ${
                    formData.goal === goal
                      ? 'bg-[#B3E5FC] text-[#5A5A5A]'
                      : 'bg-[#E1F5FE] text-[#9E9E9E] hover:bg-[#B3E5FC]'
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>

          {/* Exercise Frequency */}
          <div>
            <p className="text-2xl text-[#9E9E9E] mb-4">How often will you exercise?</p>
            <div className="flex flex-col gap-3">
              {['Little to none', '1-3 times a week', '4-5 times a week', 'Daily'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelectOption('exercise_freq', option)}
                  className={`px-8 py-3 rounded-full text-lg font-medium transition text-left ${
                    formData.exercise_freq === option
                      ? 'bg-[#B3E5FC] text-[#5A5A5A]'
                      : 'bg-[#E1F5FE] text-[#9E9E9E] hover:bg-[#B3E5FC]'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

{/*back/continue buttons*/}
        <div className="flex justify-center mt-8 gap-6">
            <button onClick={handleBack}
            className = "bg-gray-400 hover:bg-gray-500 text-white text-2xl font-medium px-16 py-4 rounded-full transition-colors">
                Back
            </button>
            <button
            type="submit"
            disabled={loading || !formData.goal || !formData.exercise_freq}
            className="bg-[#9E9E9E] hover:bg-[#757575] text-white text-xl font-semibold px-12 py-4 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </form>
      </div>

      {/* Right Side - Green */}
      <div className="w-1/2 bg-gradient-to-br from-green-100 to-green-200 flex flex-col items-end justify-between p-16">
        <h1 className="text-gray-700 text-4xl font-bold">thrive</h1>
        <div className="text-center mr-12">
          <h2 className="text-gray-700 text-7xl font-bold leading-tight">
            Getting Started:
            <br />
            <span className="text-8xl">Goals and</span>
            <br />
            <span className="text-8xl">Progress</span>
          </h2>
        </div>
        <div></div>
      </div>
    </div>
  );
}