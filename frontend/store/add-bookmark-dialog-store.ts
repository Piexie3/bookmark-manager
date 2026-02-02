import { create } from "zustand";

interface AddBookmarkDialogState {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const useAddBookmarkDialogStore = create<AddBookmarkDialogState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));
