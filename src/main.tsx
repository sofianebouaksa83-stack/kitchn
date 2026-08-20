import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { KitchNLoader } from "./components/Loading/KitchNLoader";
import LoaderPreviewPage from "./pages/LoaderPreviewPage";
import "./index.css";

const App = lazy(() => import("./App"));

function isLoaderPreviewRoute() {
  const pathname = window.location.pathname.replace(/\/+$/, "") || "/";
  const hashPath = window.location.hash
    .slice(1)
    .split("?")[0]
    .replace(/\/+$/, "");

  return pathname === "/loader-preview" || hashPath === "/loader-preview";
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      {isLoaderPreviewRoute() ? (
        <LoaderPreviewPage />
      ) : (
        <Suspense fallback={<KitchNLoader />}>
          <App />
        </Suspense>
      )}
    </BrowserRouter>
  </React.StrictMode>
);
