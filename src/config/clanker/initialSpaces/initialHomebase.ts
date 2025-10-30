import { SpaceConfig } from "@/app/(spaces)/Space";
import { cloneDeep } from "lodash";
import { getLayoutConfig } from "@/common/utils/layoutFormatUtils";
import { INITIAL_SPACE_CONFIG_EMPTY } from "../../initialSpaceConfig";

const INITIAL_HOMEBASE_CONFIG: SpaceConfig = (() => {
	const config = cloneDeep(INITIAL_SPACE_CONFIG_EMPTY);

	config.theme = {
		id: "clanker-homebase-theme",
		name: "Clanker Homebase Theme",
		properties: {
			font: "Inter, system-ui, sans-serif",
			fontColor: "#ffffff",
			headingsFont: "Inter, system-ui, sans-serif",
			headingsFontColor: "#a8e6cf",
			background:
				"linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
			backgroundHTML: "",
			musicURL: "",
			fidgetBackground: "#a8e6cf",
			fidgetBorderWidth: "1px",
			fidgetBorderColor: "#a8e6cf",
			fidgetShadow: "0 10px 40px rgba(168, 230, 207, 0.2)",
			fidgetBorderRadius: "20px",
			gridSpacing: "24",
		},
	};

	config.fidgetInstanceDatums = {
		"market-data": {
			id: "market-data",
			fidgetType: "Market",
			config: {
				data: {},
				editable: true,
				settings: {
					showEcosystemOverview: true,
					showMarketCap: true,
					showVolume: true,
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
					showEcosystemMetrics: true,
					showPerformance: true,
					showTrends: true,
				},
			},
		},
		rss: {
			id: "rss",
			fidgetType: "Rss",
			config: {
				data: {},
				editable: true,
				settings: {
					showEcosystemNews: true,
					showTokenNews: true,
					maxItems: 8,
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
					showEcosystemImages: true,
					showDataVisualizations: true,
					maxImages: 10,
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
					showEcosystemDiscussions: true,
					showTrendingTopics: true,
					maxCasts: 12,
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
					showEcosystemLinks: true,
					showExternalTools: true,
				},
			},
		},
		text: {
			id: "text",
			fidgetType: "text",
			config: {
				data: {},
				editable: true,
				settings: {
					showEcosystemDescription: true,
					showStats: true,
				},
			},
		},
		iframe: {
			id: "iframe",
			fidgetType: "iframe",
			config: {
				data: {},
				editable: true,
				settings: {
					showEcosystemAnalytics: true,
					url: "https://analytics.clanker.world",
				},
			},
		},
	};

	const layoutItems = [
		{ w: 6, h: 4, x: 0, y: 0, i: "market-data" },
		{ w: 6, h: 4, x: 6, y: 0, i: "portfolio" },
		{ w: 4, h: 3, x: 0, y: 4, i: "rss" },
		{ w: 4, h: 3, x: 4, y: 4, i: "gallery" },
		{ w: 4, h: 3, x: 8, y: 4, i: "feed" },
		{ w: 8, h: 4, x: 0, y: 7, i: "links" },
		{ w: 4, h: 4, x: 8, y: 7, i: "text" },
		{ w: 12, h: 3, x: 0, y: 11, i: "iframe" },
	];

	const layoutConfig = getLayoutConfig(config.layoutDetails);
	layoutConfig.layout = layoutItems;

	config.tabNames = ["Homebase"];

	// Ensure required SpaceConfig field present and return full SpaceConfig
	return {
		...config,
		isEditable: false,
	};
})();

export default INITIAL_HOMEBASE_CONFIG;
