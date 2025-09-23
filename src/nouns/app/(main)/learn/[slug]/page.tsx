import { Skeleton } from "@nouns/components/ui/skeleton";
import { Suspense } from "react";
import { JSXConvertersFunction, RichText, DefaultNodeTypes } from "@nouns/lib/richText";
import Image from "next/image";
import Link from "next/link";
import { LinkExternal } from "@nouns/components/ui/link";
import { getPostBySlug } from "@nouns/data/cms/getPostBySlug";
import { BlogPosting, WithContext } from "schema-dts";
import { Metadata } from "next";
import Icon from "@nouns/components/ui/Icon";
import { ClipboardCopy } from "@nouns/components/ClipboardCopy";
import ShareToFarcaster from "@nouns/components/ShareToFarcaster";
import ShareToX from "@nouns/components/ShareToX";

const SOCIAL_SHARE_TEXT = ""; // Nothing, just the link is fine

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const decodedSlug = decodeURIComponent(slug);
  const post = await getPostBySlug(decodedSlug);

  if (!post) {
    return {};
  }

  return {
    title: post.title + " | Nouns DAO",
    description: post.description,
    alternates: {
      canonical: "./",
    },
    openGraph: {
      title: post.title,
      description: post.description,
      images: [
        {
          url: post.heroImage.url ?? "",
        },
      ],
    },
    twitter: {
      images: [
        {
          url: post.heroImage.url ?? "",
        },
      ],
    },
  };
}

export default async function LearnPostPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const decodedSlug = decodeURIComponent(slug);

  const postUrl = `${process.env.NEXT_PUBLIC_URL}/learn/${decodedSlug}`;

  return (
    <>
      <div className="flex w-full max-w-[720px] flex-col justify-center gap-4 px-6 pb-24 pt-[72px] md:px-10">
        <Link
          href="/learn"
          className="font-bold text-content-secondary label-lg"
        >
          Learn
        </Link>
        <Suspense
          fallback={Array(10)
            .fill(0)
            .map((_, i) => (
              <Skeleton className="h-[392px] w-full rounded-[32px]" key={i} />
            ))}
        >
          <LearnPostWrapper slug={decodedSlug} />
        </Suspense>
        <div className="my-8 h-[1px] w-full bg-background-secondary" />
        <div className="flex flex-col gap-11">
          <div className="flex flex-col gap-4">
            <div className="font-bold text-content-secondary label-sm">
              Share post
            </div>
            <div className="flex items-center gap-6">
              <ShareToFarcaster text={SOCIAL_SHARE_TEXT} embeds={[postUrl]}>
                <Icon
                  icon="farcaster"
                  size={20}
                  className="fill-content-primary"
                />
              </ShareToFarcaster>
              <ShareToX text={SOCIAL_SHARE_TEXT} url={postUrl}>
                <Icon
                  icon="xTwitter"
                  size={20}
                  className="fill-content-primary"
                />
              </ShareToX>

              <ClipboardCopy copyContent={postUrl}>
                <Icon icon="link" size={20} className="fill-content-primary" />
              </ClipboardCopy>
            </div>
          </div>
          <div className="text-content-secondary paragraph-sm">
            The content on this site is produced by the Nouns.com Team and is
            for informational purposes only. The content is not intended to be
            investment advice or any other kind of professional advice. Before
            taking any action based on this content you should do you own
            research. We do not endorse any third parties referenced on this
            site. When you invest, your funds are at risk and it is possible
            that you may lose some or all of your investment. Past performance
            is not a guarantee of future results.
          </div>
        </div>
      </div>
    </>
  );
}

async function LearnPostWrapper({ slug }: { slug: string }) {
  const post = await getPostBySlug(slug);

  if (!post?.content) {
    return null;
  }

  const keywords =
    post.keywords
      ?.map((entry) => entry.value)
      .filter((word) => word != null && word != undefined) ?? [];

  const jsonLd: WithContext<BlogPosting> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    author: {
      "@type": "Organization",
      name: "Nouns.com",
      url: "https://www.nouns.com",
      logo: "https://www.nouns.com/app-icon.jpeg",
    },
    datePublished: post.createdAt ?? undefined,
    dateModified: post.updatedAt ?? undefined,
    image: post.heroImage.url ?? "",
    url: `https://nouns.com/learn/${slug}`,
    keywords: [...keywords, "Nouns DAO", "Nouns NFT", "web3", "Crypto"],
  };

  return (
    <div className="flex min-w-0 flex-col gap-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1>{post.title}</h1>
      <Image
        src={post.heroImage.url ?? ""}
        width={800}
        height={792}
        alt={post.heroImage.alt}
        className="aspect-video rounded-[12px] object-cover md:rounded-[24px]"
      />

      <RichText data={post.content} converters={jsxConverters as any} />
    </div>
  );
}

const jsxConverters: JSXConvertersFunction<DefaultNodeTypes> = ({
  defaultConverters,
}) => ({
  ...defaultConverters,
  upload: ({ node }) => {
    return (
      <Image
        src={(node.value as any)["url"] ?? ""}
        width={640}
        height={362}
        className="aspect-video rounded-[12px] md:rounded-[24px]"
        alt={(node.value as any)["alt"] ?? ""}
      />
    );
  },
  link: ({ node }) => {
    const url = decodeURIComponent(node.fields.url ?? ""); // To ensure decoded correctly since payload encodes direct relative url (/slug => %2Fslug)
    const internal = node.fields.newTab === false;
    const content = (node.children[0] as any)["text"] as string | undefined;

    return internal ? (
      <Link
        href={url}
        className="underline transition-all hover:text-semantic-accent hover:brightness-100"
      >
        {content}
      </Link>
    ) : (
      <LinkExternal
        href={url}
        className="underline transition-all hover:text-semantic-accent hover:brightness-100"
      >
        {content}
      </LinkExternal>
    );
  },
  blocks: ({ node }) => <div>{node.children}</div>,
});
