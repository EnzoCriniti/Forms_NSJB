/**
 * @file frontend/src/features/forms/createFormPanels/finalPanels.jsx
 * @summary Paineis finais da criacao de formulario.
 * @responsibility Manter separados os blocos de escala, resultados e rodape.
 */

import React from "react";
import { COLORS, Btn, Icon } from "../../../components/ui";
import { CreateFormLivePreview } from "../../../components/CreateFormLivePreview";

export const FormPreviewPanel = ({
  showPreview,
  format,
  previewTitle,
  previewDescription,
  previewClosingText,
  fields,
  people,
  scaleDraft,
  scaleLimit,
}) => {
  if (!showPreview) return null;
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 0.4 }}>
            Pré-visualização do formulário
          </div>
          <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>
            Esta área mostra como o link público está ficando com base no rascunho atual.
          </div>
        </div>
      </div>
      <CreateFormLivePreview
        format={format}
        title={previewTitle}
        description={previewDescription}
        closingText={previewClosingText}
        fields={fields}
        people={people}
        scaleSections={scaleDraft}
        scaleLimit={scaleLimit}
      />
    </div>
  );
};

export const ScaleEditorPanel = ({
  scaleLimit,
  scaleDraft,
  activeScaleTaskCatalog,
  onScaleLimitChange,
  onUpdateScale,
  onSetScaleMode,
  onApplyScaleCatalog,
  onRemoveScaleSection,
  onAddScale,
}) => (
  <section className="msg-card" style={{ marginBottom: 20 }}>
    <header className="msg-card__head">
      <h3 className="msg-card__title">Modelo da Escala da Organ</h3>
      <p className="msg-card__hint">Defina as seções, quantos responsáveis e quantos auxiliares cada uma terá.</p>
    </header>
    <div className="msg-field" style={{ maxWidth: 280, marginBottom: 14 }}>
      <label className="msg-label" htmlFor="scale-person-limit">Limite por pessoa na escala</label>
      <input
        id="scale-person-limit"
        className="msg-input"
        type="number"
        min="1"
        value={scaleLimit}
        onChange={event => onScaleLimitChange(Math.max(1, Number(event.target.value) || 1))}
      />
      <span className="msg-hint">Define quantas vagas a mesma pessoa pode ocupar no total desta escala.</span>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {scaleDraft.map((section, index) => (
        <div className="create-form-scale-row" key={index} style={{ display: "grid", gridTemplateColumns: "1.2fr 1.4fr 110px 110px auto", gap: 8, alignItems: "end", background: COLORS.surfaceAlt, border: `1px solid ${COLORS.borderLight}`, borderRadius: 10, padding: 10 }}>
          <div>
            <label style={{ fontSize: 11, color: COLORS.textSecondary, display: "block", marginBottom: 4 }}>Origem da seção</label>
            <div className="create-form-segmented" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              <button disabled={activeScaleTaskCatalog.length === 0} onClick={() => onSetScaleMode(index, "catalog")} style={{ border: `1px solid ${(section.source === "catalog" || section.catalogTaskId) ? COLORS.primary : COLORS.border}`, background: (section.source === "catalog" || section.catalogTaskId) ? COLORS.primaryLight : COLORS.surface, color: (section.source === "catalog" || section.catalogTaskId) ? COLORS.primary : COLORS.textSecondary, borderRadius: 8, padding: "8px 10px", fontSize: 12, fontWeight: 800, cursor: activeScaleTaskCatalog.length === 0 ? "not-allowed" : "pointer", opacity: activeScaleTaskCatalog.length === 0 ? 0.55 : 1 }}>Tarefa existente</button>
              <button onClick={() => onSetScaleMode(index, "local")} style={{ border: `1px solid ${(!section.catalogTaskId && section.source !== "catalog") ? COLORS.primary : COLORS.border}`, background: (!section.catalogTaskId && section.source !== "catalog") ? COLORS.primaryLight : COLORS.surface, color: (!section.catalogTaskId && section.source !== "catalog") ? COLORS.primary : COLORS.textSecondary, borderRadius: 8, padding: "8px 10px", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>Tarefa local</button>
            </div>
            {(section.source === "catalog" || section.catalogTaskId) && (
              <select className="msg-input" value={section.catalogTaskId || ""} onChange={event => onApplyScaleCatalog(index, event.target.value)} style={{ marginTop: 6 }}>
                <option value="">Selecione uma tarefa base</option>
                {activeScaleTaskCatalog.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            )}
          </div>
          <label style={{ fontSize: 11, color: COLORS.textSecondary }}>Descrição na escala<input className="msg-input" value={section.title} onChange={event => onUpdateScale(index, { title: event.target.value })} style={{ marginTop: 4 }} /></label>
          <label style={{ fontSize: 11, color: COLORS.textSecondary }}>Responsáveis<input className="msg-input" type="number" min="0" value={section.responsaveis} onChange={event => onUpdateScale(index, { responsaveis: Number(event.target.value) })} style={{ marginTop: 4 }} /></label>
          <label style={{ fontSize: 11, color: COLORS.textSecondary }}>Auxiliares<input className="msg-input" type="number" min="0" value={section.auxiliares} onChange={event => onUpdateScale(index, { auxiliares: Number(event.target.value) })} style={{ marginTop: 4 }} /></label>
          <button aria-label={`Remover seção ${index + 1}`} onClick={() => onRemoveScaleSection(index)} style={{ background: "none", border: "none", color: COLORS.danger, cursor: "pointer", alignSelf: "flex-end", padding: "10px 4px" }}><Icon name="trash" size={16} /></button>
        </div>
      ))}
    </div>
    <Btn v="secondary" icon="plus" sz="sm" onClick={onAddScale} style={{ marginTop: 10 }}>Adicionar seção</Btn>
  </section>
);

export const ResultsConfigPanel = ({
  resultsConfig,
  linkedPeopleField,
  totalizableFields,
  availableTotals,
  FIELD_TYPES,
  onChangeResultsConfig,
  onMoveTotalLayout,
  onAddTotalField,
}) => (
  <section className="msg-card" style={{ marginTop: 18 }}>
    <header className="msg-card__head">
      <h3 className="msg-card__title">Configuração dos Resultados</h3>
      <p className="msg-card__hint">Ajuste a visualização da totalização e os recursos da planilha final.</p>
    </header>
    <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
      <label className="msg-check">
        <input type="checkbox" checked={resultsConfig.searchEnabled !== false} onChange={event => onChangeResultsConfig({ ...resultsConfig, searchEnabled: event.target.checked })} />
        Habilitar pesquisa na planilha de respostas
      </label>
      <label className="msg-check" style={{ color: linkedPeopleField ? undefined : "var(--text-muted)", cursor: linkedPeopleField ? "pointer" : "default" }}>
        <input type="checkbox" checked={linkedPeopleField && resultsConfig.showLinkedRoster !== false} disabled={!linkedPeopleField} onChange={event => onChangeResultsConfig({ ...resultsConfig, showLinkedRoster: event.target.checked })} />
        Controlar faltantes da base vinculada
      </label>
      <label className="msg-check">
        <input type="checkbox" checked={resultsConfig.blockDuplicatePersonResponses === true} onChange={event => onChangeResultsConfig({ ...resultsConfig, blockDuplicatePersonResponses: event.target.checked })} />
        Bloquear nova resposta quando a pessoa já respondeu
      </label>
      <label className="msg-check">
        <input type="checkbox" checked={resultsConfig.publicResultsEnabled === true} onChange={event => onChangeResultsConfig({ ...resultsConfig, publicResultsEnabled: event.target.checked })} />
        Permitir visualização pública dos resultados
      </label>
    </div>
    <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textSecondary, marginBottom: 8 }}>Ordem da totalização</div>
    {totalizableFields.length === 0 ? (
      <div style={{ fontSize: 12, color: COLORS.textMuted }}>Adicione campos totalizáveis para configurar esta área.</div>
    ) : (
      <div style={{ display: "grid", gap: 8 }}>
            {resultsConfig.totalsLayout.map((item, index) => {
              const field = totalizableFields.find(current => String(current.id) === String(item.fieldId));
              if (!field) return null;
              return (
                <ResultsTotalRow
                  key={item.fieldId}
                  field={field}
                  index={index}
                  totalCount={resultsConfig.totalsLayout.length}
                  onMoveTotalLayout={onMoveTotalLayout}
                  onRemove={() => onChangeResultsConfig({
                    ...resultsConfig,
                    totalsLayout: resultsConfig.totalsLayout.filter(layoutItem => String(layoutItem.fieldId) !== String(item.fieldId)),
                  })}
                />
              );
            })}
        {availableTotals.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
            {availableTotals.map(field => (
              <Btn
                key={field.id}
                v="secondary"
                sz="sm"
                onClick={() => onAddTotalField(field)}
              >
                Adicionar {field.label}
              </Btn>
            ))}
          </div>
        )}
      </div>
    )}
  </section>
);

export const FormFooterPanel = ({
  format,
  isEditingExistingForm,
  saving,
  hasError,
  onOpenPresetModal,
  onSubmit,
  canSubmit,
  presetModal,
  presetName,
  onPresetNameChange,
  onSaveTemplate,
  onClosePresetModal,
  saveSuccess,
  onCloseSaveSuccess,
  onGoBack,
  saveSuccessTitle,
  saveSuccessMessage,
  submitButtonLabel,
  saveButtonLabel,
  templateSummary,
  templateDescription,
  templateButtonLabel,
}) => (
  <>
    <div className="create-form-footer-actions" style={{ display: "flex", gap: 10, justifyContent: "space-between", borderTop: `1px solid ${COLORS.borderLight}`, paddingTop: 16, flexWrap: "wrap" }}>
      {!isEditingExistingForm && (
        <Btn v="secondary" icon="save" onClick={onOpenPresetModal}>{templateButtonLabel}</Btn>
      )}
      <Btn icon="check" onClick={onSubmit} disabled={!canSubmit} loading={saving}>{saving ? "Salvando..." : submitButtonLabel}</Btn>
    </div>
    {hasError && (
      <div style={{ marginTop: 12, background: COLORS.dangerLight, border: `1px solid ${COLORS.danger}`, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: COLORS.danger }}>
        {hasError}
      </div>
    )}

    {!isEditingExistingForm && presetModal && (
      <div className="modal-backdrop">
        <div className="modal-card" style={{ width: 420 }}>
          <h3 style={{ margin: "0 0 4px", fontSize: 16 }}>Salvar como Template</h3>
          <p style={{ margin: "0 0 6px", fontSize: 12, color: COLORS.textSecondary }}>
            {templateSummary}
          </p>
          <div style={{ background: COLORS.surfaceAlt, borderRadius: 8, padding: "8px 12px", marginBottom: 14, fontSize: 12, color: COLORS.textSecondary, lineHeight: 1.6 }}>
            <strong style={{ color: COLORS.text }}>O template vai salvar:</strong>{" "}
            {templateDescription}
          </div>
          <label className="msg-label" style={{ display: "block", marginBottom: 4 }}>Nome do template</label>
          <input className="msg-input" value={presetName} onChange={onPresetNameChange} placeholder="Ex.: Sessão de Escala Padrão" style={{ marginBottom: 16 }} autoFocus onKeyDown={event => { if (event.key === "Enter") onSaveTemplate(); }} />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Btn v="secondary" onClick={onClosePresetModal}>Cancelar</Btn>
            <Btn icon="save" onClick={onSaveTemplate} disabled={!presetName.trim()}>Salvar Template</Btn>
          </div>
        </div>
      </div>
    )}

    {saveSuccess && (
      <div className="modal-backdrop">
        <div className="modal-card" style={{ width: 420 }}>
          <h3 style={{ margin: "0 0 6px", fontSize: 16 }}>{saveSuccessTitle}</h3>
          <p style={{ margin: "0 0 18px", fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.5 }}>
            {saveSuccessMessage}
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Btn icon="check" onClick={onCloseSaveSuccess}>
              {saveButtonLabel}
            </Btn>
          </div>
        </div>
      </div>
    )}
  </>
);

const ResultsTotalRow = ({
  field,
  index,
  resultsConfig,
  FIELD_TYPES,
  onMoveTotalLayout,
  onChangeResultsConfig,
  onRemove,
}) => (
  <div className="create-form-total-row" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, alignItems: "center", background: COLORS.surfaceAlt, border: `1px solid ${COLORS.borderLight}`, borderRadius: 10, padding: 10 }}>
    <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.text }}>{field?.label ?? ""}</div>
        <div style={{ fontSize: 11, color: COLORS.textMuted }}>
          Tipo: {field?.type ?? ""} • Exibição automática
        </div>
    </div>
    <div className="create-form-inline-actions" style={{ display: "flex", gap: 6 }}>
      <Btn v="ghost" sz="sm" onClick={() => onMoveTotalLayout(index, -1)} disabled={index === 0}>Subir</Btn>
        <Btn v="ghost" sz="sm" onClick={() => onMoveTotalLayout(index, 1)}>Descer</Btn>
      <Btn v="ghost" sz="sm" onClick={onRemove}>Remover</Btn>
    </div>
  </div>
);
