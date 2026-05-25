/**
 * @file frontend/src/screens/escalaResultsController.js
 * @summary Controller local da tela de resultados de escala.
 */

import { useState } from "react";
import { canEditEscala } from "../lib/auth";
import { downloadCsv } from "../lib/downloadCsv";
import { useEscalaPersistController } from "./escalaPersistController";
import { buildEscalaCsv } from "./resultsCsv";
import {
  addEscalaSlot,
  assignEscalaSlotPerson,
  buildEscalaMetrics,
  buildEscalaNames,
  clearEscalaSlotPerson,
  patchEscalaSlot,
} from "./resultsEscalaDomain";

export const useEscalaResultsController = ({ people, user, form, sections, onSaveSections }) => {
  const [showSignup, setShowSignup] = useState(false);
  const [selSlot, setSelSlot] = useState(null);
  const [signName, setSignName] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [pendingRemoval, setPendingRemoval] = useState(null);
  const { busyAction, runPersistAction } = useEscalaPersistController({ onSaveSections, setFeedback });
  const canEdit = canEditEscala(user);
  const names = buildEscalaNames(people);
  const { total, filled } = buildEscalaMetrics(sections);

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
    await runPersistAction({
      busyKey: "remove",
      next: clearEscalaSlotPerson(sections, sectionIndex, slotIndex),
      successMessage: "Vaga excluida com sucesso.",
      afterSuccess: () => setPendingRemoval(null),
    });
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

  return {
    busyAction,
    canEdit,
    feedback,
    filled,
    names,
    onAddSlot: addSlot,
    onCancelRemoval: () => setPendingRemoval(null),
    onCloseSignup: () => {
      setShowSignup(false);
      setSelSlot(null);
    },
    onConfirmRemoval: confirmRemoval,
    onConfirmSignup: signup,
    onExportCsv: exportCsv,
    onOpenSignup: (sectionIndex, slotIndex) => {
      if (!canEdit) return;
      if (!sections[sectionIndex].slots[slotIndex].person) {
        setSelSlot({ sectionIndex, slotIndex });
        setShowSignup(true);
        setSignName("");
      }
    },
    onRemoveSlot: (sectionIndex, slotIndex) => setPendingRemoval({ sectionIndex, slotIndex }),
    onSetSignName: setSignName,
    onUpdateSlot: updateSlot,
    pendingRemoval,
    people,
    sections,
    selSlot,
    showSignup,
    signName,
    total,
  };
};
