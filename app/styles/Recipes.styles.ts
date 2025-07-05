import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // Main container - takes full screen with light gray background
  container: { 
    flex: 1, 
    backgroundColor: '#F9FAFB' 
  },
  
  // Header section with title and subtitle
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB', // Light border to separate from content
  },
  
  // Main title styling - large, bold text
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827', // Dark gray for high contrast
    marginBottom: 4,
  },
  
  // Subtitle text - smaller and lighter color
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280', // Medium gray for secondary information
  },
  
  // Container for filter buttons and refresh icon
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    gap: 12, // Space between filter buttons
    alignItems: 'center',
  },
  
  // Individual filter button - takes equal space (flex: 1)
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F3F4F6', // Light gray background for inactive state
    alignItems: 'center',
  },
  
  // Active filter button - green background to show selection
  filterButtonActive: { 
    backgroundColor: '#059669' // Green color to indicate active state
  },
  
  // Filter button text - medium weight for readability
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280', // Gray text for inactive buttons
  },
  
  // Active filter button text - white for contrast on green background
  filterButtonTextActive: { 
    color: '#FFFFFF' 
  },
  
  // ScrollView container - takes remaining space
  scrollView: { 
    flex: 1 
  },
  
  // ScrollView content padding and spacing between cards
  scrollContent: { 
    padding: 24, 
    gap: 16 // Consistent spacing between recipe cards
  },
  
  // Centering container for loading states and empty messages
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  
  // Recipe card styling - white background with shadow for depth
  recipeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16, // Rounded corners for modern look
    overflow: 'hidden', // Ensures rounded corners are maintained
    // Shadow properties for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // Shadow property for Android
    elevation: 4,
  },
  
  // Inner content padding for recipe cards
  recipeContent: { 
    padding: 16 
  },
  
  // Header row containing recipe title and rating
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start', // Align to top in case title wraps
    marginBottom: 12,
  },
  
  // Recipe title - takes available space, bold text
  recipeTitle: {
    flex: 1, // Takes remaining space after rating
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginRight: 12, // Space between title and rating
  },
  
  // Container for star icon and rating number
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4, // Small space between star and number
  },
  
  // Rating number text
  rating: {
    fontSize: 14,
    color: '#111827',
  },
  
  // Container for recipe statistics (time, servings, difficulty)
  recipeStats: {
    flexDirection: 'row',
    gap: 16, // Space between each stat item
    marginBottom: 8,
  },
  
  // Individual stat item with icon and text
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4, // Small space between icon and text
  },
  
  // Text for stat values (time, servings, difficulty)
  statText: {
    fontSize: 14,
    color: '#6B7280', // Medium gray for secondary information
  },
  
  // Container for ingredient availability information
  ingredientStatus: { 
    marginTop: 8 // Space above ingredient status
  },
  
  // Text showing ingredient availability count
  ingredientText: {
    fontSize: 14,
    fontWeight: '500', // Medium weight for emphasis
    color: '#374151', // Darker gray for better readability
    marginBottom: 8,
  },
  
  // Background bar for progress indicator
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB', // Light gray background
    borderRadius: 2,
    overflow: 'hidden', // Ensures rounded corners on progress fill
  },
  
  // Filled portion of progress bar showing ingredient availability
  progressFill: {
    height: '100%',
    backgroundColor: '#059669', // Green fill to match app theme
    borderRadius: 2,
  },  
  lottieIcon: {
    width: 60,
    height: 60,
    marginHorizontal: 44,
  },
  headerTitleRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
},
recipeImage: {
  width: '100%',
  height: 160,
  borderTopLeftRadius: 12,
  borderTopRightRadius: 12,
  marginBottom: 8,
},

});