'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function ProfilePage() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    height: '',
    weight: '',
    age: '',
    goal: '',
  });

  const [startingWeight, setStartingWeight] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      setUserId(user.id);

      // Fetch user data
      const { data: userInfo, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error('Error fetching user:', userError);
      } else {
        setUserData(userInfo);
      }

      // Fetch profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      } else {
        setProfileData(profile);
        // Set starting weight as the first recorded weight (you might want a separate field for this)
        setStartingWeight(profile.weight);
      }

      // Set edit form with current data
      setEditForm({
        firstName: userInfo?.first_name || '',
        lastName: userInfo?.last_name || '',
        gender: profile?.gender || '',
        height: profile?.height || '',
        weight: profile?.weight || '',
        age: profile?.age || '',
        goal: profile?.goal || '',
      });

      setLoading(false);
    };

    fetchUserData();
  }, [router]);

  const handleInputChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSelectOption = (field, value) => {
    setEditForm({ ...editForm, [field]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      // Update users table
      const { error: userError } = await supabase
        .from('users')
        .update({
          first_name: editForm.firstName,
          last_name: editForm.lastName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (userError) throw userError;

      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          gender: editForm.gender,
          height: parseFloat(editForm.height),
          weight: parseFloat(editForm.weight),
          age: parseInt(editForm.age),
          goal: editForm.goal,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Refresh data
      const { data: updatedUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      setUserData(updatedUser);
      setProfileData(updatedProfile);
      setIsEditing(false);
      setMessage('Profile updated successfully!');
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <p className="text-2xl text-[#9E9E9E]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E8E8E8]">
      {/* Header */}
      <header className="bg-[#E8E8E8] px-8 py-6 flex justify-between items-center border-b border-gray-300">
        <Link href="/dashboard">
          <h1 className="text-5xl font-bold text-[#5A5A5A] cursor-pointer hover:opacity-80">thrive</h1>
        </Link>
        <nav className="flex gap-8 items-center">
          <Link href="/dashboard" className="text-xl text-[#5A5A5A] font-semibold hover:underline">
            Home
          </Link>
          <Link href="/intake" className="text-xl text-[#5A5A5A] font-semibold hover:underline">
            Intake
          </Link>
          <Link href="/profile" className="text-xl text-[#5A5A5A] font-semibold underline">
            Settings
          </Link>
        </nav>
      </header>

      <main className="p-12">
        {/* Profile Header Section */}
        <div className="bg-[#C8E6C9] rounded-2xl p-8 mb-8 relative">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-4xl font-bold text-black mb-4">
                {userData?.first_name} {userData?.last_name}
              </h2>
              <div className="space-y-2 text-xl text-[#5A5A5A]">
                <p>
                  <span className="font-semibold">Goal:</span> {profileData?.goal || '(not set)'}
                </p>
                <p>
                  <span className="font-semibold">Starting Weight:</span> {startingWeight ? `${startingWeight} lbs` : '(not set)'}
                </p>
                <p>
                  <span className="font-semibold">Current Weight:</span> {profileData?.weight ? `${profileData.weight} lbs` : '(not set)'}
                </p>
              </div>
            </div>
            
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-white hover:bg-gray-100 text-[#5A5A5A] text-xl font-semibold px-8 py-3 rounded-full border-2 border-[#5A5A5A] transition"
              >
                Edit
              </button>
            )}
          </div>
        </div>

        {message && (
          <div className={`mb-6 px-6 py-4 rounded-lg ${
            message.includes('Error') 
              ? 'bg-red-100 border border-red-400 text-red-700' 
              : 'bg-green-100 border border-green-400 text-green-700'
          }`}>
            {message}
          </div>
        )}

        {/* Edit Form or Profile Details */}
        {isEditing ? (
          <div className="bg-white rounded-2xl p-8">
            <h3 className="text-3xl font-bold text-[#5A5A5A] mb-6">Edit Profile</h3>
            
            <div className="space-y-6 max-w-2xl">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-lg font-semibold text-[#5A5A5A] mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={editForm.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#9E9E9E] text-[#5A5A5A] focus:outline-none focus:border-[#81D4FA]"
                  />
                </div>
                <div>
                  <label className="block text-lg font-semibold text-[#5A5A5A] mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={editForm.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#9E9E9E] text-[#5A5A5A] focus:outline-none focus:border-[#81D4FA]"
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-lg font-semibold text-[#5A5A5A] mb-2">
                  Gender
                </label>
                <div className="flex gap-4">
                  {['Male', 'Female', 'Other'].map((gender) => (
                    <button
                      key={gender}
                      type="button"
                      onClick={() => handleSelectOption('gender', gender)}
                      className={`px-6 py-2 rounded-full text-lg font-medium transition ${
                        editForm.gender === gender
                          ? 'bg-[#C8E6C9] text-[#5A5A5A]'
                          : 'bg-[#E8F5E9] text-[#9E9E9E] hover:bg-[#C8E6C9]'
                      }`}
                    >
                      {gender}
                    </button>
                  ))}
                </div>
              </div>

              {/* Height, Weight, Age */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-lg font-semibold text-[#5A5A5A] mb-2">
                    Height (inches)
                  </label>
                  <input
                    type="number"
                    name="height"
                    value={editForm.height}
                    onChange={handleInputChange}
                    step="0.1"
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#9E9E9E] text-[#5A5A5A] focus:outline-none focus:border-[#81D4FA]"
                  />
                </div>
                <div>
                  <label className="block text-lg font-semibold text-[#5A5A5A] mb-2">
                    Weight (lbs)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={editForm.weight}
                    onChange={handleInputChange}
                    step="0.1"
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#9E9E9E] text-[#5A5A5A] focus:outline-none focus:border-[#81D4FA]"
                  />
                </div>
                <div>
                  <label className="block text-lg font-semibold text-[#5A5A5A] mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={editForm.age}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#9E9E9E] text-[#5A5A5A] focus:outline-none focus:border-[#81D4FA]"
                  />
                </div>
              </div>

              {/* Goal */}
              <div>
                <label className="block text-lg font-semibold text-[#5A5A5A] mb-2">
                  Goal
                </label>
                <div className="flex flex-col gap-3">
                  {['Lose weight', 'Gain weight', 'Increase muscle mass'].map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => handleSelectOption('goal', goal)}
                      className={`px-6 py-3 rounded-full text-lg font-medium transition text-left ${
                        editForm.goal === goal
                          ? 'bg-[#B3E5FC] text-[#5A5A5A]'
                          : 'bg-[#E1F5FE] text-[#9E9E9E] hover:bg-[#B3E5FC]'
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-[#81D4FA] hover:bg-[#4FC3F7] text-white text-xl font-semibold px-8 py-3 rounded-full transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setMessage('');
                  }}
                  className="bg-[#E8E8E8] hover:bg-[#D5D5D5] text-[#5A5A5A] text-xl font-semibold px-8 py-3 rounded-full border-2 border-[#9E9E9E] transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8">
            <h3 className="text-3xl font-bold text-[#5A5A5A] mb-6">Profile Details</h3>
            
            <div className="space-y-4 text-xl text-[#5A5A5A]">
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="font-semibold">Email:</span>
                <span>{userData?.email}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="font-semibold">Gender:</span>
                <span>{profileData?.gender || 'Not set'}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="font-semibold">Height:</span>
                <span>{profileData?.height ? `${profileData.height} inches` : 'Not set'}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="font-semibold">Age:</span>
                <span>{profileData?.age || 'Not set'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Sign Out Button */}
        <div className="mt-8 text-center">
          <button
            onClick={handleSignOut}
            className="bg-red-500 hover:bg-red-600 text-white text-xl font-semibold px-12 py-4 rounded-full transition"
          >
            Sign Out
          </button>
        </div>
      </main>
    </div>
  );
}