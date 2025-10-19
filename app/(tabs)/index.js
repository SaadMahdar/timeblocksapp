import React, { useState, useEffect } from 'react';
import { Alert, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';

import TimeBlockUI from '@/components/TimeBlockUI';
import { useTimeBlocks } from '@/hooks/TimeBlockContext';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const STORAGE_KEY = '@time_blocks';

export default function HomeScreen() {
  const [label, setLabel] = useState('');
  const [time, setTime] = useState(new Date());
  const [selectedDays, setSelectedDays] = useState([]);
  const [notificationGranted, setNotificationGranted] = useState(false);
  
  const { blocks, setBlocks, colors } = useTimeBlocks();

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

  const scheduleNotification = async (block) => {
    const notificationIds = [];
    for (let day of block.days) {
      const dayIndex = DAYS.indexOf(day);
      const nextDate = new Date();
      nextDate.setHours(block.time.getHours(), block.time.getMinutes(), 0, 0);
      const dayDiff = (dayIndex - nextDate.getDay() + 7) % 7;
      if (dayDiff === 0 && nextDate <= new Date()) nextDate.setDate(nextDate.getDate() + 7);
      else nextDate.setDate(nextDate.getDate() + dayDiff);

      const id = await Notifications.scheduleNotificationAsync({
        content: { title: 'Time Block', body: block.label || 'Reminder!' },
        trigger: nextDate,
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

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(
      updatedBlocks.map(b => ({ ...b, time: b.time.toISOString() }))
    ));

    setLabel('');
    setSelectedDays([]);
    setTime(new Date());
  };

  const deleteBlock = async (index) => {
    const blockToDelete = blocks[index];
    if (blockToDelete.notificationIds) {
      for (let id of blockToDelete.notificationIds) {
        await Notifications.cancelScheduledNotificationAsync(id);
      }
    }
    const updatedBlocks = blocks.filter((_, i) => i !== index);
    setBlocks(updatedBlocks);

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(
      updatedBlocks.map(b => ({ ...b, time: b.time.toISOString() }))
    ));
  };

  const loadBlocks = async () => {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored).map(b => ({ ...b, time: new Date(b.time) }));
      setBlocks(parsed);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.backgroundLight }}>
      <TimeBlockUI
        selectedDays={selectedDays}
        toggleDay={toggleDay}
        savedBlocks={blocks.map(b => ({
          label: b.label,
          time: `${b.time.getHours().toString().padStart(2,'0')}:${b.time.getMinutes().toString().padStart(2,'0')}`,
          days: b.days
        }))}
        selectedTime={time} 
        setTime={setTime}
        label={label}
        setLabel={setLabel}
        onSave={saveBlock}
        onDelete={deleteBlock}
      />
    </View>
  );
}