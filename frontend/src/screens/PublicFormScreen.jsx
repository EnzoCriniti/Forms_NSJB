/**
 * @file frontend/src/screens/PublicFormScreen.jsx
 * @summary Fluxo publico de resposta.
 * @responsibility Renderizar formulario dinamico e salvar resposta por formulario.
 */

import React, { useMemo, useState } from "react";
import { COLORS, Icon, Btn, resolveActionErrorMessage } from "../components/ui";
import { PublicResponseEditingBanner, PublicResponseEditModal, PublicResponseErrorBanner, PublicResponseHeader, PublicResponseSuccessPanel } from "./publicFormPanels";
import { getFieldSelectionSource, getPersonField, getPersonOptionLabel, getVisibleFields, isExternalBaseSelectionField, isPrimaryPeopleBaseField, resolvePersonBySelectionValue, summarizeFieldValidation, validateResponseValuesAgainstForm } from "../lib/forms";

export const PublicFormScreen = ({ responses, onSaveResponse, onBack, form, people, externalBases = [], resultsHref = "", readingControls, variant = "public" }) => {
  const isInternal = variant === "internal";
  const fields = getVisibleFields(form);
  const personField = getPersonField(form);
  const [values, setValues] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const selectedPerson = useMemo(() => {
    const raw = personField ? values[String(personField.id)] : "";
    const found = resolvePersonBySelectionValue(people, raw);
    return found ? { name: found.name, grau: found.grau, display: raw } : null;
  }, [people, personField, values]);

  const duplicateResponsesBlocked = form?.resultsConfig?.blockDuplicatePersonResponses === true;
  const existingResponse = selectedPerson
    ? responses.find(response => String(response.respondentName || "").trim().toLowerCase() === selectedPerson.name.trim().toLowerCase())
    : null;
  const duplicateResponseLocked = duplicateResponsesBlocked && Boolean(existingResponse);
  const externalBaseMap = useMemo(() => new Map((externalBases || []).map(base => [String(base.id), base])), [externalBases]);

  const setFieldValue = (fieldId, value) => {
    setValues(prev => ({ ...prev, [String(fieldId)]: value }));
  };

  const handleSelectPerson = value => {
    if (!personField) return;
    setFieldValue(personField.id, value);
    setEditing(false);
    setEditModal(false);
    setSubmitError("");
    if (!value) return;
    const found = resolvePersonBySelectionValue(people, value);
    if (!found) return;
    const matchedResponse = responses.find(response => String(response.respondentName || "").trim().toLowerCase() === found.name.trim().toLowerCase());
    if (!matchedResponse) return;
    if (duplicateResponsesBlocked) {
      setEditModal(false);
      setSubmitError("Esta pessoa ja respondeu e novas respostas estao bloqueadas para este formulario.");
      return;
    }
    setEditModal(true);
  };

  const handleSelectMemberField = (field, value) => {
    if (!field) return;
    if (isPrimaryPeopleBaseField(form, field)) {
      handleSelectPerson(value);
      return;
    }
    setFieldValue(field.id, value);
  };

  const confirmEdit = () => {
    if (!existingResponse) return;
    setEditModal(false);
    setEditing(true);
    setValues(existingResponse.values || {});
  };

  const cancelEdit = () => {
    setEditModal(false);
    setValues(prev => ({ ...prev, [String(personField.id)]: "" }));
  };

  const submit = async () => {
    if (personField && !selectedPerson) return;
    if (duplicateResponseLocked) {
      setSubmitError("Esta pessoa ja respondeu e novas respostas estao bloqueadas para este formulario.");
      return;
    }
    const validationError = validateResponseValuesAgainstForm(form, values);
    if (validationError) {
      setSubmitError(validationError);
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      await onSaveResponse({
        formId: form.id,
        respondentName: selectedPerson?.name || "Respondente",
        respondentGrau: selectedPerson?.grau || "",
        values,
      });
      setSubmitted(true);
    } catch (error) {
      setSubmitError(resolveActionErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return <PublicResponseSuccessPanel isInternal={isInternal} form={form} onBack={onBack} resultsHref={resultsHref} readingControls={readingControls} editing={editing} />;
  }

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <PublicResponseHeader isInternal={isInternal} form={form} onBack={onBack} resultsHref={resultsHref} readingControls={readingControls} />
      <PublicResponseErrorBanner submitError={submitError} />
      <PublicResponseEditingBanner editing={editing} />
      <div className={isInternal ? "internal-response-card" : "public-response-card"} style={{ background: COLORS.surface, borderRadius: isInternal ? 12 : "0 0 16px 16px", border: `1px solid ${COLORS.borderLight}`, borderTop: isInternal ? `1px solid ${COLORS.borderLight}` : "none", padding: "0 0 24px" }}>
        {fields.map(field => {
          const key = String(field.id);
          const value = values[key] ?? "";
          return (
            <div key={field.id} className="public-form-field" style={{ padding: "16px 24px", borderBottom: `1px solid ${COLORS.borderLight}` }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 10 }}>{field.label}{field.required ? " *" : ""}</label>
              {summarizeFieldValidation(field) && <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 8 }}>{summarizeFieldValidation(field)}</div>}
              {field.type === "person_select" && (
                (() => {
                  const selectionSource = getFieldSelectionSource(field);
                  const options = isExternalBaseSelectionField(field)
                    ? (externalBaseMap.get(String(selectionSource?.externalBaseId || ""))?.items || []).filter(item => item.active !== false)
                    : people.map(person => ({ value: getPersonOptionLabel(person), label: getPersonOptionLabel(person) }));

                  return (
                    <select
                      value={value}
                      onChange={event => handleSelectMemberField(field, event.target.value)}
                      style={{ width: "100%", padding: "10px 12px", border: `1px solid ${editing && isPrimaryPeopleBaseField(form, field) ? COLORS.warning : COLORS.border}`, borderRadius: 8, fontSize: 14, fontFamily: "inherit", background: editing && isPrimaryPeopleBaseField(form, field) ? COLORS.warningLight : COLORS.surface, color: value ? COLORS.text : COLORS.textMuted }}
                    >
                      <option value="">
                        {isExternalBaseSelectionField(field)
                          ? "Selecione uma opcao..."
                          : isPrimaryPeopleBaseField(form, field)
                            ? "Selecione seu nome..."
                            : "Selecione uma pessoa..."}
                      </option>
                      {options.map(option => <option key={`${field.id}-${option.value}`} value={option.value}>{option.label}</option>)}
                    </select>
                  );
                })()
              )}
              {field.type === "yes_no" && (
                <div style={{ display: "flex", gap: 10 }}>
                  {["Sim", "Não"].map(option => (
                    <button
                      key={option}
                      onClick={() => setValues(prev => ({ ...prev, [key]: option }))}
                      style={{
                        flex: 1, padding: "10px 16px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                        border: `2px solid ${value === option ? (option === "Sim" ? COLORS.accent : COLORS.danger) : COLORS.borderLight}`,
                        background: value === option ? (option === "Sim" ? COLORS.primaryLight : COLORS.dangerLight) : COLORS.surface,
                        color: value === option ? (option === "Sim" ? COLORS.accent : COLORS.danger) : COLORS.textSecondary,
                      }}
                    >{option}</button>
                  ))}
                </div>
              )}
              {field.type === "number" && (
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {[0, 1, 2, 3, 4, 5].map(option => (
                    <button
                      key={option}
                      onClick={() => setValues(prev => ({ ...prev, [key]: option }))}
                      style={{
                        width: 34, height: 34, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                        border: `2px solid ${value === option ? COLORS.primary : COLORS.borderLight}`,
                        background: value === option ? COLORS.primaryLight : COLORS.surface,
                        color: value === option ? COLORS.primary : COLORS.textMuted,
                      }}
                    >{option}</button>
                  ))}
                </div>
              )}
              {field.type === "text" && <input value={value} onChange={event => setValues(prev => ({ ...prev, [key]: event.target.value }))} placeholder="Digite sua resposta..." style={{ width: "100%", padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 8 }} />}
              {field.type === "grid" && (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left", paddingBottom: 8 }} />
                        {(field.gridCols || []).map(col => <th key={col} style={{ textAlign: "center", paddingBottom: 8 }}>{col}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {(field.gridRows || []).map(row => (
                        <tr key={row}>
                          <td style={{ padding: "8px 0", fontWeight: 500 }}>{row}</td>
                          {(field.gridCols || []).map(col => (
                            <td key={col} style={{ textAlign: "center" }}>
                              <input type="radio" checked={value?.[row] === col} onChange={() => setValues(prev => ({ ...prev, [key]: { ...(prev[key] || {}), [row]: col } }))} />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
        <div style={{ padding: "20px 24px 0" }}>
          <Btn sz="lg" icon={editing ? "edit" : "check"} style={{ width: "100%", justifyContent: "center" }} onClick={submit} loading={submitting} disabled={submitting || duplicateResponseLocked}>{editing ? "Atualizar Resposta" : "Enviar Resposta"}</Btn>
          <p style={{ fontSize: 11, color: COLORS.textMuted, textAlign: "center", marginTop: 8 }}>Você pode editar sua resposta enquanto o formulário estiver aberto.</p>
        </div>
      </div>
      {editModal && <PublicResponseEditModal selectedPerson={selectedPerson} onCancel={cancelEdit} onConfirm={confirmEdit} />}
    </div>
  );
};



