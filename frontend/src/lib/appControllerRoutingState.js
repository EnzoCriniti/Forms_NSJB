import { useState } from "react";
import { getPublicRouteFromLocation } from "./appPublicRoutes";

export const useAppControllerRoutingState = () => {
  const [screen, setScreen] = useState("list");
  const [activeFormId, setActiveFormId] = useState(null);
  const [activeEventId, setActiveEventId] = useState(null);
  const [activeMessageId, setActiveMessageId] = useState(null);
  const [editingFormId, setEditingFormId] = useState(null);
  const [draftForm, setDraftForm] = useState(null);
  const [publicRoute, setPublicRoute] = useState(() => getPublicRouteFromLocation());

  return {
    values: {
      activeEventId,
      activeFormId,
      activeMessageId,
      draftForm,
      editingFormId,
      publicRoute,
      screen,
    },
    setters: {
      setActiveEventId,
      setActiveFormId,
      setActiveMessageId,
      setDraftForm,
      setEditingFormId,
      setPublicRoute,
      setScreen,
    },
  };
};
