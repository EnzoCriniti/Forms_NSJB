import { auditLevelFromError, auditStatusFromError, getVisitorActor, writeAudit } from "./requestHelpers.mjs";

export const writeFormSaveAudit = (req, auth, { body, form = null, error = null }) => {
  const isUpdate = Boolean(body?.id);
  const savedForm = form || {};
  return writeAudit(req, auth, {
    level: error ? auditLevelFromError(error) : "info",
    category: "forms",
    action: isUpdate ? "update_form" : "create_form",
    status: error ? auditStatusFromError(error) : "success",
    screen: "formularios",
    entityType: "form",
    entityId: error ? (body?.id || null) : savedForm.id,
    entityLabel: error ? (body?.title || null) : savedForm.title,
    message: error?.message || (isUpdate ? "Formulario atualizado." : "Formulario criado."),
    metadata: error
      ? {
          formId: body?.id || null,
          slug: body?.slug || null,
          type: body?.type || null,
          status: body?.status || null,
        }
      : {
          formId: savedForm.id,
          slug: savedForm.slug,
          type: savedForm.type,
          status: savedForm.status,
          title: savedForm.title,
        },
  });
};

export const writeFormDeleteAudit = (req, auth, { formId, form = null, error = null, message = null, deleted = false }) => (
  writeAudit(req, auth, {
    level: error || !deleted ? (error ? auditLevelFromError(error) : "error") : "info",
    category: "forms",
    action: "delete_form",
    status: deleted ? "success" : (error ? auditStatusFromError(error) : "failure"),
    screen: "formularios",
    entityType: "form",
    entityId: formId,
    entityLabel: form?.title || null,
    message: error?.message || message || (deleted ? "Formulario excluido." : "Falha ao excluir formulario."),
    metadata: {
      formId,
      deleted,
    },
  })
);

export const writeEscalaUpdateAudit = (req, auth, { formId, sections = null, body = null, error = null }) => (
  writeAudit(req, auth, {
    level: error ? auditLevelFromError(error) : "info",
    category: "escala",
    action: "update_escala",
    status: error ? auditStatusFromError(error) : "success",
    screen: "escala",
    entityType: "form",
    entityId: formId,
    entityLabel: `Escala ${formId}`,
    message: error?.message || "Escala atualizada.",
    metadata: {
      formId,
      sectionCount: error ? (Array.isArray(body?.sections) ? body.sections.length : 0) : sections.length,
    },
  })
);

export const writeEscalaClaimAudit = (req, { formId, body = null, error = null }) => (
  writeAudit(req, null, {
    level: error ? auditLevelFromError(error) : "info",
    category: "escala",
    action: "claim_escala_slot",
    status: error ? auditStatusFromError(error) : "success",
    screen: "public-escala",
    actor: getVisitorActor(),
    entityType: "form",
    entityId: formId,
    entityLabel: `Escala ${formId}`,
    message: error?.message || "Vaga de escala preenchida.",
    metadata: {
      formId,
      sectionIndex: error ? body?.sectionIndex : Number(body.sectionIndex),
      slotIndex: error ? body?.slotIndex : Number(body.slotIndex),
    },
  })
);
