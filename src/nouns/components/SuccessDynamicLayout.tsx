import Image from "next/image";
import { ReactNode } from "react";
import ShareToFarcaster from "./ShareToFarcaster";
import Confetti from "./Confetti";
import { Button } from "./ui/button";
import Icon from "./ui/Icon";

export interface SuccessDynamicLayoutProps {
  frameUrl: string;
  title: string;
  subtitle: string;
  socialShareCopy: string;
  secondaryButton?: ReactNode;
}

export default function SuccessDynamicLayout({
  frameUrl,
  title,
  subtitle,
  socialShareCopy,
  secondaryButton,
}: SuccessDynamicLayoutProps) {
  return (
    <>
      <Confetti />
      <div className="flex w-full max-w-[900px] flex-col items-center justify-center gap-[40px] md:flex-row md:gap-[96px]">
        <div className="aspect-square max-h-[400px] w-full max-w-[400px] shrink-0 rounded-[32px] p-[7px] shadow-2xl md:w-[400px] md:p-[12px]">
          <Image
            src={`${frameUrl}/image`}
            alt="Nouns Frame"
            width={400}
            height={400}
            className="h-full w-full rounded-[24px]"
          />
        </div>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2 pb-[120px] md:pb-0">
            <span className="text-semantic-positive label-lg">Success!</span>
            <div>
              <h1>{title}</h1>
              <div className="paragraph-lg">{subtitle}</div>
            </div>
          </div>
          <div className="fixed bottom-0 left-0 flex w-screen flex-col gap-2 border-t-2 border-border-secondary bg-white px-4 py-2 md:static md:w-auto md:border-none md:p-0">
            <ShareToFarcaster text={socialShareCopy} embeds={[frameUrl]}>
              <Button className="w-full gap-3">
                <Icon icon="farcaster" size={20} className="fill-white" />
                Share to Farcaster
              </Button>
            </ShareToFarcaster>
            {secondaryButton}
          </div>
        </div>
      </div>
    </>
  );
}
