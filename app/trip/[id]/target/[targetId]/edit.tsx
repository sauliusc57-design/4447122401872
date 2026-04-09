// app/trip/[id]/target/[targetId]/edit.tsx
import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import { db } from '@/db/client';
import { categories, targets } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Category = typeof categories.$inferSelect;
type Target = typeof targets.$inferSelect;

export default function EditTargetScreen() {
  const { targetId } = useLocalSearchParams<{ targetId: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState<Target | null>(null);
  const [categoryRows, setCategoryRows] = useState<Category[]>([]);
  const [scope, setScope] = useState<'trip' | 'category'>('trip');
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [metricType, setMetricType] = useState<'minutes' | 'count'>('minutes');
  const [targetValue, setTargetValue] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const [targetRows, categoryData] = await Promise.all([
        db.select().from(targets).where(eq(targets.id, Number(targetId))),
        db.select().from(categories).where(eq(categories.userId, 1)),
      ]);

      const foundTarget = targetRows[0] ?? null;
      setTarget(foundTarget);
      setCategoryRows(categoryData);

      if (foundTarget) {
        setScope(foundTarget.categoryId == null ? 'trip' : 'category');
        setPeriod(foundTarget.period as 'weekly' | 'monthly');
        setMetricType(foundTarget.metricType as 'minutes' | 'count');
        setTargetValue(String(foundTarget.targetValue));
        setSelectedCategoryId(foundTarget.categoryId ?? categoryData[0]?.id ?? null);
      }

      setLoading(false);
    };

    loadData();
  }, [targetId]);

  const saveChanges = async () => {
    if (!target) return;

    const parsedValue = Number(targetValue);

    if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
      Alert.alert('Invalid target', 'Please enter a whole number greater than zero.');
      return;
    }

    if (scope === 'category' && !selectedCategoryId) {
      Alert.alert('Missing category', 'Please choose a category-specific target.');
      return;
    }

    await db
      .update(targets)
      .set({
        categoryId: scope === 'category' ? selectedCategoryId : null,
        period,
        metricType,
        targetValue: parsedValue,
      })
      .where(eq(targets.id, target.id));

    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.message}>Loading target...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!target) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.message}>Target not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Edit Target</Text>
        <Text style={styles.subtitle}>
          Update the target settings for this trip.
        </Text>

        <Text style={styles.groupLabel}>Target Scope</Text>
        <View style={styles.chipRow}>
          <Chip
            label="Whole Trip"
            selected={scope === 'trip'}
            onPress={() => setScope('trip')}
          />
          <Chip
            label="Specific Category"
            selected={scope === 'category'}
            onPress={() => setScope('category')}
          />
        </View>

        {scope === 'category' ? (
          <>
            <Text style={styles.groupLabel}>Category</Text>
            <View style={styles.chipRow}>
              {categoryRows.map((category) => (
                <Chip
                  key={category.id}
                  label={category.name}
                  selected={selectedCategoryId === category.id}
                  onPress={() => setSelectedCategoryId(category.id)}
                />
              ))}
            </View>
          </>
        ) : null}

        <Text style={styles.groupLabel}>Period</Text>
        <View style={styles.chipRow}>
          <Chip
            label="Weekly"
            selected={period === 'weekly'}
            onPress={() => setPeriod('weekly')}
          />
          <Chip
            label="Monthly"
            selected={period === 'monthly'}
            onPress={() => setPeriod('monthly')}
          />
        </View>

        <Text style={styles.groupLabel}>Metric</Text>
        <View style={styles.chipRow}>
          <Chip
            label="Minutes"
            selected={metricType === 'minutes'}
            onPress={() => setMetricType('minutes')}
          />
          <Chip
            label="Count"
            selected={metricType === 'count'}
            onPress={() => setMetricType('count')}
          />
        </View>

        <FormField
          label={`Target Value (${metricType === 'minutes' ? 'minutes' : 'count'})`}
          value={targetValue}
          onChangeText={setTargetValue}
          placeholder={metricType === 'minutes' ? '240' : '5'}
        />

        <View style={styles.buttonGroup}>
          <PrimaryButton label="Save Changes" onPress={saveChanges} />
          <View style={styles.spacer} />
          <PrimaryButton
            label="Cancel"
            variant="secondary"
            onPress={() => router.back()}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 18,
    paddingBottom: 30,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  message: {
    color: '#475569',
    fontSize: 16,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#475569',
    marginBottom: 18,
  },
  groupLabel: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 4,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  chip: {
    backgroundColor: '#FFFFFF',
    borderColor: '#94A3B8',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  chipSelected: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  chipText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  buttonGroup: {
    marginTop: 8,
  },
  spacer: {
    height: 10,
  },
});