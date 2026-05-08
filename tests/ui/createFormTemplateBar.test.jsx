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
        preset="2"
        presets={[
          { id: 1, type: "escala_organ", name: "Escala" },
          { id: 2, type: "presenca", name: "Presenca base" },
        ]}
        onApplyTemplate={onApplyTemplate}
        onClearTemplate={onClearTemplate}
      />,
    );

    expect(screen.getByRole("combobox")).toHaveValue("2");
    expect(screen.getByRole("option", { name: "Presenca base" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Escala" })).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "2" } });
    expect(onApplyTemplate).toHaveBeenCalledWith("2");

    fireEvent.click(screen.getByRole("button", { name: "Limpar" }));
    expect(onClearTemplate).toHaveBeenCalledTimes(1);
  });
});
