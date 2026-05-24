import { StyleSheet, Text, View } from "react-native";

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.text}>This is the profile screen.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0F0F0F",
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
});
