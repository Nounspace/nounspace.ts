import React from "react";
import TextInput from "@/common/components/molecules/TextInput";
import {
    FidgetArgs,
    FidgetProperties,
    FidgetModule,
    type FidgetSettingsStyle,
} from "@/common/fidgets";
import { isValidUrl } from "@/common/lib/utils/url";
import useSafeUrl from "@/common/lib/hooks/useSafeUrl";
import { defaultStyleFields } from "@/fidgets/helpers";
import IFrameWidthSlider from "@/common/components/molecules/IframeScaleSlider";
import { transformUrl, ErrorWrapper } from "@/fidgets/helpers";
import FrameV2Fidget from "./framev2";
export type FramesV2FidgetSettings = {
    url: string;
    size: number;
} & FidgetSettingsStyle;

const DISALLOW_URL_PATTERNS = [
    /javascript:/i,
    /^data:/i,
    /<script/i,
    /%3Cscript/i,
];

const frameConfig: FidgetProperties = {
    fidgetName: "FRAMESV2",
    icon: 0x1f310, // 🌐
    fields: [
        {
            fieldName: "url",
            required: true,
            inputSelector: TextInput,
            group: "settings",
        },
        ...defaultStyleFields,
        {
            fieldName: "size",
            required: false,
            inputSelector: IFrameWidthSlider,
            group: "style",
        },
    ],
    size: {
        minHeight: 2,
        maxHeight: 36,
        minWidth: 2,
        maxWidth: 36,
    },
};

const FramesV2: React.FC<FidgetArgs<FramesV2FidgetSettings>> = ({
    settings: { url, size = 1 },
}) => {
    const isValid = isValidUrl(url);
    const sanitizedUrl = useSafeUrl(url, DISALLOW_URL_PATTERNS);
    const transformedUrl = transformUrl(sanitizedUrl || "");
    if (!url) {
        return <ErrorWrapper icon="➕" message="Provide a URL to display here." />;
    }

    if (!isValid) {
        return <ErrorWrapper icon="❌" message={`This URL is invalid (${url}).`} />;
    }

    if (!transformedUrl) {
        return (
            <ErrorWrapper
                icon="🔒"
                message={`This URL cannot be displayed due to security restrictions (${url}).`}
            />
        );
    }

    const scaleValue = size;

    return (
        <div style={{ overflow: "hidden", width: "100%", height: "100%" }}>
            <FrameV2Fidget searchParams={{
                url: url,
                specification: "farcaster_v2",
                actions: "true"
            }} />

        </div>
    );
};

export default {
    fidget: FramesV2,
    properties: frameConfig,
} as FidgetModule<FidgetArgs<FramesV2FidgetSettings>>;
