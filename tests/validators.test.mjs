/**
 * @file tests/validators.test.mjs
 * @summary Testes unitarios dos validadores.
 * @responsibility Garantir que payloads validos passam e payloads invalidos falham cedo.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
  validateFormPayload,
  validateResponsePayload,
  validateEscalaPayload,
  validateEscalaClaimPayload,
  validateFormDeleteKeyPayload,
  validateFormDeleteKeyUpdatePayload,
  validateUserPayload,
  validateLabelPayload,
  validatePresetPayload,
  validateFieldCatalogPayload,
  validateScaleTaskCatalogPayload,
  validatePeoplePayload,
  validateMembersConfigPayload,
  validateTeamPeriodPayload,
} from "../backend/validators/payloadValidators.mjs";
import {
  validateExternalBasePayload,
  validateLabelPayload as validateLabelPayloadFromAdminModule,
  validateMembersConfigPayload as validateMembersConfigPayloadFromAdminModule,
  validatePeoplePayload as validatePeoplePayloadFromAdminModule,
  validateUserPayload as validateUserPayloadFromAdminModule,
} from "../backend/validators/adminPayloadValidators.mjs";
import {
  validateFieldCatalogPayload as validateFieldCatalogPayloadFromCatalogModule,
  validateScaleTaskCatalogPayload as validateScaleTaskCatalogPayloadFromCatalogModule,
} from "../backend/validators/catalogPayloadValidators.mjs";
import {
  validateFormPayload as validateFormPayloadFromFormModule,
  validatePresetPayload as validatePresetPayloadFromFormModule,
} from "../backend/validators/formPayloadValidators.mjs";
import {
  validateEventPayload,
} from "../backend/validators/eventPayloadValidators.mjs";
import {
  validateEscalaClaimPayload as validateEscalaClaimPayloadFromModule,
  validateEscalaPayload as validateEscalaPayloadFromModule,
} from "../backend/validators/escalaPayloadValidators.mjs";
import {
  validateResponsePayload as validateResponsePayloadFromModule,
} from "../backend/validators/responsePayloadValidators.mjs";
import {
  validateEventMessagePayload,
  validateMessageTemplatePayload,
  validateMessagingConfigPayload,
  validatePersonPresetPayload,
} from "../backend/validators/messagingPayloadValidators.mjs";
import {
  validateAuthLoginPayload,
  validateFormDeleteKeyPayload as validateSecurityFormDeleteKeyPayload,
  validateFormDeleteKeyUpdatePayload as validateSecurityFormDeleteKeyUpdatePayload,
} from "../backend/validators/securityPayloadValidators.mjs";

test("validateFormPayload accepts a valid presence form", () => {
  assert.doesNotThrow(() => validateFormPayload({
    type: "presenca",
    status: "aberto",
    title: "Formulario Teste",
    labels: [1],
    totalExpected: 10,
    fieldDefinitions: [
      { id: 1, type: "person_select", label: "Nome", required: true, show: true, total: false },
      { id: 2, type: "yes_no", label: "Vai?", required: true, show: true, total: true },
    ],
  }));
});

test("validateFormPayload accepts new totals layout styles", () => {
  assert.doesNotThrow(() => validateFormPayload({
    type: "presenca",
    status: "aberto",
    title: "Formulario Teste",
    labels: [],
    fieldDefinitions: [
      { id: 1, type: "person_select", label: "Nome", required: true, show: true, total: false },
      { id: 2, type: "yes_no", label: "Vai?", required: true, show: true, total: true },
      { id: 3, type: "number", label: "Qtd", required: false, show: true, total: true },
    ],
    resultsConfig: {
      totalsLayout: [
        { fieldId: 2, style: "split" },
        { fieldId: 3, style: "number" },
      ],
    },
  }));
});

test("validateFormPayload rejects an invalid status", () => {
  assert.throws(() => validateFormPayload({
    type: "presenca",
    status: "x",
    title: "Formulario Teste",
    labels: [],
    fieldDefinitions: [],
  }), /Status do formulario invalido/);
});

test("validateFormPayload rejects missing fields for presence and scale forms", () => {
  assert.throws(() => validateFormPayload({
    type: "presenca",
    status: "aberto",
    title: "",
    labels: [],
    fieldDefinitions: [],
  }), /Titulo do formulario e obrigatorio/);
  assert.throws(() => validateFormPayload({
    type: "escala_organ",
    status: "aberto",
    title: "Escala",
    labels: [],
    scaleSections: [{ title: "", responsaveis: 1, auxiliares: 0 }],
  }), /Secao de escala precisa de titulo/);
});

test("validateResponsePayload rejects non-object values", () => {
  assert.throws(() => validateResponsePayload({
    formId: 1,
    respondentName: "Pessoa",
    values: [],
  }), /Valores da resposta precisam ser um objeto/);
});

test("validateResponsePayload rejects payloads without formId or respondent", () => {
  assert.throws(() => validateResponsePayload({
    respondentName: "Pessoa",
    values: {},
  }), /formId invalido/);
  assert.throws(() => validateResponsePayload({
    formId: 1,
    values: {},
  }), /Respondente invalido/);
});

test("admin payload validators accept valid payloads", () => {
  assert.doesNotThrow(() => validateUserPayload({ username: "admin2", password: "123", role: "admin", layerId: 1 }));
  assert.doesNotThrow(() => validateLabelPayload({ name: "Evento", color: "#fff000" }));
  assert.doesNotThrow(() => validatePresetPayload({
    type: "presenca",
    name: "Preset",
    labels: [],
    fieldDefinitions: [],
    scaleSections: [],
  }));
  assert.doesNotThrow(() => validatePeoplePayload({ people: [{ name: "Maria", grau: "QS", phone: "5511999999999", active: true, source: "google_sheets", externalKey: "abc-1", syncedAt: "2026-05-08T10:00:00Z", metadata: { rowNumber: 4 } }] }));
  assert.doesNotThrow(() => validateMembersConfigPayload({ sourceType: "google_sheets", sheetUrl: "", nameColumn: "B", grauColumn: "A", phoneColumn: "C", externalIdColumn: "D", activeColumn: "E", range: "Socios!A:E", syncEnabled: true, syncFrequencyHours: 24, lastSyncedAt: null }));
  assert.doesNotThrow(() => validateFormDeleteKeyPayload({ masterKey: "segredo" }));
  assert.doesNotThrow(() => validateFormDeleteKeyUpdatePayload({ currentMasterKey: "antiga", newMasterKey: "nova" }));
  assert.doesNotThrow(() => validateFormDeleteKeyUpdatePayload({ newMasterKey: "nova" }));
  assert.doesNotThrow(() => validateEscalaClaimPayload({ sectionIndex: 0, slotIndex: 1, person: "Maria" }));
  assert.doesNotThrow(() => validateFieldCatalogPayload({
    key: "campo base",
    name: "Campo Base",
    type: "text",
    category: "texto",
    defaultLabel: "Campo",
    gridSchema: { rows: ["A"], cols: ["B"] },
    active: true,
  }));
  assert.doesNotThrow(() => validateScaleTaskCatalogPayload({
    key: "tarefa base",
    name: "Tarefa Base",
    category: "cozinha",
    defaultLabel: "Tarefa",
    active: true,
  }));
});

test("validateEscalaPayload rejects malformed slots", () => {
  assert.throws(() => validateEscalaPayload(2, {
    sections: [{ title: "Secao", slots: [{ role: "" }] }],
  }), /Slot da escala precisa de funcao/);
});

test("validateEscalaClaimPayload rejects invalid payloads", () => {
  assert.throws(() => validateEscalaClaimPayload({ sectionIndex: -1, slotIndex: 0, person: "Maria" }), /sectionIndex da escala invalido/);
  assert.throws(() => validateEscalaClaimPayload({ sectionIndex: 0, slotIndex: -1, person: "Maria" }), /slotIndex da escala invalido/);
  assert.throws(() => validateEscalaClaimPayload({ sectionIndex: 0, slotIndex: 0, person: "" }), /Nome da inscricao invalido/);
});

test("catalog and admin validators reject invalid payloads", () => {
  assert.throws(() => validateFormDeleteKeyPayload({}), /Chave mestra e obrigatoria/);
  assert.throws(() => validateFormDeleteKeyUpdatePayload({ currentMasterKey: 123, newMasterKey: "nova" }), /Chave mestra atual invalida/);
  assert.throws(() => validateFieldCatalogPayload({ key: "", name: "Campo", type: "text", category: "texto", defaultLabel: "Campo" }), /Chave do campo base e obrigatoria/);
  assert.throws(() => validateScaleTaskCatalogPayload({ key: "tarefa", name: "", category: "cozinha", defaultLabel: "Tarefa" }), /Nome da tarefa base e obrigatorio/);
  assert.throws(() => validatePeoplePayload({ people: [{}] }), /Socio precisa de nome/);
  assert.throws(() => validateMembersConfigPayload({ sheetUrl: 123 }), /sheetUrl invalido/);
  assert.throws(() => validatePeoplePayload({ people: [{ name: "Maria", active: "sim" }] }), /Status do socio invalido/);
});

test("messaging payload validators accept valid payloads from the messaging module", () => {
  assert.doesNotThrow(() => validateMessageTemplatePayload({ name: "Lembrete", type: "fill_reminder", body: "Preencha o formulario" }));
  assert.doesNotThrow(() => validatePersonPresetPayload({ name: "Equipe", personKeys: ["maria"] }));
  assert.doesNotThrow(() => validateMessagingConfigPayload({ whatsappGroupName: "Grupo", autoDispatchEnabled: true, publicBaseUrl: "https://example.test" }));
  assert.doesNotThrow(() => validateEventMessagePayload({
    type: "new_scale",
    body: "Escala aberta",
    templateId: 1,
    config: {
      formId: 2,
      recipients: { mode: "manual", personKeys: ["maria"] },
    },
    scheduledFor: null,
    windowOption: "12h_before",
    autoDispatchEnabled: false,
    status: "agendada",
  }));
});

test("messaging payload validators reject invalid recipient settings", () => {
  assert.throws(() => validateEventMessagePayload({
    type: "new_scale",
    body: "Escala aberta",
    templateId: 1,
    config: { recipients: { mode: "manual", personKeys: "maria" } },
  }), /Lista de pessoas invalida/);
  assert.throws(() => validateEventMessagePayload({
    type: "new_scale",
    body: "Escala aberta",
    templateId: 1,
    windowOption: "amanha",
  }), /Janela de agendamento invalida/);
});

test("security payload validators accept valid payloads from the security module", () => {
  assert.doesNotThrow(() => validateAuthLoginPayload({ username: "admin", password: "123" }));
  assert.doesNotThrow(() => validateSecurityFormDeleteKeyPayload({ masterKey: "segredo" }));
  assert.doesNotThrow(() => validateSecurityFormDeleteKeyUpdatePayload({ currentMasterKey: "antiga", newMasterKey: "nova" }));
  assert.doesNotThrow(() => validateSecurityFormDeleteKeyUpdatePayload({ newMasterKey: "nova" }));
});

test("security payload validators reject malformed payloads", () => {
  assert.throws(() => validateAuthLoginPayload({ username: "admin", password: "" }), /Senha e obrigatoria/);
  assert.throws(() => validateSecurityFormDeleteKeyPayload({}), /Chave mestra e obrigatoria/);
  assert.throws(() => validateSecurityFormDeleteKeyUpdatePayload({ currentMasterKey: 123, newMasterKey: "nova" }), /Chave mestra atual invalida/);
});

test("event payload validator accepts valid payloads from the event module", () => {
  assert.doesNotThrow(() => validateEventPayload({
    title: "Evento",
    description: "",
    date: "2026-05-21",
    opening: null,
    closing: null,
    status: "rascunho",
    formIds: [1, "2"],
    messageConfig: {},
  }));
});

test("team period payload validator accepts valid payloads", () => {
  assert.doesNotThrow(() => validateTeamPeriodPayload({
    title: "Equipes Maio/Junho",
    startDate: "2026-05-01",
    endDate: "2026-06-30",
    assistantMasterPersonId: 1,
    organPersonId: 3,
    directAssistantPersonId: "2",
    organDirectAssistantPersonId: 4,
    assistantMemberIds: [3, "4"],
    organMemberIds: [],
    notes: "",
  }));
});

test("team period payload validator rejects malformed periods", () => {
  assert.throws(() => validateTeamPeriodPayload({
    startDate: "2026-07-01",
    endDate: "2026-06-30",
    assistantMasterPersonId: 1,
    organPersonId: 3,
    directAssistantPersonId: 2,
    organDirectAssistantPersonId: 4,
  }), /Conclusao nao pode ser anterior ao inicio/);
  assert.throws(() => validateTeamPeriodPayload({
    startDate: "2026-05-01",
    endDate: "2026-06-30",
    organPersonId: 3,
    directAssistantPersonId: 2,
    organDirectAssistantPersonId: 4,
  }), /Mestre Assistente e obrigatorio/);
  assert.throws(() => validateTeamPeriodPayload({
    startDate: "2026-05-01",
    endDate: "2026-06-30",
    assistantMasterPersonId: 1,
    organPersonId: 3,
    organDirectAssistantPersonId: 4,
  }), /Auxiliar direto do Mestre Assistente e obrigatorio/);
  assert.throws(() => validateTeamPeriodPayload({
    startDate: "2026-05-01",
    endDate: "2026-06-30",
    assistantMasterPersonId: 1,
    organPersonId: 3,
    directAssistantPersonId: 2,
  }), /Auxiliar direto da Organ e obrigatorio/);
  assert.throws(() => validateTeamPeriodPayload({
    startDate: "2026-05-01",
    endDate: "2026-06-30",
    assistantMasterPersonId: 1,
    directAssistantPersonId: 2,
    organDirectAssistantPersonId: 4,
  }), /Organ e obrigatoria/);
  assert.throws(() => validateTeamPeriodPayload({
    startDate: "2026-05-01",
    endDate: "2026-06-30",
    assistantMasterPersonId: 1,
    organPersonId: 3,
    directAssistantPersonId: 2,
    organDirectAssistantPersonId: 4,
    organMemberIds: [0],
  }), /Equipe da Organ contem pessoa invalida/);
});

test("event payload validator rejects invalid status and linked forms", () => {
  assert.throws(() => validateEventPayload({
    title: "Evento",
    status: "aberto",
    formIds: [],
  }), /Status do evento invalido/);
  assert.throws(() => validateEventPayload({
    title: "Evento",
    formIds: [0],
  }), /Formulario do evento invalido/);
});

test("response payload validator accepts valid payloads from the response module", () => {
  assert.doesNotThrow(() => validateResponsePayloadFromModule({
    formId: "1",
    respondentName: "Maria",
    respondentGrau: null,
    values: { 1: "Sim" },
  }));
});

test("response payload validator rejects malformed payloads from the response module", () => {
  assert.throws(() => validateResponsePayloadFromModule({
    formId: 1,
    respondentName: "Maria",
    values: [],
  }), /Valores da resposta precisam ser um objeto/);
  assert.throws(() => validateResponsePayloadFromModule({
    respondentName: "Maria",
    values: {},
  }), /formId invalido/);
});

test("escala payload validators accept valid payloads from the escala module", () => {
  assert.doesNotThrow(() => validateEscalaPayloadFromModule("1", {
    sections: [
      { title: "Cozinha", color: "#fff", slots: [{ role: "Responsavel", person: null }] },
    ],
  }));
  assert.doesNotThrow(() => validateEscalaClaimPayloadFromModule({ sectionIndex: 0, slotIndex: 1, person: "Maria" }));
});

test("escala payload validators reject malformed payloads from the escala module", () => {
  assert.throws(() => validateEscalaPayloadFromModule(2, {
    sections: [{ title: "Secao", slots: [{ role: "" }] }],
  }), /Slot da escala precisa de funcao/);
  assert.throws(() => validateEscalaClaimPayloadFromModule({ sectionIndex: 0, slotIndex: -1, person: "Maria" }), /slotIndex da escala invalido/);
});

test("admin payload validators accept valid payloads from the admin module", () => {
  assert.doesNotThrow(() => validateUserPayloadFromAdminModule({ username: "viewer", password: null, role: "viewer", layerId: 2 }));
  assert.doesNotThrow(() => validateLabelPayloadFromAdminModule({ name: "Evento", color: "#fff000" }));
  assert.doesNotThrow(() => validatePeoplePayloadFromAdminModule({ people: [{ name: "Maria", active: true, metadata: { rowNumber: 4 } }] }));
  assert.doesNotThrow(() => validateMembersConfigPayloadFromAdminModule({ sheetUrl: "", syncEnabled: false, syncFrequencyHours: 24 }));
  assert.doesNotThrow(() => validateExternalBasePayload({
    name: "Base externa",
    active: true,
    syncEnabled: true,
    syncFrequencyHours: 12,
    items: [{ value: "1", label: "Pessoa", active: true }],
  }));
});

test("admin payload validators reject malformed payloads from the admin module", () => {
  assert.throws(() => validateUserPayloadFromAdminModule({ username: "viewer", role: "viewer" }), /Camada de acesso do usuario e obrigatoria/);
  assert.throws(() => validatePeoplePayloadFromAdminModule({ people: [{ name: "Maria", active: "sim" }] }), /Status do socio invalido/);
  assert.throws(() => validateMembersConfigPayloadFromAdminModule({ syncFrequencyHours: 0 }), /syncFrequencyHours invalido/);
  assert.throws(() => validateExternalBasePayload({ name: "Base", items: [{ active: "sim" }] }), /Status do item da base externa invalido/);
});

test("catalog payload validators accept valid payloads from the catalog module", () => {
  assert.doesNotThrow(() => validateFieldCatalogPayloadFromCatalogModule({
    key: "campo base",
    name: "Campo Base",
    type: "person_select",
    category: "presenca",
    defaultLabel: "Pessoa",
    selectionSource: { kind: "members" },
    active: true,
  }));
  assert.doesNotThrow(() => validateScaleTaskCatalogPayloadFromCatalogModule({
    key: "tarefa base",
    name: "Tarefa Base",
    category: "cozinha",
    defaultLabel: "Tarefa",
    active: true,
  }));
});

test("catalog payload validators reject malformed payloads from the catalog module", () => {
  assert.throws(() => validateFieldCatalogPayloadFromCatalogModule({
    key: "campo",
    name: "Campo",
    type: "text",
    category: "texto",
    defaultLabel: "Campo",
    selectionSource: { kind: "members" },
  }), /Somente campos de pessoa podem usar origem de selecao/);
  assert.throws(() => validateScaleTaskCatalogPayloadFromCatalogModule({
    key: "tarefa",
    name: "Tarefa",
    category: "x",
    defaultLabel: "Tarefa",
  }), /Categoria da tarefa base invalida/);
});

test("form payload validators accept valid payloads from the form module", () => {
  assert.doesNotThrow(() => validateFormPayloadFromFormModule({
    type: "presenca",
    status: "aberto",
    title: "Formulario Teste",
    labels: [],
    fieldDefinitions: [
      { id: 1, type: "person_select", label: "Nome", required: true, show: true, total: false },
    ],
    resultsConfig: { formMode: "nucleo", totalsLayout: [] },
  }));
  assert.doesNotThrow(() => validatePresetPayloadFromFormModule({
    type: "escala_organ",
    name: "Preset",
    labels: [],
    fieldDefinitions: [],
    scaleSections: [{ title: "Cozinha", responsaveis: 1, auxiliares: 0 }],
  }));
});

test("form payload validators reject malformed payloads from the form module", () => {
  assert.throws(() => validateFormPayloadFromFormModule({
    type: "presenca",
    status: "aberto",
    title: "Formulario Teste",
    labels: [],
    fieldDefinitions: [
      { id: 1, type: "number", label: "Qtd", required: true, show: true, total: false, validation: { min: 10, max: 1 } },
    ],
  }), /Regras de validacao invalidas/);
  assert.throws(() => validatePresetPayloadFromFormModule({
    type: "escala_organ",
    name: "Preset",
    labels: [],
    fieldDefinitions: [],
    scaleSections: [{ title: "", responsaveis: 1, auxiliares: 0 }],
  }), /Secao de escala precisa de titulo/);
});
