/**
 * @file frontend/src/screens/createFormPanels.jsx
 * @summary Paineis reutilizaveis da tela de criacao de formulario.
 * @responsibility Manter fora da tela principal os blocos visuais mais longos.
 */

import React from "react";
import { COLORS, Btn, Icon, FieldControl, SurfacePanel } from "../components/ui";
import { CreateFormFieldPreview } from "../components/CreateFormFieldPreview";

export const FormModePanel = ({ activeModeOption, formMode, membersFieldsCount, options, onSelectMode }) => (
  <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>Modo do formulario</div>
        <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>Escolha a estrutura antes de continuar montando os campos.</div>
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.primary, background: COLORS.primaryLight, borderRadius: 999, padding: "6px 10px" }}>
        {activeModeOption.badge}
      </div>
    </div>
    <div className="create-form-type-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
      {options.map(option => (
        <button
          key={option.id}
          onClick={() => onSelectMode(option.id)}
          style={{ textAlign: "left", padding: 14, borderRadius: 12, border: `2px solid ${formMode === option.id ? COLORS.primary : COLORS.borderLight}`, background: formMode === option.id ? COLORS.primaryLight : COLORS.surface, color: COLORS.text, cursor: "pointer", display: "grid", gap: 10 }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
            <div>
              <strong style={{ fontSize: 14 }}>{option.title}</strong>
              <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.textMuted, marginTop: 4, textTransform: "uppercase", letterSpacing: 0.4 }}>{option.badge}</div>
            </div>
            {formMode === option.id && <Icon name="check" size={16} />}
          </div>
          <p style={{ margin: "7px 0 0", fontSize: 12, color: COLORS.textSecondary, lineHeight: 1.45 }}>{option.desc}</p>
          <div style={{ display: "grid", gap: 5 }}>
            {option.bullets.map(item => (
              <div key={item} style={{ fontSize: 11, color: COLORS.textSecondary, display: "flex", alignItems: "center", gap: 6 }}>
                <span aria-hidden="true" style={{ width: 5, height: 5, borderRadius: 999, background: formMode === option.id ? COLORS.primary : COLORS.textMuted, flex: "0 0 auto" }} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </button>
      ))}
    </div>
    <div style={{ marginTop: 12, borderRadius: 12, border: `1px solid ${COLORS.borderLight}`, background: COLORS.surfaceAlt, padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: COLORS.text }}>Modo ativo: {activeModeOption.title}</div>
          <div style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 3 }}>{activeModeOption.desc}</div>
        </div>
        <div style={{ fontSize: 11, color: COLORS.textMuted }}>
          {formMode === "nucleo" ? `${membersFieldsCount} campo(s) ligado(s) a base central` : "Base central desativada neste formulario"}
        </div>
      </div>
    </div>
  </div>
);

export const FormTypeSetupPanel = ({ format, onSelectFormat, onContinue }) => (
  <>
    <div className="create-form-start-card">
      <div style={{ fontSize: 11, fontWeight: 900, color: COLORS.primary, textTransform: "uppercase", letterSpacing: 0.6 }}>Etapa inicial</div>
      <h3 style={{ margin: "4px 0 4px", fontSize: 20, color: COLORS.text }}>Qual estrutura voce vai criar?</h3>
      <p style={{ margin: 0, fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.5 }}>
        A escolha define o editor correto e evita carregar configuracoes que nao pertencem ao tipo do formulario.
      </p>
    </div>

    <div className="create-form-type-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginBottom: 14 }}>
      {[
        { id: "presenca", title: "Presenca", desc: "Perguntas, acompanhantes, totalizacao e controle de envio." },
        { id: "escala_organ", title: "Escala da Organ", desc: "Planilha de tarefas com responsaveis e auxiliares." },
      ].map(option => (
        <button
          className="create-form-type-card"
          key={option.id}
          onClick={() => onSelectFormat(option.id)}
          style={{ textAlign: "left", padding: 16, borderRadius: 12, border: `2px solid ${format === option.id ? COLORS.primary : COLORS.borderLight}`, background: format === option.id ? COLORS.primaryLight : COLORS.surface, color: COLORS.text, cursor: "pointer" }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
            <strong style={{ fontSize: 14 }}>{option.title}</strong>
            {format === option.id && <Icon name="check" size={16} />}
          </div>
          <p style={{ margin: "7px 0 0", fontSize: 12, color: COLORS.textSecondary, lineHeight: 1.45 }}>{option.desc}</p>
        </button>
      ))}
    </div>

    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
      <Btn icon="check" onClick={onContinue}>Continuar para o editor</Btn>
    </div>
  </>
);

export const FormBasicsPanel = ({
  inp,
  formTitle,
  shouldPresetTitle,
  onTitleChange,
  previewDescription,
  onDescriptionChange,
  eventDate,
  onEventDateChange,
  closingDate,
  onClosingDateChange,
  status,
  onStatusChange,
  linkedPeopleField,
  peopleCount,
  onTotalExpectedChange,
  totalExpected,
  formMode,
  closingText,
  onClosingTextChange,
  labels,
  selectedLabels,
  onToggleLabel,
  peopleConfigLabel,
}) => (
  <>
    <div style={{ display: "grid", gap: 14, marginBottom: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
        <FieldControl label="Titulo" required>
          <input
            value={formTitle}
            onChange={onTitleChange}
            readOnly={shouldPresetTitle}
            placeholder={shouldPresetTitle ? "Titulo padronizado pelo evento" : "Ex: Presenca Sessao de Escala - 02/05/2026"}
            aria-readonly={shouldPresetTitle}
            style={{
              ...inp,
              fontSize: 14,
              background: shouldPresetTitle ? COLORS.surfaceAlt : COLORS.surface,
              cursor: shouldPresetTitle ? "not-allowed" : "text",
            }}
          />
          <div style={{ fontSize: 11, color: COLORS.textMuted }}>
            {shouldPresetTitle
              ? "O nome deste formulario e padronizado pelo evento."
              : "O nome pode ser editado nesta tela."}
          </div>
        </FieldControl>
      </div>
      <FieldControl label="Descricao / Instrucoes">
        <textarea value={previewDescription} onChange={onDescriptionChange} rows={3} placeholder="Prezada Irmandade..." style={{ ...inp, resize: "vertical" }} />
      </FieldControl>
      <div className="create-form-meta-grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        <FieldControl label="Abertura programada" hint="O formulario vai para aberto automaticamente nesta data.">
          <input type="date" value={eventDate} onChange={onEventDateChange} style={inp} />
        </FieldControl>
        <FieldControl label="Fechamento automatico" hint="Quando chegar este horario, o formulario fecha sozinho.">
          <input type="datetime-local" value={closingDate} onChange={onClosingDateChange} style={inp} />
        </FieldControl>
        <FieldControl label="Status">
          <select value={status} onChange={onStatusChange} style={inp}>
            <option value="rascunho">Rascunho</option>
            <option value="aberto">Aberto</option>
            <option value="fechado">Fechado</option>
            <option value="arquivado">Arquivado</option>
          </select>
        </FieldControl>
      </div>
      <div className="create-form-meta-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <FieldControl label="Total esperado" hint={linkedPeopleField
          ? `Se deixar em branco, o total sera assumido pela base carregada (${peopleCount} pessoas).`
          : formMode === "geral"
            ? "Formulario geral nao usa a base central, entao o sistema nao controla faltantes esperados."
            : "Sem vinculo com a base completa, o sistema nao controla faltantes esperados."}>
          <input
            type="number"
            min="0"
            value={linkedPeopleField ? totalExpected : ""}
            onChange={onTotalExpectedChange}
            placeholder={linkedPeopleField ? String(peopleCount || "") : "Disponivel apenas com campo de pessoa vinculada"}
            disabled={!linkedPeopleField}
            style={{ ...inp, opacity: linkedPeopleField ? 1 : 0.7 }}
          />
        </FieldControl>
        <FieldControl label="Texto de fechamento">
          <input value={closingText} onChange={onClosingTextChange} style={inp} />
        </FieldControl>
      </div>
    </div>

    <FieldControl label="Classificacoes" style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {labels.map(label => (
          <button key={label.id} onClick={() => onToggleLabel(label.id)} style={{ padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600, border: "2px solid", cursor: "pointer", transition: "all 0.15s", borderColor: selectedLabels.includes(label.id) ? label.color : COLORS.borderLight, background: selectedLabels.includes(label.id) ? label.color : "transparent", color: selectedLabels.includes(label.id) ? "#fff" : label.color }}>{label.name}</button>
        ))}
      </div>
    </FieldControl>

    <div className="create-form-people-bar" style={{ background: COLORS.surfaceAlt, border: `1px solid ${COLORS.borderLight}`, borderRadius: 10, padding: "10px 14px", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
      <Icon name="user" size={14} />
      <span style={{ fontSize: 12, color: COLORS.textMuted }}>
        <strong style={{ color: COLORS.text }}>{peopleCount} pessoas</strong> carregadas. {peopleConfigLabel}
      </span>
    </div>
  </>
);

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

export const FieldEditorSourcePanel = ({
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
            ? "Este campo fica apenas neste formulario e nao entra no catalogo global."
            : "No formulario geral, campos locais nao usam a base central de socios."}
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
          O tipo e o vinculo base chegam da configuracao global do campo selecionado.
        </div>
      )}
    </div>
  </div>
);

export const FieldEditorDefinitionPanel = ({
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
      <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, marginBottom: 6 }}>2. Definicao principal</div>
      <div style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.4, marginBottom: 8 }}>
        Escolha o tipo e escreva o texto que vai aparecer para quem responder.
      </div>
      <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, display: "block", marginBottom: 4 }}>Tipo do campo</label>
      <select value={nType} disabled={nFieldMode === "catalog"} onChange={event => onSetNType(event.target.value)} style={{ ...inp, opacity: nFieldMode === "catalog" ? 0.75 : 1 }}>
        {filteredFieldTypes.map(type => <option key={type.v} value={type.v}>{type.l}</option>)}
      </select>
      {nFieldMode === "catalog" && (
        <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4 }}>
          O tipo vem da configuracao global do campo base.
        </div>
      )}
    </div>
    <div>
      <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, display: "block", marginBottom: 4 }}>
        {nType === "person_select" ? "Rotulo (ex: Nome)" : "Pergunta / Rotulo"}
      </label>
      <input value={nLabel} onChange={event => onSetNLabel(event.target.value)} placeholder={nType === "person_select" ? "Nome" : "Ex: Vai ao Jantar?"} style={inp} autoFocus />
    </div>
    {nType === "person_select" && (
      <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
        <div style={{ padding: 12, borderRadius: 10, background: COLORS.primaryLight, border: `1px solid ${COLORS.borderLight}` }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: COLORS.primary, marginBottom: 4 }}>Vinculo configurado no campo</div>
          <div style={{ fontSize: 11, color: COLORS.textSecondary, lineHeight: 1.45 }}>
            {formMode === "nucleo"
              ? "Campos locais usam a base central de socios como origem. Quando o campo vem da biblioteca, a origem ja chega definida ali. Este editor nao troca a base."
              : "Formulario geral nao usa a base central. Para seletor por base, use um campo da biblioteca ligado a uma base externa sincronizada."}
          </div>
        </div>
        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>Vinculo ativo do campo</label>
          <div style={{ padding: 10, borderRadius: 10, border: `1px solid ${COLORS.borderLight}`, background: COLORS.surface }}>
            {activeSelectionSource?.kind === "external_base"
              ? `Base externa sincronizada: ${externalBaseMap.get(String(activeSelectionSource.externalBaseId || ""))?.name || "base externa"}`
              : "Base central de socios"}
          </div>
        </div>
        <div style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.45 }}>
          {formMode === "nucleo"
            ? "Se a lista vier da biblioteca, a origem ja foi definida na configuracao do campo."
            : "Campos gerais so aceitam seletores ligados a bases externas configuradas na biblioteca."}
        </div>
        <div style={{ padding: "10px 12px", borderRadius: 10, border: `1px solid ${COLORS.borderLight}`, background: COLORS.surfaceAlt }}>
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.4, color: COLORS.textMuted, marginBottom: 4 }}>
            Resumo do vinculo
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.text }}>
            {activeSelectionSource?.kind === "external_base"
              ? `Base externa sincronizada: ${externalBaseMap.get(String(activeSelectionSource.externalBaseId || ""))?.name || "base externa"}`
              : "Base central de socios"}
          </div>
        </div>
      </div>
    )}
  </div>
);

export const FieldEditorExtrasPanel = ({
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
        Esta etapa so aparece para finalizar validacoes, obrigatoriedade ou a montagem de grade.
      </div>
    </div>
    {(nType === "text" || nType === "number") && (
      <div className="create-form-validation-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: COLORS.textSecondary, display: "block" }}>
          {nType === "text" ? "Minimo de caracteres" : "Valor minimo"}
          <input
            type="number"
            min="0"
            value={nType === "text" ? (nValidation.minLength ?? "") : (nValidation.min ?? "")}
            onChange={event => onSetNValidation(prev => ({ ...prev, [nType === "text" ? "minLength" : "min"]: event.target.value }))}
            style={{ ...inp, marginTop: 4 }}
          />
        </label>
        <label style={{ fontSize: 11, fontWeight: 600, color: COLORS.textSecondary, display: "block" }}>
          {nType === "text" ? "Maximo de caracteres" : "Valor maximo"}
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

export const FieldEditorActions = ({ isFieldSaveDisabled, isEditingField, onAddField, onResetFieldDraft }) => (
  <div className="create-form-inline-actions" style={{ display: "flex", gap: 6 }}>
    <Btn sz="sm" onClick={onAddField} disabled={isFieldSaveDisabled}>{isEditingField ? "Salvar campo" : "Adicionar"}</Btn>
    <Btn v="ghost" sz="sm" onClick={onResetFieldDraft}>Cancelar</Btn>
  </div>
);

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

const fieldStyle = { width: "100%", padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: COLORS.surface, color: COLORS.text };

export const FormFieldRow = ({
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

export const ResultsTotalRow = ({
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
