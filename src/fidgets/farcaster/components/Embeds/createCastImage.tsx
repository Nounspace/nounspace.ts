import React, { useState, useCallback } from "react";
import { PhotoIcon } from "@heroicons/react/24/solid";
import ExpandOnClick from "@/common/components/molecules/ExpandOnClick";
import { mergeClasses } from "@/common/lib/utils/mergeClasses";

const LoadingPlaceholder = () => {
    return (
        <div className="h-60 w-full flex items-center justify-center py-10 px-20 animate-pulse bg-primary/10">
            <PhotoIcon className="h-12 w-12 text-foreground/20" />
        </div>
    );
};

const CreateCastImage = ({ url }: { url: string }) => {
    const [isLoading, setIsLoading] = useState(true);

    const onLoad = useCallback(() => {
        setIsLoading(false);
    }, []);

    const onError = useCallback(() => {
        console.debug("error loading image", url);
    }, []);

    return (
        <ExpandOnClick>
            <div className="m-0.5">
            <img
                className={mergeClasses(
                    "object-cover size-full max-h-[500px]",
                    isLoading && "hidden",
                )}
                src={url}
                onLoad={onLoad}
                onError={onError}
                referrerPolicy="no-referrer"
                alt=""
            />
            {isLoading && <LoadingPlaceholder />}
            </div>
        </ExpandOnClick>
    );
};

export default CreateCastImage;
