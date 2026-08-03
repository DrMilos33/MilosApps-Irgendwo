import "./styles.css";
import { bindAppLocale, normalizeLanguage } from "./i18n";
import { SomewhereNowApp } from "./ui/app";

declare global {
  var milosAppEssentials: { ready(): void };
}

const root = document.querySelector<HTMLElement>("#app");
if (!root) {
  throw new Error("App-Wurzel nicht gefunden.");
}

await customElements.whenDefined("milos-share-button");
const app = new SomewhereNowApp(root, normalizeLanguage(document.documentElement.lang));
bindAppLocale((language) => app.setLanguage(language));
app.start();
globalThis.milosAppEssentials.ready();

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js");
  });
}
