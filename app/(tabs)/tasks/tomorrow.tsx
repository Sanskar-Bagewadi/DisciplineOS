import { router } from "expo-router";
import {
  ChevronLeft,
  Clock,
  GripVertical,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react-native";
import { useEffect, useState } from "react";
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

const tomorrowDate = new Date();
tomorrowDate.setDate(tomorrowDate.getDate() + 1);
const formattedTomorrowDate = tomorrowDate.toLocaleDateString().split("T")[0];

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

const motivationalQuotes = [
  "The pain of discipline is far less than the pain of regret.",

  "Success is not final, failure is not fatal: it is the courage to continue that counts.",

  "Your future self will thank you for the work you put in today.",

  "Motivation gets you started. Systems keep you going.",

  "You do not rise to your goals. You fall to your habits.",

  "Small daily improvements create massive long-term results.",

  "Discipline is choosing what you want most over what you want now.",

  "Consistency beats intensity when intensity cannot be sustained.",

  "Focus on finishing, not just starting.",

  "The goal is not perfection. The goal is reliability.",

  "Do it now. Your future is watching.",

  "If you cannot control your impulses, you cannot control your life.",

  "Nobody is coming to build your future for you.",

  "Hard choices create strong people. Easy choices create regret.",

  "You said you wanted a different life. This is the price.",

  "A weak mind quits when it gets uncomfortable.",

  "Comfort is expensive. Discipline is cheaper.",

  "Your excuses do not care about your dreams.",

  "Every missed task is a vote for the life you said you did not want.",

  "Discipline is doing the mission even when emotions fail.",

  "The body achieves what the mind refuses to quit on.",

  "Train your mind to obey you.",

  "Be harder to break.",

  "The mission does not care how you feel today.",

  "Earn your sleep.",

  "If you want respect from yourself, keep your word to yourself.",

  "You either suffer the training or suffer the consequences.",

  "Pressure reveals who is serious.",

  "Excuses sound best to the person making them.",

  "If you can't do the small things consistently, stop talking about big dreams.",

  "The standard is the standard.",

  "Stay disciplined when nobody is watching.",

  "One day or day one. Decide.",

  "You are either training your discipline or training your weakness.",

  "The future belongs to people who can operate without motivation.",
];

export default function TomorrowTasksScreen() {
  const [tasks, setTasks] = useState<PlannedTask[]>([]);
  useEffect(() => {
    const fetchTasks = async () => {
      const loadedTasks = await loadTasks();
      setTasks(loadedTasks);
    };
    fetchTasks();
  }, []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState<Omit<PlannedTask, "id">>({
    title: "",
    description: "",
    time: "8:00 AM",
    completeBy: "8:30 AM",
    priority: "medium",
    date: formattedTomorrowDate,
    completed: false,
  });

  const today = new Date().toLocaleDateString("en-CA").split("T")[0];

  const seed = today
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const quote = motivationalQuotes[seed % motivationalQuotes.length];

  const completedTasks = tasks.filter((task) => task.completed).length;

  const estimatedScore =
    tasks.length === 0 ? 0 : Math.round((completedTasks / tasks.length) * 100);

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
      date: formattedTomorrowDate,
      completed: false,
    });
    setShowAddModal(false);
  };

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  return (
    <View style={generalStyles.screen}>
      <ScrollView
        style={generalStyles.container}
        contentContainerStyle={generalStyles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={headerStyles.header}>
          <Pressable
            style={headerStyles.backButton}
            onPress={() => router.push("/tasks")}
          >
            <ChevronLeft size={24} color="white" />
          </Pressable>
          <View style={headerStyles.headerText}>
            <Text style={headerStyles.title}>Plan Tomorrow</Text>
            <Text style={headerStyles.subtitle}>
              {tasks.length} tasks planned
            </Text>
          </View>
        </View>

        <View style={quoteStyles.quoteCard}>
          <View style={quoteStyles.quoteIcon}>
            <Sparkles size={24} color="#fbbf24" />
          </View>
          <Text style={quoteStyles.quoteText}>{quote}</Text>
        </View>

        <View style={scoreStyles.scoreCard}>
          <View style={scoreStyles.scoreRow}>
            <View>
              <Text style={scoreStyles.scoreLabel}>Estimated Score</Text>
              <Text style={scoreStyles.scoreNumber}>{estimatedScore}</Text>
            </View>
            <View style={scoreStyles.scoreBadge}>
              <Text style={scoreStyles.scoreBadgeText}>{estimatedScore}%</Text>
            </View>
          </View>
          <Text style={scoreStyles.scoreSubtitle}>
            Complete all planned tasks to maximize your productivity score.
          </Text>
        </View>

        <View style={taskStyles.sectionHeader}>
          <Text style={taskStyles.sectionTitle}>Planned Tasks</Text>
          <Text style={taskStyles.sectionSubtitle}>Drag to reorder</Text>
        </View>

        {[...tasks]
          .filter((task) => task.date === formattedTomorrowDate)
          .sort((a, b) => a.time.localeCompare(b.time))
          .map((task) => (
            <View key={task.id} style={taskStyles.taskCard}>
              <View style={taskStyles.taskRow}>
                <GripVertical size={18} color="#6b7280" />
                <View style={taskStyles.taskInfo}>
                  <View style={taskStyles.taskTitleRow}>
                    <Text style={taskStyles.taskTitle}>{task.title}</Text>
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
          ))}
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
              <Text style={modalStyles.modalTitle}>Plan New Task</Text>
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
              placeholder="What will you accomplish?"
              placeholderTextColor="#9ca3af"
              style={modalStyles.input}
            />
            <Text style={modalStyles.inputLabel}>Description</Text>
            <TextInput
              value={newTask.description}
              onChangeText={(text) =>
                setNewTask((prev) => ({ ...prev, description: text }))
              }
              placeholder="Add details..."
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
                {" "}
                <Text style={modalStyles.inputLabel}>Priority</Text>
                <View style={modalStyles.pickerWrapper}>
                  <Pressable
                    style={[
                      modalStyles.pickerOption,
                      newTask.priority === "high" &&
                        modalStyles.pickerOptionActive,
                    ]}
                    onPress={() =>
                      setNewTask((prev) => ({ ...prev, priority: "high" }))
                    }
                  >
                    <Text
                      style={[
                        modalStyles.pickerText,
                        newTask.priority === "high" &&
                          modalStyles.pickerTextActive,
                      ]}
                    >
                      High
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      modalStyles.pickerOption,
                      newTask.priority === "medium" &&
                        modalStyles.pickerOptionActive,
                    ]}
                    onPress={() =>
                      setNewTask((prev) => ({ ...prev, priority: "medium" }))
                    }
                  >
                    <Text
                      style={[
                        modalStyles.pickerText,
                        newTask.priority === "medium" &&
                          modalStyles.pickerTextActive,
                      ]}
                    >
                      Medium
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      modalStyles.pickerOption,
                      newTask.priority === "low" &&
                        modalStyles.pickerOptionActive,
                    ]}
                    onPress={() =>
                      setNewTask((prev) => ({ ...prev, priority: "low" }))
                    }
                  >
                    <Text
                      style={[
                        modalStyles.pickerText,
                        newTask.priority === "low" &&
                          modalStyles.pickerTextActive,
                      ]}
                    >
                      Low
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
            <TouchableOpacity style={modalStyles.modalButton} onPress={addTask}>
              <Text style={modalStyles.modalButtonText}>Add to Tomorrow</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const generalStyles = StyleSheet.create({
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
    paddingBottom: 140,
  },
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

const headerStyles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingTop: 20,
    paddingBottom: 10,
    position: "sticky",
    top: 0,
    backgroundColor: "#09090f",
    zIndex: 10,
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
    marginTop: 4,
  },
});

const quoteStyles = StyleSheet.create({
  quoteCard: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 24,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  quoteIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "rgba(251, 191, 36, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  quoteText: {
    color: "#d1d5db",
    fontSize: 16,
    flex: 1,
    fontWeight: "500",
    fontStyle: "italic",
    lineHeight: 20,
  },
});

const scoreStyles = StyleSheet.create({
  scoreCard: {
    marginTop: 16,
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.12)",
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  scoreLabel: {
    color: "#9ca3af",
    fontSize: 13,
  },
  scoreNumber: {
    color: "white",
    fontSize: 36,
    fontWeight: "800",
    marginTop: 6,
  },
  scoreBadge: {
    width: 72,
    height: 72,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
  },
  scoreBadgeText: {
    color: "#22c55e",
    fontSize: 16,
    fontWeight: "800",
  },
  scoreSubtitle: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 12,
    lineHeight: 18,
  },
});

const taskStyles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  sectionSubtitle: {
    color: "#9ca3af",
    fontSize: 12,
  },
  taskCard: {
    backgroundColor: "#111827",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.12)",
    padding: 16,
    marginBottom: 14,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  taskTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "800",
    flex: 1,
  },
  priorityBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  taskDescription: {
    color: "#9ca3af",
    fontSize: 13,
    marginTop: 8,
    lineHeight: 18,
  },
  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },
  taskTime: {
    color: "#9ca3af",
    fontSize: 12,
  },
  deleteButton: {
    marginTop: 14,
    alignSelf: "flex-end",
    padding: 10,
    borderRadius: 14,
    backgroundColor: "rgba(248, 113, 113, 0.12)",
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
    paddingVertical: 11,
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
