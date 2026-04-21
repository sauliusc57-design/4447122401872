// Card component showing a single target's progress with a progress bar, status badge (Met/Exceeded/Unmet), and edit/delete buttons.
import { ThemeContext } from '@/app/_layout';
import PrimaryButton from '@/components/ui/primary-button';
import { formatMetricValue, TargetProgress } from '@/lib/target-progress';
import { useContext } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  item: TargetProgress;
  onEdit: () => void;
  onDelete: () => void;
};

const lightColors = {
  card: '#FFFAF4',
  border: '#E8D5B7',
  title: '#2C1F0E',
  meta: '#5C4A2E',
  progressText: '#2C1F0E',
  progressTrack: '#E8D5B7',
  subText: '#5C4A2E',
  summary: '#2C1F0E',
  statusUnmet: '#E8D5B7',
  statusUnmetText: '#5C4A2E',
};

const darkColors = {
  card: '#251E14',
  border: '#3D3020',
  title: '#F5ECD8',
  meta: '#D4C4A8',
  progressText: '#F5ECD8',
  progressTrack: '#3D3020',
  subText: '#D4C4A8',
  summary: '#F5ECD8',
  statusUnmet: '#3D3020',
  statusUnmetText: '#D4C4A8',
};

export default function TargetProgressCard({ item, onEdit, onDelete }: Props) {
  const themeCtx = useContext(ThemeContext);
  const isDark = themeCtx?.isDark ?? false;
  const c = isDark ? darkColors : lightColors;

  const barWidth = `${item.percentage}%`;

  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
      <View style={styles.headerRow}>
        <View style={styles.headerTextBlock}>
          <Text style={[styles.title, { color: c.title }]}>{item.title}</Text>
          <Text style={[styles.meta, { color: c.meta }]}>
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
              : { backgroundColor: c.statusUnmet },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              item.status === 'met'
                ? styles.statusTextMet
                : item.status === 'exceeded'
                ? styles.statusTextExceeded
                : { color: c.statusUnmetText },
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

      <Text style={[styles.progressText, { color: c.progressText }]}>
        {formatMetricValue(item.target.metricType, item.progressValue)} /{' '}
        {formatMetricValue(item.target.metricType, item.expectedTotal)}
      </Text>

      <View style={[styles.progressTrack, { backgroundColor: c.progressTrack }]}>
        <View style={[styles.progressFill, { width: barWidth }]} />
      </View>

      <Text style={[styles.subText, { color: c.subText }]}>
        Target per {item.target.period === 'weekly' ? 'week' : 'month'}:{' '}
        {formatMetricValue(item.target.metricType, item.target.targetValue)}
      </Text>

      <Text style={[styles.subText, { color: c.subText }]}>
        Trip covers {item.periodCount}{' '}
        {item.target.period === 'weekly'
          ? item.periodCount === 1
            ? 'week'
            : 'weeks'
          : item.periodCount === 1
          ? 'month'
          : 'months'}
      </Text>

      <Text style={[styles.subText, { color: c.subText }]}>
        Completed matching activities: {item.matchedActivityCount}
      </Text>

      <Text style={[styles.summary, { color: c.summary }]}>
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
    color: '#2C1F0E',
    fontSize: 17,
    fontWeight: '700',
  },
  meta: {
    color: '#5C4A2E',
    fontSize: 13,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  progressText: {
    color: '#2C1F0E',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
  },
  progressTrack: {
    backgroundColor: '#E8D5B7',
    borderRadius: 999,
    height: 10,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: '#E8873A',
    borderRadius: 999,
    height: 10,
  },
  subText: {
    color: '#5C4A2E',
    fontSize: 13,
    marginTop: 8,
  },
  summary: {
    color: '#2C1F0E',
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
    backgroundColor: '#E8D5B7',
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
    color: '#5C4A2E',
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