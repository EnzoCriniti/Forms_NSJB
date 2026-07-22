/**
 * @file frontend/src/components/AppSidebar.jsx
 * @summary Barra lateral de navegacao (desktop).
 * @responsibility Exibir marca e navegacao principal com estado ativo. No mobile
 * fica escondida via CSS — a navegacao passa pelo drawer do cabecalho.
 */

import React from "react";
import appData from "../data/appData.json";
import { Icon } from "./ui";
import { StarMark } from "./StarMark";

export const AppSidebar = ({ nav = [], screen, onNavigate }) => (
  <aside className="app-sidebar" aria-label="Navegação principal">
    <div className="app-sidebar__brand">
      <StarMark size={22} color="#ffffff" />
      <span>NSJB Forms</span>
    </div>
    <nav className="app-sidebar__nav">
      {nav.map(item => (
        <button
          key={item.key}
          type="button"
          className="app-sidebar__item"
          data-active={screen === item.key}
          onClick={() => onNavigate(item.key)}
          aria-current={screen === item.key ? "page" : undefined}
        >
          <span className="app-sidebar__icon"><Icon name={item.icon} size={18} /></span>
          <span className="app-sidebar__label">{item.label}</span>
        </button>
      ))}
    </nav>
    <div className="app-sidebar__foot" title={`Dados base JSON v${appData.version}`}>v{appData.version}</div>
  </aside>
);
