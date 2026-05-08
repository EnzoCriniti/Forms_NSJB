# Manutencao

Regras objetivas para manter o projeto consistente durante a migracao de estrutura.

## Checklist rapido

- Veja `docs/AI_CODEMAP.md` antes de procurar arquivos no repo inteiro.
- Verifique se a mudanca pertence ao frontend, backend, docker ou docs.
- Atualize os caminhos da documentacao quando mover arquivos.
- Rode `npm run build` ao final.
- Use `docs/CHECKLIST-MANUTENCAO.md` como lista viva da sequencia de manutencao.
- Use `docs/CHECKLIST-REFATORACAO-PENDENTE.md` para retomar pendencias de codigo.

## Separacao de responsabilidades

- Telas ficam em `frontend/src/screens/`.
- Modulos de dominio ficam em `frontend/src/features/`.
- Helpers do frontend ficam em `frontend/src/lib/`.
- Rotas ficam em `backend/routes/`.
- Regras de negocio ficam em `backend/services/`.
- Persistencia fica em `backend/repositories/`.
- Validacao fica em `backend/validators/`.

## O que evitar

- Colocar `fetch` direto em component ou screen.
- Colocar regra de negocio em `App.jsx`.
- Colocar SQL fora de repository.
- Juntar doc historica com doc operacional.

## Quando atualizar docs

- Ao mover um arquivo de pasta.
- Ao criar uma nova area de codigo.
- Ao alterar um contrato importante entre frontend e backend.
- Ao mudar a estrategia de banco ou container.
