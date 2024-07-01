export const BORDER_STYLES = [
  { name: "Theme Border", value: "var(--user-theme-fidget-border-width)" },
  { name: "None", value: "0" },
  { name: "Small", value: "1px" },
  { name: "Medium", value: "2px" },
  { name: "Large", value: "4px" },
];

export const SHADOW_STYLES = [
  { name: "Theme Shadow", value: "var(--user-theme-fidget-shadow)" },
  { name: "None", value: "none" },
  { name: "Small", value: "0 2px 5px rgba(0,0,0,0.15)" },
  { name: "Medium", value: "0 4px 8px rgba(0,0,0,0.25)" },
  { name: "Large", value: "0 5px 15px rgba(0,0,0,0.55)" },
];

export const tabListClasses =
  "w-full p-0 justify-between bg-transparent rounded-none";
export const tabTriggerClasses =
  "data-[state=active]:text-blue-600 text-md data-[state=active]:shadow-none data-[state=active]:border-b data-[state=active]:rounded-none data-[state=active]:border-blue-600 data-[state=active]:border-solid px-3 py-2";
export const tabContentClasses =
  "py-4 flex flex-col gap-4 hidden data-[state=active]:flex";
