import * as React from "react";
import { motion, Reorder } from "framer-motion";
import { CloseIcon } from "./icons/CloseIcon";
import EditableText from "./editable-text";
import { FaX } from "react-icons/fa6";

interface Props {
  tabName: string;
  inEditMode: boolean;
  isSelected: boolean;
  onClick: () => void;
  removeable: boolean;
  draggable: boolean;
  onRemove?: () => void;
}

export const Tab = ({
  tabName,
  inEditMode,
  onClick,
  removeable,
  draggable,
  onRemove,
  isSelected,
}: Props) => {
  return (
    <Reorder.Item
      value={tabName}
      id={tabName}
      initial={{ opacity: 0, y: 30 }}
      animate={{
        opacity: 1,
        backgroundColor: isSelected ? "#f3f3f3" : "#fff",
        y: 0,
        transition: { duration: 0.15 },
      }}
      exit={{ opacity: 0, y: 20, transition: { duration: 0.3 } }}
      whileDrag={{ backgroundColor: "#e3e3e3" }}
      className={isSelected ? "selected" : ""}
      onPointerDown={onClick}
      dragListener={draggable}
    >
      <div className="flex p-2 items-center">
        {/* Text */}

        <motion.span layout="position">
          {inEditMode ? (
            <>
              <EditableText initialText={tabName} updateMethod={() => {}} />
            </>
          ) : (
            tabName
          )}
        </motion.span>

        {/* Close Icon */}

        {removeable && onRemove && inEditMode && isSelected && (
          <motion.div layout>
            <motion.button
              onPointerDown={(event) => {
                event.stopPropagation();
                onRemove();
              }}
              initial={false}
              animate={{ color: isSelected ? "#000" : "#fff" }}
              className="flex items-center w-2"
            >
              <CloseIcon />
            </motion.button>
          </motion.div>
        )}
      </div>
    </Reorder.Item>
  );
};
