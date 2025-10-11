'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase.js';
import Header from '@/components/header.js';

export default function DashboardPage() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [calorieData, setCalorieData] = useState({
    maxCalories: 2000,
    caloriesTaken: 0,
    remainingCalories: 2000,
  });
  const [macroData, setMacroData] = useState({
    protein: 0,
    carbs: 0,
    fats: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeDashboard = async () => {
      // Check authentication
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      setUserId(user.id);

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      setProfile(profileData);

      // Calculate max calories based on user data (basic calculation)
      const maxCals = calculateMaxCalories(profileData);
      
      // Fetch today's calorie logs
      const today = new Date().toISOString().split('T')[0];
      const { data: calorieLog } = await supabase
        .from('calorie_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (calorieLog) {
        setCalorieData({
          maxCalories: calorieLog.max_calories || maxCals,
          caloriesTaken: calorieLog.calories_consumed || 0,
          remainingCalories: (calorieLog.max_calories || maxCals) - (calorieLog.calories_consumed || 0),
        });
      } else {
        setCalorieData({
          maxCalories: maxCals,
          caloriesTaken: 0,
          remainingCalories: maxCals,
        });
      }

      // Fetch today's macro logs
      const { data: macroLog } = await supabase
        .from('macro_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (macroLog) {
        const totalGrams = (macroLog.protein_grams || 0) + (macroLog.carbs_grams || 0) + (macroLog.fats_grams || 0);
        setMacroData({
          protein: totalGrams > 0 ? ((macroLog.protein_grams || 0) / totalGrams * 100) : 0,
          carbs: totalGrams > 0 ? ((macroLog.carbs_grams || 0) / totalGrams * 100) : 0,
          fats: totalGrams > 0 ? ((macroLog.fats_grams || 0) / totalGrams * 100) : 0,
        });
      }

      setLoading(false);
    };

    initializeDashboard();
  }, [router]);

  // Simple BMR calculation (Mifflin-St Jeor)
  const calculateMaxCalories = (profile) => {
    if (!profile.weight || !profile.height_feet) return 2000;
    
    const heightInCm = ((profile.height_feet * 12) + (profile.height_inches || 0)) * 2.54;
    const weightInKg = profile.weight * 0.453592;
    
    let bmr;
    if (profile.gender === 'Male') {
      bmr = (10 * weightInKg) + (6.25 * heightInCm) - (5 * 25) + 5; // Assuming age 25
    } else {
      bmr = (10 * weightInKg) + (6.25 * heightInCm) - (5 * 25) - 161;
    }

    // Activity multiplier (moderate activity)
    const tdee = bmr * 1.55;

    // Adjust based on goal
    if (profile.goal === 'Lose weight') {
      return Math.round(tdee - 500);
    } else if (profile.goal === 'Gain weight') {
      return Math.round(tdee + 500);
    }
    return Math.round(tdee);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <p className="text-2xl text-[#9E9E9E]">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Header userName={profile?.first_name} />

      <main className="p-12">
        {/* Calories Remaining Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-black mb-6">Calories Remaining</h2>
          <div className="bg-[#B3E5FC] rounded-2xl p-8 flex items-center justify-center gap-8 flex-wrap">
            <div className="bg-[#E1D5E7] rounded-full px-8 py-6 text-xl text-[#5A5A5A] min-w-[200px] text-center">
              {calorieData.maxCalories} cal
              <div className="text-sm text-[#757575] mt-1">Max Calories</div>
            </div>
            <span className="text-4xl font-bold">-</span>
            <div className="bg-[#E1D5E7] rounded-full px-8 py-6 text-xl text-[#5A5A5A] min-w-[200px] text-center">
              {calorieData.caloriesTaken} cal
              <div className="text-sm text-[#757575] mt-1">Calories Taken</div>
            </div>
            <span className="text-4xl font-bold">=</span>
            <div className="bg-[#E1D5E7] rounded-full px-8 py-6 text-xl text-[#5A5A5A] min-w-[200px] text-center">
              {calorieData.remainingCalories} cal
              <div className="text-sm text-[#757575] mt-1">Remaining</div>
            </div>
          </div>
        </section>

        {/* Macros Section */}
        <section>
          <h2 className="text-3xl font-bold text-black mb-6">Macros</h2>
          <div className="bg-[#F5E6F5] rounded-2xl p-8">
            <div className="flex justify-around items-center flex-wrap gap-8">
              {[
                { name: 'Protein', value: macroData.protein, color: '#C8E6C9' },
                { name: 'Carbs', value: macroData.carbs, color: '#C8E6C9' },
                { name: 'Fats', value: macroData.fats, color: '#C8E6C9' }
              ].map((macro, idx) => (
                <div key={macro.name} className="flex flex-col items-center">
                  <div className={`w-64 h-64 rounded-full relative ${idx === 2 ? 'ring-4 ring-[#7B1FA2]' : ''}`}>
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      {/* Background circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#BDBDBD"
                        strokeWidth="20"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={macro.color}
                        strokeWidth="20"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - macro.value / 100)}`}
                        transform="rotate(-90 50 50)"
                        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-2xl font-bold text-black">{macro.name}</p>
                      <p className="text-xl text-black">{Math.round(macro.value)}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}