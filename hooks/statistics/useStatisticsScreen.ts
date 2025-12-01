import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addDays,
  endOfWeek,
  format,
  isToday,
  startOfWeek,
  subDays,
} from "date-fns";
import { de } from "date-fns/locale";
import {
  DailyStatisticsDTO,
  getDailyStatistics,
} from "@/services/statistics";
import { useAuth } from "@/contexts/AuthContext";

export type WeekDirection = "prev" | "next";

export interface WeekRange {
  start: Date;
  end: Date;
}

const getFocusTotalInRange = (
  statistics: DailyStatisticsDTO[],
  range: WeekRange,
) =>
  statistics
    .filter((stat) => {
      const statDate = new Date(stat.date);
      return statDate >= range.start && statDate <= range.end;
    })
    .reduce((sum, stat) => sum + stat.totalFocusTime, 0);

export const useStatisticsScreen = () => {
  const { isAuthenticated } = useAuth();
  const [statistics, setStatistics] = useState<DailyStatisticsDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchStatistics = useCallback(async () => {
    if (!isAuthenticated) {
      setStatistics([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getDailyStatistics();
      setStatistics(data);
    } catch (error) {
      console.error("Failed to fetch statistics:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics, isAuthenticated]);

  const navigateWeek = useCallback((direction: WeekDirection) => {
    setSelectedDate((previous) =>
      direction === "prev" ? subDays(previous, 7) : addDays(previous, 7),
    );
  }, []);

  const weekRange = useMemo<WeekRange>(
    () => ({
      start: startOfWeek(selectedDate, { weekStartsOn: 1 }),
      end: endOfWeek(selectedDate, { weekStartsOn: 1 }),
    }),
    [selectedDate],
  );

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, index) =>
      addDays(weekRange.start, index),
    );
    const totalsByDay = new Map(
      statistics.map((stat) => [
        format(new Date(stat.date), "yyyy-MM-dd"),
        stat.totalFocusTime,
      ]),
    );

    return {
      labels: last7Days.map((date) =>
        format(date, "dd.MM", { locale: de }),
      ),
      datasets: [
        {
          data: last7Days.map((date) => {
            const key = format(date, "yyyy-MM-dd");
            return (totalsByDay.get(key) || 0) / 60;
          }),
        },
      ],
    };
  }, [statistics, weekRange.start]);

  const todayFocusTime = useMemo(
    () =>
      statistics
        .filter((stat) => isToday(new Date(stat.date)))
        .reduce((sum, stat) => sum + stat.totalFocusTime, 0),
    [statistics],
  );

  const currentWeekRange = useMemo<WeekRange>(
    () => ({
      start: startOfWeek(new Date(), { weekStartsOn: 1 }),
      end: endOfWeek(new Date(), { weekStartsOn: 1 }),
    }),
    [],
  );

  const currentWeekFocusTime = useMemo(
    () => getFocusTotalInRange(statistics, currentWeekRange),
    [statistics, currentWeekRange],
  );

  const selectedWeekFocusTime = useMemo(
    () => getFocusTotalInRange(statistics, weekRange),
    [statistics, weekRange],
  );

  const longestFocusSession = useMemo(() => {
    const focusTimes = statistics
      .filter((stat) => {
        const statDate = new Date(stat.date);
        return statDate >= weekRange.start && statDate <= weekRange.end;
      })
      .map((stat) => stat.totalFocusTime);
    return focusTimes.length > 0 ? Math.max(...focusTimes) : 0;
  }, [statistics, weekRange.end, weekRange.start]);

  const daysWithFocus = useMemo(() => {
    const focusDays = new Set(
      statistics
        .filter((stat) => {
          const statDate = new Date(stat.date);
          return (
            statDate >= weekRange.start &&
            statDate <= weekRange.end &&
            stat.totalFocusTime > 0
          );
        })
        .map((stat) => format(new Date(stat.date), "yyyy-MM-dd")),
    );

    return focusDays.size;
  }, [statistics, weekRange.end, weekRange.start]);

  return {
    loading,
    chartData,
    navigateWeek,
    weekRange,
    todayFocusTime,
    currentWeekFocusTime,
    selectedWeekFocusTime,
    longestFocusSession,
    daysWithFocus,
  };
};
