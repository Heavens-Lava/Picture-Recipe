import { supabase } from '../lib/supabase';

export const saveIngredientsToGrocery = async (
  userId: string,
  ingredients: string[]
): Promise<{ success: boolean; error?: string }> => {
  if (!userId || ingredients.length === 0) {
    return { success: false, error: 'Missing userId or ingredients' };
  }

  try {
    // 1. Get existing ingredient names for this user
    const { data: existingItems, error: fetchError } = await supabase
      .from('grocery')
      .select('ingredient_name')
      .eq('user_id', userId);

    if (fetchError) {
      console.error('❌ Error fetching existing grocery items:', fetchError.message);
      return { success: false, error: fetchError.message };
    }

    const existingNames = new Set(
      (existingItems ?? []).map((item) => item.ingredient_name.toLowerCase())
    );

    // 2. Filter out duplicates (case-insensitive)
    const newIngredients = ingredients.filter(
      (ingredient) => !existingNames.has(ingredient.toLowerCase())
    );

    if (newIngredients.length === 0) {
      console.log('ℹ️ No new ingredients to add.');
      return { success: true }; // Not an error — just nothing to insert
    }

    // 3. Insert only new ingredients
    const entries = newIngredients.map((ingredient) => ({
      user_id: userId,
      ingredient_name: ingredient,
      added_at: new Date().toISOString(),
    }));

    const { data, error: insertError } = await supabase
      .from('grocery')
      .insert(entries)
      .select();

    if (insertError) {
      console.error('❌ Supabase insert error:', insertError.message);
      return { success: false, error: insertError.message };
    }

    console.log('✅ New ingredients added:', data);
    return { success: true };
  } catch (err) {
    console.error('🔥 Unexpected error:', err);
    return { success: false, error: 'Unexpected error' };
  }
};


export const moveIngredientsToShoppingCart = async (userId: string, ingredientNames: string[]) => {
  try {
    // Step 1: Get the grocery items to move
    const { data: itemsToMove, error: fetchError } = await supabase
      .from('grocery_items')
      .select('*')
      .eq('user_id', userId)
      .in('name', ingredientNames);

    if (fetchError) throw fetchError;

    if (!itemsToMove || itemsToMove.length === 0) {
      console.log('No matching grocery items found.');
      return { success: false, message: 'No items to move.' };
    }

    // Step 2: Insert into shopping_cart_items
    const cartItems = itemsToMove.map(item => ({
      user_id: item.user_id,
      name: item.name,
      category: item.category || 'Uncategorized',
    }));

    const { error: insertError } = await supabase
      .from('shopping_cart_items')
      .insert(cartItems);

    if (insertError) throw insertError;

    // Step 3: Delete from grocery_items
    const idsToDelete = itemsToMove.map(item => item.id);

    const { error: deleteError } = await supabase
      .from('grocery_items')
      .delete()
      .in('id', idsToDelete);

    if (deleteError) throw deleteError;

    return { success: true };
  } catch (err) {
    console.error('❌ Failed to move items to cart:', err);
    return { success: false, error: err };
  }
};