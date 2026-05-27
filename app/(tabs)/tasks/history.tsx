import { router } from "expo-router";
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Target,
  XCircle,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useTaskStore } from "@/stores/taskStore";
import { PlannedTask } from "@/types/task";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type HistoryDay = {
  date: Date;
  dayName: string;
  dayNumber: number;
  month: string;
  completion: number;
  isRelapse: boolean;
  tasks: { title: string; completed: boolean; time: string }[];
  focusMinutes: number;
  streakStatus: "maintained" | "broken";
};

const localDayKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getMondayOfWeek = (date: Date): Date => {
  const dayOfWeek = date.getDay();
  const mondayDate = new Date(date);
  const daysDiff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  mondayDate.setDate(date.getDate() - daysDiff);
  return mondayDate;
};

const buildHistoryDays = (
  tasks: PlannedTask[],
  weekStartDate: Date,
): HistoryDay[] => {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStartDate);
    date.setDate(weekStartDate.getDate() + index);
    const dateKey = localDayKey(date);
    const dayTasks = tasks
      .filter((task) => task.date === dateKey)
      .sort((a, b) => a.time.localeCompare(b.time));
    const totalTasks = dayTasks.length;
    const completedTasks = dayTasks.filter((task) => task.completed).length;
    const completion =
      totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
    const isRelapse = totalTasks > 0 && completion < 60;
    const focusMinutes = completedTasks * 30;
    const streakStatus =
      totalTasks > 0 && completion >= 70 ? "maintained" : "broken";

    return {
      date,
      dayName: weekDays[index],
      dayNumber: date.getDate(),
      month: date.toLocaleString("default", { month: "short" }),
      completion,
      isRelapse,
      tasks: dayTasks.map((task) => ({
        title: task.title,
        completed: task.completed,
        time: task.time,
      })),
      focusMinutes,
      streakStatus,
    };
  });
};

const computeWeeklyStats = (days: HistoryDay[]) => {
  const avgCompletion =
    days.length === 0
      ? 0
      : Math.round(
          days.reduce((sum, day) => sum + day.completion, 0) / days.length,
        );
  const totalFocusMinutes = days.reduce(
    (sum, day) => sum + day.focusMinutes,
    0,
  );
  const tasksCompleted = days.reduce(
    (sum, day) => sum + day.tasks.filter((task) => task.completed).length,
    0,
  );
  const relapses = days.reduce((sum, day) => sum + (day.isRelapse ? 1 : 0), 0);

  let streakDays = 0;
  for (let idx = days.length - 1; idx >= 0; idx -= 1) {
    const day = days[idx];
    if (day.tasks.length > 0 && day.completion >= 70) {
      streakDays += 1;
    } else {
      break;
    }
  }

  return {
    avgCompletion,
    totalFocusHours: Math.round(totalFocusMinutes / 60),
    tasksCompleted,
    relapses,
    streakDays,
  };
};

export default function HistoryTasksScreen() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDayIndex, setSelectedDayIndex] = useState(6);
  const tasks = useTaskStore((s) => s.tasks);

  const weekStartDate = useMemo(() => {
    const today = new Date();
    const monday = getMondayOfWeek(today);
    monday.setDate(monday.getDate() - weekOffset * 7);
    return monday;
  }, [weekOffset]);

  const days = useMemo(
    () => buildHistoryDays(tasks, weekStartDate),
    [tasks, weekStartDate],
  );
  const selectedDay = days[selectedDayIndex] ?? days[days.length - 1];
  const weeklyStats = useMemo(() => computeWeeklyStats(days), [days]);

  const navigateWeek = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setWeekOffset((current) => current + 1);
    } else if (direction === "next") {
      setWeekOffset((current) => Math.max(0, current - 1));
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <View style={styles.headerTop}>
            <Pressable
              style={styles.backButton}
              onPress={() => router.push("/tasks")}
            >
              <ChevronLeft size={24} color="white" />
            </Pressable>
            <View style={styles.headerText}>
              <Text style={styles.title}>History</Text>
              <Text style={styles.subtitle}>Track your progress</Text>
            </View>
            <Calendar size={24} color="#9ca3af" />
          </View>
        </View>

        <View style={styles.weekNavigator}>
          <Pressable
            style={styles.navButton}
            onPress={() => navigateWeek("prev")}
          >
            <ChevronLeft size={18} color="white" />
          </Pressable>

          <Text style={styles.weekLabel}>
            {days[0].month} {days[0].dayNumber} - {days[6].month}{" "}
            {days[6].dayNumber}
          </Text>

          <Pressable
            style={[
              styles.navButton,
              weekOffset === 0 && styles.disabledButton,
            ]}
            onPress={() => navigateWeek("next")}
            disabled={weekOffset === 0}
          >
            <ChevronRight size={18} color="white" />
          </Pressable>
        </View>

        <View style={styles.selectorContainer}>
          {days.map((day, index) => (
            <Pressable
              key={localDayKey(day.date)}
              style={[
                styles.dayButton,
                index === selectedDayIndex && styles.dayButtonActive,
                index !== selectedDayIndex &&
                  day.isRelapse &&
                  styles.dayButtonRelapse,
              ]}
              onPress={() => setSelectedDayIndex(index)}
            >
              <Text style={styles.dayLabel}>{day.dayName}</Text>
              <Text style={styles.dayNumber}>{day.dayNumber}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>
                {selectedDay.month} {selectedDay.dayNumber}
              </Text>
              <Text style={styles.cardSubtitle}>
                {selectedDay.tasks.length === 0
                  ? "No tasks recorded"
                  : selectedDay.isRelapse
                    ? "Difficult day"
                    : "Productive day"}
              </Text>
            </View>
            <View
              style={[
                styles.completionCircle,
                selectedDay.isRelapse
                  ? styles.relapseBorder
                  : styles.successBorder,
              ]}
            >
              <Text
                style={[
                  styles.completionText,
                  selectedDay.isRelapse
                    ? styles.relapseText
                    : styles.successText,
                ]}
              >
                {selectedDay.completion}%
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Task Timeline</Text>
          <View style={styles.timelineList}>
            {selectedDay.tasks.length === 0 ? (
              <Text style={styles.emptyText}>
                No tasks were scheduled for this day.
              </Text>
            ) : (
              selectedDay.tasks.map((task, index) => (
                <View key={`${task.title}-${index}`} style={styles.taskRow}>
                  <View
                    style={[
                      styles.taskIndicator,
                      task.completed
                        ? styles.taskIndicatorSuccess
                        : styles.taskIndicatorFailed,
                    ]}
                  >
                    {task.completed ? (
                      <CheckCircle2 size={16} color="#22c55e" />
                    ) : (
                      <XCircle size={16} color="#f87171" />
                    )}
                  </View>
                  <View style={styles.taskTextWrapper}>
                    <Text
                      style={[
                        styles.taskTitle,
                        !task.completed && styles.taskTitleInactive,
                      ]}
                    >
                      {task.title}
                    </Text>
                  </View>
                  <Text style={styles.taskTime}>{task.time}</Text>
                </View>
              ))
            )}
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statRow}>
              <Clock size={16} color="#60a5fa" />
              <Text style={styles.statLabel}>Focus Time</Text>
            </View>
            <Text style={styles.statValue}>
              {Math.floor(selectedDay.focusMinutes / 60)}h{" "}
              {selectedDay.focusMinutes % 60}m
            </Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statRow}>
              <Target size={16} color="#34d399" />
              <Text style={styles.statLabel}>Streak</Text>
            </View>
            <Text
              style={[
                styles.statValue,
                selectedDay.streakStatus === "maintained"
                  ? styles.successText
                  : styles.relapseText,
              ]}
            >
              {selectedDay.streakStatus === "maintained"
                ? "Maintained"
                : "Broken"}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.reportHeader}>
            <Text style={styles.sectionTitle}>Weekly Report</Text>
            <Text style={styles.reportLabel}>This Week</Text>
          </View>
          <View style={styles.reportGrid}>
            <View style={styles.reportItem}>
              <Text style={styles.reportValue}>
                {weeklyStats.avgCompletion}%
              </Text>
              <Text style={styles.reportText}>Avg Completion</Text>
            </View>
            <View style={styles.reportItem}>
              <Text style={styles.reportValue}>
                {weeklyStats.totalFocusHours}h
              </Text>
              <Text style={styles.reportText}>Focus Time</Text>
            </View>
            <View style={styles.reportItem}>
              <Text style={styles.reportValue}>
                {weeklyStats.tasksCompleted}
              </Text>
              <Text style={styles.reportText}>Tasks Done</Text>
            </View>
          </View>

          <View style={styles.chartRow}>
            {days.map((day) => (
              <View key={localDayKey(day.date)} style={styles.chartBarWrapper}>
                <View
                  style={[
                    styles.chartBar,
                    {
                      height: Math.max(8, (day.completion / 100) * 96),
                      backgroundColor: day.isRelapse ? "#f87171" : "#2563eb",
                    },
                  ]}
                />
                <Text style={styles.chartLabel}>{day.dayName[0]}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.buttonWrapper}>
          <Pressable style={styles.reportButton}>
            <FileText size={18} color="white" />
            <Text style={styles.reportButtonText}>Generate Overall Report</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#09090f",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
  },
  contentContainer: {
    paddingBottom: 160,
  },
  headerContainer: {
    marginBottom: 16,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: "#09090f",
    zIndex: 10,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: "white",
    fontSize: 26,
    fontWeight: "800",
  },
  subtitle: {
    color: "#9ca3af",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  weekNavigator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
    paddingHorizontal: 6,
  },
  weekLabel: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },
  navButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    opacity: 0.3,
  },
  selectorContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
    gap: 6,
  },
  dayButton: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 18,
    backgroundColor: "#111827",
  },
  dayButtonActive: {
    backgroundColor: "#2563eb",
  },
  dayButtonRelapse: {
    backgroundColor: "rgba(248,113,113,0.18)",
  },
  dayLabel: {
    color: "#9ca3af",
    fontSize: 11,
    fontWeight: "700",
  },
  dayNumber: {
    color: "white",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.12)",
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "800",
  },
  cardSubtitle: {
    color: "#9ca3af",
    fontSize: 13,
    marginTop: 6,
  },
  completionCircle: {
    width: 72,
    height: 72,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  completionText: {
    fontSize: 20,
    fontWeight: "800",
  },
  successBorder: {
    borderColor: "#22c55e",
    borderWidth: 4,
  },
  relapseBorder: {
    borderColor: "#f87171",
    borderWidth: 4,
  },
  successText: {
    color: "#22c55e",
  },
  relapseText: {
    color: "#f87171",
  },
  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 16,
  },
  timelineList: {
    gap: 14,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  taskIndicator: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  taskIndicatorSuccess: {
    backgroundColor: "rgba(34,197,94,0.15)",
  },
  taskIndicatorFailed: {
    backgroundColor: "rgba(248,113,113,0.15)",
  },
  taskTextWrapper: {
    flex: 1,
  },
  taskTitle: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
  },
  taskTitleInactive: {
    color: "#6b7280",
    textDecorationLine: "line-through",
  },
  taskTime: {
    color: "#9ca3af",
    fontSize: 12,
  },
  emptyText: {
    color: "#9ca3af",
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.12)",
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  statLabel: {
    color: "#9ca3af",
    fontSize: 12,
  },
  statValue: {
    color: "white",
    fontSize: 18,
    fontWeight: "800",
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  reportLabel: {
    color: "#9ca3af",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  reportGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  reportItem: {
    flex: 1,
    alignItems: "center",
  },
  reportValue: {
    color: "white",
    fontSize: 20,
    fontWeight: "800",
  },
  reportText: {
    color: "#9ca3af",
    fontSize: 11,
    marginTop: 6,
  },
  chartRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 110,
    marginTop: 18,
    gap: 6,
  },
  chartBarWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
  },
  chartBar: {
    width: "100%",
    borderRadius: 12,
  },
  chartLabel: {
    color: "#9ca3af",
    fontSize: 10,
  },
  buttonWrapper: {
    marginTop: 8,
  },
  reportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#2563eb",
    borderRadius: 20,
    paddingVertical: 16,
  },
  reportButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "800",
  },
});
