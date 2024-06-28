export const isImageUrl = (url: string) => {
  if (!url) {
    return false;
  }

  return (
    url.match(/\.(jpeg|jpg|gif|png)$/) != null || url.includes("imagedelivery")
  );
};

export const isWebUrl = (url: string) => {
  if (!url) {
    return false;
  }

  return url.match(/^(http|https):\/\//) != null;
};
