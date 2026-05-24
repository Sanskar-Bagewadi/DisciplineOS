import { Discipline_Socre } from "@/types/discipline_score";
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

const Discipline_Key = "DISCIPLINE_SCORE";

export const saveDisciplineScore = async (score: Discipline_Socre) => {
  try {
    const jsonValue = JSON.stringify(score);
    await AsyncStorage.setItem(Discipline_Key, jsonValue);
  } catch (error) {
    console.error("Error saving discipline score: ", error);
  }
};

export const loadDisciplineScore = async (): Promise<Discipline_Socre> => {
  try {
    const jsonValue = await AsyncStorage.getItem(Discipline_Key);
    return jsonValue
      ? JSON.parse(jsonValue)
      : {
          score: 0,
          change: 0,
          LastUpdated: new Date().toISOString().split("T")[0],
        }; // Return default score if not found
  } catch (error) {
    console.error("Error loading discipline score: ", error);
    return {
      score: 0,
      change: 0,
      LastUpdated: new Date().toISOString().split("T")[0],
    };
  }
};
