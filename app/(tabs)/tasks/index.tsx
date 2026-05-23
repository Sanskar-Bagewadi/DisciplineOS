//import { ThemedText } from "@/components/themed-text";
//import { ThemedView } from "@/components/themed-view";
import { router } from "expo-router";
import {
  CalendarPlus,
  ChevronRight,
  History,
  ListChecks,
} from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const cards = [
  {
    id: "1",
    title: "Check History",
    description: "Review your past activities and progress.",
    icon: History,
    route: "/tasks/history",
  },
  {
    id: "2",
    title: "Todo List For Today",
    description: "Focus on what matters most right now",
    icon: ListChecks,
    route: "/tasks/today",
  },
  {
    id: "3",
    title: "Plan Tomorrow",
    description: "Set yourself up for success before the day begins",
    icon: CalendarPlus,
    route: "/tasks/tomorrow",
  },
];

export default function TasksScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>Tasks</Text>
      <Text style={styles.text}>Manage your daily missions</Text>
      {cards.map((item) => (
        <Pressable
          key={item.id}
          style={styles.card}
          onPress={() => {
            // Handle card press, e.g., navigate to the respective screen
            router.push(item.route as any);
          }}
        >
          <View style={styles.iconContainer}>
            <item.icon size={40} color={"white"} />
          </View>
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
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={styles.statNumber}>2</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={styles.statNumber}>1</Text>
            <Text style={styles.statLabel}>Overdue</Text>
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
    paddingBottom: 40,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "white",
    marginBottom: 6,
    letterSpacing: -1,
  },
  text: {
    fontSize: 16,
    fontWeight: "400",
    color: "#888",
    marginBottom: 32,
    lineHeight: 24,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "white",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    fontWeight: "400",
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
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: "white",
  },
  statLabel: {
    fontSize: 13,
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
  cardContent: {
    flex: 1,
    marginLeft: 16,
  },
});
