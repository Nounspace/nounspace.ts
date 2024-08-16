import React, { useState, useEffect } from "react";
import * as Toast from "@radix-ui/react-toast";
import { FaTimes } from "react-icons/fa";

type GenericToasterProps = {
  message: string;
  duration?: number;
  isError?: boolean;
};

const GenericToaster: React.FC<GenericToasterProps> = ({
  message,
  duration = 5000,
  isError = false,
}) => {
  const [isDisplayed, setIsDisplayed] = useState(false);

  useEffect(() => {
    if (message) {
      setIsDisplayed(true);
    }
  }, [message]);

  const closeToast = () => {
    setIsDisplayed(false);
  };

  // Determine styles based on whether it's an error or not
  const toastStyles = isError
    ? "bg-red-100 border border-red-300 text-red-600"
    : "bg-blue-100 border border-blue-300 text-blue-600";

  return (
    <Toast.Provider>
      <Toast.Root
        open={isDisplayed}
        onOpenChange={(open) => setIsDisplayed(open)}
        duration={duration}
        className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg ${toastStyles}`}
      >
        <div className="flex items-center justify-between">
          <p>{message}</p>
          <Toast.Action altText="Close" asChild>
            <button onClick={closeToast} className="bg-transparent">
              <FaTimes className={isError ? "text-red-600" : "text-blue-600"} />
            </button>
          </Toast.Action>
        </div>
      </Toast.Root>
      <Toast.Viewport />
    </Toast.Provider>
  );
};

export default GenericToaster;
