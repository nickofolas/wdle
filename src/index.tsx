import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import WdleRoot from "./wdle";

// #wdleRoot will always exist, so the assertion is valid
const root = ReactDOM.createRoot(
  document.getElementById("wdleRoot") as HTMLElement
);
root.render(
  <React.StrictMode>
    <WdleRoot />
  </React.StrictMode>
);
