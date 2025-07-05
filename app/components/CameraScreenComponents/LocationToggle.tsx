// LocationToggle.tsx
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

export interface LocationToggleProps {
  location: 'fridge' | 'pantry';
  onToggle: () => void;
  styles: any; // You can make this more specific based on your styles
}

const LocationToggle: React.FC<LocationToggleProps> = ({
  location,
  onToggle,
  styles
}) => {
  return (
    <View style={styles.locationContainer}>
      <TouchableOpacity onPress={onToggle} style={styles.locationButton}>
        <Text style={styles.locationButtonText}>
          Switch to {location === 'fridge' ? 'Pantry' : 'Fridge'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default LocationToggle;