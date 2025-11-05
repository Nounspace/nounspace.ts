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
import React from "react";
import { defaultStyleFields, ErrorWrapper, WithMargin } from "@/fidgets/helpers";

enum LumaEmbedType {
  CALENDAR = "calendar",
  EVENT_PAGE = "eventPage",
}

const LUMA_EMBED_LABELS: Record<LumaEmbedType, string> = {
  [LumaEmbedType.CALENDAR]: "Calendar",
  [LumaEmbedType.EVENT_PAGE]: "Event Page",
};

enum LumaCalendarDarkModeOption {
  OFF = "off",
  ON = "on",
}

const LUMA_CALENDAR_DARK_MODE_LABELS: Record<LumaCalendarDarkModeOption, string> = {
  [LumaCalendarDarkModeOption.OFF]: "Off",
  [LumaCalendarDarkModeOption.ON]: "On",
};

enum LumaCalendarStyleOption {
  COMPACT = "compact",
  CARDS = "cards",
}

const LUMA_CALENDAR_STYLE_LABELS: Record<LumaCalendarStyleOption, string> = {
  [LumaCalendarStyleOption.COMPACT]: "Compact",
  [LumaCalendarStyleOption.CARDS]: "Cards",
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

type LumaCalendarDarkModeSelectorProps = {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  id?: string;
};

const LumaCalendarDarkModeSelector: React.FC<LumaCalendarDarkModeSelectorProps> = ({
  value = LumaCalendarDarkModeOption.OFF,
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
          <SelectValue placeholder="Select dark mode preference">
            <div className="flex items-center">
              {LUMA_CALENDAR_DARK_MODE_LABELS[
                value as LumaCalendarDarkModeOption
              ] || "Select dark mode preference"}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(LUMA_CALENDAR_DARK_MODE_LABELS).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              <div className="flex items-center">{label}</div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

type LumaCalendarStyleSelectorProps = {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  id?: string;
};

const LumaCalendarStyleSelector: React.FC<LumaCalendarStyleSelectorProps> = ({
  value = LumaCalendarStyleOption.COMPACT,
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
          <SelectValue placeholder="Select calendar style">
            <div className="flex items-center">
              {LUMA_CALENDAR_STYLE_LABELS[
                value as LumaCalendarStyleOption
              ] || "Select calendar style"}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(LUMA_CALENDAR_STYLE_LABELS).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              <div className="flex items-center">{label}</div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export type LumaFidgetSettings = {
  embedType: LumaEmbedType;
  calendarId?: string;
  eventId?: string;
  darkMode?: LumaCalendarDarkModeOption;
  calendarStyle?: LumaCalendarStyleOption;
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
      fieldName: "darkMode",
      displayName: "Dark Mode",
      displayNameHint:
        "Choose whether to render the calendar in light or dark mode.",
      default: LumaCalendarDarkModeOption.OFF,
      required: false,
      inputSelector: (props) => (
        <WithMargin>
          <LumaCalendarDarkModeSelector {...props} />
        </WithMargin>
      ),
      group: "settings",
      disabledIf: (settings) => settings.embedType !== LumaEmbedType.CALENDAR,
    },
    {
      fieldName: "calendarStyle",
      displayName: "Style",
      displayNameHint:
        "Switch between the compact list or card layout for events.",
      default: LumaCalendarStyleOption.COMPACT,
      required: false,
      inputSelector: (props) => (
        <WithMargin>
          <LumaCalendarStyleSelector {...props} />
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
      disabledIf: (settings) => settings.embedType !== LumaEmbedType.EVENT_PAGE,
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

const LumaFidget: React.FC<FidgetArgs<LumaFidgetSettings>> = ({
  settings,
}) => {
  const embedType = settings.embedType || LumaEmbedType.CALENDAR;
  const calendarId = settings.calendarId?.trim() || "";
  const eventId = settings.eventId?.trim() || "";

  if (embedType === LumaEmbedType.CALENDAR) {
    if (!calendarId) {
      return (
        <ErrorWrapper
          icon="🗓️"
          message="Add a Calendar ID to embed your Luma calendar."
        />
      );
    }

    const darkModeSetting =
      settings.darkMode || LumaCalendarDarkModeOption.OFF;
    const calendarStyleSetting =
      settings.calendarStyle || LumaCalendarStyleOption.COMPACT;

    const calendarParams = new URLSearchParams();
    calendarParams.set(
      "lt",
      darkModeSetting === LumaCalendarDarkModeOption.ON ? "dark" : "light",
    );

    if (calendarStyleSetting === LumaCalendarStyleOption.COMPACT) {
      calendarParams.set("compact", "true");
    }

    const calendarParamsString = calendarParams.toString();

    const calendarSrc = `https://luma.com/embed/calendar/${encodeURIComponent(
      calendarId,
    )}/events${calendarParamsString ? `?${calendarParamsString}` : ""}`;

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
