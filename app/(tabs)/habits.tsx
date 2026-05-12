import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Platform, StyleSheet } from "react-native";

export default function HabitsScreen() {
  return (
    <ThemedView style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
    <ThemedText style={styles.text}>
      This is the Habits screen. You can edit this screen in{" "}
      <ThemedText type="defaultSemiBold">app/(tabs)/habits.tsx</ThemedText>.
    </ThemedText>
    </ThemedView>
  );
} 

const styles = StyleSheet.create({
  text: {
    fontSize: 18,
  }
});