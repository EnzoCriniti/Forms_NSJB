/**
 * @file frontend/src/screens/PublicEscalaScreen.jsx
 * @summary Fluxo publico da escala.
 * @responsibility Permitir inscricao em vagas pendentes da escala da Organ.
 */

import React, { useState } from "react";
import { FeedbackBanner, resolveActionErrorMessage } from "../components/ui";
import { PublicScaleMetricsPanel, PublicScaleSectionsPanel, PublicScaleSignupModal } from "./publicScalePanels";
import { PublicScreenFrame, PublicScreenHeader, PublicScreenLayout } from "./publicScreenFrame";
import { buildPublicScaleLimitMessage, buildPublicScaleNextSections, countPublicScaleAssignments, resolvePublicScaleLimit } from "./publicScaleDomain";

export const PublicEscalaScreen = ({ onBack, form, people, sections = [], onSaveSections, onClaimSlot, readingControls, variant = "public", readOnly = false, readOnlyMessage = "" }) => {
  const isInternal = variant === "internal";
  const isReadOnly = readOnly && !isInternal;
  const [selSlot, setSelSlot] = useState(null);
  const [signName, setSignName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const names = people.map(person => person.name);
  const scaleLimit = resolvePublicScaleLimit(form);
  const total = sections.reduce((sum, section) => sum + section.slots.length, 0);
  const filled = sections.reduce((sum, section) => sum + section.slots.filter(slot => slot.person).length, 0);

  const signup = async () => {
    setError("");
    if (isReadOnly || !selSlot || !signName) return;

    const assignedCount = countPublicScaleAssignments(sections, signName);
    if (assignedCount >= scaleLimit) {
      setError(buildPublicScaleLimitMessage(scaleLimit));
      return;
    }

    try {
      setSaving(true);
      if (onClaimSlot) {
        await onClaimSlot(selSlot.si, selSlot.sli, signName);
      } else if (onSaveSections) {
        const next = buildPublicScaleNextSections(sections, selSlot.si, selSlot.sli, signName);
        await onSaveSections(next);
      }
      setSelSlot(null);
      setSignName("");
    } catch (saveError) {
      if (saveError?.status === 409 || saveError?.code === "ESCALA_CONFLICT" || saveError?.code === "ESCALA_LIMIT_REACHED") {
        setError(saveError.message || "A escala foi atualizada por outra pessoa. Recarregue a página e tente novamente.");
        return;
      }
      setError(resolveActionErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <PublicScreenLayout maxWidth={760}>
      <PublicScreenHeader
        isInternal={isInternal}
        form={form}
        onBack={onBack}
        titleFallback="Escala"
        internalSubtitle={isReadOnly ? "Escala disponível apenas para consulta." : "Escolha uma vaga pendente para preencher seu nome."}
        readingControls={readingControls}
      />
      <PublicScreenFrame isInternal={isInternal} cardClassName="public-scale-card">
        <div className="public-scale-card__content">
          <PublicScaleMetricsPanel filled={filled} pending={total - filled} total={total} scaleLimit={scaleLimit} readOnly={isReadOnly} />
          {isReadOnly && <div style={{ marginBottom: 14 }}><FeedbackBanner tone="info" message={readOnlyMessage || "A escala segue disponível apenas para consulta."} /></div>}
          {error && <div style={{ marginBottom: 14 }}><FeedbackBanner tone="warning" message={error} /></div>}
          <PublicScaleSectionsPanel sections={sections} onPickSlot={(sectionIndex, slotIndex) => setSelSlot({ si: sectionIndex, sli: slotIndex })} readOnly={isReadOnly} />
        </div>
      </PublicScreenFrame>
      {selSlot && !isReadOnly && (
        <PublicScaleSignupModal
          sectionTitle={sections[selSlot.si].title}
          slotRole={sections[selSlot.si].slots[selSlot.sli].role}
          names={names}
          signName={signName}
          onChangeSignName={setSignName}
          onCancel={() => setSelSlot(null)}
          onConfirm={signup}
          saving={saving}
        />
      )}
    </PublicScreenLayout>
  );
};
