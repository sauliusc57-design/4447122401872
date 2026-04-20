import CategoryFormModal, { PRESET_ICONS } from '@/components/ui/category-form-modal';
import PrimaryButton from '@/components/ui/primary-button';
import { db } from '@/db/client';
import { activities, categories, trips } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../_layout';

type Category = typeof categories.$inferSelect;

const ICON_MAP: Record<string, string> = Object.fromEntries(
  PRESET_ICONS.map(({ value, label }) => [value, label])
);

export default function ManageCategoriesScreen() {
  const router = useRouter();
  const auth = useContext(AuthContext);
  const currentUser = auth?.currentUser ?? null;

  const [rows, setRows] = useState<Category[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const load = async () => {
    if (!currentUser) return;
    const data = await db
      .select()
      .from(categories)
      .where(eq(categories.userId, currentUser.id));
    setRows(data);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null);
    setModalVisible(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setModalVisible(true);
  };

  const handleSave = async (name: string, color: string, icon: string) => {
    if (!currentUser) return;

    if (editing) {
      await db
        .update(categories)
        .set({ name, color, icon })
        .where(eq(categories.id, editing.id));
    } else {
      await db.insert(categories).values({
        userId: currentUser.id,
        name,
        color,
        icon,
      });
    }

    setModalVisible(false);
    setEditing(null);
    load();
  };

  const handleDelete = async (cat: Category) => {
    const [tripUsage, activityUsage] = await Promise.all([
      db.select().from(trips).where(eq(trips.categoryId, cat.id)),
      db.select().from(activities).where(eq(activities.categoryId, cat.id)),
    ]);

    const tripCount = tripUsage.length;
    const activityCount = activityUsage.length;

    if (tripCount > 0 || activityCount > 0) {
      const parts: string[] = [];
      if (tripCount > 0) parts.push(`${tripCount} trip${tripCount > 1 ? 's' : ''}`);
      if (activityCount > 0) parts.push(`${activityCount} activit${activityCount > 1 ? 'ies' : 'y'}`);
      Alert.alert(
        'Category in use',
        `"${cat.name}" is used by ${parts.join(' and ')}. Remove those references before deleting.`
      );
      return;
    }

    Alert.alert('Delete Category', `Delete "${cat.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await db.delete(categories).where(eq(categories.id, cat.id));
          load();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Categories</Text>
          <Text style={styles.subtitle}>Manage your activity categories.</Text>
        </View>
        <PrimaryButton label="+ Add" onPress={openAdd} compact />
      </View>

      {rows.length === 0 ? (
        <Text style={styles.empty}>No categories yet. Tap + Add to create one.</Text>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={[styles.dot, { backgroundColor: item.color }]} />
              <Text style={styles.iconEmoji}>{ICON_MAP[item.icon] ?? '📌'}</Text>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <View style={styles.actions}>
                <PrimaryButton
                  label="Edit"
                  compact
                  variant="secondary"
                  onPress={() => openEdit(item)}
                />
                <View style={styles.actionGap} />
                <PrimaryButton
                  label="Delete"
                  compact
                  variant="danger"
                  onPress={() => handleDelete(item)}
                />
              </View>
            </View>
          )}
        />
      )}

      <View style={styles.backWrapper}>
        <PrimaryButton label="Back" variant="secondary" onPress={() => router.back()} />
      </View>

      <CategoryFormModal
        visible={modalVisible}
        initialName={editing?.name ?? ''}
        initialColor={editing?.color ?? '#4F46E5'}
        initialIcon={editing?.icon ?? 'map'}
        onSave={handleSave}
        onCancel={() => { setModalVisible(false); setEditing(null); }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 14,
    color: '#475569',
    marginTop: 2,
  },
  list: {
    paddingHorizontal: 18,
    paddingBottom: 12,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
    flexShrink: 0,
  },
  iconEmoji: {
    fontSize: 18,
    marginRight: 10,
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionGap: {
    width: 8,
  },
  empty: {
    color: '#64748B',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 40,
    paddingHorizontal: 18,
  },
  backWrapper: {
    padding: 18,
    paddingTop: 8,
  },
});
