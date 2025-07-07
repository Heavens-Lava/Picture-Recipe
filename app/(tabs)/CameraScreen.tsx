// CameraScreen.tsx - UI Component
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native'; // Import navigation hook
import styles from '../styles/CameraScreen.styles';

// Import components
import CameraControls from '../components/CameraScreenComponents/CameraControls';
import CameraViewComponent from '../components/CameraScreenComponents/CameraViewComponent';
import IngredientsDisplay from '../components/CameraScreenComponents/IngredientsDisplay';
import RecipesDisplay from '../components/CameraScreenComponents/RecipesDisplay';
import LocationToggle from '../components/CameraScreenComponents/LocationToggle';
import { useRequireAuth } from '../hooks/useRequireAuth';
// Import the custom hook
import { useCameraLogic } from '../components/CameraScreenComponents/useCameraLogic';

export default function CameraScreen() {
    useRequireAuth(); // Ensure the user is authenticated before accessing this screen
  // Get all state and functions from the custom hook
  const {
    facing,
    lastPhoto,
    isAnalyzing,
    ingredients,
    recipes,
     detailedRecipes,
    location,
    cameraRef,
    toggleCameraFacing,
    takePicture,
    toggleLocation,
    handleAIAction,
  } = useCameraLogic();

  const navigation = useNavigation(); // Initialize navigation hook

  // Handle button press to navigate to Ingredients screen
  const navigateToIngredients = () => {
    // Log the current state for debugging
    console.log('When navigating to ingredients: Ingredients array:', ingredients);
    console.log('When navigating to ingredients: Recipes array:', recipes);
    console.log('When navigating to ingredients: Last photo:', lastPhoto);
    
    // Convert arrays to JSON strings for proper passing through navigation
    const ingredientsParam = JSON.stringify(ingredients);
    const recipesParam = JSON.stringify(recipes);
  

    
    navigation.navigate('Ingredients', {
      ingredients: ingredientsParam,
      recipes: recipesParam,
      photoUri: lastPhoto?.uri || undefined,
      detailedRecipes: JSON.stringify(detailedRecipes), // ✅ Pass it as a JSON string
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Scan Your {location.charAt(0).toUpperCase() + location.slice(1)}
        </Text>
        <Text style={styles.headerSubtitle}>
          Take a photo of your {location} to discover recipe ideas
        </Text>
      </View>

      {/* ScrollView is a scrollable container allowing the user to scroll down*/}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        <CameraViewComponent
          cameraRef={cameraRef}
          facing={facing}
          lastPhoto={lastPhoto}
          isAnalyzing={isAnalyzing}
          styles={styles}
        />

        <CameraControls
          isAnalyzing={isAnalyzing}
          onFlipCamera={toggleCameraFacing}
          onTakePicture={takePicture}
          onAIAction={handleAIAction}
          styles={styles}
        />

        <LocationToggle
          location={location}
          onToggle={toggleLocation}
          styles={styles}
        />

        <IngredientsDisplay
          ingredients={ingredients}
          styles={styles}
        />

        <RecipesDisplay
          recipes={recipes}
          styles={styles}
        />

        {/* Show the button only when a picture has been taken */}
        {lastPhoto && (
          <View style={styles.navigateButtonContainer}>
            <TouchableOpacity style={styles.navigateButton} onPress={navigateToIngredients}>
              <Text style={styles.navigateButtonText}>
                Go to Ingredients 
                {ingredients?.length > 0 && ` (${ingredients.length} ingredients)`}
                {recipes?.length > 0 && ` (${recipes.length} recipes)`}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}