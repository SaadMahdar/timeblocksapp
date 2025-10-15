import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  FlatList,
  TextInput,
  Modal,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

export default function App() {
  // ---------- STATE ----------
  const [blocks, setBlocks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");

  const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/; // HH:MM 24-hour

  // ---------- REQUEST NOTIFICATION PERMISSIONS ----------
  useEffect(() => {
    const requestPermissions = async () => {
      if (Device.isDevice) {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== "granted") {
          alert("Permission for notifications not granted!");
        }
      }
    };
    requestPermissions();
  }, []);

  // ---------- LOAD SAVED BLOCKS ----------
  useEffect(() => {
    const loadBlocks = async () => {
      try {
        const saved = await AsyncStorage.getItem("timeBlocks");
        if (saved) setBlocks(JSON.parse(saved));
      } catch (e) {
        console.log("Error loading:", e);
      }
    };
    loadBlocks();
  }, []);

  // ---------- SAVE WHEN BLOCKS CHANGE ----------
  useEffect(() => {
    const saveBlocks = async () => {
      try {
        await AsyncStorage.setItem("timeBlocks", JSON.stringify(blocks));
      } catch (e) {
        console.log("Error saving:", e);
      }
    };
    saveBlocks();
  }, [blocks]);

  // ---------- DELETE BLOCK ----------
  const deleteBlock = (index) => {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  };

  // ---------- SCHEDULE NOTIFICATION ----------
  const scheduleNotification = async (label, start) => {
    const [hour, minute] = start.split(":").map(Number);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Time Block Started",
        body: `It's time for: ${label}`,
      },
      trigger: {
        hour,
        minute,
        repeats: true, // daily
      },
    });
  };

  // ---------- ADD NEW BLOCK ----------
  const addBlock = () => {
    if (!newLabel || !newStart || !newEnd) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    if (!timePattern.test(newStart) || !timePattern.test(newEnd)) {
      Alert.alert("Error", "Time must be in HH:MM 24-hour format");
      return;
    }

    setBlocks((prev) => [
      ...prev,
      { label: newLabel, start: newStart, end: newEnd },
    ]);

    scheduleNotification(newLabel, newStart);

    setNewLabel("");
    setNewStart("");
    setNewEnd("");
    setModalVisible(false);
  };

  // ---------- UI ----------
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Time Blocks</Text>

      <FlatList
        data={blocks}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.block}>
            <Text>
              {item.label}: {item.start} - {item.end}
            </Text>
            <Button title="Delete" onPress={() => deleteBlock(index)} />
          </View>
        )}
      />

      <Button title="Add Time Block" onPress={() => setModalVisible(true)} />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <TextInput
            placeholder="Label"
            value={newLabel}
            onChangeText={setNewLabel}
            style={styles.input}
          />
          <TextInput
            placeholder="Start (HH:MM)"
            value={newStart}
            onChangeText={setNewStart}
            style={styles.input}
          />
          <TextInput
            placeholder="End (HH:MM)"
            value={newEnd}
            onChangeText={setNewEnd}
            style={styles.input}
          />
          <Button title="Add" onPress={addBlock} />
          <Button title="Cancel" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
}

// ---------- STYLES ----------
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 50 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  block: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#ccc" },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
    padding: 8,
    borderRadius: 5,
  },
});
