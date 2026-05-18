import { describe, it, expect } from "vitest";
import { FORM_MODES } from "../../frontend/src/lib/forms";
import {
  buildCreateFormInitialState,
  buildPresetTitle,
  createDefaultPresenceFields,
  createDefaultResultsConfig,
  normalizePeopleBaseBindings,
} from "../../frontend/src/screens/createFormDomain.js";

describe("createFormDomain", () => {
  it("monta o titulo padrao do evento", () => {
    expect(buildPresetTitle("presenca", { title: "Sessao", date: "2026-05-18" })).toBe("Presenca Sessao - 18/05/2026");
    expect(buildPresetTitle("escala_organ", { date: "2026-05-18" })).toBe("Escala da Organ - 18/05/2026");
  });

  it("cria configuracao padrao de resultados coerente com a base vinculada", () => {
    const linkedField = { id: 1, type: "person_select", total: false, selectionSource: { kind: "members" } };
    const totalField = { id: 2, type: "yes_no", total: true };

    const config = createDefaultResultsConfig([linkedField, totalField]);

    expect(config.formMode).toBe(FORM_MODES.NUCLEO);
    expect(config.totalsLayout).toEqual([{ fieldId: 2, style: "split" }]);
  });

  it("normaliza o vinculo principal e secundario da base central", () => {
    const normalized = normalizePeopleBaseBindings([
      { id: 1, type: "person_select", label: "Nome", memberBinding: { source: "members", role: "primary" } },
      { id: 2, type: "person_select", label: "Acompanhante", memberBinding: { source: "members", role: "primary" } },
      { id: 3, type: "text", label: "Observacao", memberBinding: { source: "members", role: "secondary" } },
    ]);

    expect(normalized[0].memberBinding.role).toBe("primary");
    expect(normalized[1].memberBinding.role).toBe("secondary");
    expect(normalized[2]).not.toHaveProperty("memberBinding");
  });

  it("mantem campo de presenca padrao no modo nucleo", () => {
    expect(createDefaultPresenceFields(FORM_MODES.NUCLEO)).toHaveLength(1);
    expect(createDefaultPresenceFields(FORM_MODES.GERAL)).toHaveLength(0);
  });

  it("monta o estado inicial do editor para novo formulario e edicao", () => {
    const fresh = buildCreateFormInitialState({ form: null });
    const existing = buildCreateFormInitialState({
      form: {
        type: "escala_organ",
        title: "Escala",
        description: "Descricao",
        labels: [1],
        date: "2026-05-18",
        closing: "2026-05-20",
        status: "aberto",
        totalExpected: 3,
        closingText: "Fecha",
        resultsConfig: { searchEnabled: false, showLinkedRoster: false, totalsLayout: [] },
        scaleSections: [{ title: "Secao 1" }],
      },
    });

    expect(fresh.format).toBe("presenca");
    expect(fresh.formMode).toBe(FORM_MODES.NUCLEO);
    expect(fresh.setupStep).toBe("type");
    expect(existing.format).toBe("escala_organ");
    expect(existing.title).toBe("Escala");
    expect(existing.setupStep).toBe("editor");
    expect(existing.scaleDraft).toEqual([{ title: "Secao 1" }]);
  });
});
