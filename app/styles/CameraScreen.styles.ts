// CameraScreen.styles.ts
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F9FAFB' 
  },
  scrollContainer: {
    flexGrow: 1,  // Ensures the content takes up the available space and scrolls
    paddingBottom: 20, // Add some bottom padding to prevent content from being cut off
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
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  cameraContainer: {
    height: 300,  // Fixed height for camera preview (adjust as needed)
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  camera: { 
    flex: 1 
  },
  lastPhotoContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
  },
  lastPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  analyzingOverlay: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.7)',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzingText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  flipButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonDisabled: {
    opacity: 0.6,
  },
  aiButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  locationButton: {
    padding: 12,
    backgroundColor: '#059669',
    borderRadius: 8,
    alignItems: 'center',
  },
  locationButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  ingredientsContainer: {
    padding: 16,
  },
  ingredientsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  ingredientItem: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 4,
  },
  noIngredients: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  recipesContainer: {
    padding: 16,
  },
  recipesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  recipeItem: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 4,
  },
  noRecipes: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  
  // Button for navigating to Ingredients screen
  navigateButtonContainer: {
    marginTop: 20, // Adjust margin as needed
    alignItems: 'center',
  },
  navigateButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: '#059669',
    borderRadius: 8,
    alignItems: 'center',
  },
  navigateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    
  },
  
});

export default styles;
