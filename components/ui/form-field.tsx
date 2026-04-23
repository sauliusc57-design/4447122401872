// Reusable labelled text input. Supports single-line, multiline, and secure (password) modes.
import { Ionicons } from '@expo/vector-icons';
import { useContext, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ThemeContext } from '@/app/_layout';
import { darkColors, lightColors } from '@/constants/theme';

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
};

export default function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  secureTextEntry = false,
  keyboardType = 'default',
}: Props) {
  const [hidden, setHidden] = useState(secureTextEntry);
  const themeCtx = useContext(ThemeContext);
  const isDark = themeCtx?.isDark ?? false;
  const c = isDark ? darkColors : lightColors;

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: c.label }]}>{label}</Text>
      <View style={[styles.inputRow, multiline && styles.multilineRow, { backgroundColor: c.card, borderColor: c.border }]}>
        <TextInput
          accessibilityLabel={label}
          placeholder={placeholder ?? label}
          placeholderTextColor={c.placeholder}
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'auto'}
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          style={[styles.input, multiline && styles.multilineInput, secureTextEntry && styles.inputFlex, { color: c.text }]}
        />
        {secureTextEntry && (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            style={styles.eyeButton}
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
          >
            <Ionicons name={hidden ? 'eye-off' : 'eye'} size={18} color={c.icon} />
          </Pressable>
        )}
      </View>
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
  },
  multilineRow: {
    alignItems: 'flex-start',
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputFlex: {
    flex: 1,
  },
  multilineInput: {
    minHeight: 100,
  },
  eyeButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});
