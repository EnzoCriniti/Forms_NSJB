/**
 * @file tests/ui/teamsScreen.test.jsx
 * @summary Cobertura da tela de periodos de equipes.
 */

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TeamsScreen } from "../../frontend/src/screens/TeamsScreen.jsx";

const admin = { id: 1, name: "Admin", role: "admin" };

const people = [
  { id: 1, name: "Mestre Assistente", grau: "QM" },
  { id: 2, name: "Auxiliar Direto Mestre", grau: "CM" },
  { id: 3, name: "Organ", grau: "CDC" },
  { id: 4, name: "Auxiliar Direto Organ", grau: "CI" },
  { id: 5, name: "Membro Organ", grau: "CI" },
];

const teamPeriods = [
  {
    id: 10,
    title: "Equipes Maio/Junho",
    startDate: "2026-05-01T00:00:00.000Z",
    endDate: "2026-06-30T00:00:00.000Z",
    assistantMasterPersonId: 1,
    organPersonId: 3,
    directAssistantPersonId: 2,
    organDirectAssistantPersonId: 4,
    assistantMemberIds: [],
    organMemberIds: [5],
  },
];

describe("TeamsScreen", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("lista periodos e abre resultados de formulario do resumo", async () => {
    const onOpenFormResults = vi.fn();
    vi.stubGlobal("fetch", vi.fn(async url => {
      if (url === "/api/team-periods/10/summary") {
        return Response.json({
          summary: {
            period: teamPeriods[0],
            events: [
              {
                id: 20,
                title: "Sessao de Escala",
                date: "2026-05-10T00:00:00.000Z",
                status: "pronto",
                hasPresence: true,
                hasOrganScale: true,
                forms: [
                  { id: 30, title: "Presenca Maio", type: "presenca", status: "aberto", date: "2026-05-10T00:00:00.000Z" },
                ],
              },
            ],
            unlinkedForms: [],
          },
        });
      }
      return Response.json({}, { status: 404 });
    }));

    render(
      <TeamsScreen
        user={admin}
        people={people}
        teamPeriods={teamPeriods}
        onSaveTeamPeriod={vi.fn()}
        onDeleteTeamPeriod={vi.fn()}
        onOpenFormResults={onOpenFormResults}
      />,
    );

    expect(screen.getByText("Equipes Maio/Junho")).toBeInTheDocument();
    expect(screen.getByText("01/05/2026 ate 30/06/2026")).toBeInTheDocument();
    expect(screen.queryByText(/2026-05-01T00:00:00.000Z/)).not.toBeInTheDocument();
    const formButton = await screen.findByRole("button", { name: /Presenca Maio/i });
    expect(screen.getAllByText(/10\/05\/2026/).length).toBeGreaterThan(0);
    fireEvent.click(formButton);

    expect(onOpenFormResults).toHaveBeenCalledWith(30);
  });

  it("organiza campos por equipe e filtra Mestre Assistente por QM e Organ por CDC", () => {
    render(
      <TeamsScreen
        user={admin}
        people={people}
        teamPeriods={[]}
        onSaveTeamPeriod={vi.fn()}
        onDeleteTeamPeriod={vi.fn()}
        onOpenFormResults={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Novo período/i }));

    expect(screen.getByText("Equipe do Mestre Assistente")).toBeInTheDocument();
    expect(screen.getByText("Equipe da Organ")).toBeInTheDocument();
    expect(screen.getByLabelText(/Auxiliar direto do Mestre Assistente/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Auxiliar direto da Organ/i)).toBeInTheDocument();

    const masterSelect = screen.getByLabelText(/^Mestre Assistente$/i);
    expect(masterSelect).toHaveTextContent("Mestre Assistente");
    expect(masterSelect).not.toHaveTextContent("Auxiliar Direto Mestre");

    const organSelect = screen.getByLabelText(/^Organ$/i);
    expect(organSelect).toHaveTextContent("Organ");
    expect(organSelect).not.toHaveTextContent("Membro Organ");
  });
});
