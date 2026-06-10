/**
 * @file tests/ui/uiErrors.test.js
 * @summary Testes do normalizador de erros da UI.
 * @responsibility Garantir mensagens estaveis para erros comuns de acoes.
 */

import { describe, expect, it } from "vitest";
import { resolveActionErrorMessage } from "../../frontend/src/components/uiErrors";

describe("uiErrors", () => {
  it("normaliza erros conhecidos de autenticacao", () => {
    expect(resolveActionErrorMessage({ code: "AUTH_INVALID_PAYLOAD" })).toBe("Informe usuário e senha.");
    expect(resolveActionErrorMessage({ code: "AUTH_INVALID_CREDENTIALS" })).toBe("Usuário ou senha inválidos.");
  });

  it("normaliza erro de rede e conflito de escala", () => {
    expect(resolveActionErrorMessage(new Error("Failed to fetch"))).toBe("Falha de comunicação com a API. Verifique a conexão e tente novamente.");
    expect(resolveActionErrorMessage({ status: 409, code: "ESCALA_CONFLICT" })).toBe("A vaga já foi preenchida por outra pessoa. Recarregue a página e tente novamente.");
  });

  it("usa mensagem original ou fallback generico", () => {
    expect(resolveActionErrorMessage({ message: "Falha customizada" })).toBe("Falha customizada");
    expect(resolveActionErrorMessage({})).toBe("Não foi possível concluir a operação. Tente novamente.");
  });
});
