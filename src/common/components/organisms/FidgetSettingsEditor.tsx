import React, { useEffect, useMemo, useState } from "react";
import {
  FidgetSettings,
  FidgetProperties,
  FidgetFieldConfig,
} from "@/common/fidgets";
import BackArrowIcon from "../atoms/icons/BackArrow";
import { FaTrashCan } from "react-icons/fa6";
import { Button } from "@/common/components/atoms/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/common/components/atoms/tabs";
import {
  tabListClasses,
  tabTriggerClasses,
  tabContentClasses,
} from "@/common/lib/theme/helpers";
import { mergeClasses } from "@/common/lib/utils/mergeClasses";
import {
  analytics,
  AnalyticsEvent,
} from "@/common/providers/AnalyticsProvider";

export type FidgetSettingsEditorProps = {
  fidgetId: string;
  readonly properties: FidgetProperties;
  settings: FidgetSettings;
  onSave: (settings: FidgetSettings, shouldUnselect?: boolean) => void;
  unselect: () => void;
  removeFidget: (fidgetId: string) => void;
};

type FidgetSettingsRowProps = {
  field: FidgetFieldConfig;
  value: any;
  onChange: (value: any) => void;
  hide?: boolean;
  id: string;
};

export const fieldsByGroup = (fields: FidgetFieldConfig[]) => {
  return fields.reduce(
    (acc, field) => {
      if (field.group) {
        acc[field.group].push(field);
      } else {
        acc["settings"].push(field);
      }
      return acc;
    },
    { settings: [], style: [], code: [] } as Record<
      string,
      FidgetFieldConfig[]
    >,
  );
};

export const FidgetSettingsRow: React.FC<FidgetSettingsRowProps> = ({
  field,
  value,
  onChange,
  hide,
  id,
}) => {
  const InputComponent = field.inputSelector;

  return (
    <div
      className={mergeClasses(
        "text-gray-700 md:flex-col md:items-center",
        hide && "hidden",
      )}
      id={id}
    >
      <div className="md:mb-0 md:w-2/3">
        <label className="capitalize text-sm font-medium text-gray-900 dark:text-white">
          {field.displayName || field.fieldName}
        </label>
      </div>
      <div>
        <InputComponent
          id={id}
          value={value}
          onChange={onChange}
          className="!h-9 !rounded-md font-medium !shadow-none"
        />
      </div>
    </div>
  );
};

export const FidgetSettingsGroup: React.FC<{
  fidgetId: string;
  fields: FidgetFieldConfig[];
  state: FidgetSettings;
  setState: (state: FidgetSettings) => void;
  onSave: (state: FidgetSettings) => void;
}> = ({ fields, state, setState, onSave, fidgetId }) => {
  return (
    <>
      {fields.map((field, i) => {
        const value =
          (field.fieldName in state && state[field.fieldName]) || "";
        return (
          <FidgetSettingsRow
            field={field}
            key={`${fidgetId}-${i}-${field.fieldName}`}
            id={`${fidgetId}-${i}-${field.fieldName}`}
            value={value}
            onChange={(val) => {
              const data = {
                ...state,
                [field.fieldName]: val,
              };

              setState(data);
              onSave(data);
            }}
            hide={field.disabledIf && field.disabledIf(state)}
          />
        );
      })}
    </>
  );
};

export const FidgetSettingsEditor: React.FC<FidgetSettingsEditorProps> = ({
  fidgetId,
  properties,
  settings,
  onSave,
  unselect,
  removeFidget,
}) => {
  const [state, setState] = useState<FidgetSettings>(settings);

  useEffect(() => {
    setState(settings);
  }, [settings]);

  const _onSave = (e) => {
    e.preventDefault();
    onSave(state, true);
    analytics.track(AnalyticsEvent.EDIT_FIDGET, {
      fidgetType: properties.fidgetName,
    });
  };

  // 'keypress' event misbehaves on mobile so we track 'Enter' key via 'keydown' event
  // const onKeyDown = (event: React.KeyboardEvent<HTMLFormElement>): void => {
  //   if (event.key === "Enter") {
  //     event.preventDefault();
  //     event.stopPropagation();
  //     onSave(state);
  //   }
  // };

  const groupedFields = useMemo(
    () => fieldsByGroup(properties.fields),
    [properties.fields],
  );

  return (
    <form
      onSubmit={_onSave}
      className="flex-col flex h-full"
      // onKeyDown={onKeyDown}
    >
      <div className="h-full overflow-auto">
        <div className="flex pb-4 m-2">
          <button onClick={unselect} className="my-auto">
            <BackArrowIcon />
          </button>
          <h1 className="capitalize text-lg pl-4">
            Edit {properties.fidgetName} Fidget
          </h1>
        </div>
        <div className="gap-3 flex flex-col">
          <Tabs defaultValue="settings">
            <TabsList className={tabListClasses}>
              <TabsTrigger value="settings" className={tabTriggerClasses}>
                Settings
              </TabsTrigger>
              {groupedFields.style.length > 0 && (
                <TabsTrigger value="style" className={tabTriggerClasses}>
                  Style
                </TabsTrigger>
              )}
              {groupedFields.code.length > 0 && (
                <TabsTrigger value="code" className={tabTriggerClasses}>
                  Code
                </TabsTrigger>
              )}
            </TabsList>
            <TabsContent value="settings" className={tabContentClasses}>
              <FidgetSettingsGroup
                fidgetId={fidgetId}
                fields={groupedFields.settings}
                state={state}
                setState={setState}
                onSave={onSave}
              />
            </TabsContent>
            {groupedFields.style.length > 0 && (
              <TabsContent value="style" className={tabContentClasses}>
                <FidgetSettingsGroup
                  fidgetId={fidgetId}
                  fields={groupedFields.style}
                  state={state}
                  setState={setState}
                  onSave={onSave}
                />
              </TabsContent>
            )}
            {groupedFields.code.length > 0 && (
              <TabsContent value="code" className={tabContentClasses}>
                <FidgetSettingsGroup
                  fidgetId={fidgetId}
                  fields={groupedFields.code}
                  state={state}
                  setState={setState}
                  onSave={onSave}
                />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>

      <div className="shrink-0 flex flex-col gap-3 pb-8">
        <div className="pt-2 gap-2 flex items-center justify-center">
          <Button
            type="button"
            onClick={() => removeFidget(fidgetId)}
            size="icon"
            variant="secondary"
          >
            <FaTrashCan className="h-8l shrink-0" aria-hidden="true" />
          </Button>

          <Button type="submit" variant="primary" width="auto">
            <div className="flex items-center">Done</div>
          </Button>
        </div>
      </div>
    </form>
  );
};

export default FidgetSettingsEditor;
