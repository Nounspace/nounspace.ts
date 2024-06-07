import React, { useState } from "react";
import { FidgetSettings, FidgetEditConfig, FidgetFieldConfig } from "@/common/fidgets";

export type FidgetSettingsEditorProps = {
  readonly editConfig: FidgetEditConfig;
  settings: FidgetSettings;
  onSave: (settings: FidgetSettings) => void;
};

type FidgetSettingsRowProps = {
  field: FidgetFieldConfig;
  value: any;
  onChange: (value: any) => void;
}

const FidgetSettingsRow: React.FC<FidgetSettingsRowProps> = ({ field, value, onChange }) => {
  const InputComponent = field.inputSelector

  return (
    <div className="text-gray-700 md:flex md:items-center">
      <div className="md:mb-0 md:w-1/3">
        <label className="text-sm font-medium text-gray-900 dark:text-white">{ field.fieldName }</label>
      </div>
      <div className="md:w-2/3">
        <InputComponent
          value={value}
          onChange={onChange}
          className="w-full !h-9 !rounded-lg font-medium !shadow-none"
        />
      </div>
    </div>
  )
}

export const FidgetSettingsEditor: React.FC<FidgetSettingsEditorProps> = ({
  editConfig,
  settings,
  onSave,
}) => {
  const [state, setState] = useState<FidgetSettings>(settings)

  const _onSave = (e) => {
    e.preventDefault()
    onSave(state)
  }

  return (
    <form onSubmit={_onSave}>
      <div className='gap-3 flex flex-col'>
        {
          editConfig.fields.map((field, i) => (
            <FidgetSettingsRow
              field={field}
              key={i}
              value={state[field.fieldName]}
              onChange={(val) => {
                setState({
                  ...state,
                  [field.fieldName]: val
                })
              }}
            />
          ))
        }
      </div>
      <div className="text-right border-t pt-3 mt-3 border-gray-100">
        <button type="submit" className="text-white bg-blue-600 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-3 py-1.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Save</button>
      </div>
    </form>
  )
}

export default FidgetSettingsEditor;