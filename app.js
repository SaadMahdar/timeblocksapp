import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Switch, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const STORAGE_KEY = '@time_blocks';

export default function App() {
  const [label, setLabel] = useState('');
  const [time, setTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [notificationGranted, setNotificationGranted] = useState(false);

  useEffect(() => {
    (async () => {
      if (Device.isDevice) {
        const { status } = await Notifications.requestPermissionsAsync();
        setNotificationGranted(status === 'granted');
      } else {
        Alert.alert('Notice', 'Notifications work only on a physical device');
      }
      loadBlocks();
    })();
  }, []);

  const toggleDay = (day) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const computeNextDateForDay = (dayIndex, hour, minute) => {
    const now = new Date();
    const nextDate = new Date();
    nextDate.setHours(hour, minute, 0, 0);
    const dayDiff = (dayIndex - now.getDay() + 7) % 7;
    if (dayDiff === 0 && nextDate <= now) nextDate.setDate(nextDate.getDate() + 7);
    else nextDate.setDate(nextDate.getDate() + dayDiff);
    return nextDate;
  };

  const scheduleNotification = async (block) => {
    const notificationIds = [];
    for (let day of block.days) {
      const dayIndex = DAYS.indexOf(day);
      const triggerDate = computeNextDateForDay(dayIndex, block.time.getHours(), block.time.getMinutes());

      const id = await Notifications.scheduleNotificationAsync({
        content: { title: 'Time Block', body: block.label || 'Reminder!' },
        trigger: triggerDate,
      });
      notificationIds.push(id);
    }
    return notificationIds;
  };

  const saveBlock = async () => {
    if (!notificationGranted) return Alert.alert('Enable notifications first');

    const newBlock = { label, time, days: selectedDays, notificationIds: [] };
    newBlock.notificationIds = await scheduleNotification(newBlock);

    const updatedBlocks = [...blocks, newBlock];
    setBlocks(updatedBlocks);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBlocks));

    Alert.alert('Success', 'Time block scheduled and saved!');
    setLabel('');
    setSelectedDays([]);
    setTime(new Date());
  };

  const deleteBlock = async (index) => {
    const blockToDelete = blocks[index];

    // Cancel all scheduled notifications for this block
    if (blockToDelete.notificationIds) {
      for (let id of blockToDelete.notificationIds) {
        await Notifications.cancelScheduledNotificationAsync(id);
      }
    }

    const updatedBlocks = blocks.filter((_, i) => i !== index);
    setBlocks(updatedBlocks);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBlocks));
  };

  const loadBlocks = async () => {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) setBlocks(JSON.parse(stored));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Time Block App</Text>

      <TextInput
        style={styles.input}
        placeholder="Label"
        value={label}
        onChangeText={setLabel}
      />

      <Button title={`Pick Time: ${time.getHours()}:${time.getMinutes()}`} onPress={() => setShowPicker(true)} />
      {showPicker && (
        <DateTimePicker
          value={time}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={(e, selected) => {
            setShowPicker(false);
            if (selected) setTime(selected);
          }}
        />
      )}

      <Text style={styles.subtitle}>Select Days:</Text>
      {DAYS.map((day) => (
        <View key={day} style={styles.dayRow}>
          <Text>{day}</Text>
          <Switch value={selectedDays.includes(day)} onValueChange={() => toggleDay(day)} />
        </View>
      ))}

      <Button title="Save & Schedule Block" onPress={saveBlock} />

      <Text style={[styles.subtitle, { marginTop: 30 }]}>Saved Time Blocks:</Text>
      {blocks.length === 0 ? (
        <Text>No saved blocks</Text>
      ) : (
        blocks.map((b, idx) => (
          <View key={idx} style={styles.blockRow}>
            <Text>{`${b.label} - ${b.time.getHours()}:${b.time.getMinutes()} - ${b.days.join(', ')}`}</Text>
            <TouchableOpacity onPress={() => deleteBlock(idx)}>
              <Text style={styles.delete}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 20, borderRadius: 5 },
  subtitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  dayRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  blockRow: { paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: '#ccc', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  delete: { color: 'red', marginLeft: 10 },
});