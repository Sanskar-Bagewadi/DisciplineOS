import { StyleSheet, Text, View } from 'react-native';


export default function TodayTasksScreen() {
  return (
    <View style={styles.container}>
        <Text>Here todo list will come</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#0F0F0F",
  },
});