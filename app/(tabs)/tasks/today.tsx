import { router } from "expo-router";
import {
  Check,
  ChevronLeft,
  Clock,
  GripVertical,
  Plus,
  Trash2,
  X,
} from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { loadTasks, saveTasks } from "@/storage/storage";
import { PlannedTask } from "@/types/task";

const todayDate = new Date().toLocaleDateString("en-CA").split("T")[0];

const priorityStyles: Record<PlannedTask["priority"], any> = {
  high: {
    borderColor: "#f87171",
    backgroundColor: "rgba(248, 113, 113, 0.15)",
    color: "#fca5a5",
  },
  medium: {
    borderColor: "#38bdf8",
    backgroundColor: "rgba(56, 189, 248, 0.15)",
    color: "#7dd3fc",
  },
  low: {
    borderColor: "#94a3b8",
    backgroundColor: "rgba(148, 163, 184, 0.15)",
    color: "#cbd5e1",
  },
};

const parseTime = (time: string) => {
  const [timePart, period] = time.split(" ");
  const [hourString, minuteString] = timePart.split(":");
  let hour = Number(hourString);
  const minute = Number(minuteString);
  if (period?.toLowerCase() === "pm" && hour < 12) hour += 12;
  if (period?.toLowerCase() === "am" && hour === 12) hour = 0;
  return { hour, minute };
};

const getTaskDateTime = (task: PlannedTask) => {
  const deadline = task.completeBy || task.time;
  const { hour, minute } = parseTime(deadline);
  const date = new Date(task.date + "T00:00:00");
  date.setHours(hour, minute, 0, 0);
  return date;
};

const isTaskOverdue = (task: PlannedTask) => {
  return !task.completed && getTaskDateTime(task) < new Date();
};

export default function TodayTasksScreen() {
  const [tasks, setTasks] = useState<PlannedTask[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState<Omit<PlannedTask, "id">>({
    title: "",
    description: "",
    time: "8:00 AM",
    completeBy: "8:30 AM",
    priority: "medium",
    date: todayDate,
    completed: false,
  });

  useEffect(() => {
    const fetchTasks = async () => {
      const loadedTasks = await loadTasks();
      setTasks(loadedTasks);
    };
    fetchTasks();
  }, []);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const todayTasks = useMemo(
    () =>
      tasks
        .filter((task) => task.date === todayDate)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [tasks],
  );

  const completedCount = todayTasks.filter((task) => task.completed).length;
  const progressPercentage =
    todayTasks.length === 0
      ? 0
      : Math.round((completedCount / todayTasks.length) * 100);

  const toggleTask = (id: string) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const deleteTask = (id: string) => {
    setTasks((current) => current.filter((task) => task.id !== id));
  };

  const addTask = () => {
    if (!newTask.title.trim()) return;

    setTasks((current) => [
      {
        id: Date.now().toString(),
        ...newTask,
      },
      ...current,
    ]);

    setNewTask({
      title: "",
      description: "",
      time: "8:00 AM",
      completeBy: "8:30 AM",
      priority: "medium",
      date: todayDate,
      completed: false,
    });
    setShowAddModal(false);
  };

  return (
    <View style={screenStyles.screen}>
      <ScrollView
        style={screenStyles.container}
        contentContainerStyle={screenStyles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={headerStyles.headerContainer}>
          <View style={headerStyles.headerTop}>
            <Pressable
              style={headerStyles.backButton}
              onPress={() => router.push("/tasks")}
            >
              <ChevronLeft size={24} color="white" />
            </Pressable>
            <View style={headerStyles.headerText}>
              <Text style={headerStyles.title}>Today&apos;s Tasks</Text>
              <Text style={headerStyles.subtitle}>
                {completedCount} of {todayTasks.length} completed
              </Text>
            </View>
          </View>

          <View style={headerStyles.progressContainer}>
            <View style={headerStyles.progressBarBackground}>
              <View
                style={[
                  headerStyles.progressBarFill,
                  { width: `${progressPercentage}%` },
                ]}
              />
            </View>
          </View>
        </View>

        {todayTasks.length === 0 ? (
          <View style={taskStyles.emptyState}>
            <Text style={taskStyles.emptyTitle}>No tasks for today</Text>
            <Text style={taskStyles.emptyText}>
              Add a task to stay on track and keep your momentum.
            </Text>
          </View>
        ) : (
          todayTasks.map((task) => (
            <View key={task.id} style={taskStyles.taskCard}>
              <View style={taskStyles.taskRow}>
                <Pressable
                  style={[
                    taskStyles.completeToggle,
                    task.completed && taskStyles.completeToggleActive,
                  ]}
                  onPress={() => {
                    toggleTask(task.id);
                  }}
                >
                  {task.completed ? <Check size={16} color="#ffffff" /> : null}
                </Pressable>
                <GripVertical
                  size={18}
                  color="#6b7280"
                  style={taskStyles.taskIcon}
                />
                <View style={taskStyles.taskInfo}>
                  <View style={taskStyles.taskTitleRow}>
                    <Text
                      style={[
                        taskStyles.taskTitle,
                        task.completed && taskStyles.taskCompleted,
                      ]}
                    >
                      {task.title}
                    </Text>
                    <View
                      style={[
                        taskStyles.priorityBadge,
                        {
                          borderColor:
                            priorityStyles[task.priority].borderColor,
                          backgroundColor:
                            priorityStyles[task.priority].backgroundColor,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          taskStyles.priorityText,
                          { color: priorityStyles[task.priority].color },
                        ]}
                      >
                        {task.priority}
                      </Text>
                    </View>
                  </View>
                  <Text style={taskStyles.taskDescription}>
                    {task.description}
                  </Text>
                  <View style={taskStyles.taskMeta}>
                    <Clock size={12} color="#9ca3af" />
                    <Text style={taskStyles.taskTime}>At {task.time}</Text>
                    <Text style={taskStyles.taskTime}>
                      Complete by {task.completeBy}
                    </Text>
                    {isTaskOverdue(task) && (
                      <View
                        style={[taskStyles.overdueBadge, { marginLeft: 8 }]}
                      >
                        <Text style={taskStyles.overdueText}>Overdue</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
              <Pressable
                style={taskStyles.deleteButton}
                onPress={() => deleteTask(task.id)}
              >
                <Trash2 size={18} color="#f87171" />
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={generalStyles.addButton}
        onPress={() => setShowAddModal(true)}
      >
        <Plus size={22} color="white" />
      </TouchableOpacity>

      <Modal visible={showAddModal} transparent animationType="fade">
        <Pressable
          style={modalStyles.modalOverlay}
          onPress={() => setShowAddModal(false)}
        >
          <Pressable
            style={modalStyles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={modalStyles.modalHeader}>
              <Text style={modalStyles.modalTitle}>Add Today&apos;s Task</Text>
              <Pressable
                style={modalStyles.modalClose}
                onPress={() => setShowAddModal(false)}
              >
                <X size={18} color="white" />
              </Pressable>
            </View>

            <Text style={modalStyles.inputLabel}>Task Title</Text>
            <TextInput
              value={newTask.title}
              onChangeText={(text) =>
                setNewTask((prev) => ({ ...prev, title: text }))
              }
              placeholder="What do you need to finish?"
              placeholderTextColor="#9ca3af"
              style={modalStyles.input}
            />

            <Text style={modalStyles.inputLabel}>Description</Text>
            <TextInput
              value={newTask.description}
              onChangeText={(text) =>
                setNewTask((prev) => ({ ...prev, description: text }))
              }
              placeholder="Add some details..."
              placeholderTextColor="#9ca3af"
              style={modalStyles.input}
            />

            <View style={modalStyles.modalGrid}>
              <View style={modalStyles.modalField}>
                <Text style={modalStyles.inputLabel}>Time</Text>
                <TextInput
                  value={newTask.time}
                  onChangeText={(text) =>
                    setNewTask((prev) => ({ ...prev, time: text }))
                  }
                  placeholder="8:00 AM"
                  placeholderTextColor="#9ca3af"
                  style={modalStyles.input}
                />
              </View>
              <View style={modalStyles.modalField}>
                <Text style={modalStyles.inputLabel}>Complete By</Text>
                <TextInput
                  value={newTask.completeBy}
                  onChangeText={(text) =>
                    setNewTask((prev) => ({ ...prev, completeBy: text }))
                  }
                  placeholder="8:30 AM"
                  placeholderTextColor="#9ca3af"
                  style={modalStyles.input}
                />
              </View>
            </View>
            <View style={modalStyles.modalGrid}>
              <View style={modalStyles.modalField}>
                <Text style={modalStyles.inputLabel}>Priority</Text>
                <View style={modalStyles.pickerWrapper}>
                  {(["high", "medium", "low"] as const).map((level) => (
                    <Pressable
                      key={level}
                      style={[
                        modalStyles.pickerOption,
                        newTask.priority === level &&
                          modalStyles.pickerOptionActive,
                      ]}
                      onPress={() =>
                        setNewTask((prev) => ({ ...prev, priority: level }))
                      }
                    >
                      <Text
                        style={[
                          modalStyles.pickerText,
                          newTask.priority === level &&
                            modalStyles.pickerTextActive,
                        ]}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>

            <TouchableOpacity style={modalStyles.modalButton} onPress={addTask}>
              <Text style={modalStyles.modalButtonText}>Add Task</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const screenStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#09090f",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
  },
  contentContainer: {
    paddingBottom: 160,
  },
});

const headerStyles = StyleSheet.create({
  header: {
    marginBottom: 18,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: "white",
    fontSize: 26,
    fontWeight: "800",
  },
  subtitle: {
    color: "#9ca3af",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  progressContainer: {
    marginTop: 10,
    marginHorizontal: 12,
    zIndex: 10,
  },
  progressBarBackground: {
    width: "100%",
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(148, 163, 184, 0.28)",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#22c55e",
  },
  progressLabel: {
    color: "#9ca3af",
    fontSize: 13,
    marginTop: 8,
  },
  headerContainer: {
    marginBottom: 16,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: "#09090f",
    zIndex: 10,
  },
});

const taskStyles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "800",
  },
  sectionSubtitle: {
    color: "#9ca3af",
    fontSize: 13,
    fontWeight: "600",
  },
  emptyState: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.12)",
  },
  emptyTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptyText: {
    color: "#9ca3af",
    fontSize: 14,
    lineHeight: 20,
  },
  taskCard: {
    backgroundColor: "#111827",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.12)",
    padding: 18,
    paddingBottom: 26,
    marginBottom: 14,
    position: "relative",
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  taskIcon: {
    marginRight: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  taskTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "900",
    flex: 1,
  },
  taskCompleted: {
    textDecorationLine: "line-through",
    color: "#9ca3af",
  },
  priorityBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "900",
    textTransform: "capitalize",
  },
  taskDescription: {
    color: "#9ca3af",
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    flexWrap: "wrap",
  },
  taskTime: {
    color: "#9ca3af",
    fontSize: 13,
    marginLeft: 8,
  },
  overdueBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(248, 113, 113, 0.12)",
  },
  overdueText: {
    color: "#f87171",
    fontSize: 11,
    fontWeight: "700",
  },
  taskActions: {
    display: "none",
  },
  completeToggle: {
    width: 38,
    height: 38,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  completeToggleActive: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
  },
  deleteButton: {
    position: "absolute",
    right: 14,
    bottom: 14,
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(248, 113, 113, 0.18)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 3,
  },
});

const generalStyles = StyleSheet.create({
  addButton: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 58,
    height: 58,
    borderRadius: 999,
    backgroundColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 10,
  },
});

const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#0f172a",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "800",
  },
  modalClose: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  inputLabel: {
    color: "white",
    fontWeight: "600",
    fontSize: 13,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    width: "100%",
    backgroundColor: "#111827",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "white",
    fontSize: 14,
    marginBottom: 16,
    borderColor: "rgba(148, 163, 184, 0.2)",
    borderWidth: 1,
  },
  modalGrid: {
    flexDirection: "row",
    gap: 10,
  },
  modalField: {
    flex: 1,
  },
  pickerWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
  },
  pickerOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.2)",
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111827",
  },
  pickerOptionActive: {
    backgroundColor: "#1f2937",
    borderColor: "#22c55e",
  },
  pickerText: {
    color: "#cbd5e1",
    fontSize: 11,
    fontWeight: "600",
  },
  pickerTextActive: {
    color: "white",
  },
  modalButton: {
    marginTop: 10,
    borderRadius: 18,
    backgroundColor: "#22c55e",
    paddingVertical: 16,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "800",
  },
});
