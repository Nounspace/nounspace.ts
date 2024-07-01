import React, { useState } from "react";
import {
  FidgetSettings,
  FidgetProperties,
  FidgetFieldConfig,
} from "@/common/fidgets";
import BackArrowIcon from "../atoms/icons/BackArrow";
import { FaTrashCan, FaTriangleExclamation } from "react-icons/fa6";
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

export type FidgetSettingsEditorProps = {
  fidgetId: string;
  readonly properties: FidgetProperties;
  settings: FidgetSettings;
  onSave: (settings: FidgetSettings) => void;
  unselect: () => void;
  removeFidget: (fidgetId: string) => void;
};

type FidgetSettingsRowProps = {
  field: FidgetFieldConfig;
  value: any;
  onChange: (value: any) => void;
  hide?: boolean;
};

const fieldsByGroup = (fields: FidgetFieldConfig[]) => {
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

const FidgetSettingsRow: React.FC<FidgetSettingsRowProps> = ({
  field,
  value,
  onChange,
  hide,
}) => {
  const InputComponent = field.inputSelector;

  return (
    <div
      className={mergeClasses(
        "text-gray-700 md:flex-col md:items-center m-2",
        hide && "hidden",
      )}
    >
      <div className="md:mb-0 md:w-1/3">
        <label className="capitalize text-sm font-medium text-gray-900 dark:text-white">
          {field.displayName || field.fieldName}
        </label>
      </div>
      <div>
        <InputComponent
          value={value}
          onChange={onChange}
          className="!h-9 !rounded-md font-medium !shadow-none"
        />
      </div>
    </div>
  );
};

const FidgetSettingsGroup: React.FC<{
  fields: FidgetFieldConfig[];
  state: FidgetSettings;
  setState: (state: FidgetSettings) => void;
}> = ({ fields, state, setState }) => {
  return (
    <>
      {fields.map((field, i) => (
        <FidgetSettingsRow
          field={field}
          key={i}
          value={state[field.fieldName]}
          onChange={(val) => {
            setState({
              ...state,
              [field.fieldName]: val,
            });
          }}
          hide={field.disabledIf && field.disabledIf(state)}
        />
      ))}
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
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [state, setState] = useState<FidgetSettings>(settings);

  const _onSave = (e) => {
    e.preventDefault();
    onSave(state);
  };

  const groupedFields = fieldsByGroup(properties.fields);

  return (
    <form onSubmit={_onSave} className="flex-col flex h-full">
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
                fields={groupedFields.settings}
                state={state}
                setState={setState}
              />
            </TabsContent>
            {groupedFields.style.length > 0 && (
              <TabsContent value="style" className={tabContentClasses}>
                <FidgetSettingsGroup
                  fields={groupedFields.style}
                  state={state}
                  setState={setState}
                />
              </TabsContent>
            )}
            {groupedFields.code.length > 0 && (
              <TabsContent value="code" className={tabContentClasses}>
                <FidgetSettingsGroup
                  fields={groupedFields.code}
                  state={state}
                  setState={setState}
                />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>

      <div className="shrink-0 flex flex-col gap-3 pb-8">
        {showConfirmCancel ? (
          // Back Button and Exit Button (shows second)
          <>
            <div className="pt-2 flex gap-2 items-center justify-center">
              <Button
                type="button"
                onClick={() => setShowConfirmCancel(false)}
                size="icon"
                variant="secondary"
              >
                <BackArrowIcon />
              </Button>
              <Button
                type="button"
                onClick={() => {
                  removeFidget(fidgetId);
                }}
                variant="destructive"
                width="auto"
              >
                <FaTriangleExclamation
                  className="h-8l shrink-0"
                  aria-hidden="true"
                />
                <span className="ml-4 mr-4">Delete</span>
              </Button>
            </div>
          </>
        ) : (
          // X Button and Save Button (shows first)
          <div className="flex pt-2 gap-2 flex items-center justify-center">
            <Button
              type="button"
              onClick={() => setShowConfirmCancel(true)}
              size="icon"
              variant="secondary"
            >
              <FaTrashCan className="h-8l shrink-0" aria-hidden="true" />
            </Button>

            <Button type="submit" variant="primary" width="auto">
              <div className="flex items-center">Done</div>
            </Button>
          </div>
        )}
      </div>
    </form>
  );
};

export default FidgetSettingsEditor;
