import React, { useState } from "react";
import {
  FidgetSettings,
  FidgetProperties,
  FidgetFieldConfig,
} from "@/common/fidgets";
import BackArrowIcon from "../atoms/icons/BackArrow";

export type FidgetSettingsEditorProps = {
  readonly properties: FidgetProperties;
  settings: FidgetSettings;
  onSave: (settings: FidgetSettings) => void;
  unselect: () => void;
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
  properties,
  settings,
  onSave,
  unselect,
}) => {
  const [state, setState] = useState<FidgetSettings>(settings);

  const _onSave = (e) => {
    e.preventDefault();
    onSave(state);
  };

  return (
    <form onSubmit={_onSave}>
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
      <div className="absolute bottom-0 left-0 right-0 px-4 py-3">
        <div className="mt-5 pt-2 border-t border-gray-200 dark:border-gray-700 flex">
          <button
            type="submit"
            className="mx-auto text-white bg-blue-600 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-3 py-1.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            <span className="ml-16 mr-16">Save</span>
          </button>
        </div>
      </div>
    </form>
  );
};

export default FidgetSettingsEditor;
