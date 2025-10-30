import { SpaceConfig } from "@/app/(spaces)/Space";
import { cloneDeep } from "lodash";
import { getLayoutConfig } from "@/common/utils/layoutFormatUtils";
import { INITIAL_SPACE_CONFIG_EMPTY } from "../../initialSpaceConfig";
import { FilterType, FeedType } from "@neynar/nodejs-sdk/build/api";

const createInitialChannelSpaceConfig = (
	channelId: string,
): Omit<SpaceConfig, "isEditable"> => {
	const config = cloneDeep(INITIAL_SPACE_CONFIG_EMPTY);

	// Apply Clanker-specific theme defaults while preserving required UserTheme shape
	config.theme = {
		id: "clanker-channel-theme",
		name: "Clanker Channel Theme",
		properties: {
			font: "Inter, system-ui, sans-serif",
			fontColor: "#ffffff",
			headingsFont: "Inter, system-ui, sans-serif",
			headingsFontColor: "#00ff88",
			background:
				"linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
			backgroundHTML: "",
			musicURL: "",
			fidgetBackground: "rgba(0, 255, 136, 0.1)",
			fidgetBorderWidth: "1px",
			fidgetBorderColor: "rgba(0, 255, 136, 0.3)",
			fidgetShadow: "0 4px 20px rgba(0, 255, 136, 0.2)",
			fidgetBorderRadius: "12px",
			gridSpacing: "16",
		},
	};

	// Minimal initial fidget: a channel feed similar to nouns' channel space
	config.fidgetInstanceDatums = {
		"feed:channel": {
			config: {
				editable: false,
				settings: {
					feedType: FeedType.Filter,
					filterType: FilterType.ChannelId,
					channel: channelId,
				},
				data: {},
			},
			fidgetType: "feed",
			id: "feed:channel",
		},
	};

	const layoutItems = [
		{
			w: 6,
			h: 8,
			x: 0,
			y: 0,
			i: "feed:channel",
			minW: 4,
			maxW: 20,
			minH: 6,
			maxH: 12,
			moved: false,
			static: false,
		},
	];

	const layoutConfig = getLayoutConfig(config.layoutDetails);
	layoutConfig.layout = layoutItems;

	config.tabNames = ["Channel"];

	return config;
};

export default createInitialChannelSpaceConfig;
