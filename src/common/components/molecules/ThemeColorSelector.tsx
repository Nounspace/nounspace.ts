import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/common/components/atoms/tooltip";
import ColorSelector from "@/common/components/molecules/ColorSelector";
import { Color } from "@/common/lib/theme";
import React from 'react';
import { FaPaintbrush } from "react-icons/fa6";

interface ThemeColorSelectorProps {
    value: Color;
    onChange: (value: Color) => void;
    themeVariable: string;
    defaultColor: Color;
    colorType: string;
}

const ThemeColorSelector: React.FC<ThemeColorSelectorProps> = ({
    value,
    onChange,
    themeVariable,
    defaultColor,
    colorType,
}) => {
    const isUsingTheme = value?.startsWith?.('var(--');

    if (!onChange) {
        console.error('Missing onChange handler');
        return null;
    }

    return (
        <div className="flex items-center gap-2">
            <ColorSelector value={value} onChange={onChange} />
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div
                            className="cursor-pointer"
                            onClick={() => onChange(isUsingTheme ? defaultColor : themeVariable as Color)}
                        >
                            <FaPaintbrush
                                className={`w-4 h-4 transition-colors ${isUsingTheme ? 'text-blue-500' : 'text-gray-400'
                                    } hover:text-blue-600`}
                            />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <span>Inherit {colorType} from Theme</span>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
};

export default ThemeColorSelector; 