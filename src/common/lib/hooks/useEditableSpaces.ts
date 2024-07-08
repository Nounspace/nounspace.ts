import { useAppStore } from "@/common/data/stores/app";

export const useEditableSpaces = () => {
  return useAppStore((state) => state.space.editableSpaces);
};

export default useEditableSpaces;
