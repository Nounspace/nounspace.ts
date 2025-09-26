// Migrated from @mod-protocol/farcaster/structure-cast
// Source: https://github.com/mod-protocol/mod/blob/main/packages/farcaster/src/structure-cast.ts

// Regex to match URLs - supports http(s), ftp, and other protocols, as well as www domains
export const urlRegex = new RegExp(
  '((?:(?:(?:https?|ftp):)?//)?(?:\\S+(?::\\S*)?@)?(?:(?!(?:10|127)(?:\\.\\d{1,3}){3})' +
  '(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})' +
  '(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}' +
  '(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z0-9\\u00a1-\\uffff]' +
  '[a-z0-9\\u00a1-\\uffff_-]{0,62})?[a-z0-9\\u00a1-\\uffff][a-z0-9\\u00a1-\\uffff_-]{0,62}\\.)' +
  '+(?:[a-z\\u00a1-\\uffff]{2,}\\.?))(?::\\d{2,5})?(?:[/?#]\\S*)?)',
  'i'
);

// must not be global for the way we are using it!
// For .split must be: Capture groups join to entire string
export const imgRegex = /(https?:\/\/.*\.(?:png|jpg|gif|webp|jpeg))/i;

export const videoRegex = /(https?:\/\/.*\.(?:mp4|webm|avi|mov))/i;

/** https://github.com/farcasterxyz/protocol/discussions/90 **/
export const usernameRegexForSplit =
  /(^|\s|\.)(@[a-z0-9][a-z0-9-]{0,15}(?:\.eth)?)/gi;

// Non-global version for exec() calls
export const usernameRegex = 
  /(^|\s|\.)(@[a-z0-9][a-z0-9-]{0,15}(?:\.eth)?)/i;

// Regex to match mentions
const mentionRegex = /(?<=^|\s)@([a-zA-Z0-9_.-]+)/g;

const newlineRegex = /(\n)/gi;

// Non-global version for exec() calls to avoid persistent state bugs
const newlineRegexNonGlobal = /(\n)/i;

// For .split must be: Capture groups join to entire string
const textcutsForSplit =
  /((?:\b)(?:[^ .\n,]+)(?:.)(?:twitter|github|lens|telegram|eth)(?:$| |\n))/gi;
const textcuts =
  /(\b)([^ .\n,]+)(.)(twitter|github|lens|telegram|eth)($| |\n)/gi;

// Non-global version for exec() calls to avoid persistent state bugs
const textcutsNonGlobal =
  /(\b)([^ .\n,]+)(.)(twitter|github|lens|telegram|eth)($| |\n)/i;

// none of these are composable right now
export type StructuredCastUnit =
  | StructuredCastImageUrl
  | StructuredCastTextcut
  | StructuredCastVideo
  | StructuredCastPlaintext
  | StructuredCastMention
  | StructuredCastNewline
  | StructuredCastUrl;

export type StructuredCastUrl = { type: "url"; serializedContent: string };
export type StructuredCastVideo = {
  type: "videourl";
  serializedContent: string;
};
export type StructuredCastImageUrl = {
  type: "imageurl";
  serializedContent: string;
};
export type StructuredCastPlaintext = {
  type: "plaintext";
  serializedContent: string;
};
export type StructuredCastMention = {
  type: "mention";
  serializedContent: string;
};
export type StructuredCastTextcut = {
  type: "textcut";
  serializedContent: string;
  url: string;
};
export type StructuredCastNewline = {
  type: "newline";
  serializedContent: string;
};

function extractMentions(
  structuredCast: StructuredCastUnit
): StructuredCastUnit[] {
  if (structuredCast.type !== "plaintext") return [structuredCast];

  return structuredCast.serializedContent
    .split(usernameRegexForSplit)
    .map((part, i) => {
      // Reset regex state and test
      usernameRegex.lastIndex = 0;
      if (!usernameRegex.test(part)) {
        return { type: "plaintext", serializedContent: part };
      }
      return { type: "mention", serializedContent: part };
    });
}

function extractUrlsImagesAndVideos(
  structuredCast: StructuredCastUnit
): StructuredCastUnit[] {
  if (structuredCast.type !== "plaintext") return [structuredCast];

  return structuredCast.serializedContent
    .split(urlRegex)
    .flatMap((p, i): StructuredCastUnit[] => {
      const e = urlRegex.exec(p);
      const isImage = imgRegex.test(p);
      if (isImage) {
        return [{ type: "imageurl", serializedContent: p }];
      }

      const isVideo = videoRegex.test(p);
      if (isVideo) {
        return [{ type: "videourl", serializedContent: p }];
      }

      if (!e) {
        return [{ type: "plaintext", serializedContent: p }];
      }
      let partOutsideUrl = "";
      const endsInSpace = p.endsWith(" ");
      if (endsInSpace) partOutsideUrl = " ";
      let part = p.replace(" ", "");

      // While commas and ) and ] are allowed in urls, people kinda agree not to use them and hence don't. 
      // Far more common is a user doing (via www.discove.xyz) or something which breaks the url.
      // So we are going to treat these characters at the end as *not* part of the url if they are not 
      // contained elsewhere in the url
      if (part.endsWith(",")) {
        // if only one instance of comma, at the end
        if (part.indexOf(",") === part.length - 1) {
          part = part.slice(0, part.length - 1);
          partOutsideUrl = partOutsideUrl + ",";
        }
      } else if (part.endsWith(")")) {
        // if only one instance of comma, at the end
        if (
          part.indexOf(")") === part.length - 1 && 
          part.indexOf("(") === -1
        ) {
          part = part.slice(0, part.length - 1);
          partOutsideUrl = partOutsideUrl + ")";
        }
      } else if (part.endsWith("]")) {
        // if only one instance of comma, at the end
        if (part.indexOf("]") === part.length - 1) {
          part = part.slice(0, part.length - 1);
          partOutsideUrl = partOutsideUrl + "]";
        }
      } else if (part.endsWith("!")) {
        part = part.slice(0, part.length - 1);
        partOutsideUrl = partOutsideUrl + "!";
      } else if (part.endsWith(".")) {
        part = part.slice(0, part.length - 1);
        partOutsideUrl = partOutsideUrl + ".";
      } else if (part.endsWith("\n")) {
        // new line character only counts as 1 character as the backslash is an escape
        part = part.slice(0, part.length - 1);
        partOutsideUrl = partOutsideUrl + "\n";
      }

      return [
        { type: "url", serializedContent: part },
        ...(partOutsideUrl !== ""
          ? ([
              { type: "plaintext", serializedContent: partOutsideUrl },
            ] as const)
          : []),
      ];
    });
}

function extractTextcuts(
  structuredCast: StructuredCastUnit
): StructuredCastUnit[] {
  if (structuredCast.type !== "plaintext") return [structuredCast];
  // Split only keeps capturing groups
  return structuredCast.serializedContent
    .split(textcutsForSplit)
    .flatMap((part, i): StructuredCastUnit[] => {
      const e = textcutsNonGlobal.exec(part);

      if (!e) {
        return [{ type: "plaintext", serializedContent: part }];
      } else {
        let url = "";

        switch (e[4]) {
          case "twitter":
            url = `https://www.twitter.com/${e[2]}`;
            break;
          case "github":
            url = `https://www.github.com/${e[2]}`;
            break;
          case "lens":
            url = `https://lenster.xyz/u/${e[2]}.lens`;
            break;
          case "telegram":
            url = `https://t.me/${e[2]}`;
            break;
          case "eth":
            url = `https://rainbow.me/${e[2]}.eth`;
            break;
        }

        const structuredCastUnits: StructuredCastUnit[] = [];
        if (e[1] !== "" && e[1] !== undefined) {
          structuredCastUnits.push({
            type: "plaintext",
            serializedContent: e[1],
          });
        }
        structuredCastUnits.push({
          type: "textcut",
          serializedContent: `${e[2]}.${e[4]}`,
          url: url,
        });
        if (e[5] !== "" && e[5] !== undefined) {
          structuredCastUnits.push({
            type: "plaintext",
            serializedContent: e[5],
          });
        }

        return structuredCastUnits;
      }
    });
}

function extractNewlines(
  structuredCast: StructuredCastUnit
): StructuredCastUnit[] {
  if (structuredCast.type !== "plaintext") return [structuredCast];
  // Split only keeps capturing groups
  return structuredCast.serializedContent
    .split(newlineRegex)
    .map((part, i): StructuredCastUnit => {
      const e = newlineRegexNonGlobal.exec(part);
      if (!e) {
        return { type: "plaintext", serializedContent: part };
      }
      return { type: "newline", serializedContent: "\n" };
    });
}

export function convertCastPlainTextToStructured({
  text,
}: {
  text: string;
}): StructuredCastUnit[] {
  let structuredCast: StructuredCastUnit[] = [
    { type: "plaintext", serializedContent: text ?? "" },
  ];

  structuredCast = structuredCast.flatMap((x) => extractMentions(x));
  structuredCast = structuredCast.flatMap((x) => extractUrlsImagesAndVideos(x));
  structuredCast = structuredCast.flatMap((x) => extractTextcuts(x));
  structuredCast = structuredCast.flatMap((x) => extractNewlines(x));

  return structuredCast;
}