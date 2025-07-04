import { supabase } from '../lib/supabase';

export const saveIngredientsToGrocery = async (
  userId: string,
  ingredients: string[]
): Promise<{ success: boolean; error?: string }> => {
  if (!userId || ingredients.length === 0) {
    return { success: false, error: 'Missing userId or ingredients' };
  }

  try {
    const entries = ingredients.map((ingredient) => ({
      user_id: userId,
      ingredient_name: ingredient,
      added_at: new Date().toISOString(), // optional, Supabase might auto-generate
    }));

    const { data, error } = await supabase
      .from('grocery')
      .insert(entries)
      .select();

    if (error) {
      console.error('❌ Supabase insert error:', error.message);
      return { success: false, error: error.message };
    }

    console.log('✅ Ingredients saved to grocery:', data);
    return { success: true };
  } catch (err) {
    console.error('🔥 Unexpected error:', err);
    return { success: false, error: 'Unexpected error' };
  }
};
