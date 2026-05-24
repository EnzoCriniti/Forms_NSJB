/**
 * @file frontend/src/features/admin/adminAuditLogsState.js
 * @summary Estado e carregamento dos logs de auditoria administrativa.
 * @responsibility Concentrar filtros, paginacao e query da auditoria.
 */

import { useEffect, useState } from "react";
import { resolveActionErrorMessage } from "../../components/ui";
import { fetchAuditLogs } from "../../lib/api";

export const AUDIT_LOGS_PAGE_SIZE = 10;

export const emptyAuditFilters = {
  from: "",
  to: "",
  level: "",
  category: "",
  action: "",
  status: "",
  screen: "",
  actor: "",
  entityType: "",
  entityId: "",
  search: "",
};

export const getAuditPaginationState = (total, page, pageSize = AUDIT_LOGS_PAGE_SIZE) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const fromIndex = total === 0 ? 0 : ((safePage - 1) * pageSize) + 1;
  const toIndex = Math.min(safePage * pageSize, total);

  return { totalPages, safePage, fromIndex, toIndex };
};

export const useAuditLogsController = () => {
  const [draftFilters, setDraftFilters] = useState(emptyAuditFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyAuditFilters);
  const [page, setPage] = useState(1);
  const [state, setState] = useState({
    loading: true,
    error: null,
    items: [],
    total: 0,
  });

  useEffect(() => {
    let active = true;

    const load = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      try {
        const payload = await fetchAuditLogs({
          ...appliedFilters,
          limit: AUDIT_LOGS_PAGE_SIZE,
          offset: (page - 1) * AUDIT_LOGS_PAGE_SIZE,
        });
        if (!active) return;
        setState({
          loading: false,
          error: null,
          items: Array.isArray(payload.items) ? payload.items : [],
          total: Number(payload.total || 0),
        });
      } catch (error) {
        if (!active) return;
        setState(prev => ({
          ...prev,
          loading: false,
          error: resolveActionErrorMessage(error),
        }));
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [appliedFilters, page]);

  const updateFilter = (key, value) => {
    setDraftFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setPage(1);
    setAppliedFilters(draftFilters);
  };

  const clearFilters = () => {
    setPage(1);
    setDraftFilters(emptyAuditFilters);
    setAppliedFilters(emptyAuditFilters);
  };

  return {
    draftFilters,
    state,
    page,
    setPage,
    updateFilter,
    applyFilters,
    clearFilters,
    pagination: getAuditPaginationState(state.total, page),
  };
};
