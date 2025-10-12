'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

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
      
      // Fetch today's food log
      const today = new Date().toISOString().split('T')[0];
      const { data: foodLog } = await supabase
        .from('food_log')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (foodLog) {
        // Calculate calories from macros (protein=4cal/g, carbs=4cal/g, fat=9cal/g)
        const caloriesFromMacros = 
          (foodLog.protein_grams * 4) + 
          (foodLog.carbs_grams * 4) + 
          (foodLog.fat_grams * 9);

        setCalorieData({
          maxCalories: maxCals,
          caloriesTaken: Math.round(caloriesFromMacros),
          remainingCalories: Math.max(Math.round(maxCals - caloriesFromMacros),0),
        });

        // Calculate macro percentages
        const totalGrams = (foodLog.protein_grams || 0) + (foodLog.carbs_grams || 0) + (foodLog.fat_grams || 0);
        setMacroData({
          protein: totalGrams > 0 ? ((foodLog.protein_grams || 0) / totalGrams * 100) : 0,
          carbs: totalGrams > 0 ? ((foodLog.carbs_grams || 0) / totalGrams * 100) : 0,
          fats: totalGrams > 0 ? ((foodLog.fat_grams || 0) / totalGrams * 100) : 0,
        });
      } else {
        setCalorieData({
          maxCalories: maxCals,
          caloriesTaken: 0,
          remainingCalories: maxCals,
        });
      }

      setLoading(false);
    };

    initializeDashboard();
  }, [router]);

  // Simple BMR calculation (Mifflin-St Jeor)
  const calculateMaxCalories = (profile) => {
    if (!profile.weight || !profile.height || !profile.age) return 2000;
    
    const heightInCm = profile.height * 2.54; // inches to cm
    const weightInKg = profile.weight * 0.453592; // lbs to kg
    
    let bmr;
    if (profile.gender === 'Male') {
      bmr = (10 * weightInKg) + (6.25 * heightInCm) - (5 * profile.age) + 5;
    } else {
      bmr = (10 * weightInKg) + (6.25 * heightInCm) - (5 * profile.age) - 161;
    }
    let multiplier;
    if (profile.exercise_freq === 'Little to none'){
      multiplier = 1.2;
    } else if (profile.exercise_freq === '1-3 times a week'){
      multiplier = 1.375;
    } else if (profile.exercise_freq === '4-5 times a week'){
      multiplier = 1.6;
    } else if (profile.exercise_freq === 'Daily'){
      multiplier = 1.9;
    }
    // Activity multiplier
    const tdee = bmr * multiplier;

    // Adjust based on goal
    if (profile.goal === 'Lose weight') {
      return Math.round(tdee - 400);
    } else if (profile.goal === 'Increase muscle mass and gain weight') {
      return Math.round(tdee + 500);
    }
    return Math.round(tdee+150);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <p className="text-2xl text-[#595959]">Loading your dashboard...</p>
      </div>
    );
  }

  const caloriePercentage = Math.round((calorieData.caloriesTaken / calorieData.maxCalories) * 100);

  return (
    <div className="min-h-screen bg-[#EFEFEF]">
      {/* Header */}
      <header className="bg-[#EFEFEF] px-8 py-6 flex justify-between items-center border-b border-gray-300">
        <h1 className="text-5xl font-bold text-[#5A5A5A]">thrive</h1>
        <nav className="flex gap-8 items-center">
          <Link href="/dashboard" className="text-xl text-[#5A5A5A] font-semibold underline">
            Home
          </Link>
          <Link href="/intake" className="text-xl text-[#595959] font-semibold hover:underline">
            Intake
          </Link>
          <Link href="/profile" className="text-xl text-[#595959] font-semibold hover:underline">
            Settings
          </Link>
        </nav>
      </header>

      <main className="">
        {/* Calories Remaining Section */}
        <section className="mb-0 px-12 py-8 bg-[#CAEBF2] -mx-0">
          <h2 className="text-4xl font-bold text-[#595959] mb-6 ">Calories Remaining</h2>
          <div className="bg-[#A9A9A9] rounded-full p-4 relative h-24 flex items-center border-4 border-[#A9A9A9]">
            {/* Progress bar */}
            <div 
              className="absolute left-0 top-0 h-full bg-[#C8E6C9] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(caloriePercentage, 100)}%` }}
            />
            {/* Text overlay */}
            <div className="relative z-10 w-full flex items-center justify-between px-8">
              <span className="text-3xl font-bold text-[#5A5A5A]">
                {calorieData.remainingCalories}/{calorieData.maxCalories} kcal
              </span>
              <span className="text-3xl font-bold text-[#5A5A5A]">
                {caloriePercentage}%
              </span>
            </div>
          </div>
        </section>

        {/* Macros Section */}
        <section className="mb-12 px-12 py-8">
          <h2 className="text-4xl font-bold text-[#5A5A5A] mb-6">Macros</h2>
          <div className="bg-[#E8E8E8] rounded-2xl p-8">
            <div className="flex justify-around items-center flex-wrap gap-8">
              {[
                { name: 'Protein', value: macroData.protein, color: '#C8E6C9', bgColor: '#BDBDBD' },
                { name: 'Carbs', value: macroData.carbs, color: '#C8E6C9', bgColor: '#BDBDBD' },
                { name: 'Fats', value: macroData.fats, color: '#C8E6C9', bgColor: '#BDBDBD' }
              ].map((macro) => (
                <div key={macro.name} className="flex flex-col items-center">
                  <div className="w-64 h-64 rounded-full relative">
                    <svg className="w-full h-full transform -rotate-90">
                      {/* Background circle */}
                      <circle
                        cx="128"
                        cy="128"
                        r="100"
                        fill="none"
                        stroke={macro.bgColor}
                        strokeWidth="40"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="128"
                        cy="128"
                        r="100"
                        fill="none"
                        stroke={macro.color}
                        strokeWidth="40"
                        strokeDasharray={`${2 * Math.PI * 100}`}
                        strokeDashoffset={`${2 * Math.PI * 100 * (1 - macro.value / 100)}`}
                        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-2xl font-bold text-[#5A5A5A]">{macro.name}</p>
                      <p className="text-xl text-[#5A5A5A]">Percentage</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Discover Section */}
        <section className='px-12 py-8 bg-[#CAEBF2] -mx-0'>
          <h2 className="text-4xl font-bold text-[#5A5A5A] mb-6">Discover</h2>
          <div className=" rounded-2xl p-8">
            <div className="flex gap-6 flex-wrap">
              <button className="bg-[#E8E8E8] hover:bg-[#D5D5D5] text-[#5A5A5A] text-xl font-semibold px-8 py-4 rounded-full border-2 border-[#9E9E9E] transition">
                Workout Routines
              </button>
              <button className="bg-[#E8E8E8] hover:bg-[#D5D5D5] text-[#5A5A5A] text-xl font-semibold px-8 py-4 rounded-full border-2 border-[#9E9E9E] transition">
                Meal Plans
              </button>
              <button className="bg-[#E8E8E8] hover:bg-[#D5D5D5] text-[#5A5A5A] text-xl font-semibold px-8 py-4 rounded-full border-2 border-[#9E9E9E] transition">
                More Coming Soon ...
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}