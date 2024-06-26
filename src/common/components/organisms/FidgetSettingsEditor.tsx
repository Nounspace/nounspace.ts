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
      <div className="md:w-2/3">
        <InputComponent
          value={value}
          onChange={onChange}
          className="w-full !h-9 !rounded-lg font-medium !shadow-none"
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
      <div className="h-5/6">
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

      <div className="h-1/6">
        {showConfirmCancel ? (
          // Back Button and Exit Button (shows second)
          <>
            <div className="pt-2 flex items-center justify-center">
              <button
                onClick={() => setShowConfirmCancel(false)}
                className="flex rounded-xl p-2 px-auto bg-[#F3F4F6] hover:bg-sky-100 text-[#1C64F2]"
              >
                <div className="flex items-center">
                  <BackArrowIcon />
                </div>
              </button>
              <button
                onClick={() => {
                  removeFidget(fidgetId);
                }}
                className="ml-4 flex rounded-xl p-2 px-auto bg-[#F3F4F6] hover:bg-red-100 text-[#1C64F2] font-semibold"
              >
                <div className="ml-4 flex items-center">
                  <FaTriangleExclamation
                    className="h-8l shrink-0"
                    aria-hidden="true"
                  />
                  <span className="ml-4 mr-4">Delete</span>
                </div>
              </button>
            </div>
            <p className="w-full text-center text-xs pt-4 pl-16 pr-16">
              This cannot be undone.
            </p>
          </>
        ) : (
          // X Button and Save Button (shows first)
          <div className="pt-2 flex items-center justify-center">
            <button
              onClick={() => setShowConfirmCancel(true)}
              className="flex rounded-xl p-2 px-auto bg-[#F3F4F6] hover:bg-red-100 text-[#1C64F2]"
            >
              <div className="flex items-center p-1">
                <FaTrashCan className="h-8l shrink-0" aria-hidden="true" />
              </div>
            </button>

            <button
              type="submit"
              className="ml-4 flex rounded-xl p-2 px-auto bg-[#F3F4F6] hover:bg-sky-100 text-[#1C64F2] font-semibold"
            >
              <div className="ml-4 flex items-center">
                <FaFloppyDisk className="h-8l shrink-0" aria-hidden="true" />
                <span className="ml-4 mr-4">Save</span>
              </div>
            </button>
          </div>
        )}
      </div>
    </form>
  );
};

export default FidgetSettingsEditor;
