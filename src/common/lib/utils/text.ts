import * as linkify from "linkifyjs";
import { uniqBy } from "lodash";

export const getUrlsInText = (text: string): { url: string }[] => {
  const urls = linkify.find(text, "url");
  return uniqBy(urls, "href").map((url) => ({ url: url.href }));
};

export const isImageUrl = (url: string): boolean => {
  return url.match(/\.(jpeg|jpg|gif|png)$/) != null;
};
