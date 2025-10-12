'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function OnboardingPage() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [formData, setFormData] = useState({
    gender: '',
    height: '',
    weight: '',
    age: '',
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

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectOption = (field, value) => {
    setFormData({ ...formData, [field]: value });
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
          gender: formData.gender,
          height: parseInt(formData.heightFeet) * 12 + parseInt(formData.heightInches),
          weight: parseFloat(formData.weight),
          age: parseInt(formData.age),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Redirect to second onboarding page
      router.push('/onboardingTwo');
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

          {/* Gender Selection */}
          <div>
            <p className="text-2xl text-[#9E9E9E] mb-4">What is your gender?</p>
            <div className="flex gap-4">
              {['Male', 'Female'].map((gender) => (
                <button
                  key={gender}
                  type="button"
                  onClick={() => handleSelectOption('gender', gender)}
                  className={`px-8 py-3 rounded-full text-lg font-medium transition ${
                    formData.gender === gender
                      ? 'bg-[#C8E6C9] text-[#5A5A5A]'
                      : 'bg-[#E8F5E9] text-[#9E9E9E] hover:bg-[#C8E6C9]'
                  }`}
                >
                  {gender}
                </button>
              ))}
            </div>
          </div>

          {/* Height Input */}
          <div>
            <p className="text-2xl text-[#9E9E9E] mb-4">How tall are you?</p>
            <div className="flex gap-4 items-center">
              <input
                type="number"
                name="heightFeet"
                min="0"
                max="8"
                value={formData.heightFeet}
                onChange={handleInputChange}
                required
                className="w-24 px-4 py-3 rounded-lg border-2 border-[#9E9E9E] bg-white text-[#5A5A5A] text-lg focus:outline-none focus:border-[#81D4FA]"
              />
              <span className="text-xl text-[#9E9E9E]">Feet</span>
              <input
                type="number"
                name="heightInches"
                min="0"
                max="11"
                value={formData.heightInches}
                onChange={handleInputChange}
                required
                className="w-24 px-4 py-3 rounded-lg border-2 border-[#9E9E9E] bg-white text-[#5A5A5A] text-lg focus:outline-none focus:border-[#81D4FA]"
              />
              <span className="text-xl text-[#9E9E9E]">Inches</span>
            </div>
          </div>

          {/* Weight Input */}
          <div>
            <p className="text-2xl text-[#9E9E9E] mb-4">How much do you weigh?</p>
            <div className="flex gap-4 items-center">
              <input
                type="number"
                name="weight"
                min="50"
                max="500"
                step="0.1"
                value={formData.weight}
                onChange={handleInputChange}
                required
                className="w-32 px-4 py-3 rounded-lg border-2 border-[#9E9E9E] bg-white text-[#5A5A5A] text-lg focus:outline-none focus:border-[#81D4FA]"
              />
              <span className="text-xl text-[#9E9E9E]">lbs</span>
            </div>
          </div>
          {/* Age Input */}
          <div>
            <p className="text-2xl text-[#9E9E9E] mb-4">What is your age?</p>
            <div className="flex gap-4 items-center">
              <input
                type="number"
                name="age"
                min="0"
                max="100"
                step="1"
                value={formData.age}
                onChange={handleInputChange}
                required
                className="w-32 px-4 py-3 rounded-lg border-2 border-[#9E9E9E] bg-white text-[#5A5A5A] text-lg focus:outline-none focus:border-[#81D4FA]"
              />
            </div>
          </div>


          {/* Continue Button */}
          <button
            type="submit"
            disabled={loading || !formData.gender || !formData.heightFeet || !formData.weight || !formData.age}
            className="bg-[#9E9E9E] hover:bg-[#757575] text-white text-xl font-semibold px-12 py-4 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </form>
      </div>

      {/* Right Side - Branding */}
      <div className="w-1/2 bg-[#C8E6C9] flex items-center justify-center">
        <h2 className="text-6xl font-bold text-[#5A5A5A]">Getting Started</h2>
      </div>
    </div>
  );
}