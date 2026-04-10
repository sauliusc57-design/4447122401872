import { activities, categories, targets, trips } from '@/db/schema';

export type ActivityRow = typeof activities.$inferSelect;
export type CategoryRow = typeof categories.$inferSelect;
export type TargetRow = typeof targets.$inferSelect;
export type TripRow = typeof trips.$inferSelect;

export type TargetProgress = {
  target: TargetRow;
  title: string;
  categoryName: string;
  progressValue: number;
  expectedTotal: number;
  remaining: number;
  exceededBy: number;
  percentage: number;
  status: 'unmet' | 'met' | 'exceeded';
  periodCount: number;
  matchedActivityCount: number;
};

function startOfDay(dateString: string) {
  return new Date(`${dateString}T00:00:00`);
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getWeekStartKey(dateString: string) {
  const date = startOfDay(dateString);
  const day = date.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = addDays(date, diffToMonday);
  return formatDateKey(monday);
}

function getMonthKey(dateString: string) {
  return dateString.slice(0, 7);
}

function getCoveredPeriodCount(startDate: string, endDate: string, period: string) {
  const keys = new Set<string>();
  let cursor = startOfDay(startDate);
  const end = startOfDay(endDate);

  while (cursor <= end) {
    const key =
      period === 'monthly'
        ? getMonthKey(formatDateKey(cursor))
        : getWeekStartKey(formatDateKey(cursor));

    keys.add(key);
    cursor = addDays(cursor, 1);
  }

  return Math.max(keys.size, 1);
}

function getMetricUnit(metricType: string, value: number) {
  if (metricType === 'minutes') {
    return value === 1 ? 'minute' : 'minutes';
  }

  return value === 1 ? 'activity' : 'activities';
}

export function formatMetricValue(metricType: string, value: number) {
  return `${value} ${getMetricUnit(metricType, value)}`;
}

export function calculateTargetProgress(params: {
  trip: TripRow;
  target: TargetRow;
  activities: ActivityRow[];
  categories: CategoryRow[];
}): TargetProgress {
  const { trip, target, activities, categories } = params;

  const matchingActivities = activities.filter((activity) => {
    const sameTrip = activity.tripId === trip.id;
    const completedOnly = activity.status === 'completed';
    const sameCategory =
      target.categoryId == null || activity.categoryId === target.categoryId;

    if (target.metricType === 'minutes') {
      return sameTrip && completedOnly && sameCategory && activity.metricType === 'minutes';
    }

    return sameTrip && completedOnly && sameCategory;
  });

  const progressValue =
    target.metricType === 'minutes'
      ? matchingActivities.reduce((sum, activity) => sum + activity.metricValue, 0)
      : matchingActivities.length;

  const periodCount = getCoveredPeriodCount(trip.startDate, trip.endDate, target.period);
  const expectedTotal = target.targetValue * periodCount;
  const remaining = Math.max(expectedTotal - progressValue, 0);
  const exceededBy = Math.max(progressValue - expectedTotal, 0);

  const status: 'unmet' | 'met' | 'exceeded' =
    progressValue > expectedTotal
      ? 'exceeded'
      : progressValue === expectedTotal
        ? 'met'
        : 'unmet';

  const percentage =
    expectedTotal === 0 ? 0 : Math.min((progressValue / expectedTotal) * 100, 100);

  const categoryName =
    target.categoryId == null
      ? 'All categories'
      : categories.find((category) => category.id === target.categoryId)?.name ??
        'Unknown category';

  const metricLabel = target.metricType === 'minutes' ? 'minutes' : 'activities';

  const title =
    target.categoryId == null
      ? `Complete ${target.targetValue} ${metricLabel} per ${target.period === 'weekly' ? 'week' : 'month'}`
      : `Complete ${target.targetValue} ${categoryName.toLowerCase()} ${metricLabel} per ${target.period === 'weekly' ? 'week' : 'month'}`;

  return {
    target,
    title,
    categoryName,
    progressValue,
    expectedTotal,
    remaining,
    exceededBy,
    percentage,
    status,
    periodCount,
    matchedActivityCount: matchingActivities.length,
  };
}