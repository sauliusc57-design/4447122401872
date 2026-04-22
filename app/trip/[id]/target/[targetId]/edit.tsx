import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import { db } from '@/db/client';
import { categories, targets } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext, ToastContext } from '../../../../_layout';

type Category = typeof categories.$inferSelect;
type Target = typeof targets.$inferSelect;

export default function EditTargetScreen() {
  const { targetId } = useLocalSearchParams<{ targetId: string }>();
  const router = useRouter();
  const auth = useContext(AuthContext);
  const toast = useContext(ToastContext);

  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState<Target | null>(null);
  const [categoryRows, setCategoryRows] = useState<Category[]>([]);
  const [scope, setScope] = useState<'trip' | 'category'>('trip');
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [metricType, setMetricType] = useState<'minutes' | 'count'>('count');
  const [targetValue, setTargetValue] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  if (!auth?.currentUser) return null;

  const { currentUser } = auth;

  useEffect(() => {
    const loadData = async () => {
      const [targetRows, categoryData] = await Promise.all([
        db
          .select()
          .from(targets)
          .where(and(eq(targets.id, Number(targetId)), eq(targets.userId, currentUser.id))),
        db.select().from(categories).where(eq(categories.userId, currentUser.id)),
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
  }, [targetId, currentUser.id]);

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
      .where(and(eq(targets.id, target.id), eq(targets.userId, currentUser.id)));

    toast?.showToast('Target updated!');
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
        <Text style={styles.subtitle}>Update the target settings for this trip.</Text>

        <Text style={styles.groupLabel}>Target Scope</Text>
        <View style={styles.chipRow}>
          <Chip label="Whole Trip" selected={scope === 'trip'} onPress={() => setScope('trip')} />
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
          <Chip label="Weekly" selected={period === 'weekly'} onPress={() => setPeriod('weekly')} />
          <Chip label="Monthly" selected={period === 'monthly'} onPress={() => setPeriod('monthly')} />
        </View>

        <Text style={styles.groupLabel}>Goal Type</Text>
        <View style={styles.chipRow}>
          <Chip label="Activities" selected={metricType === 'count'} onPress={() => setMetricType('count')} />
          <Chip label="Minutes" selected={metricType === 'minutes'} onPress={() => setMetricType('minutes')} />
        </View>

        <FormField
          label={`Target Value (${metricType === 'minutes' ? 'minutes' : 'activities'})`}
          value={targetValue}
          onChangeText={setTargetValue}
          placeholder={metricType === 'minutes' ? '240' : '3'}
        />

        <View style={styles.buttonGroup}>
          <PrimaryButton label="Save Changes" onPress={saveChanges} />
          <View style={styles.spacer} />
          <PrimaryButton label="Cancel" variant="secondary" onPress={() => router.back()} />
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
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FDF6EE',
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
    color: '#5C4A2E',
    fontSize: 16,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C1F0E',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#5C4A2E',
    marginBottom: 18,
  },
  groupLabel: {
    color: '#5C4A2E',
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
    backgroundColor: '#FFFAF4',
    borderColor: '#E8D5B7',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  chipSelected: {
    backgroundColor: '#E8873A',
    borderColor: '#E8873A',
  },
  chipText: {
    color: '#2C1F0E',
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