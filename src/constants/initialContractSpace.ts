import { SpaceConfig } from "@/common/components/templates/Space";
import { FeedType, FilterType } from "@neynar/nodejs-sdk";
import { cloneDeep } from "lodash";
import { INITIAL_SPACE_CONFIG_EMPTY } from "./initialPersonSpace";
import { loadEthersViewOnlyContract } from "@/common/data/api/etherscan";

export const createInitialContractSpaceConfigForAddress = async (
  address: string,
  tokenSymbol: string | null,
  castHash: string | null,
  casterFid: string | null,
  symbol: string,
): Promise<Omit<SpaceConfig, "isEditable">> => {
  const config = cloneDeep(INITIAL_SPACE_CONFIG_EMPTY);
  console.log(
    "createInitialContractSpaceConfigForAddress",
    address,
    tokenSymbol,
    castHash,
    casterFid,
    symbol,
  );
  config.fidgetInstanceDatums = {
    "Swap:f9e0259a-4524-4b37-a261-9f3be26d4af1": {
      config: {
        data: {},
        editable: true,
        settings: {
          defaultBuyToken: address,
          defaultSellToken: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
          fromChain: 8453,
          toChain: 8453,
        },
      },
      fidgetType: "Swap",
      id: "Swap:f9e0259a-4524-4b37-a261-9f3be26d4af1",
    },
    ...(castHash &&
      casterFid && {
        "cast:9c63b80e-bd46-4c8e-9e4e-c6facc41bf71": {
          config: {
            data: {},
            editable: true,
            settings: {
              background: "var(--user-theme-fidget-background)",
              castHash: castHash,
              casterFid: casterFid,
              fidgetBorderColor: "var(--user-theme-fidget-border-color)",
              fidgetBorderWidth: "var(--user-theme-fidget-border-width)",
              fidgetShadow: "var(--user-theme-fidget-shadow)",
            },
          },
          fidgetType: "cast",
          id: "cast:9c63b80e-bd46-4c8e-9e4e-c6facc41bf71",
        },
      }),
    "feed:3de67742-56f2-402c-b751-7e769cdcfc56": {
      config: {
        data: {},
        editable: true,
        settings: {
          Xhandle: "thenounspace",
          background: "var(--user-theme-fidget-background)",
          feedType: "filter",
          keyword: `$${symbol || tokenSymbol}`,
          fidgetBorderColor: "var(--user-theme-fidget-border-color)",
          fidgetBorderWidth: "var(--user-theme-fidget-border-width)",
          fidgetShadow: "var(--user-theme-fidget-shadow)",
          filterType: "keyword",
          fontColor: "var(--user-theme-font-color)",
          fontFamily: "var(--user-theme-font)",
        },
      },
      fidgetType: "feed",
      id: "feed:3de67742-56f2-402c-b751-7e769cdcfc56",
    },
    "Market:733222fa-38f8-4343-9fa2-6646bb47dde0": {
      config: {
        data: {},
        editable: true,
        settings: {
          background: "var(--user-theme-fidget-background)",
          fidgetBorderColor: "var(--user-theme-fidget-border-color)",
          fidgetBorderWidth: "var(--user-theme-fidget-border-width)",
          fidgetShadow: "var(--user-theme-fidget-shadow)",
          chain: "base",
          token: address,
        },
      },
      fidgetType: "Market",
      id: "Market:733222fa-38f8-4343-9fa2-6646bb47dde0",
    },
    "links:5b4c8b73-416d-4842-9dc5-12fc186d8f57": {
      config: {
        data: {},
        editable: true,
        settings: {
          DescriptionColor: "black",
          HeaderColor: "black",
          background: "rgba(255, 255, 255, 0.5)",
          css: "",
          fidgetBorderColor: "var(--user-theme-fidget-border-color)",
          fidgetBorderWidth: "var(--user-theme-fidget-border-width)",
          fidgetShadow: "var(--user-theme-fidget-shadow)",
          headingsFontFamily: "'__Inter_d65c78', '__Inter_Fallback_d65c78'",
          itemBackground: "#e0eeff",
          links: [
            {
              avatar:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAAM1BMVEX////q5PfUxe7o4fbMu+uPadTGs+jKueqJYNHEseiJYtKOZ9PJt+rUx+7MuuvPwOvm3vVnLuiEAAAAXUlEQVR4Ac3QAxaAQAAE0LXR/S+bXdNDWuOvSSGBMsYhCikVRG2MxejcFZoHcXoDQCF9gBiMURC1cfYzpDFSiEnKAHF6w4TuiMscs0bt+69JQyW8VyvkOVeH6p/QAF54BSckEkJ8AAAAAElFTkSuQmCC",
              description: "",
              text: "Clanker.world",
              url: `https://www.clanker.world/clanker/${address}`,
            },
            {
              avatar:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAAAAABXZoBIAAAA/ElEQVR4AY3NIYyCYBiH8adv9tuM168ni9FCvmifhchoBIKFZN/sgY1KMxBtNvO3EQ2054ZTAU83f+F9wxP+fGyd52v+mQHfB6+aH54UxD4k7BhbOhExkTiSMVGQ+VBQMNYF1t5sCE4nA8xOdp3nOZyNJos1xkQQsZHKnMHWliTkNEfSkBIsJtEGqLQGDj5HPXLRjkZfxJxOJX2OhVZQ6v3vGOz1tGKnumd50pLBQbWivB1tGAR7GUpi78LAq46qpvNqzl1msBf/bjb2glvuQoK9IzT2iFtuFhGktnMF/WrNIVoyUkNmvHYLNa+Eumx5Z2G34q2q5r3ZFx/7A7k9CEA1KNm+AAAAAElFTkSuQmCC",
              description: "",
              text: "DexScreener",
              url: `https://dexscreener.com/base/${address}`,
            },
            {
              avatar:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAEGElEQVR4AbWWA5AcXRSFX2ytbe/+DNccx6vYtm3bTjm2jUGyVg/CRmzb6dwXdO12LaYHt+oMu/s797zbQMYWy7JVMzIyYkaPHjstOTlln1SmKBCJpDfFYukNqUxe2D459cCwESOmnz17Nh62rY4sVXfu3LGZOHHiJIlUdsfG1v577Tr12PLUyMaOFUuk9ydPnjqNJEl7k8HQRZWVK1f2a9Y8/GmduvU5gLHC+zRr3uL50uXLB+P0BMFfvnzZqHvPXkegY8Fgvho2smW79ehx8vXr17bGRu4qkyl05oL5kkikV+7fv+9RYecyOQe3uKRyBTZhV+aa9+7d95CloXx179HrRKkzsWLF6t4wwd/NBSQmibW7d+9OP3DgSFuscRMmbIY5KDETK1asGFQCjgckPDzysSU63LNnT2f+9SMqKuZ98W2aNw9//ubNGwduo6lTp46rW6+BRSI+efJkMuJVTEzca/4pOmHSpKnc2sNwMEIgdvaObOs2bTPaJaccxFK0bFXQoKGN0QawRCLJPWBXQ3B5Dbe1cxC09smpaSdh50rFYq4sb9kqV4gB3ARUMBo9evQkoTF36dJ1Ix+SnJy6V4iB6OjYV2CgAUpLS99dTtTf/fwDPvv5B3729PT+CmtnEQNOzq7fVq9e3QnhgqteXmlwX1//L0eOHGkFLp2x4CLlDXfBU+YawMs9d+78idyfIrGk1AFMSEy6iXi1YMGigeYYcHRy+Y6n/8/8qAiyK0qCe3qpBhJENxCvli1b1s9UAz4+fp8XLFo0/A9cSVxvqSq6rkVSqVxnbQPDho2gt27dKvvzPeMyFaYirj9TEuRF1LZd8hFrG4Cunf58Vhbd8FIR1E2InwUTO9CAQYPmW9kAVxcIOgDAzC84SEtORAcOH5bBZdgiBmDC2UKtNrE0uJKgoyDyhxwcS8tE43jqRsfEPjfXwPLly6fjO2op8VeCqIcC/GNxOHy/m5+fXw3hGjhw8HIhBrp3774GGVFKLekGsMMYyJdaS07nNtTr9b4BgcEfStzXE0UM4tWuXbu6QNRnzp8/H1oe2GBgq8P6DgTQ89Lg0P3Ls3rGkXeRWTA8MCjko5u757d//v3//dix45aUFmd54N1wZwVwK1UReYkH5WtUWY9ljiAvUH0koHYbDNXVBNlLWXSdqAAM3V+/cPw4WQOZWziN8zqqsVpLLeFNdzmibmYS11xNhp7SauvAQeJVWnoexHzZOCh3zt/O0FJhRsM2wimiKSRDNFo6WU1Qs2FqVXCgN4KgHJzKO1fIeCIhhc9RiHYCOH8rHMrpA+w/L/POnVrI1FLnUu5woGWg1wLA7yC1DcpLlB+yVGWTZH2NlkmBjtbCwTNg6h/BHHwF2FeY/qdwtcuB/zapdXSnzEt3bJCR9QPwKOxl9MLyXAAAAABJRU5ErkJggg==",
              description: "",
              text: "BaseScan",
              url: `https://basescan.org/address/${address}`,
            },
          ],
          title: `$${tokenSymbol || symbol} Links`,
          viewMode: "list",
        },
      },
      fidgetType: "links",
      id: "links:5b4c8b73-416d-4842-9dc5-12fc186d8f57",
    },
    "Chat:09528872-6659-460e-bb25-0c200cccb0ec": {
      config: {
        data: {},
        editable: true,
        settings: {
          background: "var(--user-theme-fidget-background)",
          fidgetBorderColor: "var(--user-theme-fidget-border-color)",
          fidgetBorderWidth: "var(--user-theme-fidget-border-width)",
          fidgetShadow: "var(--user-theme-fidget-shadow)",
          roomName: address,
        },
      },
      fidgetType: "Chat",
      id: "Chat:09528872-6659-460e-bb25-0c200cccb0ec",
    },
  };

  config.layoutDetails.layoutConfig.layout.push(
    {
      h: 6,
      i: "Chat:09528872-6659-460e-bb25-0c200cccb0ec",
      maxH: 36,
      maxW: 36,
      minH: 2,
      minW: 2,
      moved: false,
      resizeHandles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"],
      static: false,
      w: 4,
      x: 4,
      y: 4,
    },
    {
      h: 8,
      i: "feed:3de67742-56f2-402c-b751-7e769cdcfc56",
      maxH: 36,
      maxW: 36,
      minH: 2,
      minW: 4,
      moved: false,
      resizeHandles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"],
      static: false,
      w: 4,
      x: 8,
      y: 0,
    },
    {
      h: 5,
      i: "Swap:f9e0259a-4524-4b37-a261-9f3be26d4af1",
      maxH: 36,
      maxW: 36,
      minH: 3,
      minW: 2,
      moved: false,
      resizeHandles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"],
      static: false,
      w: 4,
      x: 0,
      y: 5,
    },
    {
      h: 5,
      i: "Market:733222fa-38f8-4343-9fa2-6646bb47dde0",
      maxH: 36,
      maxW: 36,
      minH: 2,
      minW: 2,
      moved: false,
      resizeHandles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"],
      static: false,
      w: 4,
      x: 0,
      y: 0,
    },
    {
      h: 2,
      i: "links:5b4c8b73-416d-4842-9dc5-12fc186d8f57",
      maxH: 36,
      maxW: 36,
      minH: 2,
      minW: 2,
      moved: false,
      resizeHandles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"],
      static: false,
      w: 4,
      x: 8,
      y: 8,
    },
    ...(castHash && casterFid
      ? [
          {
            h: 4,
            i: "cast:9c63b80e-bd46-4c8e-9e4e-c6facc41bf71",
            maxH: 4,
            maxW: 12,
            minH: 1,
            minW: 3,
            moved: false,
            resizeHandles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"],
            static: false,
            w: 4,
            x: 4,
            y: 0,
          },
        ]
      : []),
  );

  return config;
};

export default createInitialContractSpaceConfigForAddress;
