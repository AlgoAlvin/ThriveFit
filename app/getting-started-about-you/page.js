'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GettingStarted() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    gender: null,
    heightFeet: '',
    heightInches: '',
    weight: '',
    age: ''
  });

  const handleGenderSelect = (gender) => {
    setFormData({ ...formData, gender });
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleContinue = () => {
    console.log('Form data:', formData);
    router.push('/getting-started-goals-progress');
  };

  return (
    <div className="min-h-screen h-screen flex overflow-hidden">
      {/* Left Side - Form */}
      <div className="w-1/2 bg-gray-100 p-12 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Gender Selection */}
          <div>
            <h2 className="text-gray-400 text-2xl font-medium mb-3">What is your gender?</h2>
            <div className="flex gap-3">
              {['Male', 'Female', 'Other'].map((gender) => (
                <button
                  key={gender}
                  onClick={() => handleGenderSelect(gender)}
                  className={`px-6 py-3 rounded-full text-lg font-medium transition-colors ${
                    formData.gender === gender
                      ? 'bg-green-200 text-gray-700 border-2 border-green-300'
                      : 'bg-blue-100 text-gray-600 hover:bg-blue-200'
                  }`}
                >
                  {gender}
                </button>
              ))}
            </div>
          </div>

          {/* Height */}
          <div>
            <h2 className="text-gray-400 text-2xl font-medium mb-3">How tall are you?</h2>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={formData.heightFeet}
                onChange={(e) => handleInputChange('heightFeet', e.target.value)}
                className="w-20 px-4 py-3 rounded-xl border-2 border-gray-300 text-gray-600 text-lg focus:outline-none focus:border-gray-400"
              />
              <span className="text-gray-400 text-xl">Feet</span>
              <input
                type="number"
                value={formData.heightInches}
                onChange={(e) => handleInputChange('heightInches', e.target.value)}
                className="w-20 px-4 py-3 rounded-xl border-2 border-gray-300 text-gray-600 text-lg focus:outline-none focus:border-gray-400"
              />
              <span className="text-gray-400 text-xl">Inches</span>
            </div>
          </div>

          {/* Weight */}
          <div>
            <h2 className="text-gray-400 text-2xl font-medium mb-3">How much do you weigh?</h2>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                className="w-28 px-4 py-3 rounded-xl border-2 border-gray-300 text-gray-600 text-lg focus:outline-none focus:border-gray-400"
              />
              <span className="text-gray-400 text-xl">lbs</span>
            </div>
          </div>

          {/* Age */}
          <div>
            <h2 className="text-gray-400 text-2xl font-medium mb-3">How old are you?</h2>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                className="w-28 px-4 py-3 rounded-xl border-2 border-gray-300 text-gray-600 text-lg focus:outline-none focus:border-gray-400"
              />
              <span className="text-gray-400 text-xl">years old</span>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="flex justify-center mt-6">
          <button
            onClick={handleContinue}
            className="bg-gray-400 hover:bg-gray-500 text-white text-xl font-medium px-12 py-3 rounded-full transition-colors"
          >
            Continue
          </button>
        </div>
      </div>

      {/* Right Side - Green */}
      <div className="w-1/2 bg-gradient-to-br from-green-100 to-green-200 flex flex-col items-end justify-between p-12">
        <h1 className="text-gray-700 text-3xl font-bold">thrive</h1>
        <div className="text-center mr-8">
          <h2 className="text-gray-700 text-6xl font-bold leading-tight">
            Getting Started:
            <br />
            <span className="text-7xl">About You</span>
          </h2>
        </div>
        <div></div>
      </div>
    </div>
  );
}