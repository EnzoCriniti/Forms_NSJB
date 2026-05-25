/**
 * @file frontend/src/App.jsx
 * @summary Entrada principal do frontend.
 * @responsibility Renderizar o viewport com as props montadas pelo controller do App.
 */

import React from "react";
import { AppViewport } from "./AppViewport";
import { useAppController } from "./lib/appController";

export default function App() {
  return <AppViewport {...useAppController()} />;
}
