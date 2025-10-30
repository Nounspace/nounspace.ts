import { SpaceConfig } from "@/app/(spaces)/Space";
import { cloneDeep } from "lodash";
import { getLayoutConfig } from "@/common/utils/layoutFormatUtils";
import { INITIAL_SPACE_CONFIG_EMPTY } from "../../initialSpaceConfig";

const createInitialProfileSpaceConfigForFid = (
	fid: number,
): Omit<SpaceConfig, "isEditable"> => {
	const config = cloneDeep(INITIAL_SPACE_CONFIG_EMPTY);

	config.theme = {
		id: "clanker-profile-theme",
		name: "Clanker Profile Theme",
		properties: {
			font: "Inter, system-ui, sans-serif",
			fontColor: "#ffffff",
			headingsFont: "Inter, system-ui, sans-serif",
			headingsFontColor: "#00d4ff",
			background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
			backgroundHTML: "",
			musicURL: "",
			fidgetBackground: "rgba(0, 212, 255, 0.1)",
			fidgetBorderWidth: "1px",
			fidgetBorderColor: "rgba(0, 212, 255, 0.3)",
			fidgetShadow: "0 4px 20px rgba(0, 212, 255, 0.2)",
			fidgetBorderRadius: "12px",
			gridSpacing: "16",
		},
	};

	config.fidgetInstanceDatums = {
		profile: {
			id: "profile",
			fidgetType: "profile",
			config: {
				data: { fid },
				editable: true,
				settings: {
					showAvatar: true,
					showUsername: true,
					showStats: true,
				},
			},
		},
		portfolio: {
			id: "portfolio",
			fidgetType: "Portfolio",
			config: {
				data: {},
				editable: true,
				settings: {
					showBalance: true,
					showValue: true,
					showChange: true,
				},
			},
		},
		feed: {
			id: "feed",
			fidgetType: "feed",
			config: {
				data: {},
				editable: true,
				settings: {
					showUserCasts: true,
					showTokenDiscussions: true,
					maxCasts: 20,
				},
			},
		},
		"market-data": {
			id: "market-data",
			fidgetType: "Market",
			config: {
				data: {},
				editable: true,
				settings: {
					showUserTokens: true,
					showPriceChanges: true,
				},
			},
		},
		gallery: {
			id: "gallery",
			fidgetType: "gallery",
			config: {
				data: {},
				editable: true,
				settings: {
					showUserImages: true,
					showTokenImages: true,
					maxImages: 15,
				},
			},
		},
		links: {
			id: "links",
			fidgetType: "links",
			config: {
				data: {},
				editable: true,
				settings: {
					showUserLinks: true,
					showTokenLinks: true,
				},
			},
		},
	};

	const layoutItems = [
		{ w: 6, h: 4, x: 0, y: 0, i: "profile" },
		{ w: 6, h: 4, x: 6, y: 0, i: "portfolio" },
		{ w: 8, h: 4, x: 0, y: 4, i: "feed" },
		{ w: 4, h: 4, x: 8, y: 4, i: "market-data" },
		{ w: 6, h: 3, x: 0, y: 8, i: "gallery" },
		{ w: 6, h: 3, x: 6, y: 8, i: "links" },
	];

	const layoutConfig = getLayoutConfig(config.layoutDetails);
	layoutConfig.layout = layoutItems;

	config.tabNames = ["Profile"];

	return config;
};

export default createInitialProfileSpaceConfigForFid;
