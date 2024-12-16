import { SpaceConfig } from "@/common/components/templates/Space";

const layoutIDTab1 = "tab1-layout";
const layoutIDTab2 = "tab2-layout";
const layoutIDPressTab = "press-tab-layout";

export const TAB1_HOMEBASE_CONFIG: SpaceConfig = {
  layoutID: layoutIDTab1,
  layoutDetails: {
    layoutConfig: {
      layout: [
        {
          h: 3,
          i: 'text:a387c228-e3be-49ce-afc5-2cf724fc6a9a',
          maxH: 36,
          maxW: 36,
          minH: 2,
          minW: 3,
          moved: false,
          resizeHandles: [
            's',
            'w',
            'e',
            'n',
            'sw',
            'nw',
            'se',
            'ne'
          ],
          'static': false,
          w: 5,
          x: 0,
          y: 0
        },
        {
          h: 7,
          i: 'feed:0a733141-d56e-41c9-9eba-7bf5a52d8bb3',
          maxH: 36,
          maxW: 36,
          minH: 2,
          minW: 4,
          moved: false,
          resizeHandles: [
            's',
            'w',
            'e',
            'n',
            'sw',
            'nw',
            'se',
            'ne'
          ],
          'static': false,
          w: 5,
          x: 0,
          y: 3
        },
        {
          h: 3,
          i: 'Video:ae0ef24e-b2d0-4a50-95ce-7bc3493cced5',
          maxH: 36,
          maxW: 36,
          minH: 2,
          minW: 2,
          moved: false,
          resizeHandles: [
            's',
            'w',
            'e',
            'n',
            'sw',
            'nw',
            'se',
            'ne'
          ],
          'static': false,
          w: 4,
          x: 5,
          y: 0
        },
        {
          h: 2,
          i: 'text:8f46b706-2663-4548-b60a-2a0540ff555c',
          maxH: 36,
          maxW: 36,
          minH: 2,
          minW: 3,
          moved: false,
          resizeHandles: [
            's',
            'w',
            'e',
            'n',
            'sw',
            'nw',
            'se',
            'ne'
          ],
          'static': false,
          w: 3,
          x: 5,
          y: 5
        },
        {
          h: 2,
          i: 'text:830ce08f-d62a-4612-813f-c07fc99fe6c9',
          maxH: 36,
          maxW: 36,
          minH: 2,
          minW: 3,
          moved: false,
          resizeHandles: [
            's',
            'w',
            'e',
            'n',
            'sw',
            'nw',
            'se',
            'ne'
          ],
          'static': false,
          w: 3,
          x: 5,
          y: 3
        },
        {
          h: 7,
          i: 'iframe:fe5a0ca2-bd55-488e-90a9-287e2b47cf38',
          maxH: 36,
          maxW: 36,
          minH: 2,
          minW: 2,
          moved: false,
          resizeHandles: [
            's',
            'w',
            'e',
            'n',
            'sw',
            'nw',
            'se',
            'ne'
          ],
          'static': false,
          w: 4,
          x: 8,
          y: 3
        },
        {
          h: 3,
          i: 'text:7ff78427-4a17-4195-a962-7f08e66f3f3f',
          maxH: 36,
          maxW: 36,
          minH: 2,
          minW: 3,
          moved: false,
          resizeHandles: [
            's',
            'w',
            'e',
            'n',
            'sw',
            'nw',
            'se',
            'ne'
          ],
          'static': false,
          w: 3,
          x: 9,
          y: 0
        },
        {
          h: 3,
          i: 'text:281541a8-d9f4-46e6-b574-8e6ca0867b02',
          maxH: 36,
          maxW: 36,
          minH: 2,
          minW: 3,
          moved: false,
          resizeHandles: [
            's',
            'w',
            'e',
            'n',
            'sw',
            'nw',
            'se',
            'ne'
          ],
          'static': false,
          w: 3,
          x: 5,
          y: 7
        }
      ]
    },
    layoutFidget: 'grid'
  },
  theme: {
    id: 'colorBlobs',
    name: 'Color Blobs',
    properties: {
      background: '#fbe9e0',
      backgroundHTML: '\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width,initial-scale=1">\n    <title>SVG Animation</title>\n    <style>\n        body {\n            background-color: #fee440;\n            margin: 0;\n            padding: 0;\n        }\n        svg {\n            position: fixed;\n            top: 0;\n            left: 0;\n            width: 100%;\n            height: 100vh;\n        }\n        .links {\n            position: fixed;\n            bottom: 20px;\n            right: 20px;\n            font-size: 18px;\n            font-family: sans-serif;\n        }\n        a {\n            text-decoration: none;\n            color: #000;\n            margin-left: 1em;\n        }\n        a:hover {\n            text-decoration: underline;\n        }\n        a img.icon {\n            display: inline-block;\n            height: 1em;\n            margin: 0 0 -0.1em 0.3em;\n        }\n        @keyframes rotate {\n            0% {\n                transform: rotate(0);\n            }\n            100% {\n                transform: rotate(360deg);\n            }\n        }\n        .out-top {\n            animation: rotate 20s linear infinite;\n            transform-origin: 13px 25px;\n        }\n        .in-top {\n            animation: rotate 10s linear infinite;\n            transform-origin: 13px 25px;\n        }\n        .out-bottom {\n            animation: rotate 25s linear infinite;\n            transform-origin: 84px 93px;\n        }\n        .in-bottom {\n            animation: rotate 15s linear infinite;\n            transform-origin: 84px 93px;\n        }\n    </style>\n</head>\n<body>\n    <svg preserveAspectRatio="xMidYMid slice" viewBox="10 10 80 80">\n        <path fill="#9b5de5" class="out-top" d="M37-5C25.1-14.7,5.7-19.1-9.2-10-28.5,1.8-32.7,31.1-19.8,49c15.5,21.5,52.6,22,67.2,2.3C59.4,35,53.7,8.5,37-5Z"/>\n        <path fill="#f15bb5" class="in-top" d="M20.6,4.1C11.6,1.5-1.9,2.5-8,11.2-16.3,23.1-8.2,45.6,7.4,50S42.1,38.9,41,24.5C40.2,14.1,29.4,6.6,20.6,4.1Z"/>\n        <path fill="#00bbf9" class="out-bottom" d="M105.9,48.6c-12.4-8.2-29.3-4.8-39.4.8-23.4,12.8-37.7,51.9-19.1,74.1s63.9,15.3,76-5.6c7.6-13.3,1.8-31.1-2.3-43.8C117.6,63.3,114.7,54.3,105.9,48.6Z"/>\n        <path fill="#00f5d4" class="in-bottom" d="M102,67.1c-9.6-6.1-22-3.1-29.5,2-15.4,10.7-19.6,37.5-7.6,47.8s35.9,3.9,44.5-12.5C115.5,92.6,113.9,74.6,102,67.1Z"/>\n    </svg>\n>\n</body>\n</html>\n',
      fidgetBackground: '#ffffff80',
      fidgetBorderColor: '#ffffff',
      fidgetBorderWidth: '1px',
      fidgetShadow: 'none',
      font: 'Quicksand',
      fontColor: '#000000',
      headingsFont: 'Roboto',
      headingsFontColor: '#000000',
      musicURL: 'https://www.youtube.com/watch?v=dMXlZ4y7OK4&t=1804'
    }
  },
  fidgetInstanceDatums: {
    'text:281541a8-d9f4-46e6-b574-8e6ca0867b02': {
      config: {
        data: {},
        editable: true,
        settings: {
          background: 'rgba(255, 255, 255, 0.87)',
          css: '',
          fidgetBorderColor: 'rgb(255, 98, 98)',
          fidgetBorderWidth: '2px',
          fidgetShadow: 'Medium',
          fontColor: '#000000',
          fontFamily: 'Quicksand',
          headingsFontColor: '#000000',
          headingsFontFamily: 'Roboto',
          text: 'You can embed any website or app that allows it. Try it out with the portal for $SPACE, the governance & utility token for nounspace.',
          title: 'This is a Web Embed Fidget ➡️',
          urlColor: 'blue'
        }
      },
      fidgetType: 'text',
      id: 'text:281541a8-d9f4-46e6-b574-8e6ca0867b02'
    },
    'text:7ff78427-4a17-4195-a962-7f08e66f3f3f': {
      config: {
        data: {},
        editable: true,
        settings: {
          background: 'rgba(255, 255, 255, 0.87)',
          css: '',
          fidgetBorderColor: 'rgb(255, 180, 92)',
          fidgetBorderWidth: '2px',
          fidgetShadow: 'Medium',
          fontColor: '#000000',
          fontFamily: 'Quicksand',
          headingsFontColor: '#000000',
          headingsFontFamily: 'Roboto',
          text: 'As an open-source and community-owned platform, **everyone** is invited to join the community and contribute to building the future of social.\n\nIf you have any questions, join the community [Discord](https://discord.gg/eYQeXU2WuH) or tag [@nounspacetom](https://nounspace.com/s/nounspacetom) in a cast.\n',
          title: '',
          urlColor: 'blue'
        }
      },
      fidgetType: 'text',
      id: 'text:7ff78427-4a17-4195-a962-7f08e66f3f3f'
    },
    'text:830ce08f-d62a-4612-813f-c07fc99fe6c9': {
      config: {
        data: {},
        editable: true,
        settings: {
          background: 'rgba(255, 255, 255, 0.87)',
          css: '',
          fidgetBorderColor: 'rgba(253, 228, 65, 1)',
          fidgetBorderWidth: '2px',
          fidgetShadow: 'Medium',
          fontColor: '#000000',
          fontFamily: 'Quicksand',
          headingsFontColor: '#000000',
          headingsFontFamily: 'Roboto',
          text: 'Use it to embed any video from Youtube or Vimeo.',
          title: 'This is a Video Fidget ⬆️ ',
          urlColor: 'blue'
        }
      },
      fidgetType: 'text',
      id: 'text:830ce08f-d62a-4612-813f-c07fc99fe6c9'
    },
    'text:8f46b706-2663-4548-b60a-2a0540ff555c': {
      config: {
        data: {},
        editable: true,
        settings: {
          background: 'rgba(255, 255, 255, 0.87)',
          css: '',
          fidgetBorderColor: 'rgba(8, 188, 249, 1)',
          fidgetBorderWidth: '2px',
          fidgetShadow: 'Medium',
          fontColor: '#000000',
          fontFamily: 'Quicksand',
          headingsFontColor: '#000000',
          headingsFontFamily: 'Roboto',
          text: 'Filter it to show any user or channel on Farcaster or X.',
          title: '⬅️ This is a Feed Fidget',
          urlColor: 'blue'
        }
      },
      fidgetType: 'text',
      id: 'text:8f46b706-2663-4548-b60a-2a0540ff555c'
    },
    'text:a387c228-e3be-49ce-afc5-2cf724fc6a9a': {
      config: {
        data: {},
        editable: true,
        settings: {
          background: 'rgba(255, 255, 255, 0.87)',
          css: '',
          fidgetBorderColor: 'rgba(155, 94, 229, 1)',
          fidgetBorderWidth: '2px',
          fidgetShadow: 'Medium',
          fontColor: '#000000',
          fontFamily: 'Quicksand',
          headingsFontColor: '#000000',
          headingsFontFamily: 'Roboto',
          text: 'The customizable Farcaster client inspired by Myspace.\n\nLog in with Farcaster  to customize the look, sound, and functionality of your Feed and Profile Space with **Themes**, **Fidgets** (aka mini-apps), and **Tabs**.',
          title: 'GM, and welcome to nounspace 🚀 👾',
          urlColor: 'blue'
        }
      },
      fidgetType: 'text',
      id: 'text:a387c228-e3be-49ce-afc5-2cf724fc6a9a'
    },
    'feed:0a733141-d56e-41c9-9eba-7bf5a52d8bb3': {
      config: {
        data: {},
        editable: true,
        settings: {
          Xhandle: 'thenounspace',
          background: 'rgba(255, 255, 255, 0.87)',
          channel: 'nounspace',
          feedType: 'filter',
          fidgetBorderColor: 'rgba(240, 93, 181, 1)',
          fidgetBorderWidth: '4px',
          fidgetShadow: 'Medium',
          filterType: 'channel_id',
          fontColor: '#000000',
          fontFamily: 'Quicksand',
          selectPlatform: {
            icon: '/images/farcaster.jpeg',
            name: 'Farcaster'
          },
          style: 'light',
          users: ''
        }
      },
      fidgetType: 'feed',
      id: 'feed:0a733141-d56e-41c9-9eba-7bf5a52d8bb3'
    },
    'iframe:fe5a0ca2-bd55-488e-90a9-287e2b47cf38': {
      config: {
        data: {},
        editable: true,
        settings: {
          background: 'rgba(255, 255, 255, 0.87)',
          fidgetBorderColor: 'rgba(0, 227, 196, 1)',
          fidgetBorderWidth: '4px',
          fidgetShadow: 'Medium',
          size: 0.6,
          url: 'https://space.nounspace.com'
        }
      },
      fidgetType: 'iframe',
      id: 'iframe:fe5a0ca2-bd55-488e-90a9-287e2b47cf38'
    },
    'iframe:8fa2c65f-6224-4b75-afcc-d5cad0c2e7e5': {
      config: {
        data: {},
        editable: true,
        settings: {
          background: 'rgba(255, 255, 255, 0)',
          fidgetBorderColor: 'rgba(0, 227, 196, 0)',
          url: 'https://player.vimeo.com/video/973566244?h=c6cefbe4c3',
        }
      },
      fidgetType: 'iframe',
      id: 'iframe:8fa2c65f-6224-4b75-afcc-d5cad0c2e7e5'
    },
  },
  isEditable: true,
  fidgetTrayContents: []
};

export const FIDGETS_TAB_HOMEBASE_CONFIG: SpaceConfig = {
  layoutID: layoutIDTab2,
  layoutDetails: {
    layoutConfig: {
      layout: [
        {
          h: 6,
          i: "text:a1acd942-be81-4ab6-ae4e-2b6e41ccfde2",
          maxH: 36,
          maxW: 36,
          minH: 2,
          minW: 3,
          moved: false,
          resizeHandles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"],
          static: false,
          w: 7,
          x: 0,
          y: 0,
        },
        {
          h: 5,
          i: "governance:655926c1-41f6-4179-b653-aa2aff3ece03",
          maxH: 36,
          maxW: 36,
          minH: 2,
          minW: 2,
          moved: false,
          resizeHandles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"],
          static: false,
          w: 3,
          x: 9,
          y: 5,
        },
        {
          h: 2,
          i: "Video:ef661762-46f3-460d-89ff-eb3165130183",
          maxH: 36,
          maxW: 36,
          minH: 2,
          minW: 2,
          moved: false,
          resizeHandles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"],
          static: false,
          w: 2,
          x: 0,
          y: 6,
        },
        {
          h: 4,
          i: "Rss:26ef43b7-8e38-4223-8c31-84adca18dd05",
          maxH: 36,
          maxW: 36,
          minH: 2,
          minW: 3,
          moved: false,
          resizeHandles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"],
          static: false,
          w: 3,
          x: 6,
          y: 6,
        },
        {
          h: 4,
          i: "iframe:83896255-e7e0-4c5e-81d2-3e7b0eebcb1a",
          maxH: 36,
          maxW: 36,
          minH: 2,
          minW: 2,
          moved: false,
          resizeHandles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"],
          static: false,
          w: 2,
          x: 4,
          y: 6,
        },
        {
          h: 3,
          i: "frame:d09e3c75-a15f-4d52-b0f5-39c970ad1ab8",
          maxH: 36,
          maxW: 36,
          minH: 2,
          minW: 2,
          moved: false,
          resizeHandles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"],
          static: false,
          w: 2,
          x: 2,
          y: 6,
        },
        {
          h: 5,
          i: "links:9cb3dac9-5458-4b0a-9f5d-5517b3e9f06f",
          maxH: 36,
          maxW: 36,
          minH: 2,
          minW: 2,
          moved: false,
          resizeHandles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"],
          static: false,
          w: 5,
          x: 7,
          y: 0,
        },
      ],
    },
    layoutFidget: "grid",
  },
  theme: {
    id: "imageParallax",
    name: "Image Parallax",
    properties: {
      background: "#000000",
      backgroundHTML: `
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        /* CSS Configuration for background and animation */
    </style>
</head>
<body>
    <div class="container">
        <img src="https://nounspace.com/images/rainforest.png?raw=true" class="background">
        <p class="message">to infinity and beyond</p>
    </div>
</body>
</html>`,
      fidgetBackground: "#00000099", // Equivalent to rgba(0, 0, 0, 0.6)
      fidgetBorderColor: "transparent",
      fidgetBorderWidth: "0",
      fidgetShadow: "0 5px 15px rgba(0,0,0,0.55)",
      font: "Inter",
      fontColor: "#FFFFFF",
      headingsFont: "Poppins",
      headingsFontColor: "#FFFFFF",
      musicURL: "https://www.youtube.com/watch?v=dMXlZ4y7OK4&t=1804",
    },
  },
  fidgetInstanceDatums: {
    "text:a1acd942-be81-4ab6-ae4e-2b6e41ccfde2": {
      config: {
        data: {},
        editable: true,
        settings: {
          background: "rgba(70, 69, 69, 0.27)",
          css: "",
          fidgetBorderColor: "rgb(159, 111, 206)",
          fidgetBorderWidth: "2px",
          fidgetShadow: "0 4px 8px rgba(0,0,0,0.25)",
          fontColor: "rgb(221, 221, 221)",
          fontFamily: "'__Inter_36bd41', '__Inter_Fallback_36bd41'",
          headingsFontColor: "rgb(228, 228, 228)",
          headingsFontFamily:
            "'__Trispace_3014ec', '__Trispace_Fallback_3014ec'",
          text: "Did you ever wish you could do more on social than post, like, and comment? Fidgets make this possible. In fact, Fidgets make anything possible. Arrange and configure a growing library of Fidgets on your social profile (your Space) or your homebase to seamlessly bridge the vast digital universe into social, and social into to digital universe. \n\nLearn more about each Fidget from the Fidget on the right 👉\n\nJoin the [Discord](https://discord.gg/eYQeXU2WuH) to get early access to the  Fidget SDK\n\nCheck out a few examples of Fidgets below 📺  ⏹️  🌐 🛰️ 🏛️",
          title: "Fidgets are customizable fun-sized apps",
          urlColor: "rgb(40, 206, 246)",
        },
      },
      fidgetType: "text",
      id: "text:a1acd942-be81-4ab6-ae4e-2b6e41ccfde2",
    },
    "governance:655926c1-41f6-4179-b653-aa2aff3ece03": {
      config: {
        data: {},
        editable: true,
        settings: {
          background: "rgb(255, 255, 255)",
          fidgetBorderColor: "rgb(238, 238, 31)",
          fidgetBorderWidth: "4px",
          fidgetShadow: "0 5px 15px rgba(0,0,0,0.55)",
          selectedDao: {
            contract: "",
            graphUrl:
              "https://api.goldsky.com/api/public/project_cldf2o9pqagp43svvbk5u3kmo/subgraphs/nouns/prod/gn",
            icon: "/images/nouns_yellow_logo.jpg",
            name: "Nouns DAO",
          },
        },
      },
      fidgetType: "governance",
      id: "governance:655926c1-41f6-4179-b653-aa2aff3ece03",
    },
    "Video:ef661762-46f3-460d-89ff-eb3165130183": {
      config: {
        data: {},
        editable: true,
        settings: {
          background: "rgba(119, 99, 99, 0)",
          fidgetBorderColor: "rgba(0, 0, 0, 0)",
          fidgetBorderWidth: "2px",
          fidgetShadow: "Medium",
          size: 0.6,
          url: "https://vimeo.com/1011777733?share=copy",
        },
      },
      fidgetType: "Video",
      id: "Video:ef661762-46f3-460d-89ff-eb3165130183",
    },
    "Rss:26ef43b7-8e38-4223-8c31-84adca18dd05": {
      config: {
        data: {},
        editable: true,
        settings: {
          background: "rgb(255, 255, 255)",
          css: "",
          fidgetBorderColor: "rgb(6, 219, 19)",
          fidgetBorderWidth: "2px",
          fidgetShadow: "0 4px 8px rgba(0,0,0,0.25)",
          fontColor: "#000000",
          fontFamily: "'__Noto_Serif_276ada', '__Noto_Serif_Fallback_276ada'",
          headingsFontColor: "#000000",
          headingsFontFamily:
            "'__Noto_Serif_276ada', '__Noto_Serif_Fallback_276ada'",
          itemBackground: "#FFFFFF",
          itemBorderColor: "rgb(1, 172, 140)",
          rssUrl: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml",
        },
      },
      fidgetType: "Rss",
      id: "Rss:26ef43b7-8e38-4223-8c31-84adca18dd05",
    },
    "iframe:83896255-e7e0-4c5e-81d2-3e7b0eebcb1a": {
      config: {
        data: {},
        editable: true,
        settings: {
          background: "#FFFFFF",
          fidgetBorderColor: "rgb(255, 10, 173)",
          fidgetBorderWidth: "4px",
          fidgetShadow: "0 5px 15px rgba(0,0,0,0.55)",
          size: 0.5,
          url: "https://funhtml5games.com?embed=snake2",
        },
      },
      fidgetType: "iframe",
      id: "iframe:83896255-e7e0-4c5e-81d2-3e7b0eebcb1a",
    },
    "frame:d09e3c75-a15f-4d52-b0f5-39c970ad1ab8": {
      config: {
        data: {},
        editable: true,
        settings: {
          url: "https://xframes.web3.getpercs.com/cf/f50c4280-4536-494e-8128-c52d702728c8/v1",
        },
      },
      fidgetType: "frame",
      id: "frame:d09e3c75-a15f-4d52-b0f5-39c970ad1ab8",
    },
    "links:9cb3dac9-5458-4b0a-9f5d-5517b3e9f06f": {
      config: {
        data: {},
        editable: true,
        settings: {
          title: "Fidget Info",
          DescriptionColor: "rgb(255, 251, 251)",
          HeaderColor: "rgb(255, 255, 255)",
          background: "rgba(65, 64, 64, 0.15)",
          css: "",
          fidgetBorderColor: "rgb(62, 153, 245)",
          fidgetBorderWidth: "2px",
          fidgetShadow: "Medium",
          headingsFontFamily: "Londrina Solid",
          itemBackground: "rgba(75, 82, 88, 0)",
          links: [
            {
              avatar: "https://emoji.beeimg.com/📄/apple",
              description:
                "Add formatted text, links, images, or any markdown...",
              text: "Text",
              url: "https://app.charmverse.io/nounspace/text-8036391353089638",
            },
            {
              avatar: "https://emoji.beeimg.com/%F0%9F%96%BC/apple",
              description:
                "Embed an image with the Image Fidget. To add an image...",
              text: "Images",
              url: "https://app.charmverse.io/nounspace/images-5056015440990447",
            },
            {
              avatar:
                "https://cdn-0.emojis.wiki/emoji-pics/apple/stop-button-apple.png",
              description:
                "Frames are interactive mini-apps you can embed in...",
              text: "Farcaster Frame",
              url: "https://app.charmverse.io/nounspace/farcaster-frame-6604685389213765",
            },
            {
              avatar: "https://emoji.beeimg.com/📰/apple",
              description:
                "Display and interact with posts from Farcaster or X.",
              text: "Feed",
              url: "https://app.charmverse.io/nounspace/feed-3742363005936422",
            },
            {
              avatar:
                "https://cdn-0.emojis.wiki/emoji-pics/apple/classical-building-apple.png",
              description:
                "Track and participate in Governance for dozens of Nounish...",
              text: "Nounish Governance",
              url: "https://app.charmverse.io/nounspace/nounish-governance-1237568255581658",
            },
            {
              avatar:
                "https://cdn-0.emojis.wiki/emoji-pics/apple/globe-with-meridians-apple.png",
              description:
                "Embed entire websites and applications in the iFrame Fidget.",
              text: "iFrame",
              url: "https://app.charmverse.io/nounspace/iframe-8914759019717753",
            },
            {
              avatar:
                "https://cdn-0.emojis.wiki/emoji-pics/apple/link-apple.png",
              description:
                "Display clickable links along with Title, Avatar, and Description.",
              text: "Links",
              url: "https://app.charmverse.io/nounspace/links-7116041545278364",
            },
            {
              avatar:
                "https://cdn-0.emojis.wiki/emoji-pics/apple/television-apple.png",
              description: "Embed any public video from Youtube or Vimeo.",
              text: "Video",
              url: "https://app.charmverse.io/nounspace/video-8357427813677607",
            },
            {
              avatar:
                "https://cdn-0.emojis.wiki/emoji-pics/apple/satellite-apple.png",
              description:
                "Embed any RSS Feed and links to view the full content.",
              text: "RSS",
              url: "https://app.charmverse.io/nounspace/rss-5339368540795153",
            },
            {
              avatar:
                "https://cdn-0.emojis.wiki/emoji-pics/apple/high-voltage-apple.png",
              description:
                "Track and participate in governance for over 75k DAOs.",
              text: "SnapShot Governance",
              url: "https://app.charmverse.io/nounspace/snapshot-governance-7877322883244935",
            },
            {
              avatar:
                "https://cdn-0.emojis.wiki/emoji-pics/apple/speech-balloon-apple.png",
              description: "Embed any cast any where you want on your space.",
              text: "Pinned Cast",
              url: "https://app.charmverse.io/nounspace/pinned-cast-39302135409041106",
            },
          ],
        },
      },
      fidgetType: "links",
      id: "links:9cb3dac9-5458-4b0a-9f5d-5517b3e9f06f",
    },
  },
  isEditable: true,
  fidgetTrayContents: [],
};

export const PRESS_TAB_HOME_CONFIG: SpaceConfig = {
  layoutID: layoutIDPressTab,
  layoutDetails: {
    layoutConfig: {
      layout: [
        {
          h: 4,
          i: "text:4dda7826-fe5c-409d-add9-9f317f1b618c",
          maxH: 36,
          maxW: 36,
          minH: 2,
          minW: 3,
          moved: false,
          resizeHandles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"],
          static: false,
          w: 7,
          x: 0,
          y: 0,
        },
        {
          h: 3,
          i: "links:0a8f0c9c-7d3a-447d-a05d-c22d3753a594",
          maxH: 36,
          maxW: 36,
          minH: 2,
          minW: 2,
          moved: false,
          resizeHandles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"],
          static: false,
          w: 5,
          x: 7,
          y: 0,
        },
        {
          h: 6,
          i: "iframe:16a9d2bb-3092-4aba-a133-088d952bc75f",
          maxH: 36,
          maxW: 36,
          minH: 2,
          minW: 2,
          moved: false,
          resizeHandles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"],
          static: false,
          w: 3,
          x: 4,
          y: 4,
        },
        {
          h: 7,
          i: "links:e08d52da-2467-42c9-b2a1-44fee9c6da74",
          maxH: 36,
          maxW: 36,
          minH: 2,
          minW: 2,
          moved: false,
          resizeHandles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"],
          static: false,
          w: 5,
          x: 7,
          y: 3,
        },
        {
          h: 6,
          i: "text:e95ddfc6-1294-488d-b3ec-f6cfe26d7ab7",
          maxH: 36,
          maxW: 36,
          minH: 2,
          minW: 3,
          moved: false,
          resizeHandles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"],
          static: false,
          w: 4,
          x: 0,
          y: 4,
        },
      ],
    },
    layoutFidget: "grid",
  },
  theme: {
    id: "retro",
    name: "Retro",
    properties: {
      background: "#ffffff",
      backgroundHTML: `
        <html><head><style>
          html, body { height: 100%; }
          body { 
            background-image: linear-gradient(0deg, rgba(253, 253, 253, 1) 0%, rgba(203, 213, 224, 1) 100%);
            background-repeat: no-repeat;
          }
        </style></head><body></body></html>`,
      fidgetBackground: "#FFFFFF",
      fidgetBorderColor: "#90A5B9",
      fidgetBorderWidth: "2px",
      fidgetShadow: "none",
      font: "IBM Plex Mono",
      fontColor: "#333333",
      headingsFont: "IBM Plex Mono",
      headingsFontColor: "#000000",
      musicURL: "https://www.youtube.com/watch?v=dMXlZ4y7OK4&t=1804",
    },
  },
  fidgetInstanceDatums: {
    "iframe:16a9d2bb-3092-4aba-a133-088d952bc75f": {
      config: {
        data: {},
        editable: true,
        settings: {
          background: "#FFFFFF",
          fidgetBorderColor: "#90a5b9",
          fidgetBorderWidth: "1px",
          fidgetShadow: "None",
          url: "https://paragraph.xyz/@nounspace",
        },
      },
      fidgetType: "iframe",
      id: "iframe:16a9d2bb-3092-4aba-a133-088d952bc75f",
    },
    "links:0a8f0c9c-7d3a-447d-a05d-c22d3753a594": {
      config: {
        data: {},
        editable: true,
        settings: {
          title: "Links",
          viewMode: "grid",
          links: [
            {
              avatar:
                "https://paragraph.xyz/_next/image?url=https%3A%2F%2Fstorage.googleapis.com%2Fpapyrus_images%2F82bfc2a28d3e8dda0ffa636054e43791.jpg&w=48&q=75",
              text: "Tom's Blog",
              url: "https://paragraph.xyz/@nounspace",
            },
            {
              avatar: "/images/noggles.svg",
              text: "Logo Files",
              url: "https://drive.google.com/drive/folders/119CekUdAF-bgekPYsDq9wtKUZrAx6Pil?usp=drive_link",
            },
            {
              avatar: "https://www.nounspace.com/images/chainEmoji.png",
              text: "FAQ",
              url: "https://mobile.nounspace.com/faq/nounspace",
            },
          ],
        },
      },
      fidgetType: "links",
      id: "links:0a8f0c9c-7d3a-447d-a05d-c22d3753a594",
    },
    "links:e08d52da-2467-42c9-b2a1-44fee9c6da74": {
      config: {
        data: {},
        editable: true,
        settings: {
          title: "Past Media",
          viewMode: "list",
          links: [
            {
              avatar:
                "https://pods.media/_next/image?url=%2F_next%2Fimage%3Furl%3Dhttps%253A%252F%252Fgateway.irys.xyz%252FyJoy7OvYTzxXecmaat41_9kG--iIm17k1AA6sNmWIyk%26w%3D3840%26q%3D90&w=750&q=75",
              description: "",
              text: "Behind The Screen with Gramajo",
              url: "https://pods.media/behind-the-screen/nounspace",
            },
            {
              avatar:
                "https://yt3.ggpht.com/xluD6y51puQNKPXZLCMTOzOG-1oh68JlCFC4Y68U46Bf0yd1mXMsmwzoUsQvqhsg3Lct3wRrrw=s48-c-k-c0x00ffffff-no-rj",
              description: "",
              text: "GM Farcaster - Aug 16, 2024",
              url: "https://www.youtube.com/watch?v=ISh41XL4JvU&t=3522s",
            },
            {
              avatar:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAn1BMVEVHcEwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA2HhFpRjFNLh2uiGvfwKP/4b6XeGEbDwgAAADEpYv/1bG5nIMAAAB2XEn/zqf/yaD/wpbms47+u43+tYbXkmfAgVqEVzz/r3zzoG3+p3L/oGj+ml+wXzL/lljDZjT+kE9eLBLleDyVTSb9hT53NxXSZiuLPhb9dirhXRmxRxH+axmQYKgbAAAAF3RSTlMAAUyCteYtD5n///////////5s////yhnsUYEAAAHVSURBVHgBXI8FlsUgFEOpN3V3b/e/xkkfjP2L5+VAUMpSFrsituN6xHV8pbQoukW4BiFIFCcRiMPyd9NWh8U0y4WsKIHq+xZLHB7KOs8bkr8jb4FOG6QFQE99aP5MPTwJJkmAtBk+aAp4UiYd0mE0TPP3dijgKnmgQj9OEzuZgVR2PI8xbPPAKywip0zDRZ8XQBEH6aKJsIph+aaQz3pYVg2w7TQsqxbIm9PHsZ4abTguJEZZYwSMuJ+a2xg4TsPOmCGuW3P9Gm7DBke5uB/hq2jywHEYhoEgkL6KUJwPXFUvrv9/25EEdRn05ViNJgvPpwr/0YNe6VdxEFgYyS8uJLjBp+VePz3eEQkXBBcU5yKEESTa4gxr86cvKSTCgzEhhVCi95Ve6gTF+iZCbyWl2DW9UStyaiVWAyDPkYTUKoBp8bFMkGbHuTTCWzCdy1WSwg3XPWydKVjAmNja6ruRHWSJvlhetK5tZaX7mCFc5Ie5YVrXdeZS3tZ1Z1m5i0D9MvvGToYox7703DuoUzoXMjPLdhxbB8sHY3CWIi8hBpdEIXJfZHTG5MlVBFJoAwPipDWWeHYuQ9n2PgEPWVtXGNN7hXI930dBFZXvp9f5/DpRldDwDzBISs+wuA1BAAAAAElFTkSuQmCC",
              description: "",
              text: "Onchain Outpost - July 23, 2024",
              url: "https://x.com/OnchainOutpost/status/1817701043766976591",
            },
            {
              avatar:
                "https://pbs.twimg.com/profile_images/1769995879555923968/AZYJRn28_400x400.jpg",
              description: "",
              text: "Web3 on Fire - Nouns meets Farcaster  - July 18, 2024",
              url: "https://x.com/onfireweb3/status/1813946352813953080",
            },
            {
              avatar:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAAe1BMVEUNGC0DEioAABgADyc+Q1DCw8YAAAAAACAKFixHTFcAAAr////h4uPl5ud4eoKOkJbs7e7Y2dsAAAvw8fLIycyrrLEoLz8AABTS09VMUVxhZG0AABuxsrYAABB6fYSIipAMGC0gJzk4PkstNEJobHRWWmMSHTGdn6RaXmibKmQUAAAA1ElEQVR4Ac3LVZYCMRAF0OpIJaTa3Q3d/woHJxngnxvPOw9+lMc4PHHmOZmQApWGM61wI4WdakN+EKI5Y1GcUKrBYjIUOWVnVJSYGbBVdYNBe65iVGNTV2DrirAvBjhDWYRFBzY1+jUOV1gHowIbF5T4dwkJ7janIJiX8mxZMn9ym0OyjtmitO62tGvyCmyMFDbUdGxPKx7IgEVrSXExZrswG/uMejU7abqJ4z4mOm+BGM6Zg+MxNkGA8RE5vNFDS2etVbN1e6JTB1+wcWLwlVLw0/4AS1IOfUxzU6kAAAAASUVORK5CYII=",
              description: "",
              text: "ShapeShift + nounspace: the future of socials - July 10, 2024",
              url: "https://x.com/ShapeShift/status/1810419411280646567",
            },
            {
              avatar:
                "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/15709126-e03b-4e36-3d57-55c54511de00/original",
              description: "",
              text: "Onchain Summer Series: nounspace - July 2, 2024",
              url: "https://warpcast.com/pauline-unik/0xa113dd28",
            },
            {
              avatar:
                "https://wrpcd.net/cdn-cgi/image/anim=false,fit=contain,f=auto,w=288/https%3A%2F%2Fi.imgur.com%2F6lOihsD.jpg",
              description: "",
              text: "ATX DAO Podcast: nounspace",
              url: "https://warpcast.com/atxdao/0x2349baef",
            },
            {
              avatar:
                "https://pbs.twimg.com/profile_images/1793327318376583169/UWkosbOE_400x400.jpg",
              description: "",
              text: "Manifest Mondays: nounspace",
              url: "https://x.com/ManifestAIs/status/1807894759098536163",
            },
            {
              avatar:
                "https://s3-us-west-2.amazonaws.com/anchor-generated-image-bank/staging/podcast_uploaded_nologo400/41719828/41719828-1722209465604-6a760bf3e745d.jpg",
              description: "",
              text: "Hash Rate Ep. 58: nounspace on Farcaster",
              url: "https://x.com/willyogo/status/1803566976150782171",
            },
            {
              avatar:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFwAAABcCAMAAADUMSJqAAAAnFBMVEUAAACTAP/////JyclbBpqRA/gYBCiYAP/7+/uenp6FA+eEhITX19e/v78rBEl+fn6vr6/f39/t7e3n5+ekpKR4eHjPz8+QkJAjIyMyMjJYWFiWlpaEBuMtLS1CQkJRUVFtbW0XFxd5BtFlZWUQEBAcBC4hBDknBEA5BWBEBXQTAxpABm1zBsQxBFAVBCSCBNtTBY5iBKdrBrdOBIDhc0icAAACwklEQVRoge2W7XaiMBBAx1AbIkH5/koFRKvtLhbtvv+77UwQtx7Ztvb4M/cH5iThMsxMDgIYDAaDwWAwGAwGw5153m53u9285/mu6pfZlPMJH5g+zfV0lQ0byhxgU/zI/conl/DpL5q3TrqlHy0AcknXW/l9cn/44a+04NYObCool2UUw6JIsryMK4C4qG6Ou53wFq9d204n/EHLfRWUCXiOFLUfJUmkmAjyxHPt77r3Q8BvXQfd02O7e+GDvADXcSFaSJEmkEmhLEiVBAgBVqvsKzPSDHk+HB+2D8cDf3w9yyPwCx8SlMdBhvGrBFQsVRRgPZidDwrPJaz4Wj4bqtnt583+peGz/Tvv5aknHUilV0RxsZaeWtQC4jWksX8pD5hGfCLnsOVz4Ic/b80p8nE8z3fG5PZInmbn/msb3rzz6bHln8qxe+BSnpeZy9h6ZOtZToeo78NJL18qRWksVbrBI5Qqh+Yiy9XdjvKlsqy0l8SMeWNx/JN/PEU6cptRz3mM4WGqGLMAlE5AmGm5rZNBPV/RZHqbHN+1BPAZiwAixmJwSILOkOSIj2N7BbDQz3Sv5U//l9fUATnTspDZG3qVSj/TIbnU2aEngxdQUa978RM5YGyQMgwPNuRaY2rWdY0JTshKCdnYuAVOrylvSQskGK7F0BPji6c6Kz2+LihtCVnQe5ZsGH0pP+i1lLHaZqlkHsaVUeS2HyKBS5GXfdF9yAR2Zfl9+V6v4Q1YzqVgmFK/b5/ydJtFudHJiBwaZv5YN47JeXtaDHU1qdN03agrXM8N4r5b7CSgg5kPybo+oiMF5d2wiA1I8VAr6A/HKeshlYPpPqf5dT87ckS7a3dzXiyFEpiIWAjVT2QikS4d1YVwIJJSbPQsjqLVtRv+XH3jupFdP+Uwm15wvKMbefzAff9WGAwGg8FgMBgMBsOP+QuN5S2pnAdspgAAAABJRU5ErkJggg==",
              description: "Description",
              text: "Building Web3 Ep. 12: nounspace",
              url: "https://x.com/jaxxdwyer/status/1802390640061202940",
            },
            {
              avatar:
                "https://pbs.twimg.com/profile_images/1828796329990217729/qo0r6mks_400x400.jpg",
              description: "",
              text: "Tacobytes #661: How to stake with nounspace",
              url: "https://x.com/Player1Taco/status/1801717987000652126",
            },
            {
              avatar:
                "https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/50/16/83/50168304-2e1e-852a-dfad-91095492a4d5/mza_5168564415373999386.jpg/270x270bb.webp",
              description: "",
              text: "Based builders #18 with Toady and Carlos: nounspace",
              url: "https://x.com/thenounsquare/status/1800956863107957147",
            },
            {
              avatar:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAAAAABXZoBIAAAA/0lEQVR4AbXPIazCMACE4d+L2qoZFEGSIGcRc/gJJB5XMzGJmK9EN0HMi+qaibkKVF1txdQe4g0YzPK5yyWXHL9TaPNQ89LojH87N1rbJcXkMF4Fk31UMrf34hm14KUeoQxGArALHTMuQD2cAWQfJXOpgTbksGr9ng8qluShJTPhyCdx63POg7rEim95ZyR68I1ggQpnCEGwyPicw6hZtPEGmnhkycqOio1zm6XuFtyw5XDXfGvuau0dXHzJp8pfBPuhIXO9ZK5ILUCdSvLYMpc6ASBtl3EaC97I4KaFaOCaBE9Zn5jUsVqR2vcTJZO1DdbGoZryVp94Ka/mQfE7f2T3df0WBhLDAAAAAElFTkSuQmCC",
              description: "",
              text: "Decentralized AI with Morpheus, ShapeShift, and nounspace - June 6",
              url: "https://x.com/theNFThinker/status/1798377057581433310",
            },
            {
              avatar:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAA4CAMAAACfWMssAAABpFBMVEUAAAD/5w9JGPL/AFPDAPAA/6r/6g8A/6xZAG7JAPjQAESMAC7/AFX/AEaCFNFDGPVCCPWGbcf/7gCGeggAz4wz/aPUwwkA1I2zs7MOBTDXwW85APotDpU8FMiFA6SaAL6MjIxPT09qamobGxudnZ2lpaV4eHiAgIBZWVm+vr4mJiY0NDSACNRzACXTADmbWqxwZgZPRkOMv8+Dk5kjChSE3vosx/A40PS32OmS9dGG5+JYw+2U3/S0wvmaePmghP+wpdc0Ni2O4byc5ugArOZ0xu+zoPqKf8jc3Nxv2KwA5pB3xdtyWvpdU58eAJnMzMyq3Loq7KgAdlHm68hcO/1RRKGAeLedy2uZ3FbF6c347Zv662GmpbZu0QDN43L76XX5yV24qYucyXj3yYH4z3TStodtZ3Lnuu3xnwCXfl+HXADCtMfghPbPYen25ef1uEWIazyrjma7cdPjsPTwkbTuWUf5xZ/Fo5m5WE+rANvZfMXvf5b2sb7tLgCtMBcArHTbi4n4f2y9c22khoQAFgDxW4ClADfBo6oJAx7XwVsoAM9GAFVHCQj/AAAB40lEQVRIie3W+VPTQBTA8QcqeFJUxKeA7r7s5lQUb0SqgGDxivdRlCJWvEC0iiAFb0XxnyZNFqbjkYORn+h3ptPZHz5p38tMJgDRbdq8ZrEtdanqoBiuAlcc7qtXxYH7Ny7VemCrKg4sr3GbKjGsqQqqwP8Jl3s7Dm5XJYUrUduhw8thR/DoseMnKLFj7Sc7TnWmT5/psqXOiDhxJIbRF+pu7znbm+7rOzfCkWPGEJIMBIz+xf7z3Rd6my5eukzctITOXFdHFgdeudp/7Xr6xs1bHAzOwXQcrhGY0fD2nbvZgYHMPQBTerPZyBg3GLYJZLYIg8P3B3PZ7NDQAyCLI+gkPeJdIuNqGScMmsODVbmH+fwjImajQQKFkOgtOHJDI49zuSf5p88IyJ9Oc8CbE0pfoe756NjYi/Hxl6/IRMHQdCVHoVlgSd3Vw2Bh9PWb4sTbySkiFAjSwxowC6QR8VcL76aLM7MTU++JdJCSXPTWY0km3D9gg+pDMGJhurX48dPnL3bp5A/mgAaa7X1+g7WqncHxq/hW/D4X447DuqBFCNA1F7qFf8O4rQa4Q9WwK+hHXKie6DW7m1Kl6puTQ/+dIFWBf4X+VpPDn/Mtfs3ry/oVAzaq854NZe1NBNcutdrhAhV+XVox7jEhAAAAAElFTkSuQmCC",
              description: "",
              text: "Interview with SmartEconomyPodcast at Consensus 2024",
              url: "https://warpcast.com/dylang/0x3c89a276",
            },
            {
              avatar:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAAYFBMVEX///++v79wcXEbICAABwcCCgrS09MZHR0AAAC2uLh6fHyhoqI9Pz+AgoKPkJBER0clKCjHyMhlZ2fq6+tXWVliZGTP0NCtrq4zNjbg4eFwcnKGh4eoqakKEBBNUFCWl5c0vmC5AAAA5ElEQVR4AX3TRQLDQAwDQC07ZWb4/ysLtgpBHTPLdqBxPsT0TQzegUEuIjSqSMlmlYh+Eou5SKXzbJZIGY0n09mcHCUDKKK2WAJYZWDtuVABnNkG72x3ALCnOug4OeAPMVYVD72DHGuIg+iNEG3RGnKvCF1gD2KGRTEZcgJWs70lxTaehFEj5i8m5g+Z+hO3lx1AX1+hjqvzRbO/qhpWQ/dcof5CS2LU2q3reFOMfPhbDSuzACutnIi2aGTJHCs7P7ITMFPTYqNQ5TZ28/v+9G2xwgbT1O7PBmNr1sPWHGrqwd/hCS0QET7VnKdNAAAAAElFTkSuQmCC",
              description: "",
              text: "Nouns DAO: A $50M Bet on Community-Driven Innovation",
              url: "https://consensus2024.coindesk.com/agenda/event/-nouns-dao-a-50m-bet-on-community-driven-innovation-179",
            },
            {
              avatar:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAAYFBMVEX///++v79wcXEbICAABwcCCgrS09MZHR0AAAC2uLh6fHyhoqI9Pz+AgoKPkJBER0clKCjHyMhlZ2fq6+tXWVliZGTP0NCtrq4zNjbg4eFwcnKGh4eoqakKEBBNUFCWl5c0vmC5AAAA5ElEQVR4AX3TRQLDQAwDQC07ZWb4/ysLtgpBHTPLdqBxPsT0TQzegUEuIjSqSMlmlYh+Eou5SKXzbJZIGY0n09mcHCUDKKK2WAJYZWDtuVABnNkG72x3ALCnOug4OeAPMVYVD72DHGuIg+iNEG3RGnKvCF1gD2KGRTEZcgJWs70lxTaehFEj5i8m5g+Z+hO3lx1AX1+hjqvzRbO/qhpWQ/dcof5CS2LU2q3reFOMfPhbDSuzACutnIi2aGTJHCs7P7ITMFPTYqNQ5TZ28/v+9G2xwgbT1O7PBmNr1sPWHGrqwd/hCS0QET7VnKdNAAAAAElFTkSuQmCC",
              description: "",
              text: "City DAOs as Nodes in a Network State",
              url: "https://consensus2024.coindesk.com/agenda/event/-city-daos-as-nodes-in-a-network-state-59",
            },
          ],
        },
      },
      fidgetType: "links",
      id: "links:e08d52da-2467-42c9-b2a1-44fee9c6da74",
    },
    "text:4dda7826-fe5c-409d-add9-9f317f1b618c": {
      config: {
        data: {},
        editable: true,
        settings: {
          background: "#FFFFFF",
          text: "nounspace is a decentralized and open-source Social App funded by Nouns DAO and inspired by the customizability of Myspace. nounspace is owned and governed by the community of [$SPACE](https://nounspace.com/s/spacetoken) holders, and is powered by [Farcaster](https://www.farcaster.xyz/).",
          title: "wtf is nounspace?",
        },
      },
      fidgetType: "text",
      id: "text:4dda7826-fe5c-409d-add9-9f317f1b618c",
    },
    "text:e95ddfc6-1294-488d-b3ec-f6cfe26d7ab7": {
      config: {
        data: {},
        editable: true,
        settings: {
          text: "The team that built nounspace v0 and launched nounspace DAO is known as the [Based Space Foundation](https://space.nounspace.com/#/mainnet/team).\n\nFeel free to DM any member directly on Farcaster. Alternatively, you can contact the community via [Discord](https://discord.gg/eYQeXU2WuH).",
          title: "Contact",
        },
      },
      fidgetType: "text",
      id: "text:e95ddfc6-1294-488d-b3ec-f6cfe26d7ab7",
    },
  },
  isEditable: true,
  fidgetTrayContents: []
};

export const NOUNS_TAB_HOMEBASE_CONFIG: SpaceConfig = {
  layoutID: "nouns-tab-layout",
  layoutDetails: {
    layoutConfig: {
      layout: [
        {
          h: 10,
          i: "feed:fc181034-a6e9-4164-91e6-0a7491eb78cb",
          maxH: 36,
          maxW: 36,
          minH: 2,
          minW: 4,
          moved: false,
          resizeHandles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"],
          static: false,
          w: 5,
          x: 0,
          y: 0,
        },
        {
          h: 4,
          i: "feed:a4b2c4d0-4fb5-4735-9a5a-e120fa252c64",
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
          h: 6,
          i: "governance:6f7ddc86-57eb-4b07-951b-d65b8916270a",
          maxH: 36,
          maxW: 36,
          minH: 2,
          minW: 2,
          moved: false,
          resizeHandles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"],
          static: false,
          w: 4,
          x: 8,
          y: 4,
        },
        {
          h: 5,
          i: "iframe:a0cbef7a-1292-4925-ad81-5560de7efeb0",
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
          h: 5,
          i: "iframe:ede8bb6b-7f84-41fe-97ce-51aa96711f15",
          maxH: 36,
          maxW: 36,
          minH: 2,
          minW: 2,
          moved: false,
          resizeHandles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"],
          static: false,
          w: 3,
          x: 5,
          y: 5,
        },
        {
          h: 5,
          i: "iframe:e1d1a0be-6772-4299-8b45-8b75614d9e03",
          maxH: 36,
          maxW: 36,
          minH: 2,
          minW: 2,
          moved: false,
          resizeHandles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"],
          static: false,
          w: 3,
          x: 2,
          y: 5,
        },
      ],
    },
    layoutFidget: "grid",
  },
  theme: {
    id: "nounish",
    name: "Nounish",
    properties: {
      background: "#ffffff",
      backgroundHTML: "",
      fidgetBackground: "#FFFAFA",
      fidgetBorderColor: "#F05252",
      fidgetBorderWidth: "2px",
      fidgetShadow: "0 5px 15px rgba(0,0,0,0.55)",
      font: "Londrina Solid",
      fontColor: "#333333",
      headingsFont: "Work Sans",
      headingsFontColor: "#000000",
      musicURL: "https://www.youtube.com/watch?v=dMXlZ4y7OK4&t=1804",
    },
  },
  fidgetInstanceDatums: {
    "feed:a4b2c4d0-4fb5-4735-9a5a-e120fa252c64": {
      config: {
        data: {},
        editable: true,
        settings: {
          Xhandle: "",
          background: "#FFFFFF",
          channel: "thenounsquare",
          feedType: "filter",
          fidgetBorderColor: "rgba(255, 109, 109, 1)",
          fidgetBorderWidth: "2px",
          fidgetShadow: "0 2px 5px rgba(0,0,0,0.15)",
          filterType: "channel_id",
          fontColor: "#000000",
          fontFamily: "Inter",
          selectPlatform: { icon: "/images/farcaster.jpeg", name: "Farcaster" },
          style: "light",
          urlColor: "blue",
          users: "",
        },
      },
      fidgetType: "feed",
      id: "feed:a4b2c4d0-4fb5-4735-9a5a-e120fa252c64",
    },
    "feed:fc181034-a6e9-4164-91e6-0a7491eb78cb": {
      config: {
        data: {},
        editable: true,
        settings: {
          Xhandle: "",
          background: "#FFFFFF",
          channel: "nouns",
          feedType: "filter",
          fidgetBorderColor: "rgba(255, 109, 109, 1)",
          fidgetBorderWidth: "2px",
          fidgetShadow: "0 2px 5px rgba(0,0,0,0.15)",
          filterType: "channel_id",
          fontColor: "#000000",
          fontFamily: "Inter",
          selectPlatform: { icon: "/images/farcaster.jpeg", name: "Farcaster" },
          style: "light",
          urlColor: "blue",
          users: "",
        },
      },
      fidgetType: "feed",
      id: "feed:fc181034-a6e9-4164-91e6-0a7491eb78cb",
    },
    "governance:6f7ddc86-57eb-4b07-951b-d65b8916270a": {
      config: {
        data: {},
        editable: true,
        settings: {
          background: "#FFFFFF",
          fidgetBorderColor: "rgba(255, 109, 109, 1)",
          fidgetBorderWidth: "2px",
          fidgetShadow: "0 2px 5px rgba(0,0,0,0.15)",
          selectedDao: {
            contract: "",
            graphUrl:
              "https://api.goldsky.com/api/public/project_cldf2o9pqagp43svvbk5u3kmo/subgraphs/nouns/prod/gn",
            icon: "/images/nouns_yellow_logo.jpg",
            name: "Nouns DAO",
          },
        },
      },
      fidgetType: "governance",
      id: "governance:6f7ddc86-57eb-4b07-951b-d65b8916270a",
    },
    "iframe:a0cbef7a-1292-4925-ad81-5560de7efeb0": {
      config: {
        data: {},
        editable: true,
        settings: {
          background: "#FFFFFF",
          fidgetBorderColor: "rgba(255, 109, 109, 1)",
          fidgetBorderWidth: "2px",
          fidgetShadow: "0 2px 5px rgba(0,0,0,0.15)",
          size: 0.6,
          url: "https://nounswap.wtf",
        },
      },
      fidgetType: "iframe",
      id: "iframe:a0cbef7a-1292-4925-ad81-5560de7efeb0",
    },
    "iframe:ede8bb6b-7f84-41fe-97ce-51aa96711f15": {
      config: {
        data: {},
        editable: true,
        settings: {
          background: "#FFFFFF",
          fidgetBorderColor: "rgba(255, 109, 109, 1)",
          fidgetBorderWidth: "2px",
          fidgetShadow: "0 2px 5px rgba(0,0,0,0.15)",
          size: 0.7,
          url: "https://fomonouns.wtf",
        },
      },
      fidgetType: "iframe",
      id: "iframe:ede8bb6b-7f84-41fe-97ce-51aa96711f15",
    },
  },
  isEditable: true,
  fidgetTrayContents: [],
};

// Export all configurations
export const HOMEBASE_TABS_CONFIG = {
  TAB1_HOMEBASE_CONFIG,
  FIDGETS_TAB_HOMEBASE_CONFIG,
  NOUNS_TAB_HOMEBASE_CONFIG,
};
