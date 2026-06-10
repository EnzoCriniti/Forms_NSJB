import { useState } from "react";
import { createEmptyBootstrap } from "./appBootstrap";

export const useAppControllerBootstrapState = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bootstrap, setBootstrap] = useState(createEmptyBootstrap);
  const [responseDetails, setResponseDetails] = useState({});
  const [escalaDetails, setEscalaDetails] = useState({});
  const [detailLoading, setDetailLoading] = useState(null);
  const [formDeleteKeyConfigured, setFormDeleteKeyConfigured] = useState(null);

  return {
    values: {
      bootstrap,
      detailLoading,
      error,
      escalaDetails,
      formDeleteKeyConfigured,
      loading,
      responseDetails,
    },
    setters: {
      setBootstrap,
      setDetailLoading,
      setError,
      setEscalaDetails,
      setFormDeleteKeyConfigured,
      setLoading,
      setResponseDetails,
    },
  };
};
