/**
 * @file frontend/src/components/StarMark.jsx
 * @summary Marca da aplicação: estrela de 5 pontas preenchida (sem fundo).
 * @responsibility Ícone reutilizável no header e no login. A cor segue
 * `currentColor`/prop para se adaptar ao contexto (branca no header escuro).
 */

import React from "react";

export const StarMark = ({ size = 22, color = "currentColor", title }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    role={title ? "img" : undefined}
    aria-hidden={title ? undefined : "true"}
    aria-label={title}
    style={{ display: "block", flexShrink: 0 }}
  >
    {title && <title>{title}</title>}
    <path
      d="M32 6 L38.1 23.6 L56.7 24 L41.9 35.2 L47.3 53 L32 42.4 L16.7 53 L22.1 35.2 L7.3 24 L25.9 23.6 Z"
      fill={color}
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);
