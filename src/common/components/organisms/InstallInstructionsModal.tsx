import React from 'react';
import Modal from '@/common/components/molecules/Modal';
import { UserTheme } from '@/common/lib/theme';

interface InstallInstructionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    theme: UserTheme;
    isIOS?: boolean;
}

/**
 * Modal component for displaying PWA installation instructions
 * Organism-level component that combines multiple atoms/molecules
 */
export const InstallInstructionsModal: React.FC<InstallInstructionsModalProps> = ({
    isOpen,
    onClose,
    theme,
    isIOS = false
}) => {
    return (
        <Modal
            open={isOpen}
            setOpen={onClose}
            title="📱 Install App"
            showClose={true}
            overlay={true}
        >
            <div 
                className="space-y-4"
                style={{ color: theme?.properties?.fontColor || "#374151" }}
            >
                {isIOS ? (
                    <>
                        <p className="text-sm leading-relaxed">
                            To install this app on your device:
                        </p>
                        <ol className="text-sm space-y-2 ml-4 list-decimal">
                            <li>Tap the Share button (square with arrow up)</li>
                            <li>Scroll down and select &quot;Add to Home Screen&quot;</li>
                            <li>Tap &quot;Add&quot; to confirm</li>
                        </ol>
                        <p className="text-xs text-gray-500 mt-4">
                            The app will appear on your home screen like any other app.
                        </p>
                    </>
                ) : (
                    <>
                        <p className="text-sm leading-relaxed">
                            The install prompt is not ready yet. This usually happens when:
                        </p>
                        <ul className="text-sm space-y-1 ml-4 list-disc">
                            <li>The page needs to be refreshed</li>
                            <li>Your browser doesn&apos;t support PWA installation</li>
                            <li>The app is already installed</li>
                        </ul>
                        <p className="text-sm mt-4">
                            Try refreshing the page and clicking the install button again.
                        </p>
                    </>
                )}
                
                <div className="flex justify-end pt-4 border-t" style={{ borderColor: theme?.properties?.fidgetBorderColor || "rgb(229 231 235)" }}>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-md text-sm font-medium transition-opacity duration-200 focus:outline-none hover:opacity-80"
                        style={{
                            backgroundColor: theme?.properties?.headingsFontColor || "#3B82F6",
                            color: theme?.properties?.background || "white",
                        }}
                    >
                        Got it
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default InstallInstructionsModal;
