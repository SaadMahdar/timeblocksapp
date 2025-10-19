import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTimeBlocks } from '@/hooks/TimeBlockContext';

export default function MyBlocksScreen() {
  const { blocks, colors } = useTimeBlocks();

  // Safe guard - use empty array if blocks is undefined
  const safeBlocks = blocks || [];
  const safeColors = colors || {
    backgroundDark: '#0e0e0eff',
    backgroundLight: '#4A4A4A',
    accent: '#594d9eff',
    card: '#303030ff',
    text: '#E8E8E8',
    textMuted: '#A0A0A0',
    active: '#5851b4ff'
  };

  // Ultra-safe data transformation
  const displayBlocks = safeBlocks.map((block, index) => {
    // Safe time handling
    let timeDisplay = '00:00';
    try {
      if (block.time) {
        if (block.time instanceof Date && !isNaN(block.time)) {
          timeDisplay = `${block.time.getHours().toString().padStart(2,'0')}:${block.time.getMinutes().toString().padStart(2,'0')}`;
        } else if (typeof block.time === 'string') {
          timeDisplay = block.time;
        }
      }
    } catch (error) {
      timeDisplay = '00:00';
    }

    // Safe days handling
    let daysDisplay = 'No days';
    try {
      if (block.days && Array.isArray(block.days) && block.days.length > 0) {
        daysDisplay = block.days.join(', ');
      }
    } catch (error) {
      daysDisplay = 'No days';
    }

    // Safe label handling
    const labelDisplay = block.label || 'Unnamed Block';

    return {
      id: index,
      labelDisplay,
      timeDisplay,
      daysDisplay
    };
  });

  return (
    <LinearGradient colors={[safeColors.backgroundDark, safeColors.backgroundLight]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={[styles.appTitle, { color: safeColors.text }]}>My Time Blocks</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.card, { backgroundColor: safeColors.card }]}>
            <Text style={[styles.cardLabel, { color: safeColors.text }]}>SCHEDULED BLOCKS</Text>
            {displayBlocks.length === 0 ? (
              <Text style={[styles.emptyText, { color: safeColors.textMuted }]}>No time blocks scheduled yet</Text>
            ) : (
              displayBlocks.map((block) => (
                <View key={block.id} style={[styles.blockItem, { 
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderLeftColor: safeColors.accent 
                }]}>
                  <Text style={[styles.blockLabel, { color: safeColors.text }]}>{block.labelDisplay}</Text>
                  <Text style={[styles.blockTime, { color: safeColors.textMuted }]}>
                    {block.timeDisplay} • {block.daysDisplay}
                  </Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  blockItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  blockLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  blockTime: {
    fontSize: 14,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
});