/**
 * @file tests/ui/appDataLoad.test.js
 * @summary Testes dos helpers de carregamento de detalhes do app.
 * @responsibility Cobrir controle de cache, estado em andamento e atualizacao dos maps.
 */

import { describe, it, expect, vi } from "vitest";
import {
  hasLoadedFormDetails,
  loadFormEscalaDetail,
  loadFormResponsesDetail,
  removeFormDetail,
  shouldSkipDetailLoad,
  upsertFormDetail,
} from "../../frontend/src/lib/appDataLoad.js";

describe("appDataLoad", () => {
  it("detecta detalhes carregados no bootstrap ou no cache incremental", () => {
    expect(hasLoadedFormDetails({ bootstrapDetails: { 1: [] }, details: {}, formId: 1 })).toBe(true);
    expect(hasLoadedFormDetails({ bootstrapDetails: {}, details: { 2: [] }, formId: 2 })).toBe(true);
    expect(hasLoadedFormDetails({ bootstrapDetails: {}, details: {}, formId: 3 })).toBe(false);
  });

  it("decide quando pular carregamento de detalhe", () => {
    expect(shouldSkipDetailLoad({
      kind: "responses",
      formId: 1,
      bootstrapDetails: { 1: [] },
    })).toBe(true);

    expect(shouldSkipDetailLoad({
      kind: "escala",
      formId: 2,
      detailLoading: { kind: "escala", formId: 2 },
    })).toBe(true);

    expect(shouldSkipDetailLoad({
      force: true,
      kind: "escala",
      formId: 2,
      bootstrapDetails: { 2: [] },
    })).toBe(false);
  });

  it("atualiza e remove detalhes por formulario", () => {
    expect(upsertFormDetail({ 1: ["a"] }, 2, ["b"])).toEqual({ 1: ["a"], 2: ["b"] });
    expect(removeFormDetail({ 1: ["a"], 2: ["b"] }, 1)).toEqual({ 2: ["b"] });
  });

  it("carrega respostas e atualiza estado incremental", async () => {
    const setDetailLoading = vi.fn();
    const setError = vi.fn();
    let responseDetails = {};
    const setResponseDetails = updater => {
      responseDetails = updater(responseDetails);
    };

    await loadFormResponsesDetail({
      formId: 4,
      bootstrapResponsesByForm: {},
      responseDetails,
      detailLoading: null,
      setDetailLoading,
      setResponseDetails,
      setError,
      fetchFormResponses: vi.fn(async () => ({ responses: [{ id: 1 }] })),
    });

    expect(responseDetails).toEqual({ 4: [{ id: 1 }] });
    expect(setDetailLoading).toHaveBeenCalledWith({ kind: "responses", formId: 4 });
    expect(setError).not.toHaveBeenCalled();
  });

  it("carrega escala com force mesmo quando ja existe no bootstrap", async () => {
    let escalaDetails = {};
    const setEscalaDetails = updater => {
      escalaDetails = updater(escalaDetails);
    };

    await loadFormEscalaDetail({
      formId: 5,
      force: true,
      bootstrapEscalaByForm: { 5: [{ title: "Antiga" }] },
      escalaDetails,
      detailLoading: null,
      setDetailLoading: vi.fn(),
      setEscalaDetails,
      setError: vi.fn(),
      fetchFormEscala: vi.fn(async () => ({ sections: [{ title: "Nova" }] })),
    });

    expect(escalaDetails).toEqual({ 5: [{ title: "Nova" }] });
  });
});
