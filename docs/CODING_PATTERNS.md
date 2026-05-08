# Coding Patterns

PadrÃµes prÃ¡ticos observados neste projeto.

## 1. Criar ou alterar uma pÃ¡gina/tela

Quando usar:
- Quando a mudanÃ§a Ã© uma tela inteira ou uma pÃ¡gina interna do fluxo.

Arquivos normalmente envolvidos:
- `src/screens/*.jsx`
- `src/App.jsx`
- `src/lib/forms.js`
- `src/lib/api.js`

Como implementar:
1. Coloque a tela em `src/screens/` com nome `PascalCase`.
2. Receba dados e callbacks por props, em vez de buscar tudo dentro da tela.
3. Use `src/App.jsx` para decidir quando renderizar a tela e para passar `onNavigate`, dados e handlers.

Exemplo baseado no projeto:
```jsx
{screen === "results" && activeForm && (
  <ResultsScreen
    onNavigate={navigate}
    form={activeForm}
    responses={responsesByForm[activeForm.id] || []}
  />
)}
```

Cuidados:
- NÃ£o concentre regra de negÃ³cio em `src/App.jsx`.
- Mantenha o contrato de props coerente com as telas existentes.
- Se a tela for pÃºblica, respeite o fluxo `#/f/<slug>`.

## 2. Criar ou alterar um componente

Quando usar:
- Quando o cÃ³digo Ã© reutilizÃ¡vel ou visual, mas nÃ£o Ã© uma tela.

Arquivos normalmente envolvidos:
- `src/components/ui.jsx`
- `src/features/*/*.jsx`
- `src/screens/*.jsx`

Como implementar:
1. Reuse componentes da UI base quando possÃ­vel, como `Btn`, `Icon`, `Badge` e `StatusBadge`.
2. Prefira componentes pequenos e focados em uma responsabilidade.
3. Passe valores por props e evite acoplamento com estado global quando nÃ£o for necessÃ¡rio.

Exemplo baseado no projeto:
```jsx
export const Badge = ({ label, small, labels = [] }) => {
  const item = typeof label === "object" ? label : labels.find(entry => entry.id === label);
  return <span>{item?.name || ""}</span>;
};
```

Cuidados:
- `src/components/ui.jsx` Ã© compartilhado por vÃ¡rias telas, entÃ£o mudanÃ§as ali tÃªm efeito amplo.
- NÃ£o duplique componentes que jÃ¡ existem em `src/components/ui.jsx`.

## 3. Criar ou alterar um formulÃ¡rio

Quando usar:
- Quando a tela coleta dados para salvar no backend ou manipula formulÃ¡rio dinÃ¢mico.

Arquivos normalmente envolvidos:
- `src/screens/CreateFormScreen.jsx`
- `src/screens/PublicFormScreen.jsx`
- `src/screens/PublicEscalaScreen.jsx`
- `src/lib/forms.js`
- `server/validators/payloadValidators.mjs`

Como implementar:
1. Use estado local com `useState` para os campos do formulÃ¡rio.
2. Valide os campos antes de enviar.
3. Envie o payload para `src/lib/api.js` e sincronize o bootstrap depois do salvamento.

Exemplo baseado no projeto:
```jsx
await onSaveResponse({
  formId: form.id,
  respondentName: selectedPerson?.name || "Respondente",
  respondentGrau: selectedPerson?.grau || "",
  values,
});
```

Cuidados:
- FormulÃ¡rios dinÃ¢micos usam estruturas serializadas como `fieldDefinitions`, `resultsConfig` e `scaleSections`.
- O backend tambÃ©m valida o payload, entÃ£o o frontend nÃ£o pode ser a Ãºnica barreira.

## 4. Criar ou alterar uma chamada de API

Quando usar:
- Quando a mudanÃ§a envolve comunicaÃ§Ã£o com a API local.

Arquivos normalmente envolvidos:
- `src/lib/api.js`
- `server/routes/apiRouter.mjs`
- `server/services/*.mjs`
- `server/validators/payloadValidators.mjs`

Como implementar:
1. Adicione o wrapper de `fetch` em `src/lib/api.js`.
2. Adicione a rota correspondente em `server/routes/apiRouter.mjs`.
3. Direcione a regra de negÃ³cio para um service e valide o payload antes de persistir.

Exemplo baseado no projeto:
```js
export const saveForm = form => requestJson("/api/forms", {
  method: "POST",
  body: JSON.stringify(form),
});
```

Cuidados:
- NÃ£o espalhe `fetch` direto por telas e modais.
- Mantenha o contrato de resposta consistente com o que o frontend jÃ¡ espera.
- Se o payload mudar, revise validator, service, repository e testes.

## 5. Criar ou alterar um service/hook

Quando usar:
- Quando a lÃ³gica nÃ£o deve ficar na tela, mas ainda nÃ£o Ã© UI.

Arquivos normalmente envolvidos:
- `src/lib/*.js`
- `server/services/*.mjs`
- `server/core/*.mjs`

Como implementar:
1. No frontend, coloque helpers em `src/lib/`.
2. No backend, coloque regra de negÃ³cio em `server/services/`.
3. Deixe repositÃ³rio sÃ³ para persistÃªncia e `server/core/` sÃ³ para utilidades gerais.

Exemplo baseado no projeto:
```js
export const canViewForm = (user, form) => {
  if (!form) return false;
  if (user) return true;
  return form.status === "aberto";
};
```

Cuidados:
- NÃ£o foi identificado um padrÃ£o de hooks compartilhados no codebase.
- Os hooks usados nas telas sÃ£o locais e simples, como `useState`, `useEffect` e `useMemo`.

## 6. Criar ou alterar tipos/interfaces

Quando usar:
- Quando vocÃª precisa documentar forma de dados ou contratos entre frontend e backend.

Arquivos normalmente envolvidos:
- `src/lib/api.js`
- `server/validators/payloadValidators.mjs`
- `server/db.mjs`
- `server/repositories/*.mjs`

Como implementar:
1. Este projeto nÃ£o usa TypeScript nem um arquivo central de tipos.
2. Explicite o contrato nos validators, nos services e na estrutura do payload.
3. Se precisar de tipagem futura, adicione documentaÃ§Ã£o prÃ³xima ao fluxo, nÃ£o em um arquivo isolado sem uso.

Exemplo baseado no projeto:
```js
const EMPTY_BOOTSTRAP = {
  forms: [],
  responsesByForm: {},
  escalaByForm: {},
  users: [],
};
```

Cuidados:
- NÃ£o hÃ¡ `interfaces` ou `types` formais identificados no codebase.
- O contrato real Ã© definido por objetos JS e validaÃ§Ã£o runtime.

## 7. Tratar loading, erro e estado vazio

Quando usar:
- Em telas que carregam dados da API ou dependem de seleÃ§Ã£o de contexto.

Arquivos normalmente envolvidos:
- `src/App.jsx`
- `src/screens/*.jsx`
- `src/components/ui.jsx`

Como implementar:
1. Mostre loading enquanto o bootstrap ou a operaÃ§Ã£o assÃ­ncrona nÃ£o terminou.
2. Centralize erro relevante na tela pai ou no modal pai.
3. Use estado vazio explÃ­cito quando nÃ£o houver itens ou seleÃ§Ã£o.

Exemplo baseado no projeto:
```jsx
if (loading) {
  return <div>Carregando aplicaÃ§Ã£o...</div>;
}

if (error) {
  return <div>Erro ao iniciar</div>;
}
```

Cuidados:
- `src/App.jsx` trata loading e erro do bootstrap global.
- Telas especÃ­ficas normalmente tratam vazio com listas vazias ou mensagens curtas.

## 8. Aplicar estilos

Quando usar:
- Sempre que a UI for alterada.

Arquivos normalmente envolvidos:
- `src/styles.css`
- `src/components/ui.jsx`
- `src/screens/*.jsx`
- `src/features/*.jsx`

Como implementar:
1. Use `src/styles.css` para tema, base visual e classes globais.
2. Use inline styles no JSX para ajuste local e visual especÃ­fico do componente.
3. Reuse `COLORS` e componentes base para manter consistÃªncia visual.

Exemplo baseado no projeto:
```jsx
<button
  style={{
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    border: "none",
  }}
>
  Salvar
</button>
```

Cuidados:
- O projeto mistura estilos globais e inline, entÃ£o nÃ£o tente forÃ§ar uma Ãºnica estratÃ©gia sem necessidade.
- MudanÃ§as em `src/components/ui.jsx` e `src/styles.css` afetam vÃ¡rias telas.

## 9. Organizar imports

Quando usar:
- Sempre que criar ou alterar arquivos React ou mÃ³dulos do backend.

Arquivos normalmente envolvidos:
- `src/*.jsx`
- `src/*.js`
- `server/*.mjs`

Como implementar:
1. Agrupe imports por origem: externos, internos, relativos.
2. Prefira imports nomeados quando o arquivo jÃ¡ exporta vÃ¡rios helpers.
3. Mantenha a ordem coerente dentro do arquivo, como o projeto jÃ¡ faz.

Exemplo baseado no projeto:
```jsx
import React, { useEffect, useMemo, useState } from "react";
import { AuthPanel } from "./features/auth/AuthPanel";
import { fetchBootstrap } from "./lib/api";
```

Cuidados:
- O codebase usa imports relativos curtos e explÃ­citos.
- NÃ£o introduza alias de caminho sem necessidade, porque o projeto nÃ£o mostra esse padrÃ£o.

## 10. Validar alteraÃ§Ãµes

Quando usar:
- Sempre que a mudanÃ§a tocar fluxo, tela, validaÃ§Ã£o ou API.

Arquivos normalmente envolvidos:
- `package.json`
- `tests/*.test.mjs`
- `tests/ui/*.test.jsx`

Como implementar:
1. Rode `npm run build` para mudanÃ§as de frontend.
2. Rode `npm run test` ou a suÃ­te mais prÃ³xima do fluxo alterado.
3. Se nÃ£o conseguir validar, explique exatamente o motivo.

Exemplo baseado no projeto:
```text
npm run build
npm run test
npm run test:forms
```

Cuidados:
- NÃ£o existe script `lint` identificado no `package.json` atual.
- Em mudanÃ§as de API, valide tambÃ©m os testes de `node --test`.
- Em mudanÃ§as de UI, priorize os testes do screen afetado.


## 11. Feedback e confirmações

Quando usar:
- Em CRUDs, salvamentos assíncronos, exclusões e ações que podem falhar por conflito ou rede.

Arquivos normalmente envolvidos:
- `src/components/ui.jsx`
- `src/styles.css`
- `src/screens/*.jsx`
- `src/features/*.jsx`

Como implementar:
1. Reuse `FeedbackBanner` para sucesso, erro, loading e avisos curtos.
2. Reuse `ConfirmModal` para exclusões e outras ações destrutivas.
3. Use `Btn loading` para bloquear duplo clique durante operações assíncronas.

Exemplo baseado no projeto:
```jsx
<Btn loading={saving}>Salvar</Btn>
<FeedbackBanner tone="error" message={error} fixed />
<ConfirmModal open={open} title="Excluir item" message="Confirma a exclusão?" />
```

Cuidados:
- Mantenha a mensagem específica quando houver conflito de negócio, como a escala pública.
- Não misture `window.confirm` com os modais novos se o fluxo já usa os componentes compartilhados.
- Para exclusões com chave mestra, use ConfirmModal com children para o input do segredo e confirmDisabled enquanto a validação não estiver pronta.

## 12. Registrar auditoria administrativa

Quando usar:
- Em mutações administrativas, auth, operações públicas relevantes e qualquer fluxo que precise de trilha de auditoria no backend.

Arquivos normalmente envolvidos:
- `server/services/auditLogService.mjs`
- `server/repositories/auditLogRepository.mjs`
- `server/routes/apiRouter.mjs`
- `src/features/admin/AdminSettingsModal.jsx`
- `src/lib/api.js`

Como implementar:
1. Resolva o actor no backend a partir da sessao autenticada ou use actor sistemico/visitante para fluxo publico.
2. Sanitize `metadata` no backend antes de persistir.
3. Registre o evento depois da mutacao, sem confiar em actor enviado pelo frontend.
4. Para respostas publicas, grave apenas o resumo: `formId`, `responseId`, `fieldCount` e `mode`.

Exemplo baseado no projeto:
```js
recordAuditLog({
  category: "forms",
  action: "create_form",
  status: "success",
  actor: auth.user,
  metadata: { formId: form.id, title: form.title },
});
```

Cuidados:
- Nunca persistir senha, chave mestra, token, hash ou salt.
- Não registrar `values_json` completo de respostas.
- Não criar endpoint público genérico para inserção de log.

## Padronização visual compartilhada

Quando a mudança for de layout e consistência visual, prefira evoluir a base compartilhada antes de ajustar tela por tela.

Arquivos normalmente envolvidos:
- `src/components/ui.jsx`
- `src/styles.css`
- `src/App.jsx`

Como implementar:
1. Centralize botões, badges, feedback, modais e controles base em componentes ou classes compartilhadas.
2. Reaproveite tokens de tema e estados de focus/disabled/loading para manter coerência.
3. Ajuste telas pontualmente apenas onde houver divergência clara de fluxo ou hierarquia visual.
4. Preserve responsividade, dark mode e mensagens de estado sem mudar regra de negócio.

Cuidados:
- Evite duplicar estilos inline que já tenham equivalente compartilhado.
- Não reescreva telas inteiras quando a correção puder ficar em uma base comum.

