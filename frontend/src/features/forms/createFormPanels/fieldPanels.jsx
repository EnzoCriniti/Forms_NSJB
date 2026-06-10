/**
 * @file frontend/src/features/forms/createFormPanels/fieldPanels.jsx
 * @summary Paineis da lista e editor de campos do formulario.
 * @responsibility Manter reunidos os blocos de campo reutilizaveis fora da tela principal.
 */

import React from "react";
import { COLORS, Btn, Icon } from "../../../components/ui";
import { CreateFormFieldPreview } from "../../../components/CreateFormFieldPreview";

export const PresenceFieldsPanel = ({
  fields,
  FIELD_TYPES,
  formMode,
  isMembersSelectionField,
  getPeopleBaseFieldRole,
  summarizeFieldValidation,
  externalBaseMap,
  onStartEditField,
  onToggleFieldShow,
  onRemoveField,
  onOpenNewFieldDraft,
  addOpen,
  fieldEditor,
}) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
      <label style={{ fontSize: 14, fontWeight: 700 }}>Campos do Formulario</label>
      <span style={{ fontSize: 11, color: COLORS.textMuted }}>{fields.length} campo{fields.length !== 1 ? "s" : ""} configurado{fields.length !== 1 ? "s" : ""}</span>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {fields.map((field, index) => (
        <FormFieldRow
          key={field.id}
          field={field}
          index={index}
          fields={fields}
          formMode={formMode}
          FIELD_TYPES={FIELD_TYPES}
          isMembersSelectionField={isMembersSelectionField}
          getPeopleBaseFieldRole={getPeopleBaseFieldRole}
          summarizeFieldValidation={summarizeFieldValidation}
          externalBaseMap={externalBaseMap}
          onStartEditField={onStartEditField}
          onToggleFieldShow={onToggleFieldShow}
          onRemoveField={onRemoveField}
        />
      ))}
    </div>

    {addOpen ? fieldEditor : (
      <button onClick={onOpenNewFieldDraft} style={{ marginTop: 8, width: "100%", padding: 12, border: `2px dashed ${COLORS.border}`, borderRadius: 10, background: "transparent", fontSize: 13, color: COLORS.textSecondary, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <Icon name="plus" size={14} /> Adicionar Campo
      </button>
    )}
  </div>
);

export const FieldEditorPanel = ({
  addOpen,
  inp,
  inpSm,
  nType,
  nFieldMode,
  nCatalogId,
  nLabel,
  nRequired,
  nValidation,
  nGridRows,
  nGridCols,
  formMode,
  filteredFieldCatalog,
  filteredFieldTypes,
  currentFieldSourceLabel,
  activeSelectionSource,
  externalBaseMap,
  hasPrimaryLinkedField,
  fieldLabel,
  people,
  onSetFieldMode,
  onApplyFieldCatalog,
  onSetNType,
  onSetNLabel,
  onSetNRequired,
  onSetNValidation,
  onUpdateGridRow,
  onRemoveGridRow,
  onAddGridRow,
  onUpdateGridCol,
  onRemoveGridCol,
  onAddGridCol,
  onApplyScalePreset,
  scalePresets = [],
  onAddField,
  onOpenNewFieldDraft,
  onResetFieldDraft,
  isFieldSaveDisabled,
  isEditingField = false,
}) => (
  addOpen ? (
    <div style={{ marginTop: 10, background: COLORS.surfaceAlt, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 16 }} data-testid="field-editor-panel">
      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: COLORS.text }}>Editor de campo</div>
        <div style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.45, marginTop: 4 }}>
          Monte o campo em etapas. Primeiro escolha a origem e depois ajuste so o necessario para este formulario.
        </div>
      </div>
      <div className="create-form-editor-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>
        <div style={{ display: "grid", gap: 10 }}>
          <FieldEditorSourcePanel
            inp={inp}
            nFieldMode={nFieldMode}
            nCatalogId={nCatalogId}
            formMode={formMode}
            filteredFieldCatalog={filteredFieldCatalog}
            currentFieldSourceLabel={currentFieldSourceLabel}
            onSetFieldMode={onSetFieldMode}
            onApplyFieldCatalog={onApplyFieldCatalog}
          />
          <FieldEditorDefinitionPanel
            inp={inp}
            nType={nType}
            nFieldMode={nFieldMode}
            nLabel={nLabel}
            filteredFieldTypes={filteredFieldTypes}
            formMode={formMode}
            activeSelectionSource={activeSelectionSource}
            externalBaseMap={externalBaseMap}
            onSetNType={onSetNType}
            onSetNLabel={onSetNLabel}
          />
          <FieldEditorExtrasPanel
            inp={inp}
            inpSm={inpSm}
            nType={nType}
            nFieldMode={nFieldMode}
            nValidation={nValidation}
            nGridRows={nGridRows}
            nGridCols={nGridCols}
            scalePresets={scalePresets}
            onSetNValidation={onSetNValidation}
            onUpdateGridRow={onUpdateGridRow}
            onRemoveGridRow={onRemoveGridRow}
            onAddGridRow={onAddGridRow}
            onUpdateGridCol={onUpdateGridCol}
            onRemoveGridCol={onRemoveGridCol}
            onAddGridCol={onAddGridCol}
            onApplyScalePreset={onApplyScalePreset}
            onSetNRequired={onSetNRequired}
            nRequired={nRequired}
          />
          <FieldEditorActions
            isFieldSaveDisabled={isFieldSaveDisabled}
            isEditingField={isEditingField}
            onAddField={onAddField}
            onResetFieldDraft={onResetFieldDraft}
          />
        </div>
        <CreateFormFieldPreview
          fieldLabel={fieldLabel}
          fieldType={nType}
          required={nRequired}
          people={people}
          gridRows={nGridRows}
          gridCols={nGridCols}
        />
      </div>
    </div>
  ) : (
    <button onClick={onOpenNewFieldDraft} style={{ marginTop: 8, width: "100%", padding: 12, border: `2px dashed ${COLORS.border}`, borderRadius: 10, background: "transparent", fontSize: 13, color: COLORS.textSecondary, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
      <Icon name="plus" size={14} /> Adicionar Campo
    </button>
  )
);

const FieldEditorSourcePanel = ({
  inp,
  nFieldMode,
  nCatalogId,
  formMode,
  filteredFieldCatalog,
  currentFieldSourceLabel,
  onSetFieldMode,
  onApplyFieldCatalog,
}) => (
  <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 12, padding: 14 }}>
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, display: "block", marginBottom: 6 }}>1. Origem do campo</label>
      <div style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.4, marginBottom: 8 }}>
        Decida se o campo nasce so aqui ou se aproveita um campo base que ja foi configurado.
      </div>
      <div className="create-form-segmented" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 8 }}>
        <button disabled={filteredFieldCatalog.length === 0} onClick={() => onSetFieldMode("catalog")} style={{ border: `1px solid ${nFieldMode === "catalog" ? COLORS.primary : COLORS.border}`, background: nFieldMode === "catalog" ? COLORS.primaryLight : COLORS.surface, color: nFieldMode === "catalog" ? COLORS.primary : COLORS.textSecondary, borderRadius: 8, padding: "8px 10px", fontSize: 12, fontWeight: 800, cursor: filteredFieldCatalog.length === 0 ? "not-allowed" : "pointer", opacity: filteredFieldCatalog.length === 0 ? 0.55 : 1 }}>Da biblioteca</button>
        <button onClick={() => onSetFieldMode("local")} style={{ border: `1px solid ${nFieldMode === "local" ? COLORS.primary : COLORS.border}`, background: nFieldMode === "local" ? COLORS.primaryLight : COLORS.surface, color: nFieldMode === "local" ? COLORS.primary : COLORS.textSecondary, borderRadius: 8, padding: "8px 10px", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>Somente neste formulario</button>
      </div>
      {nFieldMode === "catalog" && (
        <select value={nCatalogId} onChange={event => onApplyFieldCatalog(event.target.value)} style={inp}>
          <option value="">Selecione um campo base</option>
          {filteredFieldCatalog.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      )}
      {nFieldMode === "local" && (
        <div style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.4 }}>
          {formMode === "nucleo"
            ? "Este campo fica apenas neste formulário e não entra no catálogo global."
            : "No formulário geral, campos locais não usam a base central de sócios."}
        </div>
      )}
    </div>
    <div style={{ borderTop: `1px solid ${COLORS.borderLight}`, paddingTop: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, marginBottom: 6 }}>Resumo da origem</div>
      <div style={{ padding: 10, borderRadius: 10, background: COLORS.surfaceAlt, border: `1px solid ${COLORS.borderLight}`, fontSize: 11, color: COLORS.textSecondary }}>
        {currentFieldSourceLabel}
      </div>
      {nFieldMode === "catalog" && (
        <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 6 }}>
          O tipo e o vínculo base chegam da configuração global do campo selecionado.
        </div>
      )}
    </div>
  </div>
);

const FieldEditorDefinitionPanel = ({
  inp,
  nType,
  nFieldMode,
  nLabel,
  filteredFieldTypes,
  formMode,
  activeSelectionSource,
  externalBaseMap,
  onSetNType,
  onSetNLabel,
}) => (
  <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 12, padding: 14, display: "grid", gap: 12 }}>
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, marginBottom: 6 }}>2. Definição principal</div>
      <div style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.4, marginBottom: 8 }}>
        Escolha o tipo e escreva o texto que vai aparecer para quem responder.
      </div>
      <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, display: "block", marginBottom: 4 }}>Tipo do campo</label>
      <select value={nType} disabled={nFieldMode === "catalog"} onChange={event => onSetNType(event.target.value)} style={{ ...inp, opacity: nFieldMode === "catalog" ? 0.75 : 1 }}>
        {filteredFieldTypes.map(type => <option key={type.v} value={type.v}>{type.l}</option>)}
      </select>
      {nFieldMode === "catalog" && (
        <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4 }}>
          O tipo vem da configuração global do campo base.
        </div>
      )}
    </div>
    <div>
      <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, display: "block", marginBottom: 4 }}>
        {nType === "person_select" ? "Rótulo (ex: Nome)" : "Pergunta / Rótulo"}
      </label>
      <input value={nLabel} onChange={event => onSetNLabel(event.target.value)} placeholder={nType === "person_select" ? "Nome" : "Ex: Vai ao Jantar?"} style={inp} autoFocus />
    </div>
    {nType === "person_select" && (
      <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
        <div style={{ padding: 12, borderRadius: 10, background: COLORS.primaryLight, border: `1px solid ${COLORS.borderLight}` }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: COLORS.primary, marginBottom: 4 }}>Vínculo configurado no campo</div>
          <div style={{ fontSize: 11, color: COLORS.textSecondary, lineHeight: 1.45 }}>
            {formMode === "nucleo"
              ? "Campos locais usam a base central de sócios como origem. Quando o campo vem da biblioteca, a origem já chega definida ali. Este editor não troca a base."
              : "Formulário geral não usa a base central. Para seletor por base, use um campo da biblioteca ligado a uma base externa sincronizada."}
          </div>
        </div>
        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>Vínculo ativo do campo</label>
          <div style={{ padding: 10, borderRadius: 10, border: `1px solid ${COLORS.borderLight}`, background: COLORS.surface }}>
            {activeSelectionSource?.kind === "external_base"
              ? `Base externa sincronizada: ${externalBaseMap.get(String(activeSelectionSource.externalBaseId || ""))?.name || "base externa"}`
              : "Base central de sócios"}
          </div>
        </div>
        <div style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.45 }}>
          {formMode === "nucleo"
            ? "Se a lista vier da biblioteca, a origem já foi definida na configuração do campo."
            : "Campos gerais só aceitam seletores ligados a bases externas configuradas na biblioteca."}
        </div>
        <div style={{ padding: "10px 12px", borderRadius: 10, border: `1px solid ${COLORS.borderLight}`, background: COLORS.surfaceAlt }}>
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.4, color: COLORS.textMuted, marginBottom: 4 }}>
            Resumo do vinculo
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.text }}>
            {activeSelectionSource?.kind === "external_base"
              ? `Base externa sincronizada: ${externalBaseMap.get(String(activeSelectionSource.externalBaseId || ""))?.name || "base externa"}`
              : "Base central de sócios"}
          </div>
        </div>
      </div>
    )}
  </div>
);

const FieldEditorExtrasPanel = ({
  inp,
  inpSm,
  nType,
  nFieldMode,
  nValidation,
  nGridRows,
  nGridCols,
  scalePresets = [],
  onSetNValidation,
  onUpdateGridRow,
  onRemoveGridRow,
  onAddGridRow,
  onUpdateGridCol,
  onRemoveGridCol,
  onAddGridCol,
  onApplyScalePreset,
  onSetNRequired,
  nRequired,
}) => (
  <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 12, padding: 14, display: "grid", gap: 12 }}>
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, marginBottom: 6 }}>3. Ajustes extras</div>
      <div style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.4 }}>
        Esta etapa só aparece para finalizar validações, obrigatoriedade ou a montagem de grade.
      </div>
    </div>
    {(nType === "text" || nType === "number") && (
      <div className="create-form-validation-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: COLORS.textSecondary, display: "block" }}>
          {nType === "text" ? "Mínimo de caracteres" : "Valor mínimo"}
          <input
            type="number"
            min="0"
            value={nType === "text" ? (nValidation.minLength ?? "") : (nValidation.min ?? "")}
            onChange={event => onSetNValidation(prev => ({ ...prev, [nType === "text" ? "minLength" : "min"]: event.target.value }))}
            style={{ ...inp, marginTop: 4 }}
          />
        </label>
        <label style={{ fontSize: 11, fontWeight: 600, color: COLORS.textSecondary, display: "block" }}>
          {nType === "text" ? "Máximo de caracteres" : "Valor máximo"}
          <input
            type="number"
            min="0"
            value={nType === "text" ? (nValidation.maxLength ?? "") : (nValidation.max ?? "")}
            onChange={event => onSetNValidation(prev => ({ ...prev, [nType === "text" ? "maxLength" : "max"]: event.target.value }))}
            style={{ ...inp, marginTop: 4 }}
          />
        </label>
      </div>
    )}
    {nType === "grid" && nFieldMode === "catalog" && (
      <div style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.4, background: COLORS.surfaceAlt, border: `1px solid ${COLORS.borderLight}`, borderRadius: 12, padding: 14 }}>
        A matriz deste campo vem da biblioteca global. Para alterar linhas ou colunas, edite o campo base em Configuracoes &gt; Campos e tarefas.
      </div>
    )}
    {nType === "grid" && nFieldMode === "local" && (
      <div style={{ display: "grid", gap: 10, background: COLORS.surfaceAlt, border: `1px solid ${COLORS.borderLight}`, borderRadius: 12, padding: 14 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.textSecondary, marginBottom: 4 }}>Linhas (itens a avaliar)</div>
          {nGridRows.map((row, index) => (
            <div key={index} style={{ display: "flex", gap: 6, marginBottom: 5 }}>
              <input value={row} onChange={event => onUpdateGridRow(index, event.target.value)} placeholder={`Linha ${index + 1}`} style={{ ...inpSm, flex: 1 }} />
              <button onClick={() => onRemoveGridRow(index)} style={{ background: "none", border: "none", color: COLORS.danger, cursor: "pointer", padding: "0 4px" }}><Icon name="close" size={12} /></button>
            </div>
          ))}
          <button onClick={onAddGridRow} style={{ fontSize: 11, color: COLORS.primary, background: "none", border: "none", cursor: "pointer", padding: "2px 0", display: "flex", alignItems: "center", gap: 4 }}><Icon name="plus" size={11} /> Adicionar linha</button>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.textSecondary, marginBottom: 4 }}>Escala de resposta (colunas)</div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 }}>
            {onApplyScalePreset && scalePresets.map(scalePreset => (
              <button key={scalePreset.label} onClick={() => onApplyScalePreset(scalePreset.cols)} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 99, border: `1px solid ${COLORS.border}`, background: COLORS.surface, color: COLORS.textSecondary, cursor: "pointer", whiteSpace: "nowrap" }}>{scalePreset.label}</button>
            ))}
          </div>
          {nGridCols.map((col, index) => (
            <div key={index} style={{ display: "flex", gap: 6, marginBottom: 5 }}>
              <input value={col} onChange={event => onUpdateGridCol(index, event.target.value)} placeholder={`Coluna ${index + 1}`} style={{ ...inpSm, flex: 1 }} />
              <button onClick={() => onRemoveGridCol(index)} style={{ background: "none", border: "none", color: COLORS.danger, cursor: "pointer", padding: "0 4px" }}><Icon name="close" size={12} /></button>
            </div>
          ))}
          <button onClick={onAddGridCol} style={{ fontSize: 11, color: COLORS.primary, background: "none", border: "none", cursor: "pointer", padding: "2px 0", display: "flex", alignItems: "center", gap: 4 }}><Icon name="plus" size={11} /> Adicionar coluna</button>
        </div>
      </div>
    )}
    <div style={{ padding: 12, borderRadius: 10, border: `1px solid ${COLORS.borderLight}`, background: COLORS.surfaceAlt }}>
      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: COLORS.textSecondary, cursor: "pointer" }}>
        <input type="checkbox" checked={nRequired} onChange={event => onSetNRequired(event.target.checked)} /> Campo obrigatorio
      </label>
    </div>
    {nType !== "text" && nType !== "number" && nType !== "grid" && !nRequired && (
      <div style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.4 }}>
        Esse campo nao precisa de configuracao extra. Se o texto ja estiver certo, ele pode ser adicionado agora.
      </div>
    )}
  </div>
);

const FieldEditorActions = ({ isFieldSaveDisabled, isEditingField, onAddField, onResetFieldDraft }) => (
  <div className="create-form-inline-actions" style={{ display: "flex", gap: 6 }}>
    <Btn sz="sm" onClick={onAddField} disabled={isFieldSaveDisabled}>{isEditingField ? "Salvar campo" : "Adicionar"}</Btn>
    <Btn v="ghost" sz="sm" onClick={onResetFieldDraft}>Cancelar</Btn>
  </div>
);

const fieldStyle = { width: "100%", padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: COLORS.surface, color: COLORS.text };

const FormFieldRow = ({
  field,
  index,
  fields,
  formMode,
  FIELD_TYPES,
  isMembersSelectionField,
  getPeopleBaseFieldRole,
  summarizeFieldValidation,
  externalBaseMap,
  onStartEditField,
  onToggleFieldShow,
  onRemoveField,
}) => (
  <div className="create-form-field-row" style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
    <div style={{ width: 22, height: 22, borderRadius: 6, background: COLORS.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: COLORS.primary, flexShrink: 0 }}>{index + 1}</div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontWeight: 600, fontSize: 13 }}>{field.label}{field.required ? <span style={{ color: COLORS.danger, marginLeft: 2 }}>*</span> : ""}</div>
      <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 1 }}>
        {FIELD_TYPES.find(type => type.v === field.type)?.l}
        {field.type === "grid" && field.gridRows?.length ? ` - ${field.gridRows.length} linhas x ${field.gridCols?.length ?? 0} colunas` : ""}
      </div>
      {field.type === "person_select" && (
        <div style={{ fontSize: 11, color: field.selectionSource?.kind === "external_base" ? COLORS.accent : getPeopleBaseFieldRole({ fieldDefinitions: fields }, field) === "primary" ? COLORS.primary : COLORS.textMuted, marginTop: 2 }}>
          {field.selectionSource?.kind === "external_base"
            ? `Vinculado a ${externalBaseMap.get(String(field.selectionSource.externalBaseId || ""))?.name || "base externa"}`
            : getPeopleBaseFieldRole({ fieldDefinitions: fields }, field) === "primary"
              ? "Campo principal da base central"
              : "Campo auxiliar da base central"}
        </div>
      )}
      {summarizeFieldValidation(field) && (
        <div style={{ fontSize: 11, color: COLORS.accent, marginTop: 2 }}>
          Validação: {summarizeFieldValidation(field)}
        </div>
      )}
    </div>
    <div className="create-form-field-actions" style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
      <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: COLORS.textSecondary, cursor: "pointer" }}>
        <input type="checkbox" checked={field.show} onChange={() => onToggleFieldShow(field.id)} /> Exibir
      </label>
      <button aria-label={`Editar ${field.label}`} onClick={() => onStartEditField(field)} style={{ background: "none", border: "none", color: COLORS.textSecondary, cursor: "pointer", padding: 2 }}><Icon name="edit" size={14} /></button>
      <button
        aria-label={`Remover ${field.label}`}
        disabled={formMode === "nucleo" && isMembersSelectionField(field) && getPeopleBaseFieldRole({ fieldDefinitions: fields }, field) === "primary"}
        onClick={() => onRemoveField(field.id)}
        style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", padding: 2, opacity: formMode === "nucleo" && isMembersSelectionField(field) && getPeopleBaseFieldRole({ fieldDefinitions: fields }, field) === "primary" ? 0.35 : 1 }}
      >
        <Icon name="trash" size={14} />
      </button>
    </div>
  </div>
);
