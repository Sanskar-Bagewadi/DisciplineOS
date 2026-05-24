//import { ThemedText } from "@/components/themed-text";
//import { ThemedView } from "@/components/themed-view";
import {
  loadDisciplineScore,
  loadTasks,
  saveDisciplineScore,
} from "@/storage/storage";
import { Discipline_Socre } from "@/types/discipline_score";
import { PlannedTask } from "@/types/task";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  CalendarPlus,
  ChevronRight,
  History,
  ListChecks,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const cards = [
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

export default function TasksScreen() {
  const [tasks, setTasks] = useState<PlannedTask[]>([]);
  const [disciplineScore, setDisciplineScore] = useState<Discipline_Socre>();

  useEffect(() => {
    // Load tasks and discipline score when the component mounts
    const loadData = async () => {
      const tasks = await loadTasks();
      const disciplineScore = await loadDisciplineScore();
      setTasks(tasks);
      setDisciplineScore(disciplineScore);
    };

    loadData();
  }, []);

  useEffect(() => {
    // Save discipline score whenever it changes
    if (disciplineScore) {
      saveDisciplineScore(disciplineScore);
    }
  }, [disciplineScore]);

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

  if (
    disciplineScore &&
    new Date(disciplineScore.LastUpdated).getDate() < new Date().getDate()
  ) {
    // Reset discipline score if it's from a previous day
    let day = new Date(disciplineScore.LastUpdated).getDate() + 1;
    while (day !== new Date().getDate()) {
      const currentScore =
        (tasks.filter(
          (task) => task.completed && new Date(task.date).getDate() === day,
        ).length /
          tasks.filter((task) => new Date(task.date).getDate() === day)
            .length) *
          100 || 0;
      if (currentScore > 80) {
        disciplineScore.score = disciplineScore.score + 1;
        disciplineScore.change = 1;
      } else if (currentScore < 65) {
        disciplineScore.score = disciplineScore.score - 1;
        disciplineScore.change = -1;
      } else {
        disciplineScore.score = disciplineScore.score + 0.5;
        disciplineScore.change = 0.5;
      }
      day = day + 1;
    }
    disciplineScore.LastUpdated = new Date().toISOString().split("T")[0];
  }
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
            router.push(item.route as any);
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
    position: "sticky",
    bottom: 0,
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
