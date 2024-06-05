import React, { useState } from "react";
import { FidgetSettings, FidgetEditConfig, FidgetFieldConfig } from "@/common/fidgets";
import { reduce } from "lodash";

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
    <div className="mb-5">
      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{ field.fieldName }</label>
      {
        <InputComponent
          value={value}
          onChange={onChange}
          className="h-9"
        />
      }
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
    <form className="" onSubmit={_onSave}>
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
      <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Save</button>
    </form>
  )
}

export default FidgetSettingsEditor;