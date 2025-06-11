import React, { useEffect, useState } from "react";
import TextInput from "@/common/components/molecules/TextInput";
import {
    FidgetArgs,
    FidgetProperties,
    FidgetModule,
    type FidgetSettingsStyle,
} from "@/common/fidgets";
import { isValidUrl } from "@/common/lib/utils/url";
import { defaultStyleFields } from "@/fidgets/helpers";
import IFrameWidthSlider from "@/common/components/molecules/IframeScaleSlider";
import { ErrorWrapper } from "@/fidgets/helpers";

export type IframelyFidgetSettings = {
    url: string;
    size: number;
} & FidgetSettingsStyle;

const frameConfig: FidgetProperties = {
    fidgetName: "Socials Embed",
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

const Iframely: React.FC<FidgetArgs<IframelyFidgetSettings>> = ({
    settings: { url, size = 1 },
}) => {
    const [embedHtml, setEmbedHtml] = useState<string | null>(null);
    const isValid = isValidUrl(url);

    useEffect(() => {
        if (!isValid) return;

        fetch(`/api/iframely?url=${encodeURIComponent(url)}`)
            .then((response) => response.json())
            .then((data) => {
                if (data.html) {
                    setEmbedHtml(data.html);
                } else {
                    setEmbedHtml(null);
                }
            })
            .catch(() => setEmbedHtml(null));
    }, [url, isValid]);

    if (!url) {
        return (
            <ErrorWrapper icon="➕" message="Provide a URL to display here." />
        );
    }

    if (!isValid) {
        return (
            <ErrorWrapper
                icon="❌"
                message={`This URL is invalid (${url}).`}
            />
        );
    }

    if (!embedHtml) {
        return (
            <ErrorWrapper
                icon="🔒"
                message={`Loading (${url}).`}
            />
        );
    }

    return (
        <div
            dangerouslySetInnerHTML={{ __html: embedHtml }}
        />
    );
};

export default {
    fidget: Iframely,
    properties: frameConfig,
} as FidgetModule<FidgetArgs<IframelyFidgetSettings>>;
