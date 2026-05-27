import { HelloWave } from "@/components/hello-wave";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { loadDisciplineScore, loadTasks } from "@/storage/storage";
import { useDisciplineScoreStore } from "@/stores/disciplineScoreStore";
import { useTaskStore } from "@/stores/taskStore";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";

export default function HomeScreen() {
  const setTasks = useTaskStore((s) => s.setTasks);
  const setDisciplineScore = useDisciplineScoreStore(
    (s) => s.setDisciplineScore,
  );
  useEffect(() => {
    // Load tasks from storage when the component mounts
    const loadTasksFromStorage = async () => {
      const storedTasks = await loadTasks();
      const storedDisciplineScore = await loadDisciplineScore();
      setTasks(storedTasks);
      setDisciplineScore(storedDisciplineScore);
    };
    loadTasksFromStorage();
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <View
        style={{ alignItems: "center", justifyContent: "center", padding: 16 }}
      >
        <HelloWave />
      </View>
      <View
        style={{ alignItems: "center", justifyContent: "center", padding: 16 }}
      >
        <ThemedText
          style={{
            fontSize: 18,
            textAlign: "justify",
            marginBottom: 16,
            marginLeft: 0,
          }}
        >
          Hello Sanskar,{"\n\n"} Welcome to the app. Congratulations on setting
          up your first screen!
        </ThemedText>
        <ThemedText
          style={{
            fontSize: 18,
            textAlign: "justify",
            marginBottom: 16,
            marginLeft: 0,
          }}
        >
          These are the things we will have in our app:
          {"\n"} Tasks
          {"\n"} Habits
          {"\n"} Alarms
          {"\n"} Screen Time
          {"\n"} Focus Mode
          {"\n"} And much more!
        </ThemedText>
      </View>
      <View
        style={{ alignItems: "center", justifyContent: "center", padding: 16 }}
      >
        <ThemedText>
          Executed: {"\n"}
          <Link href="/tasks" style={{ color: "#007AFF" }}>
            Tasks
          </Link>
        </ThemedText>
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
