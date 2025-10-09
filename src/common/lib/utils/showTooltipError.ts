export const showTooltipError = (title: string, description: string) => {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return;
  }

  const errorContainer = document.createElement("div");
  errorContainer.style.position = "fixed";
  errorContainer.style.top = "20px";
  errorContainer.style.right = "20px";
  errorContainer.style.zIndex = "9999999999999999";
  errorContainer.style.backgroundColor = "#ef4444";
  errorContainer.style.color = "white";
  errorContainer.style.padding = "16px";
  errorContainer.style.borderRadius = "6px";
  errorContainer.style.boxShadow =
    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
  errorContainer.style.maxWidth = "400px";

  const titleElement = document.createElement("h3");
  titleElement.style.fontWeight = "bold";
  titleElement.style.marginBottom = "4px";
  titleElement.textContent = title;

  const descriptionElement = document.createElement("p");
  descriptionElement.textContent = description;

  errorContainer.appendChild(titleElement);
  errorContainer.appendChild(descriptionElement);
  document.body.appendChild(errorContainer);

  setTimeout(() => {
    if (errorContainer.parentElement) {
      errorContainer.parentElement.removeChild(errorContainer);
    }
  }, 4000);
};
