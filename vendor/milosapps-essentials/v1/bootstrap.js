import { initMilosAppEssentials } from "./milos-app-essentials.js";

document.body?.setAttribute("data-milos-essentials-app", "somewhere-now");
export const milosAppEssentials = initMilosAppEssentials({
  "appKey": "somewhere-now",
  "environment": "dev",
  "productionApproved": false,
  "loading": {
    "appName": "Irgendwo ist gerade …",
    "iconPath": "public/favicon.svg",
    "iconRuntimePath": "favicon.svg",
    "message": {
      "de": "App wird geöffnet …",
      "en": "Opening app …"
    }
  },
  "privacy": {
    "mode": "no-cookies",
    "usesLocalStorage": true,
    "storagePurposes": [
      {
        "key": "milosapps.somewhere-now.language",
        "purpose": "Vom Nutzer gewählte Sprache barrierearm über Seitenaufrufe hinweg beibehalten",
        "lifetime": "until-user-clears",
        "strictlyNecessary": true
      }
    ],
    "optionalTracking": false,
    "privacyUrl": "https://dev.milos-apps.de/datenschutz"
  },
  "features": {
    "startup": true,
    "privacyNotice": false,
    "share": true,
    "datePicker": false,
    "placeSearch": false,
    "placeSuggestions": {
      "enabled": false,
      "minChars": 3,
      "debounceMs": 350,
      "providerCapability": "submit-only",
      "evidenceFile": null
    }
  }
});
globalThis.milosAppEssentials = milosAppEssentials;
