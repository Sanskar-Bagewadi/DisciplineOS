export interface PlannedTask {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  completeBy: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
}
