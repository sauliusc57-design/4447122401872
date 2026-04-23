import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useContext, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { ThemeContext } from '@/app/_layout';
import { darkColors, lightColors } from '@/constants/theme';

type Props = {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
};

// Format a date as "DD Mon YYYY" for display in the field
function formatDisplay(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// DatePickerField — cross-platform date picker that uses a native dialog on Android and a modal spinner on iOS
export default function DatePickerField({ label, value, onChange }: Props) {
  const [iosVisible, setIosVisible] = useState(false);
  const themeCtx = useContext(ThemeContext);
  const isDark = themeCtx?.isDark ?? false;
  const c = isDark ? darkColors : lightColors;

  // Open the platform-appropriate date picker
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
      <Text style={[styles.label, { color: c.label }]}>{label}</Text>
      <Pressable
        style={[styles.field, { backgroundColor: c.card, borderColor: c.border }]}
        onPress={open}
        accessibilityLabel={label}
      >
        <Text style={[styles.value, { color: c.value }]}>{formatDisplay(value)}</Text>
        <Ionicons name="calendar-outline" size={18} color={c.icon} />
      </Pressable>

      {/* iOS-only bottom-sheet inline calendar modal */}
      {Platform.OS === 'ios' && (
        <Modal visible={iosVisible} transparent animationType="slide">
          <View style={styles.overlay}>
            <View style={[styles.sheet, { backgroundColor: c.card }]}>
              <Pressable
                onPress={() => setIosVisible(false)}
                style={[styles.doneRow, { borderBottomColor: c.iosDoneBorder }]}
              >
                <Text style={[styles.doneText, { color: c.iosDoneText }]}>Done</Text>
              </Pressable>
              <DateTimePicker
                value={value}
                mode="date"
                display="inline"
                themeVariant={isDark ? 'dark' : 'light'}
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
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  value: {
    fontSize: 15,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 32,
  },
  doneRow: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  doneText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
