import { SpaceConfig } from "@/common/components/templates/Space";

const layoutID = "";

const USER_NOT_LOGGED_IN_HOMEBASE_CONFIG: SpaceConfig = {
  layoutID,
  layoutDetails: {
    layoutConfig: {
      layout: [
        {
          h: 3,
          i: "text:14ac63b4-c3d6-41dc-b220-b06c7d481cae",
          maxH: 36,
          maxW: 36,
          minH: 2,
          minW: 3,
          moved: false,
          resizeHandles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"],
          static: false,
          w: 5,
          x: 0,
          y: 0,
        },
        {
          h: 4,
          i: "gallery:21671679-c341-4d16-a52b-841a49fe84d3",
          maxH: 36,
          maxW: 36,
          minH: 2,
          minW: 2,
          moved: false,
          resizeHandles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"],
          static: false,
          w: 3,
          x: 5,
          y: 0,
        },
        {
          h: 7,
          i: "iframe:c9f34918-b20e-417a-afae-86ee410bb6ba",
          maxH: 36,
          maxW: 36,
          minH: 2,
          minW: 2,
          moved: false,
          resizeHandles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"],
          static: false,
          w: 5,
          x: 0,
          y: 3,
        },
        {
          h: 3,
          i: "frame:cc3443fd-bfb6-41bb-b0dd-c2299257dfc0",
          maxH: 36,
          maxW: 36,
          minH: 1,
          minW: 1,
          moved: false,
          resizeHandles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"],
          static: false,
          w: 3,
          x: 5,
          y: 7,
        },
        {
          h: 3,
          i: "iframe:c98bcd08-0fe8-4d27-9c2e-214a8d28c3de",
          maxH: 36,
          maxW: 36,
          minH: 2,
          minW: 2,
          moved: false,
          resizeHandles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"],
          static: false,
          w: 3,
          x: 5,
          y: 4,
        },
        {
          h: 10,
          i: "feed:46dde8d6-80b6-4f1c-98ab-53e0af6db26a",
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
      ],
    },
    layoutFidget: "grid",
  },
  theme: {
    id: "default",
    name: "Default",
    properties: {
      background: "#ffffff",
      backgroundHTML:
        '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>SVG Animation</title>\n    <style>\n        body {\n            background-color: #fee440;\n            margin: 0;\n            padding: 0;\n        }\n        svg {\n            position: fixed;\n            top: 0;\n            left: 0;\n            width: 100%;\n            height: 100vh;\n        }\n        .links {\n            position: fixed;\n            bottom: 20px;\n            right: 20px;\n            font-size: 18px;\n            font-family: sans-serif;\n        }\n        a {\n            text-decoration: none;\n            color: black;\n            margin-left: 1em;\n        }\n        a:hover {\n            text-decoration: underline;\n        }\n        a img.icon {\n            display: inline-block;\n            height: 1em;\n            margin: 0 0 -0.1em 0.3em;\n        }\n        @keyframes rotate {\n            0% {\n                transform: rotate(0deg);\n            }\n            100% {\n                transform: rotate(360deg);\n            }\n        }\n        .out-top {\n            animation: rotate 20s linear infinite;\n            transform-origin: 13px 25px;\n        }\n        .in-top {\n            animation: rotate 10s linear infinite;\n            transform-origin: 13px 25px;\n        }\n        .out-bottom {\n            animation: rotate 25s linear infinite;\n            transform-origin: 84px 93px;\n        }\n        .in-bottom {\n            animation: rotate 15s linear infinite;\n            transform-origin: 84px 93px;\n        }\n    </style>\n</head>\n<body>\n    <!-- \n    - Single file SVG animation\n    - * can be used as CSS backgroud\n    - * total size is less than 2kb!\n    -->\n    <svg preserveAspectRatio="xMidYMid slice" viewBox="10 10 80 80">\n        <path fill="#9b5de5" class="out-top" d="M37-5C25.1-14.7,5.7-19.1-9.2-10-28.5,1.8-32.7,31.1-19.8,49c15.5,21.5,52.6,22,67.2,2.3C59.4,35,53.7,8.5,37-5Z"/>\n        <path fill="#f15bb5" class="in-top" d="M20.6,4.1C11.6,1.5-1.9,2.5-8,11.2-16.3,23.1-8.2,45.6,7.4,50S42.1,38.9,41,24.5C40.2,14.1,29.4,6.6,20.6,4.1Z"/>\n        <path fill="#00bbf9" class="out-bottom" d="M105.9,48.6c-12.4-8.2-29.3-4.8-39.4.8-23.4,12.8-37.7,51.9-19.1,74.1s63.9,15.3,76-5.6c7.6-13.3,1.8-31.1-2.3-43.8C117.6,63.3,114.7,54.3,105.9,48.6Z"/>\n        <path fill="#00f5d4" class="in-bottom" d="M102,67.1c-9.6-6.1-22-3.1-29.5,2-15.4,10.7-19.6,37.5-7.6,47.8s35.9,3.9,44.5-12.5C115.5,92.6,113.9,74.6,102,67.1Z"/>\n    </svg>\n    </div>\n</body>\n</html>',
      fidgetBackground: "#ffffff",
      fidgetBorderColor: "#eeeeee",
      fidgetBorderWidth: "1px",
      fidgetShadow: "0 4px 8px rgba(0,0,0,0.25)",
      font: "Inter",
      fontColor: "#000000",
      headingsFont: "Inter",
      headingsFontColor: "#000000",
      musicURL: "https://www.youtube.com/watch?v=dMXlZ4y7OK4&t=1804",
    },
  },
  fidgetInstanceDatums: {
    "feed:46dde8d6-80b6-4f1c-98ab-53e0af6db26a": {
      config: {
        data: {},
        editable: true,
        settings: {
          feedType: "filter",
          filterType: "channel_id",
          channel: "nounspace",
        },
      },
      fidgetType: "feed",
      id: "feed:46dde8d6-80b6-4f1c-98ab-53e0af6db26a",
    },
    "frame:3355c9cd-a45f-439f-921a-eb0ecdbafa09": {
      config: {
        data: {},
        editable: true,
        settings: {},
      },
      fidgetType: "frame",
      id: "frame:3355c9cd-a45f-439f-921a-eb0ecdbafa09",
    },
    "frame:cc3443fd-bfb6-41bb-b0dd-c2299257dfc0": {
      config: {
        data: {},
        editable: true,
        settings: {
          url: "https://framedl.xyz/?id=4878fa03-a77d-4b4c-8299-dcee3e6d7d2c",
        },
      },
      fidgetType: "frame",
      id: "frame:cc3443fd-bfb6-41bb-b0dd-c2299257dfc0",
    },
    "gallery:21671679-c341-4d16-a52b-841a49fe84d3": {
      config: {
        data: {},
        editable: true,
        settings: {
          imageUrl:
            "https://storage.googleapis.com/papyrus_images/d467b07030969fab95a8f44b1de596ab.png",
        },
      },
      fidgetType: "gallery",
      id: "gallery:21671679-c341-4d16-a52b-841a49fe84d3",
    },
    "iframe:c98bcd08-0fe8-4d27-9c2e-214a8d28c3de": {
      config: {
        data: {},
        editable: true,
        settings: {
          url: "https://vimeo.com/973566244?share=copy",
        },
      },
      fidgetType: "iframe",
      id: "iframe:c98bcd08-0fe8-4d27-9c2e-214a8d28c3de",
    },
    "iframe:c9f34918-b20e-417a-afae-86ee410bb6ba": {
      config: {
        data: {},
        editable: true,
        settings: {
          url: "https://highlight.xyz/mint/663d2717dffb7b3a490f398f?fcframe=tx",
        },
      },
      fidgetType: "iframe",
      id: "iframe:c9f34918-b20e-417a-afae-86ee410bb6ba",
    },
    "text:14ac63b4-c3d6-41dc-b220-b06c7d481cae": {
      config: {
        data: {},
        editable: true,
        settings: {
          fontColor: "var(--user-theme-font-color)",
          fontFamily: "var(--user-theme-font)",
          headingsFontColor: "var(--user-theme-headings-font-color)",
          headingsFontFamily: "var(--user-theme-headings-font)",
          text: "Your space to create, customize, and explore. To customize your own space, you need to hold at least one pair of nOGs. If you don't have nOGs yet, you can mint them in the fidget below! If you're not sold on nOGs yet, don't worry, you can explore other customized spaces or check out the $SPACE Fair Launch, and then come back and mint nOGs any time :)",
          title: "Welcome to nounspace! 🚀👾",
        },
      },
      fidgetType: "text",
      id: "text:14ac63b4-c3d6-41dc-b220-b06c7d481cae",
    },
  },
  isEditable: false,
  fidgetTrayContents: [],
};

export default USER_NOT_LOGGED_IN_HOMEBASE_CONFIG;
