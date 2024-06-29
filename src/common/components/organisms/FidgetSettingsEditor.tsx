import React, { useState } from "react";
import {
  FidgetSettings,
  FidgetProperties,
  FidgetFieldConfig,
} from "@/common/fidgets";
import BackArrowIcon from "../atoms/icons/BackArrow";
import {
  FaFloppyDisk,
  FaTrashCan,
  FaTriangleExclamation,
} from "react-icons/fa6";
import { Button } from "@/common/components/atoms/button";

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
};

const FidgetSettingsRow: React.FC<FidgetSettingsRowProps> = ({
  field,
  value,
  onChange,
}) => {
  const InputComponent = field.inputSelector;

  return (
    <div className="text-gray-700 md:flex-col md:items-center m-2">
      <div className="md:mb-0 md:w-1/3">
        <label className="capitalize text-sm font-medium text-gray-900 dark:text-white">
          {field.fieldName}
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
          {properties.fields.map((field, i) => (
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
            />
          ))}
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
