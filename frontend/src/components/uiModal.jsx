import React from "react";
import { Btn } from "./uiButton";
import { Icon } from "./uiIcons";
import { COLORS } from "./uiTheme";

export const ConfirmModal = ({
  open,
  title,
  message,
  children,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tone = "danger",
  busy = false,
  confirmDisabled = false,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ width: "min(440px, 100%)" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ width: 42, height: 42, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto", background: tone === "danger" ? COLORS.dangerLight : COLORS.warningLight, color: tone === "danger" ? COLORS.danger : COLORS.warning }}>
            <Icon name={tone === "danger" ? "trash" : "warning"} size={20} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: 17 }}>{title}</h3>
            <p style={{ margin: "8px 0 0", color: COLORS.textSecondary, fontSize: 13, lineHeight: 1.5 }}>{message}</p>
          </div>
        </div>
        {children && <div style={{ marginTop: 16 }}>{children}</div>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
          <Btn v="secondary" onClick={onCancel} disabled={busy}>{cancelLabel}</Btn>
          <Btn v={tone === "danger" ? "danger" : "warning"} onClick={onConfirm} loading={busy} disabled={confirmDisabled}>{confirmLabel}</Btn>
        </div>
      </div>
    </div>
  );
};
