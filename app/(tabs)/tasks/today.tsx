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
  KeyboardAvoidingView,
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

import { saveTasks } from "@/storage/storage";
import { useTaskStore } from "@/stores/taskStore";
import { PlannedTask } from "@/types/task";

const todayDate = () => {
  const today = new Date();
  return (
    String(today.getFullYear()) +
    "-" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(today.getDate()).padStart(2, "0")
  );
};

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

const TIME_HOURS = Array.from({ length: 12 }, (_, index) => `${index + 1}`);
const TIME_MINUTES = ["00", "15", "30", "45"];
const TIME_PERIODS = ["AM", "PM"] as const;

const parseTime = (time: string) => {
  const match = time.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
  if (!match) return { hour: 0, minute: 0 };

  let hour = Number(match[1]);
  const minute = Number(match[2] ?? "0");
  const period = match[3].toLowerCase();

  if (period === "pm" && hour < 12) hour += 12;
  if (period === "am" && hour === 12) hour = 0;

  return { hour, minute };
};

const formatTimeString = (hour: number, minute: number) => {
  const normalizedHour = hour % 12 === 0 ? 12 : hour % 12;
  const period = hour >= 12 ? "PM" : "AM";
  return `${normalizedHour}:${minute.toString().padStart(2, "0")} ${period}`;
};

const timeToMinutes = (time: string) => {
  const { hour, minute } = parseTime(time);
  return hour * 60 + minute;
};

const isValidTimeOrder = (start: string, end: string) => {
  return timeToMinutes(end) >= timeToMinutes(start);
};

const compareTasksByTime = (a: PlannedTask, b: PlannedTask) => {
  const diff = timeToMinutes(a.time) - timeToMinutes(b.time);
  return diff !== 0
    ? diff
    : timeToMinutes(a.completeBy) - timeToMinutes(b.completeBy);
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
  const tasks = useTaskStore((s) => s.tasks);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState<Omit<PlannedTask, "id">>({
    title: "",
    description: "",
    time: "8:00 AM",
    completeBy: "8:30 AM",
    priority: "medium",
    date: todayDate(),
    completed: false,
  });
  const [timePickerField, setTimePickerField] = useState<
    "time" | "completeBy" | null
  >(null);
  const [pickerHour, setPickerHour] = useState("8");
  const [pickerMinute, setPickerMinute] = useState("00");
  const [pickerPeriod, setPickerPeriod] =
    useState<(typeof TIME_PERIODS)[number]>("AM");

  const openTimePicker = (
    field: "time" | "completeBy",
    currentValue: string,
  ) => {
    const parsed = parseTime(currentValue);
    const hourValue = `${parsed.hour % 12 === 0 ? 12 : parsed.hour % 12}`;
    setPickerHour(hourValue);
    setPickerMinute(parsed.minute.toString().padStart(2, "0"));
    setPickerPeriod(parsed.hour >= 12 ? "PM" : "AM");
    setTimePickerField(field);
  };

  const applyPickedTime = () => {
    if (!timePickerField) return;

    let hour = Number(pickerHour);
    if (pickerPeriod === "PM" && hour < 12) hour += 12;
    if (pickerPeriod === "AM" && hour === 12) hour = 0;
    const formattedTime = formatTimeString(hour, Number(pickerMinute));

    setNewTask((prev) => {
      if (timePickerField === "time") {
        return {
          ...prev,
          time: formattedTime,
          completeBy: isValidTimeOrder(formattedTime, prev.completeBy)
            ? prev.completeBy
            : formattedTime,
        };
      }

      return {
        ...prev,
        completeBy: isValidTimeOrder(prev.time, formattedTime)
          ? formattedTime
          : prev.time,
      };
    });

    setTimePickerField(null);
  };

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const todayTasks = useMemo(
    () =>
      tasks
        .filter((task) => task.date === todayDate())
        .sort(compareTasksByTime),
    [tasks],
  );

  const completedCount = todayTasks.filter((task) => task.completed).length;
  const progressPercentage =
    todayTasks.length === 0
      ? 0
      : Math.round((completedCount / todayTasks.length) * 100);

  const toggleTask = useTaskStore((s) => s.toggleTask);
  const handleToggleTask = async (id: string) => {
    toggleTask(id);

    const UpdatedTasks = useTaskStore.getState().tasks;
    saveTasks(UpdatedTasks);
  };

  const deleteTask = useTaskStore((s) => s.deleteTask);
  const addToStore = useTaskStore((s) => s.addTask);

  const handleDeleteTask = async (id: string) => {
    deleteTask(id);
    const UpdatedTasks = useTaskStore.getState().tasks;
    saveTasks(UpdatedTasks);
  };

  const addTask = () => {
    if (!newTask.title.trim()) return;

    const nextTask = {
      ...newTask,
      completeBy: isValidTimeOrder(newTask.time, newTask.completeBy)
        ? newTask.completeBy
        : newTask.time,
      id: "",
    };

    addToStore(nextTask);
    saveTasks(useTaskStore.getState().tasks);

    setNewTask({
      title: "",
      description: "",
      time: "8:00 AM",
      completeBy: "8:30 AM",
      priority: "medium",
      date: todayDate(),
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
                    handleToggleTask(task.id);
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
                onPress={() => handleDeleteTask(task.id)}
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
          onPress={() => {
            setTimePickerField(null);
            setShowAddModal(false);
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 100}
            style={modalStyles.keyboardAvoidingView}
          >
            <Pressable
              style={modalStyles.modalContent}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={modalStyles.modalHeader}>
                <Text style={modalStyles.modalTitle}>
                  Add Today&apos;s Task
                </Text>
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
                  <Pressable
                    style={modalStyles.timeInput}
                    onPress={() => openTimePicker("time", newTask.time)}
                  >
                    <Text style={modalStyles.timeInputText}>
                      {newTask.time}
                    </Text>
                  </Pressable>
                </View>
                <View style={modalStyles.modalField}>
                  <Text style={modalStyles.inputLabel}>Complete By</Text>
                  <Pressable
                    style={modalStyles.timeInput}
                    onPress={() =>
                      openTimePicker("completeBy", newTask.completeBy)
                    }
                  >
                    <Text style={modalStyles.timeInputText}>
                      {newTask.completeBy}
                    </Text>
                  </Pressable>
                </View>
              </View>

              {timePickerField ? (
                <View style={modalStyles.timePickerPanel}>
                  <Text style={modalStyles.timePickerLabel}>
                    Select {timePickerField === "time" ? "Time" : "Complete By"}
                  </Text>
                  <View style={modalStyles.timePickerRow}>
                    <View style={modalStyles.timePickerColumn}>
                      {TIME_HOURS.map((hour) => (
                        <Pressable
                          key={hour}
                          style={[
                            modalStyles.timePickerOption,
                            pickerHour === hour &&
                              modalStyles.timePickerOptionActive,
                          ]}
                          onPress={() => setPickerHour(hour)}
                        >
                          <Text
                            style={[
                              modalStyles.timePickerOptionText,
                              pickerHour === hour &&
                                modalStyles.timePickerOptionTextActive,
                            ]}
                          >
                            {hour}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                    <View style={modalStyles.timePickerColumn}>
                      {TIME_MINUTES.map((minute) => (
                        <Pressable
                          key={minute}
                          style={[
                            modalStyles.timePickerOption,
                            pickerMinute === minute &&
                              modalStyles.timePickerOptionActive,
                          ]}
                          onPress={() => setPickerMinute(minute)}
                        >
                          <Text
                            style={[
                              modalStyles.timePickerOptionText,
                              pickerMinute === minute &&
                                modalStyles.timePickerOptionTextActive,
                            ]}
                          >
                            {minute}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                    <View style={modalStyles.timePickerColumn}>
                      {TIME_PERIODS.map((period) => (
                        <Pressable
                          key={period}
                          style={[
                            modalStyles.timePickerOption,
                            pickerPeriod === period &&
                              modalStyles.timePickerOptionActive,
                          ]}
                          onPress={() => setPickerPeriod(period)}
                        >
                          <Text
                            style={[
                              modalStyles.timePickerOptionText,
                              pickerPeriod === period &&
                                modalStyles.timePickerOptionTextActive,
                            ]}
                          >
                            {period}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                  <View style={modalStyles.timePickerActions}>
                    <Pressable
                      style={modalStyles.timePickerButton}
                      onPress={() => setTimePickerField(null)}
                    >
                      <Text style={modalStyles.timePickerButtonText}>
                        Cancel
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[
                        modalStyles.timePickerButton,
                        modalStyles.timePickerButtonConfirm,
                      ]}
                      onPress={applyPickedTime}
                    >
                      <Text
                        style={[
                          modalStyles.timePickerButtonText,
                          modalStyles.timePickerButtonConfirmText,
                        ]}
                      >
                        Set time
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ) : null}
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

              <TouchableOpacity
                style={modalStyles.modalButton}
                onPress={addTask}
              >
                <Text style={modalStyles.modalButtonText}>Add Task</Text>
              </TouchableOpacity>
            </Pressable>
          </KeyboardAvoidingView>
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
  keyboardAvoidingView: {
    flex: 1,
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
  timeInput: {
    width: "100%",
    backgroundColor: "#111827",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: "center",
  },
  timeInputText: {
    color: "white",
    fontSize: 14,
  },
  timePickerPanel: {
    backgroundColor: "#0f172a",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.2)",
    padding: 14,
    marginTop: 12,
  },
  timePickerLabel: {
    color: "white",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 10,
  },
  timePickerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  timePickerColumn: {
    flex: 1,
  },
  timePickerOption: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.2)",
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111827",
  },
  timePickerOptionActive: {
    backgroundColor: "#1f2937",
    borderColor: "#22c55e",
  },
  timePickerOptionText: {
    color: "#cbd5e1",
    fontSize: 14,
  },
  timePickerOptionTextActive: {
    color: "white",
    fontWeight: "700",
  },
  timePickerActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 10,
  },
  timePickerButton: {
    flex: 1,
    borderRadius: 16,
    borderColor: "rgba(148, 163, 184, 0.2)",
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111827",
  },
  timePickerButtonConfirm: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
  },
  timePickerButtonText: {
    color: "#cbd5e1",
    fontSize: 14,
    fontWeight: "700",
  },
  timePickerButtonConfirmText: {
    color: "#0f172a",
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
