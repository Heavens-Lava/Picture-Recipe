import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Check, ShoppingCart, Trash2, Camera, List, X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '../lib/supabase';
import { useRequireAuth } from '../hooks/useRequireAuth';
  import { useFocusEffect } from '@react-navigation/native';


interface GroceryItem {
  id: string;
  name: string;
  category: string;
  needed: boolean;
  inCart: boolean;
}

export default function GroceryTab() {
      useRequireAuth(); // Ensure the user is authenticated before accessing this screen
  
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [selectedTab, setSelectedTab] = useState<'needed' | 'cart'>('needed');
  const [showCartToast, setShowCartToast] = useState(false);
  const [showRemovedToast, setShowRemovedToast] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<string>('');
  const [lastRemovedItem, setLastRemovedItem] = useState<string>('');
  const [showManualAddModal, setShowManualAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const navigation = useNavigation();
  const { newIngredients } = useLocalSearchParams();
  
  // Animation values
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(-50)).current;
  const removedToastOpacity = useRef(new Animated.Value(0)).current;
  const removedToastTranslateY = useRef(new Animated.Value(-50)).current;
  
  // Add debounce mechanism to prevent rapid updates
  const processingItems = useRef(new Set<string>());
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const removedToastTimeoutRef = useRef<NodeJS.Timeout | null>(null);




useFocusEffect(
  useCallback(() => {
    fetchGroceryItemsFromDatabase();
  }, [])
);
  
  // Handle new ingredients from the ingredients screen
useEffect(() => {
  if (newIngredients) {
    try {
      const parsedIngredients = JSON.parse(newIngredients as string);
      addNewIngredientsToGroceryList(parsedIngredients);
    } catch (error) {
      console.error('Error parsing new ingredients:', error);
    }
  }
}, [newIngredients]);



const fetchGroceryItemsFromDatabase = async () => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.log("User not logged in");
    return;
  }

  const { data, error } = await supabase
    .from('grocery')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    console.error('❌ Error fetching grocery items:', error.message);
    return;
  }

  if (data) {
    const formattedItems = data.map((item) => ({
      id: item.id,
      name: item.ingredient_name,
      category: categorizeIngredient(item.ingredient_name),
      needed: true,
      inCart: false,
    }));

    setItems(formattedItems);
  }
};


  // Function to add new ingredients to grocery list
  const addNewIngredientsToGroceryList = (ingredients: string[]) => {
    const newItems: GroceryItem[] = ingredients.map((ingredient, index) => ({
      id: `new-${Date.now()}-${index}`,
      name: ingredient,
      category: categorizeIngredient(ingredient),
      needed: true,
      inCart: false,
    }));

    setItems(prevItems => {
      // Filter out duplicates based on name (case-insensitive)
      const existingNames = new Set(prevItems.map(item => item.name.toLowerCase()));
      const uniqueNewItems = newItems.filter(
        item => !existingNames.has(item.name.toLowerCase())
      );

      if (uniqueNewItems.length > 0) {
        Alert.alert(
          'Items Added',
          `${uniqueNewItems.length} new item${uniqueNewItems.length !== 1 ? 's' : ''} added to your grocery list!`,
          [{ text: 'OK' }]
        );
      }

      return [...prevItems, ...uniqueNewItems];
    });
  };

  // Function to add a single item manually
const addManualItem = async () => {
  const trimmedName = newItemName.trim();
  if (trimmedName === '') {
    Alert.alert('Error', 'Please enter an item name');
    return;
  }

  const existingNames = new Set(items.map(item => item.name.toLowerCase()));
  if (existingNames.has(trimmedName.toLowerCase())) {
    Alert.alert('Item Exists', 'This item is already in your grocery list');
    return;
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    Alert.alert('Error', 'Unable to fetch user information.');
    console.error('User error:', userError?.message);
    return;
  }

  const { data, error } = await supabase
    .from('grocery')
    .insert([{ ingredient_name: trimmedName, user_id: user.id }])
    .select()
    .single();

  if (error || !data) {
    Alert.alert('Error', 'Failed to add item to the database.');
    console.error('Insert error:', error?.message);
    return;
  }

  const newItem: GroceryItem = {
    id: data.id,
    name: data.ingredient_name,
    category: categorizeIngredient(data.ingredient_name),
    needed: true,
    inCart: false,
  };

  setItems(prevItems => [...prevItems, newItem]);
  setNewItemName('');
  setShowManualAddModal(false);

  Alert.alert('Item Added', `"${newItem.name}" has been added to your grocery list!`);
};


  // Simple categorization function
  const categorizeIngredient = (ingredient: string): string => {
    const lowerIngredient = ingredient.toLowerCase();
    
    // Produce
    if (lowerIngredient.includes('apple') || lowerIngredient.includes('banana') || 
        lowerIngredient.includes('orange') || lowerIngredient.includes('tomato') ||
        lowerIngredient.includes('onion') || lowerIngredient.includes('carrot') ||
        lowerIngredient.includes('potato') || lowerIngredient.includes('lettuce')) {
      return 'Produce';
    }
    
    // Dairy
    if (lowerIngredient.includes('milk') || lowerIngredient.includes('cheese') || 
        lowerIngredient.includes('yogurt') || lowerIngredient.includes('butter')) {
      return 'Dairy';
    }
    
    // Meat & Seafood
    if (lowerIngredient.includes('chicken') || lowerIngredient.includes('beef') || 
        lowerIngredient.includes('fish') || lowerIngredient.includes('salmon') ||
        lowerIngredient.includes('pork') || lowerIngredient.includes('turkey')) {
      return 'Meat & Seafood';
    }
    
    // Pantry
    if (lowerIngredient.includes('rice') || lowerIngredient.includes('pasta') || 
        lowerIngredient.includes('flour') || lowerIngredient.includes('oil') ||
        lowerIngredient.includes('salt') || lowerIngredient.includes('pepper')) {
      return 'Pantry';
    }
    
    return 'Other';
  };

  useEffect(() => {
    // fetchGroceryItemsFromDatabase();
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      if (removedToastTimeoutRef.current) {
        clearTimeout(removedToastTimeoutRef.current);
      }
    };
  }, []);

  // Optimized toast function for adding to cart
  const showAddedToCartToast = useCallback((itemName: string) => {
    // Clear existing timeout
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    // If toast is already showing, just update the item name
    if (showCartToast) {
      setLastAddedItem(itemName);
      toastTimeoutRef.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(toastOpacity, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(toastTranslateY, {
            toValue: -50,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setShowCartToast(false);
        });
      }, 2000);
      return;
    }

    setLastAddedItem(itemName);
    setShowCartToast(true);
    
    // Reset animation values
    toastOpacity.setValue(0);
    toastTranslateY.setValue(-50);
    
    // Animate in
    Animated.parallel([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(toastTranslateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Auto hide after 2 seconds
    toastTimeoutRef.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(toastTranslateY, {
          toValue: -50,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowCartToast(false);
      });
    }, 2000);
  }, [showCartToast, toastOpacity, toastTranslateY]);

  // Optimized toast function for removing from cart
  const showRemovedFromCartToast = useCallback((itemName: string) => {
    // Clear existing timeout
    if (removedToastTimeoutRef.current) {
      clearTimeout(removedToastTimeoutRef.current);
    }

    // If toast is already showing, just update the item name
    if (showRemovedToast) {
      setLastRemovedItem(itemName);
      removedToastTimeoutRef.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(removedToastOpacity, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(removedToastTranslateY, {
            toValue: -50,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setShowRemovedToast(false);
        });
      }, 2000);
      return;
    }

    setLastRemovedItem(itemName);
    setShowRemovedToast(true);
    
    // Reset animation values
    removedToastOpacity.setValue(0);
    removedToastTranslateY.setValue(-50);
    
    // Animate in
    Animated.parallel([
      Animated.timing(removedToastOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(removedToastTranslateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Auto hide after 2 seconds
    removedToastTimeoutRef.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(removedToastOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(removedToastTranslateY, {
          toValue: -50,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowRemovedToast(false);
      });
    }, 2000);
  }, [showRemovedToast, removedToastOpacity, removedToastTranslateY]);

  // Optimized toggleItemCart function with debouncing
  const toggleItemCart = useCallback((id: string) => {
    // Prevent rapid successive calls
    if (processingItems.current.has(id)) {
      return;
    }

    processingItems.current.add(id);
    
    // Use functional update to avoid stale closure issues
    setItems(prevItems => {
      const item = prevItems.find(item => item.id === id);
      if (!item) {
        processingItems.current.delete(id);
        return prevItems;
      }

      // Trigger toast animation based on the new state
      if (!item.inCart) {
        // Will be adding to cart
        showAddedToCartToast(item.name);
      } else {
        // Will be removing from cart
        showRemovedFromCartToast(item.name);
      }

      const updatedItems = prevItems.map(prevItem =>
        prevItem.id === id ? { ...prevItem, inCart: !prevItem.inCart } : prevItem
      );

      // Clean up processing flag after a short delay
      setTimeout(() => {
        processingItems.current.delete(id);
      }, 300);

      return updatedItems;
    });
  }, [showAddedToCartToast, showRemovedFromCartToast]);

const removeItem = async (id: string) => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.log("User not logged in");
    return;
  }

  // Remove from database
  const { error } = await supabase
    .from('grocery')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id); // Optional: extra safety

  if (error) {
    console.error('❌ Failed to delete item:', error.message);
    Alert.alert('Error', 'Failed to remove item from the database.');
    return;
  }

  // Remove from local state
  setItems(prevItems => prevItems.filter(item => item.id !== id));
};


  const navigateToCamera = () => {
    navigation.navigate('CameraScreen' as never);
  };

  const navigateToIngredients = () => {
    navigation.navigate('Ingredients' as never);
  };

  const neededItems = items.filter(item => item.needed && !item.inCart);
  const cartItems = items.filter(item => item.inCart);

  const groupItemsByCategory = (items: GroceryItem[]) => {
    return items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, GroceryItem[]>);
  };

  const renderItem = (item: GroceryItem, showCheckbox: boolean = true) => (
    <View key={item.id} style={styles.groceryItem}>
      {showCheckbox && (
        <TouchableOpacity
          style={[styles.checkbox, item.inCart && styles.checkboxChecked]}
          onPress={() => toggleItemCart(item.id)}
          activeOpacity={0.7}
        >
          {item.inCart && <Check size={16} color="#FFFFFF" />}
        </TouchableOpacity>
      )}
      
      <TouchableOpacity
        style={styles.itemContent}
        onPress={() => toggleItemCart(item.id)}
        activeOpacity={0.7}
      >
        <Text style={[styles.itemName, item.inCart && styles.itemNameChecked]}>
          {item.name}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeItem(item.id)}
        activeOpacity={0.7}
      >
        <Trash2 size={16} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  const renderItemsByCategory = (items: GroceryItem[], showCheckbox: boolean = true) => {
    const groupedItems = groupItemsByCategory(items);
    
    return Object.entries(groupedItems).map(([category, categoryItems]) => (
      <View key={category} style={styles.categorySection}>
        <Text style={styles.categoryTitle}>{category}</Text>
        {categoryItems.map(item => renderItem(item, showCheckbox))}
      </View>
    ));
  };

const renderEmptyState = () => (
  <View style={styles.emptyState}>
    <ShoppingCart size={64} color="#D1D5DB" />
    <Text style={styles.emptyStateTitle}>No grocery items yet</Text>
    <Text style={styles.emptyStateText}>
      Get started by adding ingredients from your fridge or typing in a grocery item
    </Text>

    <View style={styles.emptyButtonContainer}>
      <TouchableOpacity
        style={styles.emptyActionButton}
        onPress={navigateToCamera}
        activeOpacity={0.7}
      >
        <Camera size={20} color="#059669" />
        <Text style={styles.emptyActionButtonText}>Take Photo</Text>
        <Text style={styles.emptyActionButtonSubtext}>Scan your fridge</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.emptyActionButton}
        onPress={navigateToIngredients}
        activeOpacity={0.7}
      >
        <List size={20} color="#059669" />
        <Text style={styles.emptyActionButtonText}>View Ingredients</Text>
        <Text style={styles.emptyActionButtonSubtext}>Browse your pantry</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.emptyActionButton}
        onPress={() => setShowManualAddModal(true)}
        activeOpacity={0.7}
      >
        <Plus size={20} color="#059669" />
        <Text style={styles.emptyActionButtonText}>Type Item Manually</Text>
        <Text style={styles.emptyActionButtonSubtext}>Add any grocery by name</Text>
      </TouchableOpacity>
    </View>
  </View>
);


  const hasAnyItems = items.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Grocery List</Text>
        <Text style={styles.headerSubtitle}>
          Smart suggestions based on your fridge
        </Text>
      </View>

      {hasAnyItems && (
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              selectedTab === 'needed' && styles.tabButtonActive
            ]}
            onPress={() => setSelectedTab('needed')}
            activeOpacity={0.7}
          >
            <ShoppingCart size={20} color={selectedTab === 'needed' ? '#FFFFFF' : '#6B7280'} />
            <Text style={[
              styles.tabButtonText,
              selectedTab === 'needed' && styles.tabButtonTextActive
            ]}>
              Need to Buy ({neededItems.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tabButton,
              selectedTab === 'cart' && styles.tabButtonActive
            ]}
            onPress={() => setSelectedTab('cart')}
            activeOpacity={0.7}
          >
            <Check size={20} color={selectedTab === 'cart' ? '#FFFFFF' : '#6B7280'} />
            <Text style={[
              styles.tabButtonText,
              selectedTab === 'cart' && styles.tabButtonTextActive
            ]}>
              In Cart ({cartItems.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Helpful instruction text */}
      {hasAnyItems && selectedTab === 'needed' && neededItems.length > 0 && (
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>
            💡 Tap on any item or checkbox to add it to your cart
          </Text>
        </View>
      )}

      {/* Helpful instruction text for cart */}
      {hasAnyItems && selectedTab === 'cart' && cartItems.length > 0 && (
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>
            ↩️ Tap on any item to move it back to your shopping list
          </Text>
        </View>
      )}

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!hasAnyItems ? (
          renderEmptyState()
        ) : selectedTab === 'needed' ? (
          <>
            {neededItems.length > 0 ? (
              renderItemsByCategory(neededItems, true)
            ) : (
              <View style={styles.emptyState}>
                <ShoppingCart size={64} color="#D1D5DB" />
                <Text style={styles.emptyStateTitle}>All set!</Text>
                <Text style={styles.emptyStateText}>
                  You have all the ingredients you need
                </Text>
              </View>
            )}
          </>
        ) : (
          <>
            {cartItems.length > 0 ? (
              renderItemsByCategory(cartItems, true)
            ) : (
              <View style={styles.emptyState}>
                <Check size={64} color="#D1D5DB" />
                <Text style={styles.emptyStateTitle}>Cart is empty</Text>
                <Text style={styles.emptyStateText}>
                  Add items from your needed list
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Two Add Item Buttons */}
      {hasAnyItems && (
        <View style={styles.addButtonContainer}>
          <TouchableOpacity 
            style={[styles.addButton, styles.addButtonPhoto]}
            onPress={navigateToCamera}
            activeOpacity={0.7}
          >
            <Camera size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Item (From Photo)</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.addButton, styles.addButtonManual]}
            onPress={() => setShowManualAddModal(true)}
            activeOpacity={0.7}
          >
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Item (Manually Type)</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Manual Add Item Modal */}
      <Modal
        visible={showManualAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowManualAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Item Manually</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowManualAddModal(false)}
                activeOpacity={0.7}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <Text style={styles.inputLabel}>Item Name</Text>
              <TextInput
                style={styles.textInput}
                value={newItemName}
                onChangeText={setNewItemName}
                placeholder="Enter item name (e.g., Bananas, Milk, Bread)"
                placeholderTextColor="#9CA3AF"
                autoFocus={true}
                returnKeyType="done"
                onSubmitEditing={addManualItem}
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowManualAddModal(false);
                  setNewItemName('');
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalAddButton}
                onPress={addManualItem}
                activeOpacity={0.7}
              >
                <Text style={styles.modalAddButtonText}>Add Item</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Animated Toast Notification - Added to Cart */}
      {showCartToast && (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              opacity: toastOpacity,
              transform: [{ translateY: toastTranslateY }],
            },
          ]}
        >
          <View style={styles.toast}>
            <View style={styles.toastIcon}>
              <Check size={20} color="#FFFFFF" />
            </View>
            <View style={styles.toastContent}>
              <Text style={styles.toastTitle}>Added to Cart!</Text>
              <Text style={styles.toastMessage} numberOfLines={1}>
                {lastAddedItem}
              </Text>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Animated Toast Notification - Removed from Cart */}
      {showRemovedToast && (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              opacity: removedToastOpacity,
              transform: [{ translateY: removedToastTranslateY }],
            },
          ]}
        >
          <View style={[styles.toast, styles.toastRemoved]}>
            <View style={[styles.toastIcon, styles.toastIconRemoved]}>
              <ShoppingCart size={20} color="#FFFFFF" />
            </View>
            <View style={styles.toastContent}>
              <Text style={styles.toastTitle}>Back to Shopping List!</Text>
              <Text style={styles.toastMessage} numberOfLines={1}>
                {lastRemovedItem}
              </Text>
            </View>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    gap: 8,
  },
  tabButtonActive: {
    backgroundColor: '#059669',
  },
  tabButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  instructionContainer: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    backgroundColor: '#F0F9FF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0F2FE',
  },
  instructionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#0369A1',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 120,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 12,
  },
  groceryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    margin: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  itemContent: {
    flex: 1,
    paddingVertical: 16,
  },
  itemName: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
  },
  itemNameChecked: {
    textDecorationLine: 'line-through',
    color: '#6B7280',
  },
  removeButton: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 24,
    lineHeight: 24,
  },
  emptyButtonContainer: {
    width: '100%',
    paddingHorizontal: 24,
    gap: 16,
  },
  emptyActionButton: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyActionButtonText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginLeft: 16,
  },
  emptyActionButtonSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginLeft: 16,
  },
  addButtonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  addButtonPhoto: {
    backgroundColor: '#059669',
  },
  addButtonManual: {
    backgroundColor: '#3B82F6',
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
  },
  modalButtons: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  modalAddButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  modalAddButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  // Toast Animation Styles
  toastContainer: {
    position: 'absolute',
    top: 100,
    left: 24,
    right: 24,
    zIndex: 1000,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  toastIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  toastContent: {
    flex: 1,
  },
  toastTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  toastMessage: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  // Removed from cart toast styles
  toastRemoved: {
    backgroundColor: '#DC2626',
  },
  toastIconRemoved: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});

// working version here. 