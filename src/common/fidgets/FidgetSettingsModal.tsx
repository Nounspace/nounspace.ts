import React, { useState } from "react";
import Modal from "@/common/ui/molecules/Modal";
import { FidgetSettings, FidgetEditConfig, FidgetFieldConfig } from "@/common/fidgets";
import FidgetSettingsEditor, { FidgetSettingsEditorProps } from "@/common/ui/organisms/FidgetSettingsEditor";

type FidgetSettingsModalProps = FidgetSettingsEditorProps & {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSave: (newSettings: FidgetSettings) => void;
}

export const FidgetSettingsModal: React.FC<FidgetSettingsModalProps> = ({
  open,
  setOpen,
  onSave,
  editConfig,
  settings,
}) =>  {
  return (
    <Modal
      open={open}
      setOpen={setOpen}
      title="Fidget Settings"
      description="Edit fidget settings"
      overlay={true}
    >
      <FidgetSettingsEditor
        editConfig={editConfig}
        settings={settings}
        onSave={onSave}
      />
    </Modal>
  );
}

export default FidgetSettingsModal;