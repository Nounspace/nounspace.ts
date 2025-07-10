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
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={handleBackdropClick}
            onKeyDown={handleKeyDown}
            role="dialog"
            aria-modal="true"
            aria-labelledby="install-modal-title"
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />

            {/* Modal Content */}
            <div
                className={mergeClasses(
                    "relative w-full max-w-sm mx-auto rounded-lg shadow-xl",
                    "transform transition-all duration-200",
                    "animate-in fade-in-0 zoom-in-95"
                )}
                style={{
                    backgroundColor: theme?.properties?.background || "white",
                    borderColor: theme?.properties?.fidgetBorderColor || "rgb(229 231 235)",
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2
                        id="install-modal-title"
                        className="text-lg font-semibold"
                        style={{ color: theme?.properties?.headingsFontColor || "#000000" }}
                    >
                        📱 Install App
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Close modal"
                    >
                        <svg
                            className="w-5 h-5"
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
                <div className="p-4 space-y-4">
                    {isIOS ? (
                        <>
                            <p
                                className="text-sm"
                                style={{ color: theme?.properties?.fontColor || "#374151" }}
                            >
                                To install this app on your iOS device:
                            </p>
                            <ol className="space-y-3 text-sm">
                                <li className="flex items-start space-x-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs">
                                        1
                                    </span>
                                    <div>
                                        <p style={{ color: theme?.properties?.fontColor || "#374151" }}>
                                            Tap the <strong>Share button</strong> in Safari
                                        </p>
                                        <div className="mt-1 flex items-center space-x-1 text-xs text-gray-500">
                                            <span>Look for:</span>
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
                                            </svg>
                                        </div>
                                    </div>
                                </li>
                                <li className="flex items-start space-x-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs">
                                        2
                                    </span>
                                    <div>
                                        <p style={{ color: theme?.properties?.fontColor || "#374151" }}>
                                            Select <strong>&quot;Add to Home Screen&quot;</strong>
                                        </p>
                                        <div className="mt-1 flex items-center space-x-1 text-xs text-gray-500">
                                            <span>Look for:</span>
                                            <span>➕</span>
                                        </div>
                                    </div>
                                </li>
                                <li className="flex items-start space-x-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs">
                                        3
                                    </span>
                                    <p style={{ color: theme?.properties?.fontColor || "#374151" }}>
                                        Tap <strong>&quot;Add&quot;</strong> to confirm
                                    </p>
                                </li>
                            </ol>
                        </>
                    ) : (
                        <>
                            <p
                                className="text-sm"
                                style={{ color: theme?.properties?.fontColor || "#374151" }}
                            >
                                Install prompt not ready yet. This can happen when:
                            </p>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-start space-x-2">
                                    <span className="text-red-500">•</span>
                                    <span style={{ color: theme?.properties?.fontColor || "#374151" }}>
                                        The app doesn&apos;t meet PWA criteria
                                    </span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <span className="text-red-500">•</span>
                                    <span style={{ color: theme?.properties?.fontColor || "#374151" }}>
                                        Chrome hasn&apos;t shown the prompt yet
                                    </span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <span className="text-red-500">•</span>
                                    <span style={{ color: theme?.properties?.fontColor || "#374151" }}>
                                        You&apos;re in an unsupported browser
                                    </span>
                                </li>
                            </ul>
                            <p
                                className="text-sm font-medium"
                                style={{ color: theme?.properties?.fontColor || "#374151" }}
                            >
                                Try refreshing the page or waiting a few seconds.
                            </p>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end p-4 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className={mergeClasses(
                            "px-4 py-2 rounded-md text-sm font-medium",
                            "transition-colors duration-200",
                            "focus:outline-none focus:ring-2 focus:ring-offset-2"
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
