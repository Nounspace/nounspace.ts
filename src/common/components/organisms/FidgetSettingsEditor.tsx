import { Button } from "@/common/components/atoms/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/common/components/atoms/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/common/components/atoms/tooltip";
import {
  FidgetFieldConfig,
  FidgetProperties,
  FidgetSettings,
} from "@/common/fidgets";
import {
  tabContentClasses,
  tabListClasses,
  tabTriggerClasses,
} from "@/common/lib/theme/helpers";
import { mergeClasses } from "@/common/lib/utils/mergeClasses";
import React, { useEffect, useMemo, useState } from "react";
import { FaCircleInfo, FaTrashCan } from "react-icons/fa6";
import BackArrowIcon from "../atoms/icons/BackArrow";
import { AnalyticsEvent } from "@/common/constants/analyticsEvents";
import { analytics } from "@/common/providers/AnalyticsProvider";

export type FidgetSettingsEditorProps = {
  fidgetId: string;
  readonly properties: FidgetProperties;
  settings: FidgetSettings;
  onSave: (settings: FidgetSettings, shouldUnselect?: boolean) => void;
  unselect: () => void;
  removeFidget: (fidgetId: string) => void;
  showRemoveButton?: boolean;
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
  const isValid = !field.validator || field.validator(value);

  return (
    <div
      className={mergeClasses(
        "text-gray-700 md:flex-col md:items-center",
        hide && "hidden",
        !isValid && "text-red-500"
      )}
      id={id}
    >
      <div className="md:mb-0 md:w-full flex items-center justify-between gap-2">
        <label className="text-sm font-medium text-gray-900 dark:text-white">
          {field.displayName || field.fieldName}
        </label>
        {field.displayNameHint && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center">
                  <FaCircleInfo color="#D1D5DB" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="max-w-44">{field.displayNameHint}</div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div>
        <InputComponent
          id={id}
          value={value}
          onChange={onChange}
          className={mergeClasses(
            "!h-9 !rounded-md font-medium !shadow-none",
            !isValid && "border-red-500"
          )}
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
  }, [settings, fidgetId]);

  const _onSave = (e) => {
    e.preventDefault();
    onSave(state, true);
    analytics.track(AnalyticsEvent.EDIT_FIDGET, {
      fidgetType: properties.fidgetName,
    });
  };

  const groupedFields = useMemo(
    () => fieldsByGroup(properties.fields),
    [properties.fields],
  );

  return (
    <form
      key={fidgetId}
      onSubmit={_onSave}
      className="flex-col flex h-full"
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
          {showRemoveButton !== false && (
            <Button
              type="button"
              onClick={() => removeFidget(fidgetId)}
              size="icon"
              variant="secondary"
            >
              <FaTrashCan className="h-8l shrink-0" aria-hidden="true" />
            </Button>
          )}

          <Button type="submit" variant="primary" width="auto">
            <div className="flex items-center">Done</div>
          </Button>
        </div>
      </div>
    </form>
  );
};

export default FidgetSettingsEditor;
