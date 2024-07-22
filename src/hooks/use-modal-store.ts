import { create } from "zustand";
import { streakWithCompletion } from "~/server/api/routers/user";

export type ModalType = "createStreak" | "editStreakSettings";

interface ModalData {
  userId?: string;
  streakName?: string;
  streakEmoji?: string;
  streakUrl?: string;
  streakDescription?: string;
  streakId?: number;
  userStreaks?: streakWithCompletion[];
  setUserStreaks?: React.Dispatch<React.SetStateAction<streakWithCompletion[]>>;
}

interface ModalStore {
  type: ModalType | null;
  data: ModalData;
  isOpen: boolean;
  onOpen: (type: ModalType, data?: ModalData) => void;
  onClose: () => void;
}

export const useModal = create<ModalStore>((set) => ({
  type: null,
  data: {},
  isOpen: false,
  onOpen: (type, data = {}) => set({ isOpen: true, type, data }),
  onClose: () => set({ type: null, isOpen: false }),
}));
