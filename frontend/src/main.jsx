/**
 * @file frontend/src/main.jsx
 * @summary Entrada do frontend React.
 * @responsibility Montar a aplicacao no DOM e carregar estilos globais.
 */

import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

createRoot(document.getElementById("app")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
