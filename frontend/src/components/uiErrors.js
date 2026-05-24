/**
 * @file frontend/src/components/uiErrors.js
 * @summary Mensagens de erro compartilhadas da UI.
 * @responsibility Normalizar erros de acoes assicronas para textos exibidos ao usuario.
 */

export const resolveActionErrorMessage = error => {
  const message = String(error?.message || "").trim();
  if (error?.code === "AUTH_INVALID_PAYLOAD" || /usuario e senha sao obrigatorios/i.test(message)) {
    return "Informe usuário e senha.";
  }
  if (error?.code === "AUTH_INVALID_CREDENTIALS" || /usuario ou senha invalidos/i.test(message)) {
    return "Usuário ou senha inválidos.";
  }
  if (error?.code === "AUTH_ADMIN_SESSION_ACTIVE" || /administrador conectado em outro dispositivo/i.test(message)) {
    return "Já existe um administrador conectado em outro dispositivo. Aguarde o logout ou o timeout de inatividade.";
  }
  const isNetworkError = !error?.status && /fetch|network|failed to fetch|networkerror/i.test(message);
  if (isNetworkError) {
    return "Falha de comunicação com a API. Verifique a conexão e tente novamente.";
  }
  if (error?.status === 409 && error?.code === "ESCALA_CONFLICT") {
    return message || "A vaga já foi preenchida por outra pessoa. Recarregue a página e tente novamente.";
  }
  return message || "Não foi possível concluir a operação. Tente novamente.";
};
