import ReactMarkdown from "react-markdown";
import rehypeUnwrapImages from "rehype-unwrap-images";
import { sanitizeUri } from "micromark-util-sanitize-uri";
import { LinkExternal } from "../ui/link";
import MarkdownImage from "./MarkdownImage";
import { HTMLAttributes } from "react";
import clsx from "clsx";
import remarkGfm from "remark-gfm";

export default function MarkdownRenderer({
  children,
  className,
}: { children: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <ReactMarkdown
      className={clsx(
        "flex min-w-0 flex-col gap-2 overflow-x-hidden break-words",
        className,
      )}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeUnwrapImages]}
      urlTransform={(url) => {
        const protocolSanitized = sanitizeUri(
          url,
          /^(https?|ircs?|mailto|xmpp)$/i,
        );
        const dataProtocol = sanitizeUri(url, /^data$/i);
        const dataProtocolSanitized = /^data:image\/png/.test(dataProtocol)
          ? dataProtocol
          : "";
        return protocolSanitized != ""
          ? protocolSanitized
          : dataProtocolSanitized;
      }}
      components={{
        a: (props) => (
          <LinkExternal className="text-semantic-accent" {...props} />
        ),
        h1: ({ children }) => <h2 className="pt-4 heading-4">{children}</h2>,
        h2: ({ children }) => <h3 className="pt-2 heading-5">{children}</h3>,
        h3: ({ children }) => <h4 className="pt-2 heading-6">{children}</h4>,
        blockquote: (props) => (
          <blockquote className="border-l-2 pl-2" {...props} />
        ),
        img: (props) => <MarkdownImage src={props.src} title={props.title} />,
        code: (props) => (
          <code
            className="flex max-w-full overflow-x-auto rounded-md bg-background-ternary p-2 scrollbar-thin"
            {...props}
          />
        ),
        table: (props) => (
          <div className="overflow-x-auto rounded-[12px] border">
            <table className="w-full" {...props} />
          </div>
        ),
        th: (props) => (
          <th
            className="bg-background-secondary px-6 py-2 text-left label-md"
            {...props}
          />
        ),
        tbody: (props) => (
          <tbody
            className="[&>tr:last-child]:border-none [&>tr]:border-b"
            {...props}
          />
        ),
        td: (props) => (
          <td className="whitespace-nowrap px-6 py-2" {...props} />
        ),
        ul: (props) => (
          <ul className="list-outside list-disc pl-6" {...props} />
        ),
        ol: (props) => (
          <ul className="list-outside list-disc pl-6" {...props} />
        ),
      }}
    >
      {/* Makes comply with markdown standard */}
      {children.replace(/\n/g, "  \n")}
    </ReactMarkdown>
  );
}
