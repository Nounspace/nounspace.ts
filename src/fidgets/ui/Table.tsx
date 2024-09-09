import { CardHeader, CardTitle } from "@/common/components/atoms/card";
import CSSInput from "@/common/components/molecules/CSSInput";
import ColorSelector from "@/common/components/molecules/ColorSelector";
import {
  CSVSelector,
  CSVSelectorOption,
} from "@/common/components/molecules/CsvSelector";
import FontSelector from "@/common/components/molecules/FontSelector";
import TextInput from "@/common/components/molecules/TextInput";
import {
  FidgetArgs,
  FidgetModule,
  FidgetProperties,
  FidgetSettingsStyle,
} from "@/common/fidgets";
import { CheckIcon, CopyIcon } from "@radix-ui/react-icons";
import Papa from "papaparse";
import React, { useEffect, useState } from "react";
import { defaultStyleFields } from "../helpers";
import {
  formatEthereumAddress,
  isEthereumAddress,
} from "@/common/lib/utils/ethereum";

export type TableFidgetSettings = {
  title?: string;
  table: string;
  tableBorderColor: string;
  selectInput: CSVSelectorOption;
  URL: string;
} & FidgetSettingsStyle;

export const tableConfig: FidgetProperties<TableFidgetSettings> = {
  fidgetName: "Table",
  icon: 0x1f4c4,
  fields: [
    {
      fieldName: "title",
      default: "Table Fidget",
      required: false,
      inputSelector: TextInput,
      group: "settings",
    },
    {
      fieldName: "selectInput",
      displayName: "Select Input",
      inputSelector: CSVSelector,
      required: false,
      default: { name: "Text" },
      group: "settings",
    },
    {
      fieldName: "table",
      default: `"Game Number", "Game Length"
1, 30
2, 29
3, 31
4, 16
5, 24
6, 29
7, 28
8, 117
9, 42
10, 23
`,
      required: true,
      inputSelector: CSSInput,
      group: "settings",
      disabledIf: (settings) => settings?.selectInput?.name === "External URL",
    },
    {
      fieldName: "URL",
      default: ``,
      required: true,
      inputSelector: TextInput,
      group: "settings",
      disabledIf: (settings) => settings?.selectInput?.name === "Text",
    },
    {
      fieldName: "fontFamily",
      default: "var(--user-theme-font)",
      required: false,
      inputSelector: FontSelector,
      group: "style",
    },
    {
      fieldName: "fontColor",
      default: "var(--user-theme-font-color)",
      required: false,
      inputSelector: ColorSelector,
      group: "style",
    },
    {
      fieldName: "headingsFontFamily",
      default: "var(--user-theme-headings-font)",
      required: false,
      inputSelector: FontSelector,
      group: "style",
    },
    {
      fieldName: "headingsFontColor",
      default: "var(--user-theme-headings-font-color)",
      required: false,
      inputSelector: ColorSelector,
      group: "style",
    },
    {
      fieldName: "tableBorderColor",
      default: "var(--user-theme-fidget-border-color)",
      required: false,
      inputSelector: ColorSelector,
      group: "style",
    },
    ...defaultStyleFields,
    {
      fieldName: "css",
      default: "",
      required: false,
      inputSelector: CSSInput,
      group: "code",
    },
  ],
  size: {
    minHeight: 2,
    maxHeight: 36,
    minWidth: 3,
    maxWidth: 36,
  },
};

export const Table: React.FC<FidgetArgs<TableFidgetSettings>> = ({
  settings,
}) => {
  const [tableData, setTableData] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const headers = tableData.length > 0 ? Object.keys(tableData[0]) : [];
  const usingTextCsv = settings.selectInput.name == "Text";

  const parseCSV = (data) => {
    Papa.parse(data, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        setTableData(results.data);
      },
    });
  };

  const handleCopy = (content, index) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 3000);
  };

  const fetchUrl = async (url: string) => {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Erro: ${res.status}`);
      }

      const text = await res.text();
      console.log(text);
      parseCSV(text);
    } catch (err) {
      console.error("Error loading data for table fidget:", err);
    }
  };

  useEffect(() => {
    if (usingTextCsv) {
      parseCSV(settings.table);
    } else {
      fetchUrl(settings.URL);
    }
  }, [usingTextCsv]);

  return (
    <div
      style={{
        background: settings.background,
        height: "100%",
        borderWidth: settings.fidgetBorderWidth,
        borderColor: settings.fidgetBorderColor,
        boxShadow: settings.fidgetShadow,
        overflow: "auto",
        scrollbarWidth: "none",
        color: settings.fontColor,
        fontFamily: settings.fontFamily,
        display: "flex",
        flexDirection: "column",
        textOverflow: "ellipsis",
      }}
    >
      {settings?.title && (
        <CardHeader className="p-4 pb-2">
          <CardTitle
            className="table-2xl font-bold"
            style={{
              fontFamily: settings.headingsFontFamily,
              color: settings.headingsFontColor,
            }}
          >
            {settings.title}
          </CardTitle>
        </CardHeader>
      )}
      {settings?.table && (
        <table
          style={{
            border: "1px solid",
            width: "100%",
            height: "auto",
            flexGrow: 1,
            borderColor: settings.tableBorderColor,
          }}
          className="overflow-hidden"
        >
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th
                  style={{
                    borderStyle: "solid",
                    borderWidth: "1px",
                    borderColor: settings.tableBorderColor,
                  }}
                  className="p-2"
                  key={index}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, rowIndex) => (
              <tr key={rowIndex} style={{ maxWidth: "100%" }}>
                {headers.map((header, index) => (
                  <td
                    style={{
                      border: "1px solid",
                      textAlign: "center",
                      borderColor: settings.tableBorderColor,
                      maxWidth: "100%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      position: "relative",
                    }}
                    className="p-2 group"
                    key={index}
                  >
                    <span>
                      {isEthereumAddress(row[header])
                        ? formatEthereumAddress(row[header])
                        : row[header]}
                    </span>
                    <button
                      className="absolute right-2 group-hover:block hidden"
                      onClick={() => handleCopy(row[header], rowIndex)}
                      style={{
                        top: "50%",
                        transform: "translateY(-50%)",
                        transition: "transform 0.3s ease",
                      }}
                    >
                      {copiedIndex === rowIndex ? (
                        <CheckIcon
                          style={{
                            transition: "color 1s ease",
                          }}
                        />
                      ) : (
                        <CopyIcon
                          style={{
                            transition: "color 0.3s ease",
                          }}
                        />
                      )}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default {
  fidget: Table,
  properties: tableConfig,
} as FidgetModule<FidgetArgs<TableFidgetSettings>>;
