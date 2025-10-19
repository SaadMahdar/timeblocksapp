import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Platform,
  StyleSheet 
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons'; // Add this import
import { useTimeBlocks } from '@/hooks/TimeBlockContext';
import ThemeModal from '@/components/ThemeModal';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function TimeBlockUI({
  selectedDays,
  toggleDay,
  savedBlocks,
  selectedTime,
  setTime,
  label,
  setLabel,
  onSave,
  onDelete,
}) {
  const [showPicker, setShowPicker] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const { colors } = useTimeBlocks();

  const handleTimeChange = (event, selected) => {
    setShowPicker(Platform.OS === 'ios');
    if (selected) setTime(selected);
  };

  const formattedTime = selectedTime instanceof Date
    ? `${selectedTime.getHours().toString().padStart(2,'0')}:${selectedTime.getMinutes().toString().padStart(2,'0')}`
    : selectedTime;

  return (
    <LinearGradient colors={[colors.backgroundDark, colors.backgroundLight]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.appTitle, { color: colors.text }]}>Time Block App</Text>
          <TouchableOpacity 
            style={styles.themeButton}
            onPress={() => setShowThemeModal(true)}
          >
            <Ionicons name="contrast" size={24} color={colors.text} /> {/* Changed from 🎨 */}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Label Input */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardLabel, { color: colors.text }]}>Label</Text>
            <TextInput
              value={label}
              onChangeText={setLabel}
              placeholder="Enter task name..."
              placeholderTextColor={colors.textMuted}
              style={[styles.textInput, { 
                backgroundColor: 'rgba(255,255,255,0.08)',
                borderColor: 'rgba(255,255,255,0.15)',
                color: colors.text 
              }]}
            />
          </View>

          {/* Time Picker */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardLabel, { color: colors.text }]}>PICK TIME: {formattedTime}</Text>
            <TouchableOpacity
              onPress={() => setShowPicker(true)}
              style={styles.timeButton}
            >
              <LinearGradient colors={[colors.accent, '#e867ac']} style={styles.timeGradient}>
                <Text style={[styles.timeButtonText, { color: colors.text }]}>SELECT TIME</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {showPicker && (
            <DateTimePicker
              value={selectedTime instanceof Date ? selectedTime : new Date()}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={handleTimeChange}
            />
          )}

          {/* Days Selection */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardLabel, { color: colors.text }]}>SELECT DAYS</Text>
            <View style={styles.daysGrid}>
              {DAYS.map((day) => (
                <TouchableOpacity
                  key={day}
                  onPress={() => toggleDay(day)}
                  style={[
                    styles.dayButton,
                    { 
                      backgroundColor: 'rgba(147, 76, 240, 0.08)',
                      borderColor: 'rgba(255,255,255,0.15)'
                    },
                    selectedDays.includes(day) && [styles.dayButtonActive, { 
                      backgroundColor: colors.active,
                      borderColor: colors.active 
                    }]
                  ]}
                >
                  <Text style={[
                    styles.dayText,
                    { color: colors.textMuted },
                    selectedDays.includes(day) && [styles.dayTextActive, { color: colors.text }]
                  ]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity onPress={onSave} style={styles.saveButton}>
            <LinearGradient colors={[colors.accent, '#fc79bf']} style={styles.saveGradient}>
              <Text style={[styles.saveText, { color: colors.text }]}>SAVE & SCHEDULE BLOCK</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Saved Blocks */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardLabel, { color: colors.text }]}>SAVED TIME BLOCKS</Text>
            {savedBlocks.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>No time blocks saved yet</Text>
            ) : (
              savedBlocks.map((block, index) => (
                <View key={index} style={[styles.blockItem, { 
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderLeftColor: colors.accent 
                }]}>
                  <Text style={[styles.blockLabel, { color: colors.text }]}>{block.label}</Text>
                  <Text style={[styles.blockTime, { color: colors.textMuted }]}>{block.time} • {block.days.join(', ')}</Text>
                  <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(index)}>
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Theme Modal */}
        <ThemeModal 
          visible={showThemeModal} 
          onClose={() => setShowThemeModal(false)} 
        />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  themeButton: {
    padding: 8,
  },
  themeButtonText: {
    fontSize: 20,
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
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  textInput: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    fontSize: 16,
  },
  timeButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  timeGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  timeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    flex: 1,
    minWidth: 70,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  dayButtonActive: {
    // Colors handled inline
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  dayTextActive: {
    fontWeight: '600',
  },
  saveButton: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  saveGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  saveText: {
    fontSize: 18,
    fontWeight: 'bold',
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
  deleteButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  deleteText: {
    color: '#D95B7F',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
});