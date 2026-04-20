import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
};

function formatDisplay(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function DatePickerField({ label, value, onChange }: Props) {
  const [iosVisible, setIosVisible] = useState(false);

  const open = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value,
        mode: 'date',
        onChange: (_e, date) => {
          if (date) onChange(date);
        },
      });
    } else {
      setIosVisible(true);
    }
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.field} onPress={open} accessibilityLabel={label}>
        <Text style={styles.value}>{formatDisplay(value)}</Text>
        <Ionicons name="calendar-outline" size={18} color="#64748B" />
      </Pressable>

      {Platform.OS === 'ios' && (
        <Modal visible={iosVisible} transparent animationType="slide">
          <View style={styles.overlay}>
            <View style={styles.sheet}>
              <Pressable onPress={() => setIosVisible(false)} style={styles.doneRow}>
                <Text style={styles.doneText}>Done</Text>
              </Pressable>
              <DateTimePicker
                value={value}
                mode="date"
                display="spinner"
                onChange={(_e, date) => {
                  if (date) onChange(date);
                }}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
  },
  label: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  value: {
    color: '#0F172A',
    fontSize: 15,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 32,
  },
  doneRow: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomColor: '#E2E8F0',
    borderBottomWidth: 1,
  },
  doneText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '600',
  },
});
