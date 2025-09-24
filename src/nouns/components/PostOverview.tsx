import { getPostOverviews } from "@nouns/data/cms/getPostOverviews";
import Image from "next/image";
import Link from "next/link";

interface PostOverviewProps {
  data: NonNullable<Awaited<ReturnType<typeof getPostOverviews>>>[number];
}

export default function PostOverview({ data }: PostOverviewProps) {
  return (
    <Link
      href={`/learn/${data.slug}`}
      className="flex h-[368px] w-full max-w-[750px] flex-col overflow-hidden rounded-[32px] transition-all clickable-active hover:brightness-90"
      key={data.id}
    >
      <Image
        src={data.heroImage.url ?? ""}
        width={400}
        height={225}
        className="aspect-video h-[212px] w-full object-cover"
        alt={data.heroImage.alt}
      />
      <div className="grow bg-background-secondary p-6">
        <h2 className="heading-4">{data.title}</h2>
      </div>
    </Link>
  );
}
