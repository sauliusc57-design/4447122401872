import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

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

export default function CategoryPicker({
  categories,
  selectedCategoryId,
  onSelect,
  onAdd,
  label = 'Category',
}: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>

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
                { borderColor: category.color },
                isSelected && { backgroundColor: category.color },
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
                  isSelected && styles.chipTextSelected,
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
            style={styles.addChip}
          >
            <Text style={styles.addChipText}>+ New</Text>
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
    color: '#334155',
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
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginRight: 8,
  },
  chipText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  addChip: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderStyle: 'dashed',
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    marginRight: 8,
  },
  addChipText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
  },
});