import { create } from "zustand";

export type ModalType = "createStreak" | "editStreakSettings";

interface ModalData {
  userId?: string;
  streakName?: string;
  streakEmoji?: string;
  streakUrl?: string;
  streakDescription?: string;
  streakId?: number;
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
