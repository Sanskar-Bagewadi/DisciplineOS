import { Discipline_Socre } from "@/types/discipline_score";
import { create } from "zustand";

type DisciplineScoreStore = {
  disciplineScore: Discipline_Socre;
  setDisciplineScore: (score: Discipline_Socre) => void;
};

export const useDisciplineScoreStore = create<DisciplineScoreStore>((set) => ({
  disciplineScore: {
    score: 0,
    change: 0,
    LastUpdated: "",
  },
  setDisciplineScore: (score) => set({ disciplineScore: score }),
}));
