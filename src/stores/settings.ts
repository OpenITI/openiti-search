import { create } from "zustand";
import { persist } from "zustand/middleware";

type Language = "en" | "ar";

interface Settings {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useSettings = create(
  persist<Settings>(
    (set) => ({
      language: "en",
      setLanguage: (language) => set({ language }),
    }),
    {
      name: "settings-storage",
    },
  ),
);
