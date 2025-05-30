import { Button } from "@/common/components/atoms/button";
import { Loader2 } from "lucide-react";
import React, { useRef, useState } from "react";

declare global {
  interface Window {
    handleGalleryImageUpload?: (url: string) => void;
  }
}

const ImageIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
    data-slot="icon"
    className="mr-1 w-5 h-5"
  >
    <path
      fillRule="evenodd"
      d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
      clipRule="evenodd"
    />
  </svg>
);

interface ImgBBUploaderProps {
  onImageUploaded: (url: string | null) => void;
  showSuccessMessage?: boolean;
  initialImage?: string | null;
}

const ImgBBUploader: React.FC<ImgBBUploaderProps> = ({ 
  onImageUploaded, 
  showSuccessMessage = true,
  initialImage = null
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(initialImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imgBBApiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB");
      return;
    }

    if (!imgBBApiKey) {
      setError("ImgBB API key is not configured");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgBBApiKey}`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        const imageUrl = data.data.display_url || data.data.url;
        setUploadedUrl(imageUrl);
        onImageUploaded(imageUrl);

        if (window.handleGalleryImageUpload) {
          window.handleGalleryImageUpload(imageUrl);
        }
      } else {
        setError("Failed to upload image: " + (data.error?.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      setError("Error uploading image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    fileInputRef.current?.click();
  };

  return (
    <div
      className="flex flex-col gap-4"
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <input
          ref={fileInputRef}
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          variant="outline"
          onClick={handleButtonClick}
          className="w-full"
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <ImageIcon />
              Add
            </>
          )}
        </Button>
       {error === "File size exceeds 5MB" && (
        <p className="text-red-500 text-sm whitespace-nowrap">{error}</p>
      )}
      </div>

      {uploadedUrl && showSuccessMessage && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-green-500">Image uploaded successfully!</p>
        </div>
      )}
    </div>
  );
};

export default ImgBBUploader; 