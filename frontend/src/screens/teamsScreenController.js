/**
 * @file frontend/src/screens/teamsScreenController.js
 * @summary Controller da tela de equipes.
 */

import { useEffect, useMemo, useState } from "react";
import { resolveActionErrorMessage } from "../components/ui";
import { fetchTeamPeriodSummary } from "../lib/api";
import { buildTeamPeriodDraft, buildTeamPeriodPayload, emptyTeamPeriodDraft, sortTeamPeriods } from "./teamsDomain";

export const useTeamsScreenController = ({
  teamPeriods = [],
  onSaveTeamPeriod,
  onDeleteTeamPeriod,
}) => {
  const sortedPeriods = useMemo(() => sortTeamPeriods(teamPeriods), [teamPeriods]);
  const [selectedPeriodId, setSelectedPeriodId] = useState(sortedPeriods[0]?.id || null);
  const [draft, setDraft] = useState(() => ({ ...emptyTeamPeriodDraft }));
  const [editing, setEditing] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const selectedPeriod = useMemo(
    () => sortedPeriods.find(period => String(period.id) === String(selectedPeriodId)) || sortedPeriods[0] || null,
    [selectedPeriodId, sortedPeriods],
  );

  useEffect(() => {
    if (!selectedPeriodId && sortedPeriods[0]?.id) setSelectedPeriodId(sortedPeriods[0].id);
  }, [selectedPeriodId, sortedPeriods]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!selectedPeriod?.id) {
        setSummary(null);
        return;
      }
      setSummaryLoading(true);
      try {
        const result = await fetchTeamPeriodSummary(selectedPeriod.id);
        if (active) setSummary(result.summary || null);
      } catch (error) {
        if (active) setFeedback({ tone: "error", message: resolveActionErrorMessage(error) });
      } finally {
        if (active) setSummaryLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [selectedPeriod?.id]);

  const startNew = () => {
    setDraft({ ...emptyTeamPeriodDraft });
    setEditing(true);
    setFeedback(null);
  };

  const editPeriod = period => {
    setDraft(buildTeamPeriodDraft(period));
    setSelectedPeriodId(period.id);
    setEditing(true);
    setFeedback(null);
  };

  const cancelEdit = () => {
    setDraft({ ...emptyTeamPeriodDraft });
    setEditing(false);
  };

  const save = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const saved = await onSaveTeamPeriod(buildTeamPeriodPayload(draft));
      setSelectedPeriodId(saved.id);
      setDraft(buildTeamPeriodDraft(saved));
      setEditing(false);
      setFeedback({ tone: "success", message: "Periodo de equipes salvo." });
    } catch (error) {
      setFeedback({ tone: "error", message: resolveActionErrorMessage(error) });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    setFeedback(null);
    try {
      await onDeleteTeamPeriod(pendingDelete.id);
      setPendingDelete(null);
      if (String(selectedPeriodId) === String(pendingDelete.id)) setSelectedPeriodId(null);
      setFeedback({ tone: "success", message: "Periodo de equipes excluido." });
    } catch (error) {
      setFeedback({ tone: "error", message: resolveActionErrorMessage(error) });
    } finally {
      setDeleting(false);
    }
  };

  return {
    sortedPeriods,
    selectedPeriod,
    selectedPeriodId,
    setSelectedPeriodId,
    draft,
    setDraft,
    editing,
    feedback,
    saving,
    pendingDelete,
    setPendingDelete,
    deleting,
    summary,
    summaryLoading,
    startNew,
    editPeriod,
    cancelEdit,
    save,
    confirmDelete,
  };
};
