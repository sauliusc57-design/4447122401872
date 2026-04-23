import { useContext } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ThemeContext } from '@/app/_layout';
import { darkColors, lightColors } from '@/constants/theme';

export type CategoryOption = {
  id: number;
  name: string;
  color: string;
  icon: string;
};

type Props = {
  categories: CategoryOption[];
  selectedCategoryId: number | null;
  onSelect: (categoryId: number) => void;
  onAdd?: () => void;
  label?: string;
};

// CategoryPicker — horizontal scrollable row of category chips with an optional "+ New" button
export default function CategoryPicker({
  categories,
  selectedCategoryId,
  onSelect,
  onAdd,
  label = 'Category',
}: Props) {
  const themeCtx = useContext(ThemeContext);
  const isDark = themeCtx?.isDark ?? false;
  const c = isDark ? darkColors : lightColors;

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: c.label }]}>{label}</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {categories.map((category) => {
          const isSelected = selectedCategoryId === category.id;

          return (
            <Pressable
              key={category.id}
              accessibilityRole="button"
              accessibilityLabel={`Select ${category.name} category`}
              onPress={() => onSelect(category.id)}
              style={[
                styles.chip,
                { borderColor: category.color, backgroundColor: isSelected ? category.color : c.card },
              ]}
            >
              <View
                style={[
                  styles.dot,
                  { backgroundColor: isSelected ? '#FFFFFF' : category.color },
                ]}
              />
              <Text
                style={[
                  styles.chipText,
                  { color: isSelected ? '#FFFFFF' : c.chipText },
                ]}
              >
                {category.name}
              </Text>
            </Pressable>
          );
        })}

        {onAdd && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add new category"
            onPress={onAdd}
            style={[styles.addChip, { backgroundColor: c.background, borderColor: c.border }]}
          >
            <Text style={[styles.addChipText, { color: c.subtitle }]}>+ New</Text>
          </Pressable>
        )}
      </ScrollView>
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
  row: {
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginRight: 8,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  addChip: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: 'dashed',
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
  },
  addChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
