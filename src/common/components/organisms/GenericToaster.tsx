import React, { useState, useEffect } from "react";
import * as Toast from "@radix-ui/react-toast";
import { FaTimes } from "react-icons/fa";

type GenericToasterProps = {
  message: string;
  duration?: number;
};

const GenericToaster: React.FC<GenericToasterProps> = ({
  message,
  duration = 5000,
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

  return (
    <Toast.Provider>
      <Toast.Root
        open={isDisplayed}
        onOpenChange={setIsDisplayed}
        duration={duration}
        className="fixed bottom-4 right-4 p-4 bg-blue-100 border border-blue-300 rounded-md shadow-lg"
      >
        <div className="flex items-center justify-between">
          <p className="text-blue-600">{message}</p>
          <Toast.Action altText="Close" asChild>
            <button onClick={closeToast} className="bg-transparent">
              <FaTimes className="text-blue-600" />
            </button>
          </Toast.Action>
        </div>
      </Toast.Root>
      <Toast.Viewport />
    </Toast.Provider>
  );
};

export default GenericToaster;
