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
  { id: 1, name: "Mestre Assistente" },
  { id: 2, name: "Auxiliar Direto" },
  { id: 3, name: "Membro Organ" },
];

const teamPeriods = [
  {
    id: 10,
    title: "Equipes Maio/Junho",
    startDate: "2026-05-01",
    endDate: "2026-06-30",
    assistantMasterPersonId: 1,
    directAssistantPersonId: 2,
    assistantMemberIds: [],
    organMemberIds: [3],
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
                date: "2026-05-10",
                status: "pronto",
                hasPresence: true,
                hasOrganScale: true,
                forms: [
                  { id: 30, title: "Presenca Maio", type: "presenca", status: "aberto", date: "2026-05-10" },
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
    const formButton = await screen.findByRole("button", { name: /Presenca Maio/i });
    fireEvent.click(formButton);

    expect(onOpenFormResults).toHaveBeenCalledWith(30);
  });
});
