# Padroes de Codigo

Padroes de implementacao usados neste repositorio.

## Tela nova

- Coloque a tela em `frontend/src/screens/` com nome `PascalCase`.
- Mantenha a tela pequena e deixe a orquestracao em `frontend/src/App.jsx`.
- Use `frontend/src/lib/api.js` para chamadas remotas.
- Use `frontend/src/lib/forms.js` para regras de formato e leitura de dados.

## Modulo novo de dominio

- Use `frontend/src/features/` para blocos com fluxo proprio.
- Use `frontend/src/components/ui.jsx` para elementos visuais compartilhados.
- Evite duplicar componentes que ja existem no kit visual.

## Regra de negocio

- Coloque regra de negocio em `backend/services/`.
- Deixe persistencia em `backend/repositories/`.
- Deixe validacao estrutural em `backend/validators/`.
- Use `backend/core/` apenas para utilitarios gerais.

## API nova

- Adicione o wrapper de transporte em `frontend/src/lib/api.js`.
- Adicione a rota em `backend/routes/apiRouter.mjs`.
- Adicione service e repository se houver persistencia.

## Dados e seed

- Atualize `backend/data/seedData.mjs` quando mudar dados base.
- Atualize `backend/seed.mjs` quando mudar a primeira carga do banco.
- Mantenha `backend/database/*` coerente com o driver PostgreSQL oficial.

## Boas praticas

- Nao espalhe `fetch` em componentes.
- Nao coloque regra de negocio em modal ou screen.
- Nao acople UI com detalhes do banco.
- Nao mude contratos sem atualizar backend, frontend e docs juntos.
