import {
  CardContent,
  CardHeader,
  CardTitle,
} from "@/common/components/atoms/card";
import CSSInput from "@/common/components/molecules/CSSInput";
import FontSelector from "@/common/components/molecules/FontSelector";
import ImageScaleSlider from "@/common/components/molecules/ImageScaleSlider";
import TextInput from "@/common/components/molecules/TextInput";
import ThemeColorSelector from "@/common/components/molecules/ThemeColorSelector";
import { FidgetArgs, FidgetModule, FidgetProperties, FidgetSettingsStyle } from "@/common/fidgets";
import { MarkdownRenderers } from "@/common/lib/utils/markdownRenderers";
import React, { useEffect, useState } from "react";
import { BsRss, BsRssFill } from "react-icons/bs";
import ReactMarkdown from "react-markdown";
import RSSParser from "rss-parser";
import { defaultStyleFields, WithMargin } from "../helpers";

export type RSSFidgetSettings = {
  title?: string;
  rssUrl: string;
  scale: number;
  useDefaultColors?: boolean;
} & FidgetSettingsStyle;

export const rssConfig: FidgetProperties = {
  fidgetName: "RSS",
  icon: 0x1f6f0,
  mobileIcon: <BsRss size={20} />,
  mobileIconSelected: <BsRssFill size={20} />,
  fields: [
    {
      fieldName: "rssUrl",
      displayName: "RSS Feed URL",
      displayNameHint: "Enter the URL of the RSS feed you want to display.",
      default: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml",
      required: true,
      inputSelector: (props) => (
        <WithMargin>
          <TextInput {...props} />
        </WithMargin>
      ),
      group: "settings",
    },
    {
      fieldName: "fontFamily",
      displayName: "Font Family",
      displayNameHint: "Font used for the content text. Set to Theme Font to inherit the Body Font from the Theme.",
      default: "var(--user-theme-font)",
      required: false,
      inputSelector: (props) => (
        <WithMargin>
          <FontSelector {...props} />
        </WithMargin>
      ),
      group: "style",
    },
    {
      fieldName: "fontColor",
      displayName: "FontColor",
      displayNameHint: "Color used for the content text",
      default: "var(--user-theme-font-color)",
      required: false,
      inputSelector: (props) => (
        <WithMargin>
          <ThemeColorSelector
            {...props}
            themeVariable="var(--user-theme-font-color)"
            defaultColor="#000000"
            colorType="font color"
          />
        </WithMargin>

      ),
      group: "style",
    },
    {
      fieldName: "headingsFontFamily",
      displayName: "HeadingsFontFamily",
      displayNameHint: "Font used for titles. Set to Theme Font to inherit the Title Font from the Theme.",
      default: "var(--user-theme-headings-font)",
      required: false,
      inputSelector: (props) => (
        <WithMargin>
          <FontSelector {...props} />
        </WithMargin>
      ),
      group: "style",
    },
    {
      fieldName: "headingsFontColor",
      displayName: "HeadingsFontColor",
      displayNameHint: "Color used for titles",
      default: "var(--user-theme-headings-font-color)",
      required: false,
      inputSelector: (props) => (
        <WithMargin>
          <ThemeColorSelector
            {...props}
            themeVariable="var(--user-theme-headings-font-color)"
            defaultColor="#000000"
            colorType="headings color"
          />
        </WithMargin>

      ),
      group: "style",
    },
    ...defaultStyleFields,
    {
      fieldName: "css",
      displayName: "CSS",
      displayNameHint: "Add custom CSS to further customize the appearance",
      default: "",
      required: false,
      inputSelector: (props) => (
        <WithMargin>
          <CSSInput {...props} />
        </WithMargin>
      ),
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

export const Rss: React.FC<FidgetArgs<RSSFidgetSettings>> = ({ settings }) => {
  const [rssItems, setRssItems] = useState<any[]>([]);
  const [rssFeed, setRssFeed] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRssFeed = async () => {
      try {
        const parser = new RSSParser();
        const feed = await parser.parseURL(settings.rssUrl);

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
    >
      {rssFeed?.title && (
        <CardHeader className="p-2 ml-5">
          <div className="flex-col items-center">
            {rssFeed?.image && (
              <img
                src={rssFeed.image.url}
                alt={rssFeed.title}
                className="mt-4 h-auto rounded w-10"
              />
            )}

            <CardTitle
              className="text-2xl font-bold mt-4 ml-1"
              style={{
                fontFamily: settings.headingsFontFamily,
                color: settings.headingsFontColor,
              }}
            >
              {rssFeed.title || settings.title}
            </CardTitle>
          </div>
        </CardHeader>
      )}
      <CardContent className="p-4 pt-2">
        {isLoading ? (
          <p>Loading RSS feed...</p>
        ) : rssItems.length > 0 ? (
          rssItems.map((item, index) => (
            <div
              key={index}
              className="mb-6 p-4 rounded-lg border"
              style={{
                borderWidth: settings.fidgetBorderWidth,
                borderColor: settings.itemBorderColor,
                backgroundColor: settings.itemBackground,
                boxShadow: settings.fidgetShadow,
              }}
            >
              <div className="flex-row items-center ">
                <div className="flex flex-col justify-between">
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

              {item.contentSnippet && (
                <div
                  className="mb-4"
                  style={{
                    fontFamily: settings.fontFamily,
                    color: settings.fontColor,
                  }}
                >
                  <ReactMarkdown components={MarkdownRenderers()}>
                    {item.contentSnippet}
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
  properties: rssConfig,
} as FidgetModule<FidgetArgs<RSSFidgetSettings>>;
