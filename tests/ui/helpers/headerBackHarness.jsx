/**
 * @file tests/ui/helpers/headerBackHarness.jsx
 * @summary Harness de teste para o "Voltar" do header global.
 * @responsibility Prover o HeaderBackContext e renderizar o botao "Voltar" que as
 * telas registram via useHeaderBack, ja que em testes isolados nao ha AppHeader.
 */

import React, { useState } from "react";
import { render } from "@testing-library/react";
import { HeaderBackContext } from "../../../frontend/src/lib/headerBack.js";

/** Provider que espelha o AppHeader: mostra o botao quando uma tela registra o back. */
export const HeaderBackHarness = ({ children }) => {
  const [back, setBack] = useState(null);
  return (
    <HeaderBackContext.Provider value={{ setBack }}>
      {back && (
        <button type="button" aria-label={back.label} onClick={back.run}>
          {back.label}
        </button>
      )}
      {children}
    </HeaderBackContext.Provider>
  );
};

/** render() do RTL embrulhando a UI no harness do header. */
export const renderWithHeaderBack = ui => render(<HeaderBackHarness>{ui}</HeaderBackHarness>);
