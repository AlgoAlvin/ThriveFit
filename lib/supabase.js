import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Create a single supabase client for interacting with your database
export const supabase = createClientComponentClient()

// Helper function to check if user is authenticated
export const checkAuth = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Helper function to get user profile
export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }
  
  return data
}

// Helper function to update user profile
export const updateUserProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating profile:', error)
    throw error
  }
  
  return data
}

// Helper function to log calories
export const logCalories = async (userId, caloriesConsumed, maxCalories) => {
  const today = new Date().toISOString().split('T')[0]
  
  const { data, error } = await supabase
    .from('calorie_logs')
    .upsert({
      user_id: userId,
      date: today,
      calories_consumed: caloriesConsumed,
      max_calories: maxCalories,
    }, {
      onConflict: 'user_id,date'
    })
    .select()
  
  if (error) {
    console.error('Error logging calories:', error)
    throw error
  }
  
  return data
}

// Helper function to log macros
export const logMacros = async (userId, protein, carbs, fats) => {
  const today = new Date().toISOString().split('T')[0]
  
  const { data, error } = await supabase
    .from('macro_logs')
    .upsert({
      user_id: userId,
      date: today,
      protein_grams: protein,
      carbs_grams: carbs,
      fats_grams: fats,
    }, {
      onConflict: 'user_id,date'
    })
    .select()
  
  if (error) {
    console.error('Error logging macros:', error)
    throw error
  }
  
  return data
}