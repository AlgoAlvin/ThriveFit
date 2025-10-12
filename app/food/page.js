'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function IntakePage() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [formData, setFormData] = useState({
    protein: '',
    carbs: '',
    fat: '',
  });
  const [todayLog, setTodayLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const [baseNutrition, setBaseNutrition] = useState({
    protein: 0,
    carbs: 0,
    fat: 0
  });
  const [servingSize, setServingSize] = useState('');

  useEffect(() => {
    const initializePage = async () => {
      // Check authentication
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      setUserId(user.id);

      // Fetch today's food log
      const today = new Date().toISOString().split('T')[0];
      const { data: foodLog } = await supabase
        .from('food_log')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (foodLog) {
        setTodayLog(foodLog);
        // Don't pre-fill the form - keep it blank for new entries
      }

      setLoading(false);
    };

    initializePage();
  }, [router]);

  //USDA API
  useEffect(() => {
    const searchFoods = async (searchTerm) => {
      if(!searchTerm || searchTerm.length < 2){
        setSearchResults([]);
        return;
      }

      try{
        const API_KEY = process.env.NEXT_PUBLIC_USDA_API_KEY;
        const response = await fetch(
          `https://api.nal.usda.gov/fdc/v1/foods/search?query=${searchTerm}&api_key=${API_KEY}`
        );

        const data = await response.json();
      
        const options = data.foods.map(food => ({
          id: food.fdcId,
          name: food.description,
          brand: food.brandOwner || 'Generic',
          category: food.foodCategory || 'N/A'
        }));

        setSearchResults(options);

    } catch (error){
      console.error('Search error:', error);
      setSearchResults([]);
    }
    };

    const timer = setTimeout(() => {
      searchFoods(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);
  
  // if user clicks outside usda dropdown

  useEffect(() => {
    const handleClickOutside = (event) => {
      if(searchResults.length > 0 && !event.target.closest('.food-search-container')){
        setSearchResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchResults]);


  const handleInputChange = (e) => {
    const value = e.target.value;
    // Only allow positive numbers
    if (value === '' || (Number(value) >= 0)) {
      setFormData({ ...formData, [e.target.name]: value });
    }
  };

  const handleServingSizeChange = (e) => {
        const size = e.target.value;
        setServingSize(size);

        if(size && !isNaN(size) && parseFloat(size) > 0){
          const multiplier = parseFloat(size) / 100;
          setFormData({
            protein: (baseNutrition.protein * multiplier).toFixed(1),
            carbs: (baseNutrition.carbs * multiplier).toFixed(1),
            fat: (baseNutrition.fat * multiplier).toFixed(1),
          });
        }else{
          setFormData({
            protein:'',
            carbs:'',
            fat:'',
          });
        }
      };

      
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setSaving(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get current day's totals
      const { data: currentLog } = await supabase
        .from('food_log')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      // Add new intake to existing totals (or start from 0)
      const newProtein = (currentLog?.protein_grams || 0) + (parseFloat(formData.protein) || 0);
      const newCarbs = (currentLog?.carbs_grams || 0) + (parseFloat(formData.carbs) || 0);
      const newFat = (currentLog?.fat_grams || 0) + (parseFloat(formData.fat) || 0);

      // Upsert (insert or update) food log with cumulative totals
      const { error } = await supabase
        .from('food_log')
        .upsert({
          user_id: userId,
          date: today,
          protein_grams: newProtein,
          carbs_grams: newCarbs,
          fat_grams: newFat,
        }, {
          onConflict: 'user_id,date'
        });

      if (error) throw error;

      setMessage('Successfully added to your daily intake!');
      
      // Clear the form
      setFormData({
        protein: '',
        carbs: '',
        fat: '',
      });

      // Update today's log state for display
      setTodayLog({
        protein_grams: newProtein,
        carbs_grams: newCarbs,
        fat_grams: newFat,
      });

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFormData({
      protein: '',
      carbs: '',
      fat: '',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <p className="text-2xl text-[#9E9E9E]">Loading...</p>
      </div>
    );
  }

  //Dropdown handleSelect
  const handleSelect = async (food) => {
    setQuery(food.name);
    setSearchResults([]);
  
    try {
      const API_KEY = process.env.NEXT_PUBLIC_USDA_API_KEY;
      const response = await fetch(
        `https://api.nal.usda.gov/fdc/v1/food/${food.id}?api_key=${API_KEY}`
      );
    
      const foodData = await response.json();
      const nutrients = foodData.foodNutrients || [];
    
    // Helper function to find nutrient by name
      const findNutrient = (names) => {
        const nutrient = nutrients.find(n => {
          const name = n.nutrientName || n.nutrient?.name || '';
          return names.some(searchName => name === searchName);
        });
        return nutrient?.value || nutrient?.amount || 0;
      };
    
      const protein = findNutrient(['Protein']);
      const carbs = findNutrient(['Carbohydrate, by difference', 'Carbohydrates']);
      const fat = findNutrient(['Total lipid (fat)']);
    
      setBaseNutrition({
        protein: protein,
        carbs: carbs,
        fat: fat
      });
      setServingSize('');
      setFormData({
        protein:'',
        carbs: '',
        fat: '',
      });
    } catch (error) {
      console.error('Error fetching nutrition:', error);
    }
  };

  // Calculate total calories
  const totalCalories = 
    (parseFloat(formData.protein) || 0) * 4 + 
    (parseFloat(formData.carbs) || 0) * 4 + 
    (parseFloat(formData.fat) || 0) * 9;

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
          <Link href="/food" className="text-xl text-[#5A5A5A] font-semibold underline">
            Intake
          </Link>
          <Link href="/profile" className="text-xl text-[#5A5A5A] font-semibold hover:underline">
            Settings
          </Link>
        </nav>
      </header>

      <main className="p-12 max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-[#5A5A5A] mb-2">Log Your Daily Intake</h2>
        <p className="text-lg text-[#757575] mb-4">
          Enter the macros for this meal/snack (in grams)
        </p>

        {/* Show today's total */}
        {todayLog && (
          <div className="bg-[#B3E5FC] rounded-lg p-4 mb-8">
            <p className="text-xl font-semibold text-[#5A5A5A] mb-2">Today's Total So Far:</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-[#5A5A5A]">{Math.round(todayLog.protein_grams)}g</p>
                <p className="text-sm text-[#757575]">Protein</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#5A5A5A]">{Math.round(todayLog.carbs_grams)}g</p>
                <p className="text-sm text-[#757575]">Carbs</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#5A5A5A]">{Math.round(todayLog.fat_grams)}g</p>
                <p className="text-sm text-[#757575]">Fat</p>
              </div>
            </div>
            <p className="text-center text-xl font-bold text-[#5A5A5A] mt-3">
              Total: {Math.round((todayLog.protein_grams * 4) + (todayLog.carbs_grams * 4) + (todayLog.fat_grams * 9))} kcal
            </p>
          </div>
        )}

        {message && (
          <div className={`mb-6 px-6 py-4 rounded-lg ${
            message.includes('Error') 
              ? 'bg-red-100 border border-red-400 text-red-700' 
              : 'bg-green-100 border border-green-400 text-green-700'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-[#C8E6C9] rounded-2xl p-8 space-y-6">
          {/* Food Input */}
          <div className="relative food-search-container">
            <label className="block text-2xl font-semibold text-[#5A5A5A] mb-3">
              Add Food
            </label>
            <input
            type="text"
            placeholder="Search for food or enter food name"
            name="food"
            className="w-full px-6 py-4 rounded-lg border-2 border-[#9E9E9E] bg-white text-[#5A5A5A] text-xl focus:outline-none focus:border-[#81D4FA]"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            >
            </input>
            {searchResults.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border-2 border-[#9E9E9E] rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                {searchResults.map(food => (
                  <li 
                  key={food.id} 
                  onClick={() => handleSelect(food)}
                  className="px-6 py-3 hover:bg-[#B3E5FC] cursor-pointer text-[#5A5A5A] border-b border-gray-200 last:border-b-0">
                    <span className="font-semibold">{food.name}</span>
                    {food.brand !== 'Generic' && <span className="text-sm text-[#757575]"> - {food.brand}</span>}
                    </li>
                  ))}
                  </ul>
                )}
                </div>
          {/* Serving Size */}
          <div>
            <label className="block text-2xl font-semibold text-[#5A5A5A] mb-3">
              Serving Size (grams)
            </label>
            <input
            placeholder="Enter serving size in grams"
            type="number"
            className="w-full px-6 py-4 rounded-lg border-2 border-[#9E9E9E] bg-white text-[#5A5A5A] text-xl focus:outline-none focus:border-[#81D4FA]"
            step="0.1"
            onChange={handleServingSizeChange}
            value={servingSize}
            min="0"
            />
            {baseNutrition.protein > 0 && (
              <p className="text-sm text-[#757575] mt-2">
                Nutrition per 100g: {baseNutrition.protein.toFixed(1)}g protein, {baseNutrition.carbs.toFixed(1)}g carbs, {baseNutrition.fat.toFixed(1)}g fat
                </p>
            )}
          </div>

          {/* Protein Input */}
          <div>
            <label className="block text-2xl font-semibold text-[#5A5A5A] mb-3">
              Protein (grams)
            </label>
            <input
              type="number"
              name="protein"
              placeholder="0"
              value={formData.protein}
              onChange={handleInputChange}
              min="0"
              step="0.1"
              className="w-full px-6 py-4 rounded-lg border-2 border-[#9E9E9E] bg-white text-[#5A5A5A] text-xl focus:outline-none focus:border-[#81D4FA]"
            />
            <p className="text-sm text-[#757575] mt-2">
              Calories from protein: {Math.round((parseFloat(formData.protein) || 0) * 4)} kcal
            </p>
          </div>

          {/* Carbs Input */}
          <div>
            <label className="block text-2xl font-semibold text-[#5A5A5A] mb-3">
              Carbohydrates (grams)
            </label>
            <input
              type="number"
              name="carbs"
              placeholder="0"
              value={formData.carbs}
              onChange={handleInputChange}
              min="0"
              step="0.1"
              className="w-full px-6 py-4 rounded-lg border-2 border-[#9E9E9E] bg-white text-[#5A5A5A] text-xl focus:outline-none focus:border-[#81D4FA]"
            />
            <p className="text-sm text-[#757575] mt-2">
              Calories from carbs: {Math.round((parseFloat(formData.carbs) || 0) * 4)} kcal
            </p>
          </div>

          {/* Fat Input */}
          <div>
            <label className="block text-2xl font-semibold text-[#5A5A5A] mb-3">
              Fats (grams)
            </label>
            <input
              type="number"
              name="fat"
              placeholder="0"
              value={formData.fat}
              onChange={handleInputChange}
              min="0"
              step="0.1"
              className="w-full px-6 py-4 rounded-lg border-2 border-[#9E9E9E] bg-white text-[#5A5A5A] text-xl focus:outline-none focus:border-[#81D4FA]"
            />
            <p className="text-sm text-[#757575] mt-2">
              Calories from fat: {Math.round((parseFloat(formData.fat) || 0) * 9)} kcal
            </p>
          </div>

          {/* Total Calories Display */}
          <div className="bg-[#B3E5FC] rounded-lg p-6 mt-4">
            <p className="text-3xl font-bold text-[#5A5A5A] text-center">
              This Entry: {Math.round(totalCalories)} kcal
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-[#81D4FA] hover:bg-[#4FC3F7] text-white text-xl font-semibold px-8 py-4 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Adding...' : 'Add to Daily Total'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="bg-[#E8E8E8] hover:bg-[#D5D5D5] text-[#5A5A5A] text-xl font-semibold px-8 py-4 rounded-full border-2 border-[#9E9E9E] transition"
            >
              Reset
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <Link href="/dashboard" className="text-lg text-[#5A5A5A] hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}