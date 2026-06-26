/**
 * @file frontend/src/features/events/components/MessageBodyEditor.jsx
 * @summary Editor do corpo da mensagem com chips de variáveis e prévia ao vivo.
 * @responsibility Inserir variáveis na posição do cursor (sem digitar `{{...}}`)
 * e mostrar a pré-visualização com valores de exemplo.
 */

import React, { useRef } from "react";
import { renderMessagePreview, variablesForType } from "../../../lib/messageVariables";

export const MessageBodyEditor = ({ type, body = "", onChange }) => {
  const ref = useRef(null);

  const insert = token => {
    const el = ref.current;
    const start = el?.selectionStart ?? body.length;
    const end = el?.selectionEnd ?? body.length;
    const next = `${body.slice(0, start)}${token}${body.slice(end)}`;
    onChange(next);
    requestAnimationFrame(() => {
      if (!el) return;
      el.focus();
      const caret = start + token.length;
      el.setSelectionRange(caret, caret);
    });
  };

  const preview = renderMessagePreview(body);

  return (
    <div className="msg-field">
      <span className="msg-label">Corpo</span>
      <div className="msg-var-chips">
        <span className="msg-var-chips-label">Inserir variável:</span>
        {variablesForType(type).map(variable => (
          <button type="button" key={variable.token} className="msg-var-chip" title={variable.token} onClick={() => insert(variable.token)}>
            {variable.label}
          </button>
        ))}
      </div>
      <textarea
        ref={ref}
        className="msg-input"
        aria-label="Corpo"
        value={body}
        onChange={event => onChange(event.target.value)}
        rows={8}
        placeholder="Olá {{person.name}}, não esqueça de preencher…"
      />
      <div className="msg-preview">
        <div className="msg-preview-label">Pré-visualização (valores de exemplo)</div>
        {body.trim()
          ? <div className="msg-preview-body">{preview}</div>
          : <div className="msg-hint">Escreva ou insira variáveis para ver a prévia.</div>}
      </div>
    </div>
  );
};
