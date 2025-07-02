import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Check, ShoppingCart, Trash2 } from 'lucide-react-native';

interface GroceryItem {
  id: string;
  name: string;
  category: string;
  needed: boolean;
  inCart: boolean;
}

const sampleGroceryItems: GroceryItem[] = [
  { id: '1', name: 'Greek Yogurt', category: 'Dairy', needed: true, inCart: false },
  { id: '2', name: 'Fresh Spinach', category: 'Vegetables', needed: true, inCart: false },
  { id: '3', name: 'Chicken Breast', category: 'Meat', needed: true, inCart: false },
  { id: '4', name: 'Avocados', category: 'Produce', needed: true, inCart: true },
  { id: '5', name: 'Olive Oil', category: 'Pantry', needed: true, inCart: false },
  { id: '6', name: 'Bell Peppers', category: 'Vegetables', needed: true, inCart: false },
  { id: '7', name: 'Brown Rice', category: 'Grains', needed: true, inCart: true },
  { id: '8', name: 'Salmon Fillet', category: 'Seafood', needed: true, inCart: false },
];

export default function GroceryTab() {
  const [items, setItems] = useState<GroceryItem[]>(sampleGroceryItems);
  const [selectedTab, setSelectedTab] = useState<'needed' | 'cart'>('needed');

  const toggleItemCart = (id: string) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, inCart: !item.inCart } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
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
        >
          {item.inCart && <Check size={16} color="#FFFFFF" />}
        </TouchableOpacity>
      )}
      
      <Text style={[styles.itemName, item.inCart && styles.itemNameChecked]}>
        {item.name}
      </Text>
      
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeItem(item.id)}
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Grocery List</Text>
        <Text style={styles.headerSubtitle}>
          Smart suggestions based on your fridge
        </Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'needed' && styles.tabButtonActive
          ]}
          onPress={() => setSelectedTab('needed')}
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

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {selectedTab === 'needed' ? (
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
              renderItemsByCategory(cartItems, false)
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

      <TouchableOpacity style={styles.addButton}>
        <Plus size={24} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Add Item</Text>
      </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
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
    paddingVertical: 12,
    paddingHorizontal: 16,
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
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  itemName: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
  },
  itemNameChecked: {
    textDecorationLine: 'line-through',
    color: '#6B7280',
  },
  removeButton: {
    padding: 8,
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
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    marginHorizontal: 24,
    marginBottom: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});