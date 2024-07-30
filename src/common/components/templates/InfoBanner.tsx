import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FaTimes } from "react-icons/fa";
import * as Toast from "@radix-ui/react-toast";

export default function InfoToast() {
  const [isDisplayed, setIsDisplayed] = useState(false);
  const [message, setMessage] = useState("");
  const [duration, setDuration] = useState(10000);
  const router = useRouter();
  const { pathname, query } = router;
  const userFarcasterName = query.handle;

  useEffect(() => {
    let storedState;

    if (pathname === "/homebase") {
      storedState = localStorage.getItem("homebaseToastDisplayed");
      if (!storedState && localStorage.getItem("privy:token") !== null) {
        setIsDisplayed(true);
        setMessage(
          "Your homebase is a space that only you can see. Click the paintbrush to customize it 🚀",
        );
        setDuration(10000);
      } else {
        setIsDisplayed(false);
      }
    } else if (
      pathname.startsWith("/s/") &&
      userFarcasterName === "farcaster"
    ) {
      storedState = localStorage.getItem("profileToastDisplayed");
      if (!storedState) {
        setIsDisplayed(true);
        setMessage(
          "This is your profile. Click the paintbrush to customize your space.",
        );
        setDuration(10000);
      } else {
        setIsDisplayed(false);
      }
    } else {
      setIsDisplayed(false);
    }
  }, [pathname, userFarcasterName]);

  const closeToast = () => {
    setIsDisplayed(false);
    if (pathname === "/homebase") {
      localStorage.setItem("homebaseToastDisplayed", "true");
    } else if (pathname.startsWith("/s/")) {
      localStorage.setItem("profileToastDisplayed", "true");
    }
  };

  return (
    <Toast.Provider>
      <Toast.Root
        open={isDisplayed}
        onOpenChange={setIsDisplayed}
        duration={duration} // Set the duration here
        className="fixed bottom-4 right-4 p-4 bg-blue-100 border border-blue-300 rounded-md shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img
              src="https://i.ibb.co/L8Fb37T/image.png"
              alt="rocket"
              className="w-8 h-8 object-contain"
            />
            <p className="text-blue-600 ml-2">{message}</p>
          </div>
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
}
