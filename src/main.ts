import "./styles.css";
import { bindAppLocale, normalizeLanguage } from "./i18n";
import { SomewhereNowApp } from "./ui/app";

const root = document.querySelector<HTMLElement>("#app");
if (!root) {
  throw new Error("App-Wurzel nicht gefunden.");
}

const app = new SomewhereNowApp(root, normalizeLanguage(document.documentElement.lang));
bindAppLocale((language) => app.setLanguage(language));
app.start();

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js");
  });
}
