import { initMilosAppEssentials } from "./milos-app-essentials.js";

document.body?.setAttribute("data-milos-essentials-app", "somewhere-now");
export const milosAppEssentials = initMilosAppEssentials({
  "appKey": "somewhere-now",
  "environment": "dev",
  "productionApproved": false,
  "loading": {
    "appName": "Irgendwo ist gerade …",
    "iconPath": "favicon.svg",
    "message": {
      "de": "App wird geöffnet …",
      "en": "Opening app …"
    }
  },
  "privacy": {
    "mode": "no-cookies",
    "usesLocalStorage": true,
    "optionalTracking": false,
    "privacyUrl": "https://dev.milos-apps.de/datenschutz"
  },
  "features": {
    "startup": true,
    "privacyNotice": true,
    "share": true,
    "datePicker": false,
    "placeSearch": false
  }
});
globalThis.milosAppEssentials = milosAppEssentials;
