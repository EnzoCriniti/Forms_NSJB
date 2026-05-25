/**
 * @file frontend/src/screens/presenceTableZoomController.js
 * @summary Controle local de zoom da tabela de presenca.
 */

import { useRef, useState } from "react";
import { TABLE_ZOOM_STEP, clampTableZoom, getPresenceTouchDistance } from "./resultsPresenceDomain";

export const usePresenceTableZoomController = () => {
  const [tableZoom, setTableZoom] = useState(1);
  const touchZoomRef = useRef({ distance: 0, zoom: 1 });

  const updateTableZoom = direction => {
    setTableZoom(current => clampTableZoom(current + (direction * TABLE_ZOOM_STEP)));
  };

  const handleTableTouchStart = event => {
    if (event.touches.length !== 2) return;
    touchZoomRef.current = { distance: getPresenceTouchDistance(event.touches), zoom: tableZoom };
  };

  const handleTableTouchMove = event => {
    if (event.touches.length !== 2 || !touchZoomRef.current.distance) return;
    event.preventDefault();
    const nextDistance = getPresenceTouchDistance(event.touches);
    setTableZoom(clampTableZoom(touchZoomRef.current.zoom * (nextDistance / touchZoomRef.current.distance)));
  };

  const handleTableTouchEnd = event => {
    if (event.touches.length < 2) {
      touchZoomRef.current = { distance: 0, zoom: tableZoom };
    }
  };

  return {
    handleTableTouchEnd,
    handleTableTouchMove,
    handleTableTouchStart,
    onResetZoom: () => setTableZoom(1),
    onZoomChange: updateTableZoom,
    tableZoom,
  };
};
