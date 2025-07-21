import React from 'react';
import { mergeClasses } from '@/common/lib/utils/mergeClasses';
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
    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    return (
        <div
            className="absolute inset-0 flex items-center justify-center p-2 z-10"
            onClick={handleBackdropClick}
            onKeyDown={handleKeyDown}
            role="dialog"
            aria-modal="true"
            aria-labelledby="install-modal-title"
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black bg-opacity-40" />

            {/* Modal Content */}
            <div
                className={mergeClasses(
                    "relative w-full max-w-[280px] mx-auto rounded-lg shadow-lg border",
                    "transform transition-all duration-200",
                    "scale-100 opacity-100"
                )}
                style={{
                    backgroundColor: theme?.properties?.background || "white",
                    borderColor: theme?.properties?.fidgetBorderColor || "rgb(229 231 235)",
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-2 border-b" style={{ borderColor: theme?.properties?.fidgetBorderColor || "rgb(229 231 235)" }}>
                    <h2
                        id="install-modal-title"
                        className="text-sm font-semibold"
                        style={{ color: theme?.properties?.headingsFontColor || "#000000" }}
                    >
                        📱 Install App
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:opacity-70 transition-opacity"
                        aria-label="Close modal"
                        style={{ color: theme?.properties?.fontColor || "#374151" }}
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-2 space-y-2">
                    {isIOS ? (
                        <>
                            <p
                                className="text-[10px] leading-tight"
                                style={{ color: theme?.properties?.fontColor || "#374151" }}
                            >
                                To install this app:
                            </p>
                            <ol className="space-y-1 text-[10px] leading-tight">
                                <li className="flex items-start space-x-1">
                                    <span className="flex-shrink-0 w-3 h-3 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-[8px] mt-0.5">
                                        1
                                    </span>
                                    <div className="flex-1">
                                        <p style={{ color: theme?.properties?.fontColor || "#374151" }}>
                                            Tap <strong>Share</strong> in Safari
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start space-x-1">
                                    <span className="flex-shrink-0 w-3 h-3 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-[8px] mt-0.5">
                                        2
                                    </span>
                                    <div className="flex-1">
                                        <p style={{ color: theme?.properties?.fontColor || "#374151" }}>
                                            Select <strong>&quot;Add to Home Screen&quot;</strong>
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start space-x-1">
                                    <span className="flex-shrink-0 w-3 h-3 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-[8px] mt-0.5">
                                        3
                                    </span>
                                    <div className="flex-1">
                                        <p style={{ color: theme?.properties?.fontColor || "#374151" }}>
                                            Tap <strong>&quot;Add&quot;</strong>
                                        </p>
                                    </div>
                                </li>
                            </ol>
                        </>
                    ) : (
                        <>
                            <p
                                className="text-[10px] leading-tight"
                                style={{ color: theme?.properties?.fontColor || "#374151" }}
                            >
                                Install not ready yet. This can happen when:
                            </p>
                            <ul className="space-y-1 text-[10px] leading-tight">
                                <li className="flex items-start space-x-1">
                                    <span className="text-red-500 text-[8px] mt-0.5">•</span>
                                    <span style={{ color: theme?.properties?.fontColor || "#374151" }}>
                                        App doesn&apos;t meet PWA criteria
                                    </span>
                                </li>
                                <li className="flex items-start space-x-1">
                                    <span className="text-red-500 text-[8px] mt-0.5">•</span>
                                    <span style={{ color: theme?.properties?.fontColor || "#374151" }}>
                                        Browser hasn&apos;t shown prompt yet
                                    </span>
                                </li>
                                <li className="flex items-start space-x-1">
                                    <span className="text-red-500 text-[8px] mt-0.5">•</span>
                                    <span style={{ color: theme?.properties?.fontColor || "#374151" }}>
                                        Unsupported browser
                                    </span>
                                </li>
                            </ul>
                            <p
                                className="text-[10px] font-medium leading-tight"
                                style={{ color: theme?.properties?.fontColor || "#374151" }}
                            >
                                Try refreshing or wait a few seconds.
                            </p>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end p-2 border-t" style={{ borderColor: theme?.properties?.fidgetBorderColor || "rgb(229 231 235)" }}>
                    <button
                        onClick={onClose}
                        className={mergeClasses(
                            "px-2 py-1 rounded text-[10px] font-medium",
                            "transition-opacity duration-200",
                            "focus:outline-none hover:opacity-80"
                        )}
                        style={{
                            backgroundColor: theme?.properties?.headingsFontColor || "#3B82F6",
                            color: theme?.properties?.background || "white",
                        }}
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstallInstructionsModal;
