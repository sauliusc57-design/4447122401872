import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import { useContext, useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ThemeContext } from '@/app/_layout';
import { darkColors, lightColors } from '@/constants/theme';

// Available colour swatches for a category
const PRESET_COLORS = [
  '#4F46E5', '#3B82F6', '#10B981', '#14B8A6',
  '#F59E0B', '#F97316', '#EF4444', '#EC4899',
  '#8B5CF6', '#64748B',
];

// Available icon options — value is the DB key, label is the rendered emoji
export const PRESET_ICONS: { value: string; label: string }[] = [
  { value: 'map', label: '🗺️' },
  { value: 'restaurant', label: '🍽️' },
  { value: 'compass', label: '🧭' },
  { value: 'bed', label: '🛏️' },
  { value: 'camera', label: '📷' },
  { value: 'bike', label: '🚴' },
  { value: 'beach', label: '🏖️' },
  { value: 'mountain', label: '⛰️' },
  { value: 'museum', label: '🏛️' },
  { value: 'shopping', label: '🛍️' },
];

type Props = {
  visible: boolean;
  initialName?: string;
  initialColor?: string;
  initialIcon?: string;
  onSave: (name: string, color: string, icon: string) => void;
  onCancel: () => void;
};

// CategoryFormModal — bottom-sheet modal for creating or editing a category
export default function CategoryFormModal({
  visible,
  initialName = '',
  initialColor = PRESET_COLORS[0],
  initialIcon = PRESET_ICONS[0].value,
  onSave,
  onCancel,
}: Props) {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);
  const [icon, setIcon] = useState(initialIcon);

  const themeCtx = useContext(ThemeContext);
  const isDark = themeCtx?.isDark ?? false;
  const c = isDark ? darkColors : lightColors;

  // Reset form fields each time the modal opens with fresh initial values
  useEffect(() => {
    if (visible) {
      setName(initialName);
      setColor(initialColor);
      setIcon(initialIcon);
    }
  }, [visible, initialName, initialColor, initialIcon]);

  // Validate name then pass values up to the parent handler
  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Missing name', 'Please enter a category name.');
      return;
    }
    onSave(name.trim(), color, icon);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: c.background }]}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Text style={[styles.title, { color: c.title }]}>Category</Text>

            <FormField
              label="Name"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Sightseeing"
            />

            <Text style={[styles.sectionLabel, { color: c.subtitle }]}>Colour</Text>
            <View style={styles.swatchGrid}>
              {PRESET_COLORS.map((preset) => (
                <Pressable
                  key={preset}
                  accessibilityRole="button"
                  accessibilityLabel={`Select colour ${preset}`}
                  onPress={() => setColor(preset)}
                  style={[
                    styles.swatch,
                    { backgroundColor: preset },
                    color === preset && [styles.swatchSelected, { borderColor: c.title }],
                  ]}
                />
              ))}
            </View>

            <Text style={[styles.sectionLabel, { color: c.subtitle }]}>Icon</Text>
            <View style={styles.iconGrid}>
              {PRESET_ICONS.map((item) => (
                <Pressable
                  key={item.value}
                  accessibilityRole="button"
                  accessibilityLabel={`Select icon ${item.value}`}
                  onPress={() => setIcon(item.value)}
                  style={[
                    styles.iconChip,
                    { borderColor: c.border, backgroundColor: c.card },
                    icon === item.value && { borderColor: color, backgroundColor: color + '22' },
                  ]}
                >
                  <Text style={styles.iconEmoji}>{item.label}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.buttonGroup}>
              <PrimaryButton label="Save Category" onPress={handleSave} />
              <View style={styles.spacer} />
              <PrimaryButton label="Cancel" variant="secondary" onPress={onCancel} />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 4,
  },
  swatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  swatchSelected: {
    borderWidth: 3,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  iconChip: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 22,
  },
  buttonGroup: {
    marginTop: 4,
  },
  spacer: {
    height: 10,
  },
});
