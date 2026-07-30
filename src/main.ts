import "./styles.css";
import { SomewhereNowApp } from "./ui/app";

const root = document.querySelector<HTMLElement>("#app");
if (!root) {
  throw new Error("App-Wurzel nicht gefunden.");
}

const app = new SomewhereNowApp(root);
app.start();

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js");
  });
}
