import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { useTimeBlocks } from '@/hooks/TimeBlockContext';

export default function ThemeModal({ visible, onClose }) {
  const { colors, currentTheme, switchTheme, themes } = useTimeBlocks();

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Choose Theme</Text>
          
          {Object.keys(themes).map(themeKey => (
            <TouchableOpacity
              key={themeKey}
              style={[
                styles.themeOption,
                { backgroundColor: themes[themeKey].accent },
                currentTheme === themeKey && styles.selectedTheme
              ]}
              onPress={() => {
                switchTheme(themeKey);
                onClose();
              }}
            >
              <Text style={styles.themeText}>{themes[themeKey].name}</Text>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  themeOption: {
    width: '100%',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  selectedTheme: {
    borderWidth: 3,
    borderColor: '#FFF',
  },
  themeText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  closeButton: {
    marginTop: 15,
    padding: 10,
  },
  closeText: {
    color: '#FFF',
    fontWeight: '600',
  },
});