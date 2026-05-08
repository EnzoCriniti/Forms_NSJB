# Diagramas

Mapa visual do NSJB Forms.

## Como ler

- Os arquivos fonte vivem em `docs/diagramas/*.d2`.
- As imagens geradas vivem em `docs/diagramas/*.svg`.
- Se mudar um diagrama, regenere o SVG a partir do `.d2` correspondente.
- Use este documento como apoio visual e [docs/MAPA-CODIGO.md](MAPA-CODIGO.md) como mapa rapido de arquivos.

## Arquitetura geral

![Arquitetura geral](diagramas/infra.svg)

## Inicializacao da stack

![Fluxo de inicializacao](diagramas/inicializacao.svg)

## Fluxo funcional

![Fluxo funcional resumido](diagramas/funcional.svg)

## Quando atualizar

- Atualize o `.d2` e regenere o `.svg` quando a topologia, a stack Docker ou o fluxo funcional mudarem.
- A documentacao tecnica continua em `README.md`, `docs/ARQUITETURA.md`, `docs/FUNCIONALIDADES.md` e `docs/MANUTENCAO.md`.
