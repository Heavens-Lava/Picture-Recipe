// CameraViewComponent.tsx
import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { CameraView, CameraType } from 'expo-camera';
import FastImage from 'expo-fast-image';

export interface CameraViewComponentProps {
  cameraRef: React.RefObject<CameraView>;
  facing: CameraType;
  lastPhoto: string | null;
  isAnalyzing: boolean;
  styles: any; // You can make this more specific based on your styles
}

const CameraViewComponent: React.FC<CameraViewComponentProps> = ({
  cameraRef,
  facing,
  lastPhoto,
  isAnalyzing,
  styles
}) => {
  return (
    <View style={styles.cameraContainer}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing} />
      {lastPhoto && (
        <View style={styles.lastPhotoContainer}>
          <FastImage
            source={{ uri: lastPhoto }}
            style={styles.lastPhoto}
            cacheKey="fridge-preview"
          />
          {isAnalyzing && (
            <View style={styles.analyzingOverlay}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={styles.analyzingText}>Analyzing...</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default CameraViewComponent;