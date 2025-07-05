import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ToolsSectionProps {
  tools: string[];
}

export default function ToolsSection({ tools }: ToolsSectionProps) {
  if (!tools || tools.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Tools Needed</Text>
      <View style={styles.toolsContainer}>
        {tools.map((tool, index) => (
          <View key={index} style={styles.toolItem}>
            <Text style={styles.toolEmoji}>🔧</Text>
            <Text style={styles.toolText}>{tool}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  toolsContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  toolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  toolEmoji: {
    fontSize: 18,
    marginRight: 12,
  },
  toolText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
});