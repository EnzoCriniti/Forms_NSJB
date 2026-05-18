/**
 * @file frontend/src/screens/PublicEscalaScreen.jsx
 * @summary Fluxo publico da escala.
 * @responsibility Permitir inscricao em vagas pendentes da escala da Organ.
 */

import React, { useState } from "react";
import { COLORS, Btn, FeedbackBanner, PublicTopCompact, ScreenHeader, resolveActionErrorMessage } from "../components/ui";
import { PublicScaleMetricsPanel, PublicScaleSectionsPanel, PublicScaleSignupModal } from "./publicScalePanels";
import { buildPublicScaleLimitMessage, buildPublicScaleNextSections, countPublicScaleAssignments, resolvePublicScaleLimit } from "./publicScaleDomain";

export const PublicEscalaScreen = ({ onBack, form, people, sections = [], onSaveSections, onClaimSlot, readingControls, variant = "public" }) => {
  const isInternal = variant === "internal";
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
    if (!selSlot || !signName) return;

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
        setError(saveError.message || "A escala foi atualizada por outra pessoa. Recarregue a pagina e tente novamente.");
        return;
      }
      setError(resolveActionErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      {isInternal ? (
        <ScreenHeader
          className="internal-response-header"
          title={form?.title || "Escala"}
          subtitle="Escolha uma vaga pendente para preencher seu nome."
          titleStyle={{ color: COLORS.text }}
          subtitleStyle={{ color: COLORS.textMuted }}
          marginBottom={14}
        />
      ) : (
        <PublicTopCompact form={form} onBack={onBack} readingControls={readingControls} />
      )}
      <div className={isInternal ? "internal-response-card" : "public-response-card public-scale-card"} style={{ background: COLORS.surface, borderRadius: isInternal ? 12 : undefined, border: `1px solid ${COLORS.borderLight}`, borderTop: isInternal ? `1px solid ${COLORS.borderLight}` : "none", padding: 18 }}>
        <PublicScaleMetricsPanel filled={filled} pending={total - filled} total={total} scaleLimit={scaleLimit} />
        {error && <div style={{ marginBottom: 14 }}><FeedbackBanner tone="error" message={error} /></div>}
        <PublicScaleSectionsPanel sections={sections} onPickSlot={(sectionIndex, slotIndex) => setSelSlot({ si: sectionIndex, sli: slotIndex })} />
      </div>
      {selSlot && (
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
    </div>
  );
};
