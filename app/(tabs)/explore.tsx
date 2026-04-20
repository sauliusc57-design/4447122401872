import PrimaryButton from '@/components/ui/primary-button';
import { db } from '@/db/client';
import { activities, categories, trips } from '@/db/schema';
import { useFocusEffect } from '@react-navigation/native';
import { eq } from 'drizzle-orm';
import { useCallback, useContext, useMemo, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../_layout';

type Activity = typeof activities.$inferSelect;
type Category = typeof categories.$inferSelect;
type Trip = typeof trips.$inferSelect;
type Period = 'daily' | 'weekly' | 'monthly';

const screenWidth = Dimensions.get('window').width;
const chartWidth = screenWidth - 36;

function getWeekKey(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear =
    (date.getTime() - firstDayOfYear.getTime()) / 86400000 + firstDayOfYear.getDay() + 1;
  const weekNumber = Math.ceil(pastDaysOfYear / 7);

  return `${date.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
}

function getMonthKey(dateString: string) {
  return dateString.slice(0, 7);
}

function formatPeriodLabel(key: string, period: Period) {
  if (period === 'daily') return key.slice(5);
  if (period === 'weekly') return key.replace('2026-', '');
  return key;
}

export default function InsightsScreen() {
  const auth = useContext(AuthContext);

  const [activityRows, setActivityRows] = useState<Activity[]>([]);
  const [categoryRows, setCategoryRows] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('daily');

  if (!auth?.currentUser) return null;

  const { currentUser } = auth;

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadInsightsData = async () => {
        setLoading(true);

        const [userTrips, allActivities, userCategories] = await Promise.all([
          db.select().from(trips).where(eq(trips.userId, currentUser.id)),
          db.select().from(activities),
          db.select().from(categories).where(eq(categories.userId, currentUser.id)),
        ]);

        const tripIds = userTrips.map((trip: Trip) => trip.id);

        const filteredActivities = allActivities.filter((activity) =>
          tripIds.includes(activity.tripId)
        );

        if (active) {
          setActivityRows(filteredActivities);
          setCategoryRows(userCategories);
          setLoading(false);
        }
      };

      loadInsightsData();

      return () => {
        active = false;
      };
    }, [currentUser.id])
  );

  const activitiesOverTime = useMemo(() => {
    const grouped = activityRows.reduce<Record<string, number>>((acc, activity) => {
      const key =
        selectedPeriod === 'daily'
          ? activity.activityDate
          : selectedPeriod === 'weekly'
            ? getWeekKey(activity.activityDate)
            : getMonthKey(activity.activityDate);

      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    const sortedKeys = Object.keys(grouped).sort();

    return {
      labels: sortedKeys.map((key) => formatPeriodLabel(key, selectedPeriod)),
      values: sortedKeys.map((key) => grouped[key]),
    };
  }, [activityRows, selectedPeriod]);

  const categoryCountData = useMemo(() => {
    const grouped = activityRows.reduce<Record<number, number>>((acc, activity) => {
      acc[activity.categoryId] = (acc[activity.categoryId] ?? 0) + 1;
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([categoryId, count], index) => {
        const category = categoryRows.find((item) => item.id === Number(categoryId));

        return {
          name: category?.name ?? 'Unknown',
          count,
          color: category?.color ?? ['#0F172A', '#334155', '#64748B', '#94A3B8'][index % 4],
          legendFontColor: '#334155',
          legendFontSize: 13,
        };
      })
      .filter((item) => item.count > 0);
  }, [activityRows, categoryRows]);

  const minutesByCategory = useMemo(() => {
    const grouped = activityRows.reduce<Record<number, number>>((acc, activity) => {
      if (activity.metricType !== 'minutes') return acc;

      acc[activity.categoryId] = (acc[activity.categoryId] ?? 0) + activity.metricValue;
      return acc;
    }, {});

    const entries = Object.entries(grouped)
      .map(([categoryId, totalMinutes]) => {
        const category = categoryRows.find((item) => item.id === Number(categoryId));

        return {
          label: category?.name ?? 'Unknown',
          minutes: totalMinutes,
        };
      })
      .filter((item) => item.minutes > 0);

    return {
      labels: entries.map((item) => item.label),
      values: entries.map((item) => item.minutes),
    };
  }, [activityRows, categoryRows]);

  const totalActivities = activityRows.length;
  const totalMinutes = activityRows.reduce((sum, activity) => {
    return activity.metricType === 'minutes' ? sum + activity.metricValue : sum;
  }, 0);

  const topCategory = categoryCountData.reduce(
    (best, current) => (current.count > best.count ? current : best),
    { name: 'None', count: 0 }
  );

  const chartConfig = {
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    color: (opacity = 1) => `rgba(15, 23, 42, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(71, 85, 105, ${opacity})`,
    decimalPlaces: 0,
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: '#0F172A',
    },
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Insights</Text>
        <Text style={styles.subtitle}>Daily, weekly and monthly activity summaries</Text>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total activities</Text>
            <Text style={styles.summaryValue}>{totalActivities}</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total minutes</Text>
            <Text style={styles.summaryValue}>{totalMinutes}</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Top category</Text>
            <Text style={styles.summaryValueSmall}>{topCategory.name}</Text>
          </View>
        </View>

        <View style={styles.toggleRow}>
          <PrimaryButton
            label="Daily"
            variant={selectedPeriod === 'daily' ? 'primary' : 'secondary'}
            onPress={() => setSelectedPeriod('daily')}
          />
          <PrimaryButton
            label="Weekly"
            variant={selectedPeriod === 'weekly' ? 'primary' : 'secondary'}
            onPress={() => setSelectedPeriod('weekly')}
          />
          <PrimaryButton
            label="Monthly"
            variant={selectedPeriod === 'monthly' ? 'primary' : 'secondary'}
            onPress={() => setSelectedPeriod('monthly')}
          />
        </View>

        {loading ? (
          <Text style={styles.message}>Loading insights...</Text>
        ) : activityRows.length === 0 ? (
          <Text style={styles.message}>No activity data available yet.</Text>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Activities over time</Text>
              <Text style={styles.sectionSubtitle}>Number of activities in the selected period</Text>

              <LineChart
                data={{
                  labels: activitiesOverTime.labels.length ? activitiesOverTime.labels : ['No data'],
                  datasets: [{ data: activitiesOverTime.values.length ? activitiesOverTime.values : [0] }],
                }}
                width={chartWidth}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                fromZero
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Activities by category</Text>
              <Text style={styles.sectionSubtitle}>Distribution of all saved activities</Text>

              <PieChart
                data={
                  categoryCountData.length
                    ? categoryCountData.map((item) => ({
                        name: item.name,
                        count: item.count,
                        color: item.color,
                        legendFontColor: item.legendFontColor,
                        legendFontSize: item.legendFontSize,
                      }))
                    : [
                        {
                          name: 'No data',
                          count: 1,
                          color: '#CBD5E1',
                          legendFontColor: '#334155',
                          legendFontSize: 13,
                        },
                      ]
                }
                width={chartWidth}
                height={220}
                chartConfig={chartConfig}
                accessor="count"
                backgroundColor="transparent"
                paddingLeft="8"
                absolute
                style={styles.chart}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Minutes by category</Text>
              <Text style={styles.sectionSubtitle}>Total time spent by category</Text>

              <BarChart
                data={{
                  labels: minutesByCategory.labels.length ? minutesByCategory.labels : ['No data'],
                  datasets: [{ data: minutesByCategory.values.length ? minutesByCategory.values : [0] }],
                }}
                width={chartWidth}
                height={240}
                chartConfig={chartConfig}
                style={styles.chart}
                fromZero
                yAxisLabel=""
                yAxisSuffix=""
              />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 18,
    paddingBottom: 28,
  },
  title: {
    color: '#0F172A',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: '#475569',
    fontSize: 15,
    marginBottom: 16,
  },
  summaryGrid: {
    gap: 10,
    marginBottom: 14,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  summaryLabel: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  summaryValue: {
    color: '#0F172A',
    fontSize: 28,
    fontWeight: '700',
  },
  summaryValueSmall: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '700',
  },
  toggleRow: {
    gap: 8,
    marginBottom: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    paddingVertical: 14,
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 14,
  },
  sectionSubtitle: {
    color: '#64748B',
    fontSize: 13,
    paddingHorizontal: 14,
    marginTop: 4,
    marginBottom: 10,
  },
  chart: {
    borderRadius: 12,
    marginLeft: -6,
  },
  message: {
    color: '#475569',
    fontSize: 16,
    paddingTop: 16,
    textAlign: 'center',
  },
});