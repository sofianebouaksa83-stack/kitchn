import { useEffect, useState } from "react";

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

export function useGoogleDriveScripts() {
  const [isGapiLoaded, setIsGapiLoaded] =
    useState(false);

  useEffect(() => {
    const gapiScript =
      document.createElement("script");

    gapiScript.src =
      "https://apis.google.com/js/api.js";
    gapiScript.async = true;
    gapiScript.defer = true;
    gapiScript.onload = () => {
      window.gapi.load("client:picker", () => {
        setIsGapiLoaded(true);
      });
    };

    document.body.appendChild(gapiScript);

    const gisScript =
      document.createElement("script");

    gisScript.src =
      "https://accounts.google.com/gsi/client";
    gisScript.async = true;
    gisScript.defer = true;

    document.body.appendChild(gisScript);
  }, []);

  return isGapiLoaded;
}