export function scrollToNounExplorer() {
  const element = document.getElementById("explore-section");
  const destinationScrollY = element?.offsetTop;
  const currentScrollY =
    document.documentElement.scrollTop || document.body.scrollTop;

  // Slight delay to prevent scroll glitches as the page is resizing
  setTimeout(() => {
    window.scrollTo({
      top: (destinationScrollY ?? 64) - 64,
      behavior:
        destinationScrollY && destinationScrollY > currentScrollY
          ? "smooth"
          : "instant",
    });
  }, 1);
}
