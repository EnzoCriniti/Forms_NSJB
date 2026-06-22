/**
 * @file frontend/src/screens/PublicFormScreen.jsx
 * @summary Fluxo publico de resposta.
 * @responsibility Renderizar formulario dinamico e salvar resposta por formulario.
 */

import React, { useMemo, useState } from "react";
import { COLORS, Btn, resolveActionErrorMessage } from "../components/ui";
import { PublicResponseEditingBanner, PublicResponseEditModal, PublicResponseErrorPopup, PublicResponseFieldPanel, PublicResponseHeader, PublicResponseSuccessPanel } from "./publicFormPanels";
import { PublicScreenFrame, PublicScreenLayout } from "./publicScreenFrame";
import { getPersonField, getVisibleFields, isPrimaryPeopleBaseField, summarizeFieldValidation, validateResponseValuesAgainstForm } from "../lib/forms";
import { buildPublicPersonSelectOptions, findExistingPublicResponse, findSelectedPublicPerson } from "./publicFormDomain";

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
    const found = findSelectedPublicPerson(people, raw);
    return found ? { name: found.name, grau: found.grau, display: raw } : null;
  }, [people, personField, values]);

  const duplicateResponsesBlocked = form?.resultsConfig?.blockDuplicatePersonResponses === true;
  const existingResponse = selectedPerson
    ? findExistingPublicResponse({ responses, personName: selectedPerson.name })
    : null;
  const duplicateResponseLocked = duplicateResponsesBlocked && Boolean(existingResponse);

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
    const found = findSelectedPublicPerson(people, value);
    if (!found) return;
    const matchedResponse = responses.find(response => String(response.respondentName || "").trim().toLowerCase() === found.name.trim().toLowerCase());
    if (!matchedResponse) return;
    if (duplicateResponsesBlocked) {
      setEditModal(false);
      setSubmitError("Esta pessoa já respondeu e novas respostas estão bloqueadas para este formulário.");
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
    const validationError = validateResponseValuesAgainstForm(form, values);
    if (validationError) {
      setSubmitError(validationError);
      return;
    }
    if (personField && !selectedPerson) {
      setSubmitError("Selecione uma pessoa válida para responder este formulário.");
      return;
    }
    if (duplicateResponseLocked) {
      setSubmitError("Esta pessoa já respondeu e novas respostas estão bloqueadas para este formulário.");
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
    <PublicScreenLayout maxWidth={680}>
      <PublicResponseHeader isInternal={isInternal} form={form} onBack={onBack} resultsHref={resultsHref} readingControls={readingControls} />
      <PublicResponseErrorPopup submitError={submitError} onClose={() => setSubmitError("")} />
      <PublicResponseEditingBanner editing={editing} />
      <PublicScreenFrame isInternal={isInternal} cardStyle={{ padding: "0 0 24px" }}>
        {fields.map(field => {
          const key = String(field.id);
          const value = values[key] ?? "";
          const validationSummary = summarizeFieldValidation(field);
          const personSelectNode = field.type === "person_select" ? (() => {
            const { options, placeholder } = buildPublicPersonSelectOptions({ field, form, people, externalBases });

            return (
              <select
                value={value}
                onChange={event => handleSelectMemberField(field, event.target.value)}
                style={{ width: "100%", padding: "10px 12px", border: `1px solid ${editing && isPrimaryPeopleBaseField(form, field) ? COLORS.warning : COLORS.border}`, borderRadius: 8, fontSize: 14, fontFamily: "inherit", background: editing && isPrimaryPeopleBaseField(form, field) ? COLORS.warningLight : COLORS.surface, color: value ? COLORS.text : COLORS.textMuted }}
              >
                <option value="">
                  {placeholder}
                </option>
                {options.map(option => <option key={`${field.id}-${option.value}`} value={option.value}>{option.label}</option>)}
              </select>
            );
          })() : null;

          return (
            <PublicResponseFieldPanel
              key={field.id}
              field={field}
              value={value}
              editing={editing}
              colorTokens={COLORS}
              validationSummary={validationSummary}
              personSelectNode={personSelectNode}
              onTextChange={nextValue => setValues(prev => ({ ...prev, [key]: nextValue }))}
              onYesNoChange={option => setValues(prev => ({ ...prev, [key]: option }))}
              onNumberChange={option => setValues(prev => ({ ...prev, [key]: option }))}
              onGridChange={(row, col) => setValues(prev => ({ ...prev, [key]: { ...(prev[key] || {}), [row]: col } }))}
            />
          );
        })}
        <div style={{ padding: "20px 24px 0" }}>
          <Btn sz="lg" icon={editing ? "edit" : "check"} style={{ width: "100%", justifyContent: "center" }} onClick={submit} loading={submitting} disabled={submitting || duplicateResponseLocked}>{editing ? "Atualizar Resposta" : "Enviar Resposta"}</Btn>
          <p style={{ fontSize: 11, color: COLORS.textMuted, textAlign: "center", marginTop: 8 }}>Você pode editar sua resposta enquanto o formulário estiver aberto.</p>
        </div>
      </PublicScreenFrame>
      {editModal && <PublicResponseEditModal selectedPerson={selectedPerson} onCancel={cancelEdit} onConfirm={confirmEdit} />}
    </PublicScreenLayout>
  );
};
