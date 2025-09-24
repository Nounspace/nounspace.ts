import { getProposal } from "@nouns/data/ponder/governance/getProposal";
import { ImageResponse } from "next/og";
import { truncate } from "lodash";
import { loadGoogleFont, localImageSrc } from "@nouns/utils/og";

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  const proposal = await getProposal(Number(params.id));
  if (!proposal) {
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }

  return new ImageResponse(
    (
      <div tw="bg-white text-[#212529] w-full h-full flex p-16 flex-col overflow-hidden">
        <div tw="flex w-full justify-between text-[60px] text-[#6C757D] items-center">
          <div tw="flex items-center" style={{ gap: 20 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={localImageSrc("/nouns-icon.png")}
              width={106}
              alt="Nouns"
            />
            <span>Nouns DAO</span>
          </div>
          <span tw="flex">Prop {proposal.id}</span>
        </div>
        <div
          tw="flex w-full grow items-center  text-[104px] leading-[114px] min-w-0"
          style={{ flexGrow: 1 }}
        >
          <span tw="max-h-[350px] overflow-hidden">
            {truncate(proposal.title, {
              length: 68,
              omission: "...",
            })}
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Londrina",
          data: await loadGoogleFont(
            "Londrina Solid",
            `Nouns DAO, Prop ${proposal.id}, ${proposal.title}...`,
          ),
          style: "normal",
        },
      ],
    },
  );
}
