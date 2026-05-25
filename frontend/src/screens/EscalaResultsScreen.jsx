/**
 * @file frontend/src/screens/EscalaResultsScreen.jsx
 * @summary Controller da tela de resultados de escala.
 */

import React, { useState } from "react";
import { resolveActionErrorMessage } from "../components/ui";
import { canEditEscala } from "../lib/auth";
import { downloadCsv } from "../lib/downloadCsv";
import { EscalaResultsPanel } from "./resultsPanels";
import {
  addEscalaSlot,
  assignEscalaSlotPerson,
  buildEscalaCsv,
  buildEscalaMetrics,
  buildEscalaNames,
  clearEscalaSlotPerson,
  patchEscalaSlot,
} from "./resultsDomain";

export const EscalaResultsScreen = ({ people, user, form, sections, onSaveSections }) => {
  const [showSignup, setShowSignup] = useState(false);
  const [selSlot, setSelSlot] = useState(null);
  const [signName, setSignName] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [busyAction, setBusyAction] = useState(null);
  const [pendingRemoval, setPendingRemoval] = useState(null);
  const canEdit = canEditEscala(user);
  const names = buildEscalaNames(people);
  const { total, filled } = buildEscalaMetrics(sections);

  const persistSections = async (next, successMessage = "AlteraÃ§Ãµes salvas.") => {
    setFeedback({ tone: "loading", message: "Salvando escala..." });
    await onSaveSections(next);
    setFeedback({ tone: "success", message: successMessage });
  };

  const runPersistAction = async ({ busyKey, next, successMessage, afterSuccess }) => {
    setBusyAction(busyKey);
    try {
      await persistSections(next, successMessage);
      afterSuccess?.();
    } catch (error) {
      setFeedback({ tone: "error", message: resolveActionErrorMessage(error) });
    } finally {
      setBusyAction(null);
    }
  };

  const signup = async () => {
    if (!signName || !selSlot) return;
    await runPersistAction({
      busyKey: "signup",
      next: assignEscalaSlotPerson(sections, selSlot.sectionIndex, selSlot.slotIndex, signName),
      successMessage: "Vaga preenchida com sucesso.",
      afterSuccess: () => setShowSignup(false),
    });
  };

  const confirmRemoval = async () => {
    if (!pendingRemoval) return;
    const { sectionIndex, slotIndex } = pendingRemoval;
    const next = clearEscalaSlotPerson(sections, sectionIndex, slotIndex);
    setBusyAction("remove");
    try {
      await persistSections(next, "Vaga excluÃ­da com sucesso.");
      setPendingRemoval(null);
    } catch (error) {
      setFeedback({ tone: "error", message: resolveActionErrorMessage(error) });
    } finally {
      setBusyAction(null);
    }
  };

  const updateSlot = async (sectionIndex, slotIndex, patch) => {
    await runPersistAction({
      busyKey: "update",
      next: patchEscalaSlot(sections, sectionIndex, slotIndex, patch),
    });
  };

  const addSlot = async sectionIndex => {
    await runPersistAction({
      busyKey: "add",
      next: addEscalaSlot(sections, sectionIndex),
    });
  };

  const exportCsv = () => {
    const csv = buildEscalaCsv(sections);
    downloadCsv({ csv, filename: `${form.slug}-escala.csv` });
    setFeedback({ tone: "success", message: "CSV exportado com sucesso." });
  };

  return (
    <EscalaResultsPanel
      canEdit={canEdit}
      feedback={feedback}
      filled={filled}
      total={total}
      sections={sections}
      people={people}
      busyAction={busyAction}
      showSignup={showSignup}
      selSlot={selSlot}
      signName={signName}
      names={names}
      onOpenSignup={(sectionIndex, slotIndex) => {
        if (!canEdit) return;
        if (!sections[sectionIndex].slots[slotIndex].person) {
          setSelSlot({ sectionIndex, slotIndex });
          setShowSignup(true);
          setSignName("");
        }
      }}
      onCloseSignup={() => {
        setShowSignup(false);
        setSelSlot(null);
      }}
      onSetSignName={setSignName}
      onConfirmSignup={signup}
      onUpdateSlot={updateSlot}
      onRemoveSlot={(sectionIndex, slotIndex) => setPendingRemoval({ sectionIndex, slotIndex })}
      onConfirmRemoval={confirmRemoval}
      onAddSlot={addSlot}
      onExportCsv={exportCsv}
      onCancelRemoval={() => setPendingRemoval(null)}
      pendingRemoval={pendingRemoval}
    />
  );
};
