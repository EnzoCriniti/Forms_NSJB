import React from "react";
import { COLORS } from "../../components/ui";

export const AuditLogsTable = ({ items }) => (
  <div className="ui-table-wrap">
    <table className="ui-table" style={{ fontSize: 12, minWidth: 920 }}>
      <thead>
        <tr>
          {["Data", "Usuário", "Ação", "Status", "Tela", "Entidade", "Mensagem", "Metadata"].map(label => (
            <th key={label}>{label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map(item => (
          <tr key={item.id}>
            <td style={{ whiteSpace: "nowrap" }}>{new Date(item.createdAt).toLocaleString("pt-BR")}</td>
            <td>
              <div style={{ fontWeight: 800, color: COLORS.text }}>{item.actorName || "Visitante"}</div>
              <div style={{ color: COLORS.textSecondary, fontSize: 11 }}>{item.actorRole || "visitor"}</div>
            </td>
            <td>{item.action}</td>
            <td>{item.status}</td>
            <td>{item.screen || "-"}</td>
            <td>
              <div style={{ fontWeight: 700 }}>{item.entityType || "-"}</div>
              <div style={{ color: COLORS.textSecondary, fontSize: 11 }}>{item.entityLabel || item.entityId || "-"}</div>
            </td>
            <td>{item.message || "-"}</td>
            <td style={{ fontSize: 11, color: COLORS.textSecondary }}>
              <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "inherit" }}>
                {JSON.stringify(item.metadata || {}, null, 2)}
              </pre>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
