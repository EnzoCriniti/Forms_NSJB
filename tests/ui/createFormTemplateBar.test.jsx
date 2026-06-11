import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CreateFormTemplateBar } from "../../frontend/src/components/CreateFormTemplateBar.jsx";

describe("CreateFormTemplateBar", () => {
  it("lista templates do formato atual e permite limpar", () => {
    const onApplyTemplate = vi.fn();
    const onClearTemplate = vi.fn();

    render(
      <CreateFormTemplateBar
        format="presenca"
        formMode="nucleo"
        preset="2"
        presets={[
          { id: 1, type: "escala_organ", name: "Escala", scaleSections: [{ title: "A" }] },
          {
            id: 2,
            type: "presenca",
            name: "Presenca base",
            fieldDefinitions: [{ id: 1, type: "person_select", label: "Nome", required: true, show: true, total: false }],
            resultsConfig: { formMode: "nucleo" },
          },
        ]}
        onApplyTemplate={onApplyTemplate}
        onClearTemplate={onClearTemplate}
      />,
    );

    expect(screen.getByText("Templates de formulário")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Presenca base (Presenca)" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Escala" })).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "2" } });
    expect(onApplyTemplate).toHaveBeenCalledWith("2");

    fireEvent.click(screen.getByRole("button", { name: "Limpar" }));
    expect(onClearTemplate).toHaveBeenCalledTimes(1);
  });
});
