/**
 * @file frontend/src/features/forms/createFormPanels/finalPanels.jsx
 * @summary Paineis finais da criacao de formulario.
 * @responsibility Manter separados os blocos de escala, resultados e rodape.
 */

import React from "react";
import { COLORS, Btn, Icon, SurfacePanel } from "../../../components/ui";
import { CreateFormLivePreview } from "../../../components/CreateFormLivePreview";

const fieldStyle = { width: "100%", padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: COLORS.surface, color: COLORS.text };

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
            Pre-visualizacao do formulario
          </div>
          <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>
            Esta area mostra como o link publico esta ficando com base no rascunho atual.
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
  inp,
  onScaleLimitChange,
  onUpdateScale,
  onSetScaleMode,
  onApplyScaleCatalog,
  onRemoveScaleSection,
  onAddScale,
}) => (
  <SurfacePanel style={{ marginBottom: 20, padding: 16 }}>
    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Modelo da Escala da Organ</div>
    <p style={{ margin: "0 0 14px", fontSize: 12, color: COLORS.textSecondary, lineHeight: 1.5 }}>Defina as secoes, quantos responsaveis e quantos auxiliares cada uma tera.</p>
    <div style={{ display: "grid", gap: 6, maxWidth: 280, marginBottom: 14 }}>
      <label htmlFor="scale-person-limit" style={{ fontSize: 12, fontWeight: 600, color: COLORS.textSecondary }}>Limite por pessoa na escala</label>
      <input
        id="scale-person-limit"
        type="number"
        min="1"
        value={scaleLimit}
        onChange={event => onScaleLimitChange(Math.max(1, Number(event.target.value) || 1))}
        style={inp}
      />
      <div style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.4 }}>Define quantas vagas a mesma pessoa pode ocupar no total desta escala.</div>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {scaleDraft.map((section, index) => (
        <div className="create-form-scale-row" key={index} style={{ display: "grid", gridTemplateColumns: "1.2fr 1.4fr 110px 110px auto", gap: 8, alignItems: "end", background: COLORS.surfaceAlt, border: `1px solid ${COLORS.borderLight}`, borderRadius: 10, padding: 10 }}>
          <div>
            <label style={{ fontSize: 11, color: COLORS.textSecondary, display: "block", marginBottom: 4 }}>Origem da secao</label>
            <div className="create-form-segmented" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              <button disabled={activeScaleTaskCatalog.length === 0} onClick={() => onSetScaleMode(index, "catalog")} style={{ border: `1px solid ${(section.source === "catalog" || section.catalogTaskId) ? COLORS.primary : COLORS.border}`, background: (section.source === "catalog" || section.catalogTaskId) ? COLORS.primaryLight : COLORS.surface, color: (section.source === "catalog" || section.catalogTaskId) ? COLORS.primary : COLORS.textSecondary, borderRadius: 8, padding: "8px 10px", fontSize: 12, fontWeight: 800, cursor: activeScaleTaskCatalog.length === 0 ? "not-allowed" : "pointer", opacity: activeScaleTaskCatalog.length === 0 ? 0.55 : 1 }}>Tarefa existente</button>
              <button onClick={() => onSetScaleMode(index, "local")} style={{ border: `1px solid ${(!section.catalogTaskId && section.source !== "catalog") ? COLORS.primary : COLORS.border}`, background: (!section.catalogTaskId && section.source !== "catalog") ? COLORS.primaryLight : COLORS.surface, color: (!section.catalogTaskId && section.source !== "catalog") ? COLORS.primary : COLORS.textSecondary, borderRadius: 8, padding: "8px 10px", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>Tarefa local</button>
            </div>
            {(section.source === "catalog" || section.catalogTaskId) && (
              <select value={section.catalogTaskId || ""} onChange={event => onApplyScaleCatalog(index, event.target.value)} style={{ ...inp, marginTop: 6 }}>
                <option value="">Selecione uma tarefa base</option>
                {activeScaleTaskCatalog.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            )}
          </div>
          <label style={{ fontSize: 11, color: COLORS.textSecondary }}>Descricao na escala<input value={section.title} onChange={event => onUpdateScale(index, { title: event.target.value })} style={{ ...inp, marginTop: 4 }} /></label>
          <label style={{ fontSize: 11, color: COLORS.textSecondary }}>Responsaveis<input type="number" min="0" value={section.responsaveis} onChange={event => onUpdateScale(index, { responsaveis: Number(event.target.value) })} style={{ ...inp, marginTop: 4 }} /></label>
          <label style={{ fontSize: 11, color: COLORS.textSecondary }}>Auxiliares<input type="number" min="0" value={section.auxiliares} onChange={event => onUpdateScale(index, { auxiliares: Number(event.target.value) })} style={{ ...inp, marginTop: 4 }} /></label>
          <button aria-label={`Remover secao ${index + 1}`} onClick={() => onRemoveScaleSection(index)} style={{ background: "none", border: "none", color: COLORS.danger, cursor: "pointer", alignSelf: "flex-end", padding: "10px 4px" }}><Icon name="trash" size={16} /></button>
        </div>
      ))}
    </div>
    <Btn v="secondary" icon="plus" sz="sm" onClick={onAddScale} style={{ marginTop: 10 }}>Adicionar secao</Btn>
  </SurfacePanel>
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
  <SurfacePanel style={{ marginTop: 18, padding: 16 }}>
    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Configuracao dos Resultados</div>
    <p style={{ margin: "0 0 14px", fontSize: 12, color: COLORS.textSecondary, lineHeight: 1.5 }}>
      Ajuste a visualizacao da totalizacao e os recursos da planilha final.
    </p>
    <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: COLORS.textSecondary, cursor: "pointer" }}>
        <input type="checkbox" checked={resultsConfig.searchEnabled !== false} onChange={event => onChangeResultsConfig({ ...resultsConfig, searchEnabled: event.target.checked })} />
        Habilitar pesquisa na planilha de respostas
      </label>
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: linkedPeopleField ? COLORS.textSecondary : COLORS.textMuted, cursor: linkedPeopleField ? "pointer" : "default" }}>
        <input type="checkbox" checked={linkedPeopleField && resultsConfig.showLinkedRoster !== false} disabled={!linkedPeopleField} onChange={event => onChangeResultsConfig({ ...resultsConfig, showLinkedRoster: event.target.checked })} />
        Exibir lista da base vinculada e destacar faltantes
      </label>
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: COLORS.textSecondary, cursor: "pointer" }}>
        <input type="checkbox" checked={resultsConfig.blockDuplicatePersonResponses === true} onChange={event => onChangeResultsConfig({ ...resultsConfig, blockDuplicatePersonResponses: event.target.checked })} />
        Bloquear nova resposta quando a pessoa ja respondeu
      </label>
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: COLORS.textSecondary, cursor: "pointer" }}>
        <input type="checkbox" checked={resultsConfig.publicResultsEnabled === true} onChange={event => onChangeResultsConfig({ ...resultsConfig, publicResultsEnabled: event.target.checked })} />
        Permitir visualizacao publica dos resultados
      </label>
    </div>
    <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textSecondary, marginBottom: 8 }}>Ordem da totalizacao</div>
    {totalizableFields.length === 0 ? (
      <div style={{ fontSize: 12, color: COLORS.textMuted }}>Adicione campos totalizaveis para configurar esta area.</div>
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
  </SurfacePanel>
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
          <label style={{ fontSize: 11, fontWeight: 600, color: COLORS.textSecondary, display: "block", marginBottom: 4 }}>Nome do template</label>
          <input value={presetName} onChange={onPresetNameChange} placeholder="Ex: Sessao de Escala Padrao" style={{ ...fieldStyle, marginBottom: 16 }} autoFocus onKeyDown={event => { if (event.key === "Enter") onSaveTemplate(); }} />
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
          Tipo: {field?.type ?? ""} • Exibicao automatica
        </div>
    </div>
    <div className="create-form-inline-actions" style={{ display: "flex", gap: 6 }}>
      <Btn v="ghost" sz="sm" onClick={() => onMoveTotalLayout(index, -1)} disabled={index === 0}>Subir</Btn>
        <Btn v="ghost" sz="sm" onClick={() => onMoveTotalLayout(index, 1)}>Descer</Btn>
      <Btn v="ghost" sz="sm" onClick={onRemove}>Remover</Btn>
    </div>
  </div>
);
