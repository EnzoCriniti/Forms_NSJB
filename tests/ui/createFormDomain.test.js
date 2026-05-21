import { describe, it, expect } from "vitest";
import { FORM_MODES } from "../../frontend/src/lib/forms";
import {
  buildCreateFormInitialState,
  buildCreateFormFormatSelectionState,
  buildCreateFormPayload,
  buildCreateFormModeTransition,
  buildCreateFormTemplateState,
  buildCreateFormSaveOutcome,
  buildCreateFormTemplatePayload,
  buildPresetTitle,
  createDefaultPresenceFields,
  normalizePeopleBaseBindings,
} from "../../frontend/src/screens/createFormDomain.js";
import {
  appendScaleSection,
  buildScaleCatalogPatch,
  buildScaleModePatch,
  updateScaleSection,
} from "../../frontend/src/screens/createFormScaleDraft.js";
import {
  appendListItem,
  removeFieldById,
  removeListItemAtIndex,
  toggleFieldShow,
  updateListItemAtIndex,
} from "../../frontend/src/screens/createFormListHelpers.js";
import {
  addTotalLayoutField,
  createDefaultResultsConfig,
} from "../../frontend/src/screens/createFormResultsConfig.js";
import {
  buildAppliedCatalogFieldDraft,
  buildFieldDraftDefaults,
  buildFieldDraftFromCatalogItem,
  buildFieldDraftFromExistingField,
  buildOpenFieldDraft,
} from "../../frontend/src/screens/createFormFieldDraft.js";

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

  it("mantem os dados do rascunho ao iniciar em modo duplicacao", () => {
    const duplicate = buildCreateFormInitialState({
      form: {
        type: "presenca",
        title: "Presenca Edicao (Copia)",
        description: "Descricao",
        labels: [1],
        date: "2026-05-18",
        closing: "2026-05-20",
        status: "rascunho",
        totalExpected: 2,
        fieldDefinitions: [{ id: 1, type: "yes_no", label: "Vai?", show: true }],
        resultsConfig: { searchEnabled: true, showLinkedRoster: false, totalsLayout: [] },
      },
      isDuplicateMode: true,
    });

    expect(duplicate.title).toBe("Presenca Edicao (Copia)");
    expect(duplicate.status).toBe("rascunho");
    expect(duplicate.setupStep).toBe("editor");
  });

  it("monta o estado inicial ao trocar entre presenca e formulario geral", () => {
    const presence = buildCreateFormFormatSelectionState("presenca");
    const general = buildCreateFormFormatSelectionState("escala_organ");

    expect(presence.format).toBe("presenca");
    expect(presence.formMode).toBe(FORM_MODES.NUCLEO);
    expect(presence.resultsConfig.formMode).toBe(FORM_MODES.NUCLEO);
    expect(general.format).toBe("escala_organ");
    expect(general.formMode).toBe(FORM_MODES.GERAL);
    expect(general.scaleLimit).toBe(1);
  });

  it("monta os estados do editor de campo por origem", () => {
    const defaults = buildFieldDraftDefaults({ hasPrimaryLinkedField: true });
    const existing = buildFieldDraftFromExistingField({
      id: 2,
      type: "person_select",
      label: "Acompanhante",
      catalogFieldId: 9,
      required: true,
      gridRows: ["Linha 1"],
      gridCols: ["Coluna 1"],
      validation: { minLength: 2 },
      memberBinding: { source: "members", role: "secondary" },
    }, {
      fields: [
        { id: 1, type: "person_select", memberBinding: { source: "members", role: "primary" } },
      ],
    });
    const catalog = buildFieldDraftFromCatalogItem({
      type: "grid",
      defaultLabel: "Matriz",
      gridSchema: { rows: ["R1"], cols: ["C1", "C2"] },
    }, {
      hasPrimaryLinkedField: true,
    });

    expect(defaults.nPersonRole).toBe("secondary");
    expect(existing.nFieldMode).toBe("catalog");
    expect(existing.nPersonRole).toBe("secondary");
    expect(existing.nGridRows).toEqual(["Linha 1"]);
    expect(catalog.nLabel).toBe("Matriz");
    expect(catalog.nGridCols).toEqual(["C1", "C2"]);
  });

  it("monta o rascunho ao abrir novo campo", () => {
    expect(buildOpenFieldDraft({ hasPrimaryLinkedField: true })).toEqual(expect.objectContaining({
      editingFieldId: null,
      nType: "yes_no",
      nPersonRole: "secondary",
      addOpen: true,
    }));
  });

  it("aplica campo do catalogo preservando estado do rascunho", () => {
    const draft = buildAppliedCatalogFieldDraft({
      catalogId: 9,
      filteredFieldCatalog: [{
        id: 9,
        type: "grid",
        defaultLabel: "Escala",
        gridSchema: { rows: ["R1"], cols: ["C1"] },
      }],
      currentDraft: {
        editingFieldId: 3,
        nFieldMode: "catalog",
        nRequired: true,
        addOpen: true,
      },
    });

    expect(draft).toEqual(expect.objectContaining({
      editingFieldId: 3,
      nCatalogId: 9,
      nType: "grid",
      nLabel: "Escala",
      nRequired: true,
      nGridRows: ["R1"],
      nGridCols: ["C1"],
      addOpen: true,
    }));
  });

  it("monta o payload de salvamento e template sem duplicar regra de campos", () => {
    const fields = [
      { id: 1, type: "person_select", label: "Nome", total: false, selectionSource: { kind: "members" }, memberBinding: { source: "members", role: "primary" } },
      { id: 2, type: "yes_no", label: "Vai?", total: true },
    ];

    const payload = buildCreateFormPayload({
      form: { id: 9, slug: "teste" },
      format: "presenca",
      formMode: FORM_MODES.NUCLEO,
      status: "aberto",
      formTitle: "Formulario",
      desc: "Descricao",
      selLabels: [1],
      eventDate: "2026-05-18",
      closingDate: "2026-05-20",
      closingText: "Fecha",
      totalExpected: "2",
      resultsConfig: { searchEnabled: true, showLinkedRoster: true, totalsLayout: [] },
      scaleLimit: 1,
      fields,
      scaleDraft: [],
      linkedPeopleField: true,
    });

    const template = buildCreateFormTemplatePayload({
      type: "presenca",
      presetName: "  Base  ",
      desc: "Descricao",
      closingText: "Fecha",
      selLabels: [1],
      format: "presenca",
      formMode: FORM_MODES.NUCLEO,
      fields,
      resultsConfig: { searchEnabled: true, showLinkedRoster: true, totalsLayout: [] },
      scaleLimit: 1,
      scaleDraft: [],
    });

    expect(payload.fieldDefinitions).toHaveLength(2);
    expect(payload.totalExpected).toBe(2);
    expect(template.name).toBe("Base");
    expect(template.fieldDefinitions).toHaveLength(2);
  });

  it("transita o modo geral removendo a base central e ajustando a selecao", () => {
    const transition = buildCreateFormModeTransition({
      nextMode: FORM_MODES.GERAL,
      fields: [
        { id: 1, type: "person_select", label: "Nome", memberBinding: { source: "members", role: "primary" } },
        { id: 2, type: "text", label: "Observacao" },
      ],
      currentNFieldMode: "local",
      currentNType: "person_select",
      currentNCatalogId: "",
      currentResultsConfig: { searchEnabled: true, showLinkedRoster: true, totalsLayout: [] },
      filteredFieldCatalog: [],
    });

    expect(transition.nextType).toBe("yes_no");
    expect(transition.totalExpected).toBe("");
    expect(transition.resultsConfig.formMode).toBe(FORM_MODES.GERAL);
    expect(transition.fields.some(field => field.type === "person_select")).toBe(false);
  });

  it("aplica template preservando os dados principais do formulario", () => {
    const nextState = buildCreateFormTemplateState({
      type: "presenca",
      title: "Evento",
      fieldDefinitions: [
        { id: 1, type: "person_select", label: "Nome", memberBinding: { source: "members", role: "primary" } },
        { id: 2, type: "yes_no", label: "Vai?" },
      ],
      labels: [1],
      resultsConfig: { searchEnabled: false, showLinkedRoster: true, totalsLayout: [] },
      closingText: "Fecha",
      desc: "Descricao",
      scaleLimit: 2,
    });

    expect(nextState.format).toBe("presenca");
    expect(nextState.formMode).toBe(FORM_MODES.NUCLEO);
    expect(nextState.fields).toHaveLength(2);
    expect(nextState.resultsConfig.formMode).toBe(FORM_MODES.NUCLEO);
    expect(nextState.closingText).toBe("Fecha");
  });

  it("monta a mensagem de sucesso do salvamento de forma consistente", () => {
    expect(buildCreateFormSaveOutcome({ form: null, isDuplicateMode: false })).toEqual({
      title: "Formulario salvo com sucesso",
      message: "O formulario foi salvo e ja esta disponivel na listagem.",
    });
    expect(buildCreateFormSaveOutcome({ form: { id: 1 }, isDuplicateMode: false })).toEqual({
      title: "Formulario alterado com sucesso",
      message: "As alteracoes foram gravadas e ja estao disponiveis na listagem.",
    });
  });

  it("reaproveita helpers puros para mutacoes de listas do editor", () => {
    expect(toggleFieldShow([{ id: 1, show: true }], 1)).toEqual([{ id: 1, show: false }]);
    expect(removeFieldById([{ id: 1 }, { id: 2 }], 2)).toEqual([{ id: 1 }]);
    expect(updateScaleSection([{ title: "A" }], 0, { title: "B" })).toEqual([{ title: "B" }]);
    expect(appendScaleSection([{ title: "A" }])).toHaveLength(2);
    expect(updateListItemAtIndex(["A", "B"], 1, "C")).toEqual(["A", "C"]);
    expect(removeListItemAtIndex(["A", "B"], 0)).toEqual(["B"]);
    expect(appendListItem(["A"], "B")).toEqual(["A", "B"]);
    expect(addTotalLayoutField([], { id: 7, type: "yes_no" })).toEqual([{ fieldId: 7, style: "split" }]);
  });

  it("monta patches de escala para modo e catalogo", () => {
    expect(buildScaleModePatch("local")).toEqual({ source: "local", catalogTaskId: "", catalogKey: "", catalogName: "" });
    expect(buildScaleModePatch("catalog")).toEqual({ source: "catalog" });
    expect(buildScaleCatalogPatch(2, [{ id: 2, key: "som", name: "Som", defaultLabel: "Mesa de som" }])).toEqual({
      source: "catalog",
      catalogTaskId: 2,
      catalogKey: "som",
      catalogName: "Som",
      title: "Mesa de som",
    });
  });
});
