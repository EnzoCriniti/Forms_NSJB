/**
 * @file frontend/src/lib/appController.js
 * @summary Controller de alto nivel do App.
 * @responsibility Centralizar estado, handlers, efeitos e props do viewport fora de App.jsx.
 */

import { canCreateForms } from "./auth";
import { useAppControllerState } from "./appControllerState";
import { useAppControllerDerivedState } from "./appControllerDerived";
import { buildAppControllerViewModel } from "./appControllerViewModel";
import { buildAppControllerLoaders } from "./appControllerLoaders";
import { buildAppControllerHandlers } from "./appControllerHandlers";
import { useAppControllerLifecycle } from "./appControllerLifecycle";
import { selectAppControllerBootstrapData } from "./appControllerBootstrap";
import {
  buildAppControllerDerivedInput,
  buildAppControllerHandlersInput,
  buildAppControllerLifecycleInput,
  buildAppControllerLoadersInput,
  buildAppControllerViewModelInput,
} from "./appControllerInputs";

export const useAppController = () => {
  const { values, setters } = useAppControllerState();
  const bootstrapData = selectAppControllerBootstrapData(values.bootstrap);
  const derived = useAppControllerDerivedState(buildAppControllerDerivedInput(values));
  const loaders = buildAppControllerLoaders(buildAppControllerLoadersInput({ values, setters }));

  const handlers = buildAppControllerHandlers(buildAppControllerHandlersInput({
    bootstrapData,
    derived,
    loaders,
    setters,
    values,
  }));
  const { navigate } = handlers.sessionHandlers;

  useAppControllerLifecycle(buildAppControllerLifecycleInput({
    derived,
    loaders,
    sessionHandlers: handlers.sessionHandlers,
    setters,
    values,
  }));

  return buildAppControllerViewModel(buildAppControllerViewModelInput({
    bootstrapData,
    canCreateForms,
    derived,
    handlers,
    loaders,
    navigate,
    sessionHandlers: handlers.sessionHandlers,
    setters,
    values,
  }));
};
