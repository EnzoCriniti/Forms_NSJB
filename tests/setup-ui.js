/**
 * @file tests/setup-ui.js
 * @summary Setup global dos testes de UI.
 * @responsibility Registrar matchers do Testing Library e limpar o DOM entre testes.
 */

import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});
