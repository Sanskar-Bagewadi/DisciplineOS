//import { ThemedText } from "@/components/themed-text";
//import { ThemedView } from "@/components/themed-view";
import { saveDisciplineScore } from "@/storage/storage";
import { useDisciplineScoreStore } from "@/stores/disciplineScoreStore";
import { Discipline_Socre } from "@/types/discipline_score";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  CalendarPlus,
  ChevronRight,
  History,
  ListChecks,
} from "lucide-react-native";
import type { ComponentType } from "react";
import { useEffect } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTaskStore } from "../../../stores/taskStore";

type TaskCardRoute = "/tasks/history" | "/tasks/today" | "/tasks/tomorrow";

type TaskCard = {
  id: string;
  title: string;
  description: string;
  icon: ComponentType<{ size: number; color: string }>;
  route: TaskCardRoute;
  gradientColors: [string, string];
};

const cards: TaskCard[] = [
  {
    id: "1",
    title: "Check History",
    description: "Review your past activities and progress.",
    icon: History,
    route: "/tasks/history",
    gradientColors: ["#dc2626", "#f97316"],
  },
  {
    id: "2",
    title: "Todo List For Today",
    description: "Focus on what matters most right now",
    icon: ListChecks,
    route: "/tasks/today",
    gradientColors: ["#f97316", "#f59e0b"],
  },
  {
    id: "3",
    title: "Plan Tomorrow",
    description: "Set yourself up for success before the day begins",
    icon: CalendarPlus,
    route: "/tasks/tomorrow",
    gradientColors: ["#b91c1c", "#ef4444"],
  },
];

const todayDate = new Date();
const todayString =
  todayDate.getFullYear() +
  "-" +
  String(todayDate.getMonth() + 1).padStart(2, "0") +
  "-" +
  String(todayDate.getDate()).padStart(2, "0");

function normalizeScore(score: Discipline_Socre): Discipline_Socre {
  return {
    score: Number(score?.score) || 0,
    change: Number(score?.change) || 0,
    LastUpdated: score?.LastUpdated || todayString,
  };
}

export default function TasksScreen() {
  const tasks = useTaskStore((s) => s.tasks);
  const disciplineScore = normalizeScore(
    useDisciplineScoreStore((s) => s.disciplineScore),
  );
  const setDisciplineScore = useDisciplineScoreStore(
    (s) => s.setDisciplineScore,
  );

  useEffect(() => {
    if (!disciplineScore) {
      return;
    }

    const storedScore = normalizeScore(disciplineScore);
    setDisciplineScore(storedScore);
    saveDisciplineScore(storedScore);
  }, []);

  const completedTasks = tasks.filter((task) => task.completed).length;
  const incompleteTasks = tasks.length - completedTasks;
  const completionRate =
    tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  const scoreChangeColor =
    disciplineScore?.change === 1
      ? "#22C55E"
      : disciplineScore?.change === -1
        ? "#F43F5E"
        : "#94A3B8";

  const scoreChangeLabel = disciplineScore
    ? disciplineScore.change === 1
      ? "+1"
      : disciplineScore.change === -1
        ? "-1"
        : "+0.5"
    : "";

  useEffect(() => {
    if (!disciplineScore) {
      return;
    }

    const lastUpdated = new Date(disciplineScore.LastUpdated);
    const today = new Date(todayString);

    if (lastUpdated >= today) {
      return;
    }

    const nextDate = new Date(lastUpdated);
    nextDate.setDate(nextDate.getDate());

    const updatedScore = { ...disciplineScore };

    while (nextDate < today) {
      const dateKey = nextDate.toISOString().split("T")[0];
      const dayTasks = tasks.filter(
        (task) => task.date && task.date.startsWith(dateKey),
      );

      const completedCount = dayTasks.filter((task) => task.completed).length;
      const dayCount = dayTasks.length;

      if (dayCount > 0) {
        const currentScore = (completedCount / dayCount) * 100;

        if (currentScore > 80) {
          updatedScore.score += 1;
          updatedScore.change = 1;
        } else if (currentScore < 65) {
          updatedScore.score -= 1;
          updatedScore.change = -1;
        } else {
          updatedScore.score += 0.5;
          updatedScore.change = 0.5;
        }
      }

      nextDate.setDate(nextDate.getDate() + 1);
    }

    updatedScore.LastUpdated = todayString;
    setDisciplineScore(updatedScore);
    saveDisciplineScore(updatedScore);
  }, []);
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>Tasks</Text>
      <Text style={styles.text}>Manage your daily missions</Text>
      <View
        style={[
          styles.scoreBadge,
          {
            borderColor: scoreChangeColor,
            backgroundColor: `${scoreChangeColor}20`,
          },
        ]}
      >
        <View
          style={[
            styles.scoreCircle,
            {
              borderColor: scoreChangeColor,
              backgroundColor: `${scoreChangeColor}22`,
            },
          ]}
        >
          <Text style={styles.scoreValue}>
            {disciplineScore?.score?.toFixed(1) ?? "--"}
          </Text>
          <Text style={[styles.scoreChange, { color: scoreChangeColor }]}>
            {scoreChangeLabel}
          </Text>
        </View>
      </View>

      {cards.map((item) => (
        <Pressable
          key={item.id}
          style={styles.card}
          onPress={() => {
            // Handle card press, e.g., navigate to the respective screen
            router.push(item.route);
          }}
        >
          <LinearGradient
            colors={item.gradientColors as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconContainer}
          >
            <item.icon size={40} color={"white"} />
          </LinearGradient>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDescription}>{item.description}</Text>
          </View>
          <ChevronRight size={30} color="#666" />
        </Pressable>
      ))}
      <View style={styles.quickStats}>
        <Text style={styles.cardTitle}>Quick Stats</Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 20,
          }}
        >
          <View style={{ alignItems: "center" }}>
            <Text style={[styles.statNumber, { color: "#0aba24" }]}>
              {completedTasks}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={[styles.statNumber, { color: "#e95353" }]}>
              {incompleteTasks}
            </Text>
            <Text style={styles.statLabel}>Incomplete</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={[styles.statNumber, { color: "#50e3b9" }]}>
              {Math.round(completionRate)}%
            </Text>
            <Text style={styles.statLabel}>Completion Rate</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 70,
    backgroundColor: "#0F0F0F",
  },
  contentContainer: {
    justifyContent: "space-between",
    flexGrow: 1,
    paddingBottom: 80,
    minHeight: Dimensions.get("window").height - 70,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "white",
    marginBottom: 6,
    fontFamily: "serif",
    letterSpacing: -1,
  },
  text: {
    fontSize: 15,
    fontWeight: "400",
    color: "#888",
    marginBottom: 32,
    lineHeight: 24,
    width: "70%",
    fontFamily: "serif",
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: "700",
    fontFamily: "serif",
    color: "white",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    fontWeight: "400",
    fontFamily: "serif",
    textAlign: "justify",
    color: "#888",
    lineHeight: 20,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 28,
    padding: 22,
    marginBottom: 22,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,

    elevation: 6,
  },
  quickStats: {
    marginTop: 32,
    padding: 16,
    borderRadius: 28,
    backgroundColor: "#1A1A1A",
    fontFamily: "serif",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "800",
    fontFamily: "serif",
    color: "white",
  },
  statLabel: {
    fontSize: 13,
    fontFamily: "serif",
    color: "#777",
    marginTop: 4,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#E85D04",
    justifyContent: "center",
    alignItems: "center",
  },
  scoreBadge: {
    position: "absolute",
    top: -10,
    right: 20,
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  scoreCircle: {
    flex: 1,
    width: "100%",
    height: "100%",
    borderRadius: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  scoreValue: {
    fontSize: 26,
    fontWeight: "900",
    color: "white",
    fontFamily: "serif",
  },
  scoreChange: {
    fontSize: 14,
    fontFamily: "serif",
    fontWeight: "700",
    marginTop: 4,
  },
  cardContent: {
    flex: 1,
    marginLeft: 16,
  },
});
