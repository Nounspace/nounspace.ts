import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/common/components/atoms/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/atoms/select";
import TextInput from "@/common/components/molecules/TextInput";
import {
  FidgetArgs,
  FidgetModule,
  FidgetProperties,
  type FidgetSettingsStyle,
} from "@/common/fidgets";
import React, { useEffect } from "react";
import { FaCircleInfo } from "react-icons/fa6";
import { defaultStyleFields, ErrorWrapper, WithMargin } from "@/fidgets/helpers";

const LUMA_CHECKOUT_SCRIPT_ID = "luma-checkout";
const LUMA_CHECKOUT_SCRIPT_SRC = "https://embed.lu.ma/checkout-button.js";

enum LumaEmbedType {
  CALENDAR = "calendar",
  EVENT_PAGE = "eventPage",
  REGISTRATION_BUTTON = "registrationButton",
}

const LUMA_EMBED_LABELS: Record<LumaEmbedType, string> = {
  [LumaEmbedType.CALENDAR]: "Calendar",
  [LumaEmbedType.EVENT_PAGE]: "Event Page",
  [LumaEmbedType.REGISTRATION_BUTTON]: "Registration Button",
};

type LumaEmbedTypeSelectorProps = {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  id?: string;
};

const LumaEmbedTypeSelector: React.FC<LumaEmbedTypeSelectorProps> = ({
  value = LumaEmbedType.CALENDAR,
  onChange,
  className,
  id,
}) => {
  return (
    <div className={className} id={id}>
      <Select
        value={value}
        onValueChange={(selected) => {
          onChange?.(selected);
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select Luma embed type">
            <div className="flex items-center">
              {LUMA_EMBED_LABELS[value as LumaEmbedType] || "Select Luma embed type"}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(LUMA_EMBED_LABELS).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              <div className="flex items-center">{label}</div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

declare global {
  interface Window {
    luma?: {
      initCheckout?: () => void;
    };
  }
}

export type LumaFidgetSettings = {
  embedType: LumaEmbedType;
  calendarId?: string;
  eventId?: string;
} & FidgetSettingsStyle;

const lumaConfig: FidgetProperties<LumaFidgetSettings> = {
  fidgetName: "Luma",
  icon: 0x1f4c5, // 📅
  fields: [
    {
      fieldName: "embedType",
      displayName: "Embed Type",
      displayNameHint: "Choose what you would like to embed from Luma.",
      default: LumaEmbedType.CALENDAR,
      required: true,
      inputSelector: (props) => (
        <WithMargin>
          <LumaEmbedTypeSelector {...props} />
        </WithMargin>
      ),
      group: "settings",
    },
    {
      fieldName: "calendarId",
      displayName: "Calendar ID",
      displayNameHint:
        "Find your calendar ID by opening https://luma.com/home/calendars and selecting the calendar to embed. The ID appears at the end of the URL (https://luma.com/calendar/manage/[calendarId]).",
      required: false,
      inputSelector: (props) => (
        <WithMargin>
          <TextInput {...props} />
        </WithMargin>
      ),
      group: "settings",
      disabledIf: (settings) => settings.embedType !== LumaEmbedType.CALENDAR,
    },
    {
      fieldName: "eventId",
      displayName: "Event ID",
      displayNameHint:
        "Find your event ID in the URL when managing the event on Luma (https://luma.com/calendar/manage/cal-123?e=[eventId]).",
      required: false,
      inputSelector: (props) => (
        <WithMargin>
          <TextInput {...props} />
        </WithMargin>
      ),
      group: "settings",
      disabledIf: (settings) =>
        settings.embedType === LumaEmbedType.CALENDAR,
    },
    ...defaultStyleFields,
  ],
  size: {
    minHeight: 2,
    maxHeight: 36,
    minWidth: 2,
    maxWidth: 36,
  },
};

const ensureLumaCheckoutScript = () => {
  if (typeof document === "undefined") {
    return;
  }

  const existingScript = document.getElementById(
    LUMA_CHECKOUT_SCRIPT_ID,
  ) as HTMLScriptElement | null;

  if (existingScript) {
    return;
  }

  const script = document.createElement("script");
  script.id = LUMA_CHECKOUT_SCRIPT_ID;
  script.src = LUMA_CHECKOUT_SCRIPT_SRC;
  script.async = true;
  document.head.appendChild(script);
};

const useLumaCheckout = (shouldInitialize: boolean) => {
  useEffect(() => {
    if (!shouldInitialize || typeof window === "undefined") {
      return;
    }

    ensureLumaCheckoutScript();

    const initializeCheckout = () => {
      try {
        window.luma?.initCheckout?.();
      } catch (error) {
        console.error("Failed to initialize Luma checkout", error);
      }
    };

    const script = document.getElementById(
      LUMA_CHECKOUT_SCRIPT_ID,
    ) as HTMLScriptElement | null;

    const handleLoad = () => {
      initializeCheckout();
      if (script) {
        script.dataset.initialized = "true";
      }
    };

    if (script) {
      if (script.dataset.initialized === "true") {
        initializeCheckout();
      } else {
        script.addEventListener("load", handleLoad, { once: true });
      }
    }

    const timeout = window.setTimeout(initializeCheckout, 500);

    return () => {
      if (script) {
        script.removeEventListener("load", handleLoad);
      }
      window.clearTimeout(timeout);
    };
  }, [shouldInitialize]);
};

const LumaFidget: React.FC<FidgetArgs<LumaFidgetSettings>> = ({
  settings,
}) => {
  const embedType = settings.embedType || LumaEmbedType.CALENDAR;
  const calendarId = settings.calendarId?.trim() || "";
  const eventId = settings.eventId?.trim() || "";

  useLumaCheckout(embedType === LumaEmbedType.REGISTRATION_BUTTON && !!eventId);

  if (embedType === LumaEmbedType.CALENDAR) {
    if (!calendarId) {
      return (
        <ErrorWrapper
          icon="🗓️"
          message="Add a Calendar ID to embed your Luma calendar."
        />
      );
    }

    const calendarSrc = `https://luma.com/embed/calendar/${encodeURIComponent(
      calendarId,
    )}/events`;

    return (
      <div className="size-full">
        <iframe
          src={calendarSrc}
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: "1px solid #bfcbda88", borderRadius: "4px" }}
          allowFullScreen
          aria-hidden="false"
          tabIndex={0}
          title="Luma Calendar"
        />
      </div>
    );
  }

  if (embedType === LumaEmbedType.EVENT_PAGE) {
    if (!eventId) {
      return (
        <ErrorWrapper
          icon="📄"
          message="Add an Event ID to embed your Luma event page."
        />
      );
    }

    const eventSrc = `https://luma.com/embed/event/${encodeURIComponent(
      eventId,
    )}/simple`;

    return (
      <div className="size-full">
        <iframe
          src={eventSrc}
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: "1px solid #bfcbda88", borderRadius: "4px" }}
          allow="fullscreen; payment"
          aria-hidden="false"
          tabIndex={0}
          title="Luma Event"
        />
      </div>
    );
  }

  if (embedType === LumaEmbedType.REGISTRATION_BUTTON) {
    if (!eventId) {
      return (
        <ErrorWrapper
          icon="📝"
          message="Add an Event ID to show the Luma registration button."
        />
      );
    }

    const eventUrl = `https://luma.com/event/${encodeURIComponent(eventId)}`;

    return (
      <div className="size-full flex items-center justify-center p-4">
        <a
          href={eventUrl}
          className="luma-checkout--button"
          data-luma-action="checkout"
          data-luma-event-id={eventId}
        >
          Register for Event
        </a>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="ml-2 text-gray-400">
                <FaCircleInfo />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              Luma will open a modal checkout when visitors click this button.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <ErrorWrapper
      icon="❓"
      message="Select a Luma embed option to display content here."
    />
  );
};

export default {
  fidget: LumaFidget,
  properties: lumaConfig,
} as FidgetModule<FidgetArgs<LumaFidgetSettings>>;
