/**
 * @file tests/ui/eventParticipation.test.js
 * @summary Testes do calculo do snapshot de participacao por evento.
 */

import { describe, it, expect } from "vitest";
import { buildParticipationRows, minutesBetween } from "../../shared/eventParticipation.mjs";
import { filterByEligibleGraus, isGrauEligible } from "../../shared/grauEligibility.mjs";

const event = { id: 9, opening: "2026-05-01T08:00:00.000Z", eligibleGraus: ["QM"] };

const people = [
  { name: "Ana", grau: "QM", active: true },
  { name: "Bruno", grau: "CDC", active: true },
  { name: "Carla", grau: "QM", active: false },
  { name: "Davi", grau: "QM", active: true },
];

describe("grauEligibility", () => {
  it("conjunto vazio considera todos elegiveis", () => {
    expect(isGrauEligible("QS", [])).toBe(true);
    expect(filterByEligibleGraus(people, [])).toHaveLength(4);
  });

  it("filtra por grau ignorando acento e caixa", () => {
    expect(filterByEligibleGraus(people, ["qm"]).map(p => p.name)).toEqual(["Ana", "Carla", "Davi"]);
  });
});

describe("minutesBetween", () => {
  it("calcula minutos e protege contra valores invalidos ou negativos", () => {
    expect(minutesBetween("2026-05-01T08:00:00Z", "2026-05-01T09:30:00Z")).toBe(90);
    expect(minutesBetween("2026-05-01T09:00:00Z", "2026-05-01T08:00:00Z")).toBeNull();
    expect(minutesBetween(null, "2026-05-01T09:00:00Z")).toBeNull();
  });
});

describe("buildParticipationRows", () => {
  const responsesByForm = {
    1: [{ respondentName: "Ana", createdAt: "2026-05-01T09:00:00.000Z" }],
  };

  it("cobre apenas socios ativos elegiveis e marca preenchimento + tempo", () => {
    const rows = buildParticipationRows({
      event,
      presencaFormIds: [1],
      people,
      responsesByForm,
      capturedAt: "2026-05-02T00:00:00.000Z",
    });

    expect(rows.map(r => r.personName)).toEqual(["Ana", "Davi"]);

    const ana = rows.find(r => r.personName === "Ana");
    expect(ana).toMatchObject({ eventId: 9, formId: 1, filled: true, expected: true, timeToFillMinutes: 60 });
    expect(ana.respondedAt).toBe("2026-05-01T09:00:00.000Z");

    const davi = rows.find(r => r.personName === "Davi");
    expect(davi).toMatchObject({ filled: false, respondedAt: null, timeToFillMinutes: null });
  });

  it("sem graus elegiveis cobre todos os socios ativos", () => {
    const rows = buildParticipationRows({
      event: { id: 9, opening: event.opening, eligibleGraus: [] },
      presencaFormIds: [1],
      people,
      responsesByForm,
      capturedAt: "2026-05-02T00:00:00.000Z",
    });
    expect(rows.map(r => r.personName)).toEqual(["Ana", "Bruno", "Davi"]);
  });
});
