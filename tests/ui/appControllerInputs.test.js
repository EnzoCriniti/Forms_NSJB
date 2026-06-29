import { describe, expect, it, vi } from "vitest";
import {
  buildAppControllerDerivedInput,
  buildAppControllerHandlersInput,
  buildAppControllerLifecycleInput,
  buildAppControllerLoadersInput,
  buildAppControllerViewModelInput,
} from "../../frontend/src/lib/appControllerInputs";

const fn = () => vi.fn();

const values = {
  activeEventId: 9,
  activeFormId: 2,
  activeMessageId: 7,
  authToken: "token",
  bootstrap: { forms: [{ id: 2 }] },
  currentUser: { id: 1, role: "admin" },
  detailLoading: null,
  draftForm: { title: "Novo" },
  editingFormId: 2,
  error: "",
  escalaDetails: { 2: [] },
  fontScale: 1,
  formDeleteKeyConfigured: true,
  loading: false,
  pinnedEventsByUser: { 1: [9] },
  pinnedFormsByUser: { 1: [2] },
  publicRoute: null,
  responseDetails: { 2: [] },
  screen: "events",
  session: { token: "token" },
  theme: "light",
};

const setters = {
  setActiveEventId: fn(),
  setActiveFormId: fn(),
  setActiveMessageId: fn(),
  setBootstrap: fn(),
  setDetailLoading: fn(),
  setDraftForm: fn(),
  setEditingFormId: fn(),
  setError: fn(),
  setEscalaDetails: fn(),
  setFontScale: fn(),
  setFormDeleteKeyConfigured: fn(),
  setLoading: fn(),
  setPinnedEventsByUser: fn(),
  setPinnedFormsByUser: fn(),
  setPublicRoute: fn(),
  setResponseDetails: fn(),
  setScreen: fn(),
  setSession: fn(),
  setTheme: fn(),
};

const bootstrapData = {
  events: [{ id: 9 }],
  externalBases: [],
  fieldCatalog: [],
  labels: [],
  membersConfig: {},
  messageTemplates: [],
  messagingConfig: {},
  people: [],
  personPresets: [],
  presets: [],
  scaleTaskCatalog: [],
  users: [],
};

const derived = {
  activeEvent: { id: 9 },
  activeForm: { id: 2 },
  editingForm: { id: 2 },
  escalaByForm: { 2: [] },
  forms: [{ id: 2 }],
  pinnedEventIds: [9],
  pinnedFormIds: [2],
  publicEvent: null,
  publicForm: null,
  publicResultsEnabled: false,
  publicResultsView: false,
  responsesByForm: { 2: [] },
};

const loaders = {
  loadEscalaForForm: fn(),
  loadResponsesForForm: fn(),
  refreshBootstrap: fn(),
  refreshEscalaForForm: fn(),
  refreshFormDeleteKeyStatus: fn(),
};

const sessionHandlers = {
  invalidateSession: fn(),
  navigate: fn(),
};

describe("appControllerInputs", () => {
  it("monta inputs de derived state e loaders a partir de values/setters", () => {
    expect(buildAppControllerDerivedInput(values)).toMatchObject({
      bootstrap: values.bootstrap,
      activeFormId: 2,
      activeEventId: 9,
      publicRoute: null,
    });

    expect(buildAppControllerLoadersInput({ values, setters })).toMatchObject({
      activeFormId: 2,
      bootstrap: values.bootstrap,
      currentUser: values.currentUser,
      setBootstrap: setters.setBootstrap,
      setLoading: setters.setLoading,
    });
  });

  it("monta inputs dos handlers e lifecycle preservando callbacks", () => {
    expect(buildAppControllerHandlersInput({
      bootstrapData,
      derived,
      loaders,
      setters,
      values,
    })).toMatchObject({
      activeForm: derived.activeForm,
      events: bootstrapData.events,
      refreshBootstrap: loaders.refreshBootstrap,
      setScreen: setters.setScreen,
    });

    expect(buildAppControllerLifecycleInput({
      derived,
      loaders,
      sessionHandlers,
      setters,
      values,
    })).toMatchObject({
      activeForm: derived.activeForm,
      authToken: "token",
      invalidateSession: sessionHandlers.invalidateSession,
      refreshFormDeleteKeyStatus: loaders.refreshFormDeleteKeyStatus,
      setTheme: setters.setTheme,
    });
  });

  it("monta input do view model com blocos de estado, dados e handlers", () => {
    const handlers = {
      adminHandlers: { onSaveUser: fn() },
      eventHandlers: { onSaveEvent: fn() },
      formHandlers: { onSaveForm: fn() },
      sessionHandlers,
    };
    const canCreateForms = vi.fn();
    const input = buildAppControllerViewModelInput({
      bootstrapData,
      canCreateForms,
      derived,
      handlers,
      loaders,
      navigate: sessionHandlers.navigate,
      sessionHandlers,
      setters,
      values,
    });

    expect(input).toMatchObject({
      adminHandlers: handlers.adminHandlers,
      activeEvent: derived.activeEvent,
      activeEventId: 9,
      canCreateForms,
      events: bootstrapData.events,
      formHandlers: handlers.formHandlers,
      refreshBootstrap: loaders.refreshBootstrap,
      sessionHandlers,
      setPublicRoute: setters.setPublicRoute,
      theme: "light",
    });
  });
});
