'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GoalsAndProgress() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    goal: '',
    exerciseFrequency: ''
  });

  const goals = [
    'Lose weight',
    'Maintain Weight',
    'Increase Muscle Mass and Gain Weight'
  ];

  const exerciseOptions = [
    'Little to no exercise',
    '1-3 times per week',
    '4-5 times per week',
    'Daily'
  ];

  const handleGoalSelect = (goal) => {
    setFormData({ ...formData, goal });
  };

  const handleExerciseSelect = (frequency) => {
    setFormData({ ...formData, exerciseFrequency: frequency });
  };

  const handleContinue = () => {
    console.log('Form data:', formData);
    router.push('/dashboard');
  };

  const handleBack = () => {
    router.push('/getting-started-about-you');
  };

  return (
    <div className="min-h-screen h-screen flex overflow-hidden">
      {/* Left Side - Form */}
      <div className="w-1/2 bg-gray-100 p-12 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-8">
          {/* Goal Selection */}
          <div>
            <h2 className="text-gray-400 text-2xl font-medium mb-4">What is your goal?</h2>
            <div className="flex flex-col gap-3">
              {goals.map((goal) => (
                <button
                  key={goal}
                  onClick={() => handleGoalSelect(goal)}
                  className={`px-6 py-3 rounded-full text-lg font-medium transition-colors text-left ${
                    formData.goal === goal
                      ? 'bg-green-200 text-gray-700 border-2 border-green-300'
                      : 'bg-blue-100 text-gray-600 hover:bg-blue-200'
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>

          {/* Exercise Frequency */}
          <div>
            <h2 className="text-gray-400 text-2xl font-medium mb-4">How often will you exercise?</h2>
            <div className="flex flex-col gap-3">
              {exerciseOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => handleExerciseSelect(option)}
                  className={`px-6 py-3 rounded-full text-lg font-medium transition-colors text-left ${
                    formData.exerciseFrequency === option
                      ? 'bg-green-200 text-gray-700 border-2 border-green-300'
                      : 'bg-blue-100 text-gray-600 hover:bg-blue-200'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>

{/*back/continue buttons*/}
        <div className="flex justify-center mt-8 gap-6">
            <button onClick={handleBack}
            className = "bg-gray-400 hover:bg-gray-500 text-white text-2xl font-medium px-16 py-4 rounded-full transition-colors">
                Back
            </button>
          <button
            onClick={handleContinue}
            className="bg-gray-400 hover:bg-gray-500 text-white text-2xl font-medium px-16 py-4 rounded-full transition-colors"
          >
            Continue
          </button>
        </div>
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