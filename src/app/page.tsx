import { redirect } from "next/navigation";
import { loadSystemConfig } from "@/config";

export default function RootRedirect() {
  const config = loadSystemConfig();
  const tab = encodeURIComponent(config.homePage.defaultTab);
  redirect(`/home/${tab}`);
}


