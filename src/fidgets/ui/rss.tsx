import React, { useEffect, useState } from "react";
import RSSParser from "rss-parser";
import TextInput from "@/common/components/molecules/TextInput";
import CSSInput from "@/common/components/molecules/CSSInput";
import ColorSelector from "@/common/components/molecules/ColorSelector";
import FontSelector from "@/common/components/molecules/FontSelector";
import { FidgetArgs, FidgetProperties, FidgetModule } from "@/common/fidgets";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { defaultStyleFields } from "../helpers";
import { FidgetSettingsStyle } from "@/common/fidgets";
import {
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/common/components/atoms/card";
import { MarkdownRenderers } from "@/common/lib/utils/markdownRenderers";

export type TextFidgetSettings = {
  title?: string;
  rssUrl: string;
} & FidgetSettingsStyle;

export const textConfig: FidgetProperties = {
  fidgetName: "Rss",
  icon: 0x1f4c4,
  fields: [
    {
      fieldName: "title",
      default: "RSS Fidget",
      required: false,
      inputSelector: TextInput,
      group: "settings",
    },
    {
      fieldName: "rssUrl",
      default: "https://www.reddit.com/.rss",
      required: true,
      inputSelector: TextInput,
      group: "settings",
    },
    {
      fieldName: "fontFamily",
      default: "var(--user-theme-font)",
      required: false,
      inputSelector: FontSelector,
      group: "style",
    },
    {
      fieldName: "fontColor",
      default: "var(--user-theme-font-color)",
      required: false,
      inputSelector: ColorSelector,
      group: "style",
    },
    {
      fieldName: "headingsFontFamily",
      default: "var(--user-theme-headings-font)",
      required: false,
      inputSelector: FontSelector,
      group: "style",
    },
    {
      fieldName: "headingsFontColor",
      default: "var(--user-theme-headings-font-color)",
      required: false,
      inputSelector: ColorSelector,
      group: "style",
    },
    ...defaultStyleFields,
    {
      fieldName: "css",
      default: "",
      required: false,
      inputSelector: CSSInput,
      group: "code",
    },
  ],
  size: {
    minHeight: 2,
    maxHeight: 36,
    minWidth: 3,
    maxWidth: 36,
  },
};

export const Rss: React.FC<FidgetArgs<TextFidgetSettings>> = ({ settings }) => {
  const [rssItems, setRssItems] = useState<any[]>([]);
  const [rssFeed, setRssFeed] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRssFeed = async () => {
      try {
        const parser = new RSSParser();
        console.log("Fetching RSS feed from:", settings.rssUrl);
        const feed = await parser.parseURL(settings.rssUrl);

        console.log("Fetched RSS feed data:", feed);
        if (feed.items && feed.items.length > 0) {
          setRssItems(feed.items);
          setRssFeed(feed);
        } else {
          console.warn("No items found in the RSS feed.");
        }
      } catch (error) {
        console.error("Error fetching RSS feed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRssFeed();
  }, [settings.rssUrl]);

  return (
    <div
      style={{
        background: settings.background,
        height: "100%",
        borderWidth: settings.fidgetBorderWidth,
        borderColor: settings.fidgetBorderColor,
        boxShadow: settings.fidgetShadow,
        overflow: "auto",
        scrollbarWidth: "none",
      }}
    >
      {settings?.title && (
        <CardHeader className="p-4 pb-2">
          <CardTitle
            className="text-2xl font-bold"
            style={{
              fontFamily: settings.headingsFontFamily,
              color: settings.headingsFontColor,
            }}
          >
            {settings.title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-4 pt-2">
        {isLoading ? (
          <p>Loading RSS feed...</p>
        ) : rssItems.length > 0 ? (
          rssItems.map((item, index) => (
            <div
              key={index}
              className="mb-6 p-4 rounded-lg shadow-md"
              style={{ backgroundColor: settings.background }}
            >
              <div className="flex-row items-center ">
                <div className="flex flex-col justify-between">
                  {rssFeed?.image && (
                    <img
                      src={rssFeed.image.url}
                      alt={rssFeed.title}
                      className="mt-4 h-auto rounded w-10"
                    />
                  )}
                  <h3
                    className="text-xl font-semibold mb-2"
                    style={{
                      fontFamily: settings.headingsFontFamily,
                      color: settings.headingsFontColor,
                    }}
                  >
                    {item.title}
                  </h3>
                  {item.pubDate && (
                    <p
                      className="text-xs text-gray-500 mb-2"
                      style={{ fontFamily: settings.fontFamily }}
                    >
                      Published on:{" "}
                      {new Date(item.pubDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              {item.categories && (
                <p
                  className="text-sm font-medium text-gray-600 mb-2"
                  style={{ fontFamily: settings.fontFamily }}
                >
                  Categories: {item.categories.join(", ")}
                </p>
              )}
              {item.content && (
                <div
                  className="mb-4"
                  style={{
                    fontFamily: settings.fontFamily,
                    color: settings.fontColor,
                  }}
                >
                  <ReactMarkdown
                    rehypePlugins={[rehypeRaw]}
                    remarkPlugins={[remarkGfm]}
                    components={MarkdownRenderers}
                  >
                    {item.contentSnippet || item.content}
                  </ReactMarkdown>
                </div>
              )}
              {item.link && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: settings.fontColor,
                    textDecoration: "underline",
                  }}
                  className="text-sm"
                >
                  Read more
                </a>
              )}
            </div>
          ))
        ) : (
          <div>
            <p>No RSS items found.</p>
            <p>
              It seems that there are no articles available from this feed.
              Please check the feed URL or try again later.
            </p>
          </div>
        )}
      </CardContent>
    </div>
  );
};

export default {
  fidget: Rss,
  properties: textConfig,
} as FidgetModule<FidgetArgs<TextFidgetSettings>>;
