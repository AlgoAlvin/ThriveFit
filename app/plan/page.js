'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function PlanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [planData, setPlanData] = useState({
    goal: '',
    calorieGoal: 0,
    proteinGrams: 0,
    carbsGrams: 0,
    fatGrams: 0,
    exercisePlan: '',
    workoutSchedule: []
  });

  useEffect(() => {
    const fetchPlanData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      // Fetch profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      // Calculate TDEE (Total Daily Energy Expenditure)
      const tdee = calculateTDEE(profile);
      
      // Adjust calories based on goal
      let calorieGoal = tdee;
      if (profile.goal === 'Lose weight') {
        calorieGoal = Math.round(tdee - 400);
      } else if (profile.goal === 'Increase muscle mass and gain weight') {
        calorieGoal = Math.round(tdee + 500);
      } else {
        calorieGoal = Math.round(tdee + 150);
      }

      // Calculate macros (40% protein, 30% carbs, 30% fat)
      const proteinCalories = calorieGoal * 0.40;
      const carbsCalories = calorieGoal * 0.30;
      const fatCalories = calorieGoal * 0.30;

      const proteinGrams = Math.round(proteinCalories / 4);
      const carbsGrams = Math.round(carbsCalories / 4);
      const fatGrams = Math.round(fatCalories / 9);

      // Get workout schedule based on exercise frequency
      const workoutSchedule = getWorkoutSchedule(profile.exercise_freq);

      setPlanData({
        goal: profile.goal,
        calorieGoal,
        proteinGrams,
        carbsGrams,
        fatGrams,
        exercisePlan: getExercisePlanName(profile.exercise_freq),
        workoutSchedule
      });

      setLoading(false);
    };

    fetchPlanData();
  }, [router]);

  const calculateTDEE = (profile) => {
    if (!profile.weight || !profile.height || !profile.age) return 2000;
    
    const heightInCm = profile.height * 2.54;
    const weightInKg = profile.weight * 0.453592;
    
    // Calculate BMR (Basal Metabolic Rate)
    let bmr;
    if (profile.gender === 'Male') {
      bmr = (10 * weightInKg) + (6.25 * heightInCm) - (5 * profile.age) + 5;
    } else {
      bmr = (10 * weightInKg) + (6.25 * heightInCm) - (5 * profile.age) - 161;
    }

    // Activity multiplier based on exercise frequency
    let activityMultiplier = 1.2; // Sedentary
    if (profile.exercise_freq === '1-3 times a week') {
      activityMultiplier = 1.375;
    } else if (profile.exercise_freq === '4-5 times a week') {
      activityMultiplier = 1.6;
    } else if (profile.exercise_freq === 'Daily') {
      activityMultiplier = 1.9;
    }

    return bmr * activityMultiplier;
  };

  const getExercisePlanName = (exerciseFreq) => {
    const planNames = {
      'Little to none': 'Light',
      '1-3 times a week': 'Moderate',
      '4-5 times a week': 'High',
      'Daily': 'Very High'
    };
    return planNames[exerciseFreq] || 'Moderate';
  };
  const handleBack = () => {
    router.push('/onboardingTwo');
  };

  const getWorkoutSchedule = (exerciseFreq) => {
    const schedules = {
      'Little to none': [
        { day: 1, workout: 'Full Body A', isRest: false },
        { day: 2, workout: 'Rest', isRest: true },
        { day: 3, workout: 'Rest', isRest: true },
        { day: 4, workout: 'Full Body B', isRest: false },
        { day: 5, workout: 'Rest', isRest: true },
        { day: 6, workout: 'Rest', isRest: true },
        { day: 7, workout: 'Rest', isRest: true }
      ],
      '1-3 times a week': [
        { day: 1, workout: 'Push', isRest: false },
        { day: 2, workout: 'Rest', isRest: true },
        { day: 3, workout: 'Pull', isRest: false },
        { day: 4, workout: 'Rest', isRest: true },
        { day: 5, workout: 'Legs', isRest: false },
        { day: 6, workout: 'Rest', isRest: true },
        { day: 7, workout: 'Rest', isRest: true }
      ],
      '4-5 times a week': [
        { day: 1, workout: 'Upper', isRest: false },
        { day: 2, workout: 'Lower', isRest: false },
        { day: 3, workout: 'Rest', isRest: true },
        { day: 4, workout: 'Upper', isRest: false },
        { day: 5, workout: 'Lower', isRest: false },
        { day: 6, workout: 'Rest', isRest: true },
        { day: 7, workout: 'Cardio', isRest: false }
      ],
      'Daily': [
        { day: 1, workout: 'Push', isRest: false },
        { day: 2, workout: 'Pull', isRest: false },
        { day: 3, workout: 'Legs', isRest: false },
        { day: 4, workout: 'Chest + Back', isRest: false },
        { day: 5, workout: 'Arms + Shoulders', isRest: false },
        { day: 6, workout: 'Legs + Cardio', isRest: false },
        { day: 7, workout: 'Rest', isRest: true }
      ]
    };

    return schedules[exerciseFreq] || schedules['1-3 times a week'];
  };

  const handleContinue = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <p className="text-2xl text-[#9E9E9E]">Loading your plan...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Your Plan */}
      <div className="w-1/2 bg-[#B3E5FC] flex flex-col items-center justify-center p-16">
        <div className="mb-8">
          <h1 className="text-[#5A5A5A] text-5xl font-bold mb-4">thrive</h1>
        </div>
        <div className="text-center">
          <h2 className="text-[#5A5A5A] text-6xl font-bold mb-4">Your Plan:</h2>
          <h3 className="text-[#5A5A5A] text-7xl font-bold">
            {planData.goal === 'Lose weight' && 'Weight Loss'}
            {planData.goal === 'Maintain weight' && 'Maintenance'}
            {planData.goal === 'Increase muscle mass and gain weight' && 'Weight Gain'}
          </h3>
        </div>
      </div>

      {/* Right Side - Plan Details */}
      <div className="w-1/2 bg-[#F5E6F5] flex flex-col p-12 overflow-y-auto relative">
        <div className="space-y-8">
          {/* Macro Goals Section */}
          <div>
            <h3 className="text-3xl font-bold text-[#757575] mb-4">Macro Goals:</h3>
            <div className="bg-[#C8E6C9] inline-block px-6 py-3 rounded-full mb-4">
              <span className="text-2xl font-bold text-[#5A5A5A]">
                {planData.calorieGoal} kcal/day
              </span>
            </div>
            <div className="flex gap-4 flex-wrap">
              <div className="bg-[#B3E5FC] px-6 py-3 rounded-full">
                <span className="text-xl font-semibold text-[#5A5A5A]">
                  Protein: {planData.proteinGrams} g
                </span>
              </div>
              <div className="bg-[#B3E5FC] px-6 py-3 rounded-full">
                <span className="text-xl font-semibold text-[#5A5A5A]">
                  Carbs: {planData.carbsGrams} g
                </span>
              </div>
              <div className="bg-[#B3E5FC] px-6 py-3 rounded-full">
                <span className="text-xl font-semibold text-[#5A5A5A]">
                  Fat: {planData.fatGrams} g
                </span>
              </div>
            </div>
          </div>

          {/* Exercise Plan Section */}
          <div>
            <h3 className="text-3xl font-bold text-[#757575] mb-4">
              Exercise Plan: <span className="text-[#5A5A5A]">{planData.exercisePlan}</span>
            </h3>
            <div className="space-y-3">
              {planData.workoutSchedule.map((day) => (
                <div
                  key={day.day}
                  className={`px-6 py-3 rounded-full ${
                    day.isRest ? 'bg-[#C8E6C9]' : 'bg-[#B3E5FC]'
                  }`}
                >
                  <span className="text-xl font-semibold text-[#5A5A5A]">
                    Day {day.day}: {day.workout}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Back and Continue Button */}
        <div className="flex absolute bottom-8 right-8 gap-6">
        <button 
              type="button"
              onClick={handleBack}
              className="bg-gray-400 hover:bg-gray-500 text-white text-2xl font-medium px-16 py-4 rounded-full transition shadow-lg"
            >
              Back
            </button>
          <button
          type="button"
            onClick={handleContinue}
            className="bg-[#9E9E9E] hover:bg-[#757575] text-white text-2xl font-semibold px-12 py-4 rounded-full transition shadow-lg"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}