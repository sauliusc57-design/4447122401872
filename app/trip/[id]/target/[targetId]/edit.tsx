import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import { db } from '@/db/client';
import { fetchUserCategories } from '@/db/queries';
import { categories, targets } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext, ThemeContext, ToastContext } from '../../../../_layout';
import { darkColors, lightColors } from '@/constants/theme';

type Category = typeof categories.$inferSelect;
type Target = typeof targets.$inferSelect;

export default function EditTargetScreen() {
  const { targetId } = useLocalSearchParams<{ targetId: string }>();
  const router = useRouter();
  const auth = useContext(AuthContext);
  const toast = useContext(ToastContext);
  const themeCtx = useContext(ThemeContext);
  const isDark = themeCtx?.isDark ?? false;
  const c = isDark ? darkColors : lightColors;

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
        fetchUserCategories(currentUser.id),
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
      <SafeAreaView style={[styles.safeArea, { backgroundColor: c.background }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()} accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={26} color={c.title} />
        </Pressable>
        <View style={styles.centered}>
          <Text style={[styles.message, { color: c.message }]}>Loading target...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!target) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: c.background }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()} accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={26} color={c.title} />
        </Pressable>
        <View style={styles.centered}>
          <Text style={[styles.message, { color: c.message }]}>Target not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable style={styles.backButton} onPress={() => router.back()} accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={26} color={c.title} />
        </Pressable>

        <Text style={[styles.title, { color: c.title }]}>Edit Target</Text>
        <Text style={[styles.subtitle, { color: c.subtitle }]}>Update the target settings for this trip.</Text>

        <Text style={[styles.groupLabel, { color: c.label }]}>Target Scope</Text>
        <View style={styles.chipRow}>
          <Chip label="Whole Trip" selected={scope === 'trip'} onPress={() => setScope('trip')} c={c} />
          <Chip label="Specific Category" selected={scope === 'category'} onPress={() => setScope('category')} c={c} />
        </View>

        {scope === 'category' ? (
          <>
            <Text style={[styles.groupLabel, { color: c.label }]}>Category</Text>
            <View style={styles.chipRow}>
              {categoryRows.map((category) => (
                <Chip
                  key={category.id}
                  label={category.name}
                  selected={selectedCategoryId === category.id}
                  onPress={() => setSelectedCategoryId(category.id)}
                  c={c}
                />
              ))}
            </View>
          </>
        ) : null}

        <Text style={[styles.groupLabel, { color: c.label }]}>Period</Text>
        <View style={styles.chipRow}>
          <Chip label="Weekly" selected={period === 'weekly'} onPress={() => setPeriod('weekly')} c={c} />
          <Chip label="Monthly" selected={period === 'monthly'} onPress={() => setPeriod('monthly')} c={c} />
        </View>

        <Text style={[styles.groupLabel, { color: c.label }]}>Goal Type</Text>
        <View style={styles.chipRow}>
          <Chip label="Activities" selected={metricType === 'count'} onPress={() => setMetricType('count')} c={c} />
          <Chip label="Minutes" selected={metricType === 'minutes'} onPress={() => setMetricType('minutes')} c={c} />
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

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  c: typeof lightColors;
};

function Chip({ label, selected, onPress, c }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[
        styles.chip,
        { backgroundColor: selected ? '#E8873A' : c.card, borderColor: selected ? '#E8873A' : c.border },
      ]}
    >
      <Text style={[styles.chipText, { color: selected ? '#FFFFFF' : c.chipText }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    padding: 18,
    paddingBottom: 30,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    padding: 4,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 18,
  },
  groupLabel: {
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
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  buttonGroup: {
    marginTop: 8,
  },
  spacer: {
    height: 10,
  },
});
