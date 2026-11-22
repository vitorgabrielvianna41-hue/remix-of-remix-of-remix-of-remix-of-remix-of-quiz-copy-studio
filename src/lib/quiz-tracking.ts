const UTM_SCRIPT = "https://cdn.utmify.com.br/scripts/utms/latest.js";
const PIXEL_SCRIPT = "https://cdn.utmify.com.br/scripts/pixel/pixel.js";

function appendScript(src: string, attributes: Record<string, string> = {}) {
  if (Array.from(document.scripts).some((script) => script.src === src)) return;
  const script = document.createElement("script");
  script.src = src;
  script.async = true;
  script.defer = true;
  for (const [name, value] of Object.entries(attributes)) script.setAttribute(name, value);
  document.head.appendChild(script);
}

// Called only after hydration; scripts remain loaded across quiz steps and remounts.
export function initializeQuizTracking() {
  appendScript(UTM_SCRIPT, {
    "data-utmify-prevent-xcod-sck": "",
    "data-utmify-prevent-subids": "",
  });
  Object.assign(window, { pixelId: "6adec30fd4f7aa8e32c61f37" });
  appendScript(PIXEL_SCRIPT);
}