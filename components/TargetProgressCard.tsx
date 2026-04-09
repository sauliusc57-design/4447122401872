// components/TargetProgressCard.tsx
import PrimaryButton from '@/components/ui/primary-button';
import { formatMetricValue, TargetProgress } from '@/lib/target-progress';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  item: TargetProgress;
  onEdit: () => void;
  onDelete: () => void;
};

export default function TargetProgressCard({ item, onEdit, onDelete }: Props) {
  const barWidth = `${item.percentage}%`;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerTextBlock}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.meta}>
            {item.categoryName} · {item.target.period} · {item.target.metricType}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            item.status === 'met'
              ? styles.statusMet
              : item.status === 'exceeded'
              ? styles.statusExceeded
              : styles.statusUnmet,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              item.status === 'met'
                ? styles.statusTextMet
                : item.status === 'exceeded'
                ? styles.statusTextExceeded
                : styles.statusTextUnmet,
            ]}
          >
            {item.status === 'met'
              ? 'Met'
              : item.status === 'exceeded'
              ? 'Exceeded'
              : 'Unmet'}
          </Text>
        </View>
      </View>

      <Text style={styles.progressText}>
        {formatMetricValue(item.target.metricType, item.progressValue)} /{' '}
        {formatMetricValue(item.target.metricType, item.expectedTotal)}
      </Text>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: barWidth }]} />
      </View>

      <Text style={styles.subText}>
        Target per {item.target.period === 'weekly' ? 'week' : 'month'}:{' '}
        {formatMetricValue(item.target.metricType, item.target.targetValue)}
      </Text>

      <Text style={styles.subText}>
        Trip covers {item.periodCount}{' '}
        {item.target.period === 'weekly'
          ? item.periodCount === 1
            ? 'week'
            : 'weeks'
          : item.periodCount === 1
          ? 'month'
          : 'months'}
      </Text>

      <Text style={styles.subText}>
        Completed matching activities: {item.matchedActivityCount}
      </Text>

      <Text style={styles.summary}>
        {item.status === 'exceeded'
          ? `Exceeded by ${formatMetricValue(
              item.target.metricType,
              item.exceededBy
            )}`
          : item.status === 'met'
          ? 'Target met exactly'
          : `Remaining ${formatMetricValue(
              item.target.metricType,
              item.remaining
            )}`}
      </Text>

      <View style={styles.buttonRow}>
        <View style={styles.buttonHalf}>
          <PrimaryButton label="Edit Target" onPress={onEdit} variant="secondary" />
        </View>
        <View style={styles.buttonHalf}>
          <PrimaryButton label="Delete Target" onPress={onDelete} variant="danger" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    padding: 14,
  },
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerTextBlock: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '700',
  },
  meta: {
    color: '#475569',
    fontSize: 13,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  progressText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
  },
  progressTrack: {
    backgroundColor: '#E2E8F0',
    borderRadius: 999,
    height: 10,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: '#0F766E',
    borderRadius: 999,
    height: 10,
  },
  subText: {
    color: '#475569',
    fontSize: 13,
    marginTop: 8,
  },
  summary: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusMet: {
    backgroundColor: '#DCFCE7',
  },
  statusExceeded: {
    backgroundColor: '#FEF3C7',
  },
  statusUnmet: {
    backgroundColor: '#E2E8F0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusTextMet: {
    color: '#166534',
  },
  statusTextExceeded: {
    color: '#92400E',
  },
  statusTextUnmet: {
    color: '#334155',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  buttonHalf: {
    flex: 1,
  },
});