import { PlannedTask } from "@/types/task";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TASK_KEY = "TASKS";

export const saveTasks = async (tasks: PlannedTask[]) => {
  try {
    const jsonValue = JSON.stringify(tasks);

    await AsyncStorage.setItem(TASK_KEY, jsonValue);
  } catch (error) {
    console.error("Error saving tasks: ", error);
  }
};

export const loadTasks = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(TASK_KEY);

    return jsonValue != null ? JSON.parse(jsonValue) : []; // Return empty array if no tasks found
  } catch (error) {
    console.error("Error loading tasks: ", error);
    return [];
  }
};
