import Icon from "@nouns/components/ui/Icon";
import { LinkExternal } from "@nouns/components/ui/link";
import Image from "next/image";

const SPEND_SITES: { url: string; urlName: string; imgSrc: string }[] = [
  { url: "https://cork.wtf/", urlName: "cork.wtf", imgSrc: "/cork.png" },
];

export default function Spend() {
  return (
    <section className="flex w-full flex-col items-center justify-center gap-14 px-6 md:px-10">
      <div className="flex flex-col items-center justify-center gap-2 px-6 text-center">
        <h2>Use $NOUNS</h2>
        <p className="max-w-[490px] text-center paragraph-lg">
          Discover where you can spend your $NOUNS to unlock unique experiences
          within the Nouns ecosystem.
        </p>
      </div>
      <div className="flex w-full justify-center gap-10">
        {SPEND_SITES.map((site) => (
          <LinkExternal
            href={site.url}
            className="flex flex-col items-center justify-center gap-4 text-center"
            key={site.urlName}
          >
            <Image
              src={site.imgSrc}
              width={160}
              height={160}
              alt={site.urlName}
              className="h-[160px] w-[160px] rounded-[20px]"
            />
            <div>{site.urlName} ↗</div>
          </LinkExternal>
        ))}

        <LinkExternal
          href="https://docs.google.com/forms/d/e/1FAIpQLSfqmfBF0mG6qtioDsVNnQnL328TkeRqZJfiW3HQsUiF5aCTdA/viewform"
          className="flex h-[160px] w-[160px] flex-col items-center justify-center gap-4 rounded-[20px] border-4 border-dashed"
        >
          <Icon icon="plus" size={48} className="fill-content-secondary" />
          <div className="text-content-secondary heading-6">Add yours</div>
        </LinkExternal>
      </div>
    </section>
  );
}
