/**
 * @file frontend/src/lib/messageVariables.js
 * @summary Catálogo de variáveis das mensagens e prévia client-side.
 * @responsibility Listar as variáveis válidas por tipo (para os chips) e renderar
 * uma pré-visualização com valores de exemplo (espelha o renderTemplate do backend).
 */

const COMMON = [
  { token: "{{event.title}}", label: "Título do evento" },
  { token: "{{event.date}}", label: "Data do evento" },
  { token: "{{event.closing}}", label: "Fechamento" },
];

const OPENING = [
  { token: "{{forms.list}}", label: "Lista de formulários" },
  { token: "{{group.name}}", label: "Nome do grupo" },
];

const REMINDER = [
  { token: "{{person.name}}", label: "Nome do sócio" },
  { token: "{{person.grau}}", label: "Grau" },
  { token: "{{form.title}}", label: "Título do formulário" },
  { token: "{{form.publicLink}}", label: "Link do formulário" },
  { token: "{{form.closing}}", label: "Fechamento do formulário" },
];

/** Variáveis disponíveis para o tipo (abertura = `new_scale`, demais = lembrete). */
export const variablesForType = type => [
  ...COMMON,
  ...(type === "new_scale" ? OPENING : REMINDER),
];

const SAMPLE = {
  "event.title": "Sessão de Escala",
  "event.date": "20/06/2026",
  "event.opening": "16/06/2026 08:00",
  "event.closing": "20/06/2026 15:00",
  "forms.list": "- Presença: <link>\n- Escala da Organ: <link>",
  "group.name": "Irmandade NSJB",
  "person.name": "Maria Silva",
  "person.grau": "QM",
  "form.title": "Presença Sessão de Escala",
  "form.publicLink": "https://app.exemplo.com/#/formularios/presenca",
  "form.closing": "20/06/2026 15:00",
};

/** Renderiza o corpo com valores de exemplo para a pré-visualização. */
export const renderMessagePreview = body => String(body || "")
  .replace(/\{\{\s*([^}\s]+)\s*\}\}/g, (_, path) => {
    const key = path.trim();
    return key in SAMPLE ? SAMPLE[key] : `{{${key}}}`;
  });
