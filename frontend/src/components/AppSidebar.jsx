/**
 * @file frontend/src/components/AppSidebar.jsx
 * @summary Barra lateral de navegacao (desktop), recolhivel.
 * @responsibility Exibir marca e navegacao principal com estado ativo e um botao
 * para recolher a barra num trilho so de icones. No mobile fica escondida via
 * CSS — a navegacao passa pelo drawer do cabecalho.
 */

import React from "react";
import { Icon } from "./ui";
import { StarMark } from "./StarMark";

const appVersion = import.meta.env.VITE_APP_VERSION || "dev";
const gitCommit = import.meta.env.VITE_GIT_COMMIT || "dev";
const buildLabel = `v${appVersion}+g${gitCommit}`;

export const AppSidebar = ({ nav = [], screen, onNavigate, collapsed = false, onToggle }) => (
  <aside className="app-sidebar" data-collapsed={collapsed} aria-label="Navegação principal">
    <div className="app-sidebar__head">
      <button
        type="button"
        className="app-sidebar__toggle"
        onClick={onToggle}
        aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
        title={collapsed ? "Expandir menu" : "Recolher menu"}
        aria-expanded={!collapsed}
      >
        <Icon name="menu" size={18} />
      </button>
      <span className="app-sidebar__brand">
        <StarMark size={20} color="#ffffff" />
        <span className="app-sidebar__brand-name">NSJB Forms</span>
      </span>
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
          title={item.label}
        >
          <span className="app-sidebar__icon"><Icon name={item.icon} size={18} /></span>
          <span className="app-sidebar__label">{item.label}</span>
        </button>
      ))}
    </nav>
    <div className="app-sidebar__foot" title={`Versao ${appVersion}, commit ${gitCommit}`}>{buildLabel}</div>
  </aside>
);
