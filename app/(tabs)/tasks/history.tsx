import ParallaxScrollView from '@/components/parallax-scroll-view';
import { StyleSheet, Text, View } from 'react-native';


export default function HistoryTasksScreen() {
  return (
    <ParallaxScrollView >
        <Text style={{ color: "white" }}>Here todo list will come</Text>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#0F0F0F",
  },
});