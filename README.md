# NSJB Forms

Aplicação para gestão de formulários de presença e escala da Organ.

A base agora está separada em:

- `src/`: frontend React + Vite
- `server/`: API local em Node + SQLite
- `storage/nsjb-forms.sqlite`: banco local do projeto

## Rodar localmente

No Windows:

```bat
start-mvp.bat
```

Ou manualmente:

```powershell
$env:PATH = "$PWD\tools\node;$env:PATH"
.\tools\node\npm.cmd run dev
```

O comando sobe:

- frontend Vite em `http://127.0.0.1:5173`
- API local em `http://127.0.0.1:8787`

## Stack

- React 19
- Vite 7
- Node 22
- SQLite local via `node:sqlite`

## Qualidade

Build do frontend:

```text
npm run build
```

Testes automatizados:

```text
npm run test
```

Suítes:

- `npm run test:api`: validadores e integração da API
- `npm run test:ui`: componentes React em `jsdom`

## Estado atual

- formulários persistidos em SQLite
- respostas persistidas por formulário
- escala da Organ persistida por formulário
- usuários, presets, classificações e sócios persistidos em SQLite
- sessão atual e tema continuam no navegador
- importação de sócios por link direto de Google Sheets foi mantida por decisão do projeto

## Documentação normalizada

- [docs/APLICACAO.md](docs/APLICACAO.md): visão funcional e fluxo do produto
- [docs/FUNCIONALIDADES-E-ARQUITETURA.md](docs/FUNCIONALIDADES-E-ARQUITETURA.md): arquitetura, modelo de dados e API local
- [docs/GUIDELINES-TECNICOS.md](docs/GUIDELINES-TECNICOS.md): operação, convenções e próximos passos técnicos
- [docs/MANUTENCAO.md](docs/MANUTENCAO.md): regra de manutenção, cabeçalhos e decisões de camada
- [docs/IA-LOG.md](docs/IA-LOG.md): log curto de mudanças feitas em sessões assistidas
- [docs/briefing-original.md](docs/briefing-original.md): histórico do briefing inicial

## Usuários de teste

- `admin` / `admin123`
- `viewer` / `viewer123`
