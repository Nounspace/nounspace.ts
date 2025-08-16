import IFrameWidthSlider from "@/common/components/molecules/IframeScaleSlider";
import TextInput from "@/common/components/molecules/TextInput";
import Spinner from "@/common/components/atoms/spinner";
import {
    FidgetArgs,
    FidgetModule,
    FidgetProperties,
    type FidgetSettingsStyle,
} from "@/common/fidgets";
import { useIsMobile } from "@/common/lib/hooks/useIsMobile";
import useSafeUrl from "@/common/lib/hooks/useSafeUrl";
import { isValidUrl } from "@/common/lib/utils/url";
import { validateVideoFile } from "@/common/lib/utils/files";
import { getWalrusDirectVideoUrl, isWalrusUrl, uploadVideoToWalrus } from "@/common/lib/utils/walrus";
import { defaultStyleFields, ErrorWrapper, transformUrl, WithMargin } from "@/fidgets/helpers";
import { VideoCameraIcon } from "@heroicons/react/20/solid";
import React, { useState } from "react";

export type VideoFidgetSettings = {
  url: string;
  size: number;
} & FidgetSettingsStyle;


const frameConfig: FidgetProperties = {
  fidgetName: "Video",
  icon: 0x1f4fa, // 📺
  fields: [
    {
      fieldName: "url",
      displayName: "URL or Upload",
      displayNameHint: "Paste any YouTube/Vimeo URL, or upload a video to Walrus decentralized storage",
      required: true,
      default: "https://www.youtube.com/watch?v=lOzCA7bZG_k", 
      inputSelector: (props) => {
        const [isUploading, setIsUploading] = useState(false);

        const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
          const file = event.target.files?.[0];
          if (!file) return;

          const validation = validateVideoFile(file);
          if (!validation.valid) {
            alert(validation.error);
            return;
          }

          setIsUploading(true);
          try {
            const url = await uploadVideoToWalrus(file);
            props.onChange(url);
          } catch (error) {
            alert('Erro no upload do vídeo. Tente novamente.');
          } finally {
            setIsUploading(false);
          }
        };

        return (
          <WithMargin>
            <div className="space-y-3">
              <TextInput {...props} placeholder="Enter video URL..." />
              <div className="text-sm text-gray-600 text-center">OR</div>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  disabled={isUploading}
                  className="hidden"
                  id="video-upload"
                />
                <label
                  htmlFor="video-upload"
                  className={`px-3 py-2 bg-blue-500 text-white rounded text-sm cursor-pointer hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2 ${
                    isUploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <VideoCameraIcon className="w-4 h-4" />
                  {isUploading ? (
                    <>
                      <Spinner />
                      Fazendo upload...
                    </>
                  ) : (
                    'Upload Vídeo'
                  )}
                </label>
              </div>
            </div>
          </WithMargin>
        );
      },
      group: "settings",
    },
    ...defaultStyleFields,
    {
      fieldName: "size",
      displayName: "Scale",
      displayNameHint: "Drag the slider to adjust the image size.",
      required: false,
      inputSelector: (props) => (
        <WithMargin>
          <IFrameWidthSlider {...props} />
        </WithMargin>
      ),
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

const VideoFidget: React.FC<FidgetArgs<VideoFidgetSettings>> = ({
  settings: { url, size = 1 },
}) => {
  const isMobile = useIsMobile();
  
  const isValid = isValidUrl(url);
  const sanitizedUrl = useSafeUrl(url);
  const isWalrusVideo = isWalrusUrl(url);

  if (!url) {
    return (
      <ErrorWrapper
        icon="➕"
        message="Upload a video or provide a YouTube/Vimeo URL to display here."
      />
    );
  }

  if (!isValid) {
    return <ErrorWrapper icon="❌" message={`This URL is invalid (${url}).`} />;
  }

  const scaleValue = size;

  // For Walrus videos, render directly as video element
  if (isWalrusVideo) {
    const directVideoUrl = getWalrusDirectVideoUrl(url);
    return (
      <div style={{ 
        overflow: "hidden", 
        width: "100%", 
        height: "100%",
        position: "relative"
      }}>
        <video
          src={directVideoUrl}
          controls
          style={{
            transform: isMobile ? 'none' : `scale(${scaleValue})`,
            transformOrigin: "0 0",
            width: isMobile ? "100%" : `${100 / scaleValue}%`,
            height: isMobile ? "100%" : `${100 / scaleValue}%`,
            position: "relative",
            top: 0,
            left: 0,
          }}
          className="size-full object-contain"
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  // For YouTube/Vimeo, use iframe as before
  const transformedUrl = transformUrl(sanitizedUrl || "");
  
  if (!transformedUrl) {
    return (
      <ErrorWrapper
        icon="🔒"
        message={`This URL cannot be displayed due to security restrictions (${url}).`}
      />
    );
  }

  return (
    <div style={{ 
      overflow: "hidden", 
      width: "100%", 
      height: "100%",
      position: "relative"
    }}>
      <iframe
        src={transformedUrl}
        title="IFrame Fidget"
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        allowFullScreen
        style={{
          transform: isMobile ? 'none' : `scale(${scaleValue})`,
          transformOrigin: "0 0",
          width: isMobile ? "100%" : `${100 / scaleValue}%`,
          height: isMobile ? "100%" : `${100 / scaleValue}%`,
          // Removed absolute positioning which was causing issues
          position: "relative",
          top: 0,
          left: 0,
          border: "none"
        }}
        className="size-full"
      />
    </div>
  );
};

export default {
  fidget: VideoFidget,
  properties: frameConfig,
} as FidgetModule<FidgetArgs<VideoFidgetSettings>>;