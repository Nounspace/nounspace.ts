import type { ReactNode } from "react";

type Converter = (props: any) => ReactNode;

type ConverterMap = Record<string, Converter>;

export type JSXConvertersFunction<TNodeTypes = unknown> = (args: {
  defaultConverters: ConverterMap;
}) => ConverterMap;

export type DefaultNodeTypes = unknown;

type RichTextProps = {
  data: any;
  converters?: ConverterMap;
};

const renderNode = (node: any, converters?: ConverterMap): ReactNode => {
  if (!node) return null;

  if (typeof node === "string") {
    return node;
  }

  const type = node?.type as string | undefined;
  const converter = type && converters?.[type];

  if (converter) {
    return converter({ node });
  }

  if (Array.isArray(node?.children)) {
    return node.children.map((child: any, index: number) => (
      <span key={index}>{renderNode(child, converters)}</span>
    ));
  }

  const text = node?.value ?? node?.text;
  if (text) {
    return <span>{String(text)}</span>;
  }

  return null;
};

export function RichText({ data, converters }: RichTextProps) {
  if (!data) {
    return null;
  }

  if (Array.isArray(data)) {
    return <>{data.map((node, index) => <div key={index}>{renderNode(node, converters)}</div>)}</>;
  }

  if (typeof data === "string") {
    return <div dangerouslySetInnerHTML={{ __html: data }} />;
  }

  return <div>{renderNode(data, converters)}</div>;
}
