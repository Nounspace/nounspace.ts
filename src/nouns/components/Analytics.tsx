import Script from "next/script";

export default function Analytics() {
  return (
    <>
      {process.env.NEXT_PUBLIC_PLAUSIBLE_DATA_DOMAIN && (
        <Script
          defer
          src="https://plausible.paperclip.xyz/js/script.js"
          data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DATA_DOMAIN}
        />
      )}
    </>
  );
}
