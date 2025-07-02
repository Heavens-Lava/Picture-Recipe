// CameraControls.tsx
import React from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Camera, RotateCcw, Sparkles } from 'lucide-react-native';

export interface CameraControlsProps {
  isAnalyzing: boolean;
  onFlipCamera: () => void;
  onTakePicture: () => void;
  onAIAction?: () => void;
  styles: any; // You can make this more specific based on your styles
}

const CameraControls: React.FC<CameraControlsProps> = ({
  isAnalyzing,
  onFlipCamera,
  onTakePicture,
  onAIAction,
  styles
}) => {
  return (
    <View style={styles.controls}>
      <TouchableOpacity style={styles.flipButton} onPress={onFlipCamera}>
        <RotateCcw size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.captureButton, isAnalyzing && styles.captureButtonDisabled]}
        onPress={onTakePicture}
        disabled={isAnalyzing}
      >
        <View style={styles.captureButtonInner}>
          {isAnalyzing ? (
            <ActivityIndicator color="#059669" />
          ) : (
            <Camera size={32} color="#059669" />
          )}
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.aiButton} onPress={onAIAction}>
        <Sparkles size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

export default CameraControls;