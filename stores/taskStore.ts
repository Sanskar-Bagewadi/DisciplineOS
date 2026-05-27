import { create } from "zustand";
import { PlannedTask } from "../types/task";

type TaskStore = {
  tasks: PlannedTask[];
  setTasks: (tasks: PlannedTask[]) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  addTask: (task: PlannedTask) => void;
};

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  toggleTask: (id) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    })),
  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    })),
  addTask: async (task) =>
    set((state) => ({
      tasks: [
        {
          ...task,
          id: Date.now().toString(),
        },
        ...state.tasks,
      ],
    })),
}));
